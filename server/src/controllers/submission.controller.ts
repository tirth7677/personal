import { Response } from "express";
import crypto from "crypto";
import { prisma } from "../config/db";
import { getSignedReadUrl, getSignedUploadUrl } from "../config/storage";
import { response } from "../utils/response";
import { AuthRequest } from "../middleware/auth.middleware";

// Step 1 of the upload flow: frontend asks for permission to upload a submission file.
// Stored under bounty/<bountyId>/<uuid>_<filename> — same folder as the bounty's own
// file, since every submission belongs to exactly one bounty. Requires bountyId up front
// so we can validate the bounty exists/is open BEFORE handing out an upload URL.
export const getSubmissionUploadUrl = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { filename, contentType, bountyId } = req.body;
    const parsedBountyId = Number(bountyId);

    if (!filename || typeof filename !== "string") {
      return response(res, 400, false, "filename is required");
    }
    if (!contentType || typeof contentType !== "string") {
      return response(res, 400, false, "contentType is required");
    }
    if (!parsedBountyId || isNaN(parsedBountyId)) {
      return response(res, 400, false, "A valid bountyId is required");
    }

    const bounty = await prisma.bounty.findUnique({
      where: { id: parsedBountyId },
      select: { id: true, userId: true, active: true, timeLimit: true },
    });

    if (!bounty) {
      return response(res, 404, false, "Bounty not found");
    }
    if (bounty.userId === userId) {
      return response(res, 403, false, "You cannot submit to your own bounty");
    }
    if (!bounty.active || bounty.timeLimit.getTime() <= Date.now()) {
      return response(res, 400, false, "This bounty is no longer accepting submissions");
    }

    const uniqueId = crypto.randomUUID();
    const filePath = `bounty/${parsedBountyId}/${uniqueId}_${filename}`;

    const uploadUrl = await getSignedUploadUrl(filePath, contentType);

    return response(res, 200, true, "Upload URL generated successfully", {
      uploadUrl,
      filePath,
    });
  } catch (error) {
    console.error("Get submission upload URL error:", error);
    return response(res, 500, false, "Failed to generate upload URL");
  }
};

// Step 2: create the submission. Frontend has already PUT the file directly to GCS
// by this point — this only receives the filePath string, never the file bytes.
export const createSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const bountyId = Number(req.body.bountyId);
    const { filePath, comment } = req.body;

    if (!bountyId || isNaN(bountyId)) {
      return response(res, 400, false, "A valid bountyId is required");
    }
    if (!filePath || typeof filePath !== "string") {
      return response(res, 400, false, "filePath is required");
    }
    if (!filePath.startsWith(`bounty/${bountyId}/`)) {
      return response(res, 400, false, "Invalid filePath for this bounty");
    }
    if (comment !== undefined && comment !== null && typeof comment !== "string") {
      return response(res, 400, false, "comment must be a string");
    }

    const bounty = await prisma.bounty.findUnique({
      where: { id: bountyId },
      select: { id: true, userId: true, active: true, timeLimit: true },
    });

    if (!bounty) {
      return response(res, 404, false, "Bounty not found");
    }

    if (bounty.userId === userId) {
      return response(res, 403, false, "You cannot submit to your own bounty");
    }

    if (!bounty.active || bounty.timeLimit.getTime() <= Date.now()) {
      return response(res, 400, false, "This bounty is no longer accepting submissions");
    }

    // One submission per user per bounty — checked at the application level here.
    // Known race-condition gap (two near-simultaneous requests could both pass this
    // check) — a DB-level @@unique([userId, bountyId]) constraint would close it fully.
    const existingSubmission = await prisma.submission.findFirst({
      where: { userId, bountyId },
    });

    if (existingSubmission) {
      return response(res, 409, false, "You have already submitted to this bounty");
    }

    const submission = await prisma.submission.create({
      data: {
        userId,
        bountyId,
        filePath,
        comment: comment || null,
      },
    });

    return response(res, 201, true, "Submission created successfully", { submission });
  } catch (error) {
    console.error("Create submission error:", error);
    return response(res, 500, false, "Failed to create submission");
  }
};

// Public: paginated submissions for a given bounty, newest first, cursor-based
// for infinite scroll — same pattern as bounty/payment listings, to avoid loading
// every submission at once on bounties with a lot of activity.
export const getSubmissionsByBounty = async (req: AuthRequest, res: Response) => {
  try {
    const bountyId = Number(req.params.bountyId);
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;

    if (!bountyId || isNaN(bountyId)) {
      return response(res, 400, false, "A valid bountyId is required");
    }

    const submissions = await prisma.submission.findMany({
      where: { bountyId },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { id: "desc" },
      include: {
        user: { select: { id: true, username: true } },
      },
    });

    const hasMore = submissions.length > limit;
    const rawItems = hasMore ? submissions.slice(0, limit) : submissions;
    const nextCursor = hasMore ? rawItems[rawItems.length - 1]?.id ?? null : null;

    const items = await Promise.all(
      rawItems.map(async (s) => ({
        ...s,
        filePath: await getSignedReadUrl(s.filePath),
      }))
    );

    return response(res, 200, true, "Submissions fetched successfully", {
      submissions: items,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("Get submissions by bounty error:", error);
    return response(res, 500, false, "Failed to fetch submissions");
  }
};

// Protected: all of the logged-in user's own submissions, across every bounty, newest first.
export const getMySubmissions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;

    const submissions = await prisma.submission.findMany({
      where: { userId },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { id: "desc" },
      include: {
        bounty: { select: { id: true, title: true, price: true, active: true } },
      },
    });

    const hasMore = submissions.length > limit;
    const rawItems = hasMore ? submissions.slice(0, limit) : submissions;
    const nextCursor = hasMore ? rawItems[rawItems.length - 1]?.id ?? null : null;

    const items = await Promise.all(
      rawItems.map(async (s) => ({
        ...s,
        filePath: await getSignedReadUrl(s.filePath),
      }))
    );

    return response(res, 200, true, "Your submissions fetched successfully", {
      submissions: items,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("Get my submissions error:", error);
    return response(res, 500, false, "Failed to fetch your submissions");
  }
};