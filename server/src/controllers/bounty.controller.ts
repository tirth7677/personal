import { Response } from "express";
import crypto from "crypto";
import { prisma } from "../config/db";
import { getSignedReadUrl, getSignedUploadUrl } from "../config/storage";
import { response } from "../utils/response";
import { AuthRequest } from "../middleware/auth.middleware";

// Step 1 of the upload flow: frontend asks for permission to upload a specific file.
// Backend never touches file bytes — it just generates a signed PUT URL pointing at
// a predetermined path under bounty/<userId>/<uuid>_<filename>.
export const getBountyUploadUrl = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { filename, contentType } = req.body;

    if (!filename || typeof filename !== "string") {
      return response(res, 400, false, "filename is required");
    }
    if (!contentType || typeof contentType !== "string") {
      return response(res, 400, false, "contentType is required");
    }

    const uniqueId = crypto.randomUUID();
    const filePath = `bounty/${userId}/${uniqueId}_${filename}`;

    const uploadUrl = await getSignedUploadUrl(filePath, contentType);

    return response(res, 200, true, "Upload URL generated successfully", {
      uploadUrl,
      filePath, // frontend must send this back unchanged when creating the bounty
    });
  } catch (error) {
    console.error("Get bounty upload URL error:", error);
    return response(res, 500, false, "Failed to generate upload URL");
  }
};

// Step 2: create the bounty record. By this point the frontend has already PUT the
// file directly to GCS using the signed URL from getBountyUploadUrl — this function
// only receives the filePath string, never the actual file bytes.
export const createBounty = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { title, price, timeLimit, description, filePath } = req.body;

    if (!title || typeof title !== "string") {
      return response(res, 400, false, "Title is required");
    }

    const parsedPrice = Number(price);
    if (!price || isNaN(parsedPrice) || parsedPrice <= 0) {
      return response(res, 400, false, "A valid positive price is required");
    }

    if (!timeLimit || isNaN(new Date(timeLimit).getTime())) {
      return response(res, 400, false, "A valid timeLimit date is required");
    }
    if (new Date(timeLimit).getTime() <= Date.now()) {
      return response(res, 400, false, "timeLimit must be in the future");
    }

    if (!description || typeof description !== "string") {
      return response(res, 400, false, "Description is required");
    }

    // filePath is optional — bounties don't require an attached file.
    // If provided, it must at least belong to this user's own folder, so users
    // can't claim someone else's (or an unrelated) GCS object as their bounty's file.
    if (filePath !== undefined && filePath !== null) {
      if (typeof filePath !== "string") {
        return response(res, 400, false, "filePath must be a string");
      }
      if (!filePath.startsWith(`bounty/${userId}/`)) {
        return response(res, 400, false, "Invalid filePath for this user");
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { bcoins: true },
    });

    if (!user) {
      return response(res, 404, false, "User not found");
    }

    if (user.bcoins < parsedPrice) {
      return response(
        res,
        400,
        false,
        `Insufficient Bcoins. You have ${user.bcoins}, but this bounty costs ${parsedPrice}.`
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { bcoins: { decrement: parsedPrice } },
        select: { id: true, username: true, bcoins: true },
      });

      const bounty = await tx.bounty.create({
        data: {
          userId,
          title,
          price: parsedPrice,
          timeLimit: new Date(timeLimit),
          description,
          filePath: filePath || null,
          active: true,
        },
      });

      await tx.bcoinsUsage.create({
        data: {
          userId,
          type: "debit",
          amount: parsedPrice,
          reason: "bounty_posted",
        },
      });

      return { updatedUser, bounty };
    });

    return response(res, 201, true, "Bounty created successfully", {
      bounty: result.bounty,
      remainingBcoins: result.updatedUser.bcoins,
    });
  } catch (error) {
    console.error("Create bounty error:", error);
    return response(res, 500, false, "Failed to create bounty");
  }
};

// Public: paginated list of all active bounties, cursor-based for infinite scroll.
// No auth — anyone can browse bounties.
export const getAllBounties = async (req: AuthRequest, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;

    const bounties = await prisma.bounty.findMany({
      where: { active: true },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { id: "desc" },
      select: {
        id: true,
        title: true,
        price: true,
        timeLimit: true,
        description: true,
        filePath: true,
        active: true,
        createdAt: true,
        userId: true,
        user: {
          select: { id: true, username: true },
        },
      },
    });

    const hasMore = bounties.length > limit;
    const rawItems = hasMore ? bounties.slice(0, limit) : bounties;
    const nextCursor = hasMore ? rawItems[rawItems.length - 1]?.id ?? null : null;

    // Convert each stored filePath into a temporary signed READ URL the frontend can load directly
    const items = await Promise.all(
      rawItems.map(async (bounty) => ({
        ...bounty,
        filePath: await getSignedReadUrl(bounty.filePath),
      }))
    );

    return response(res, 200, true, "Bounties fetched successfully", {
      bounties: items,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("Get all bounties error:", error);
    return response(res, 500, false, "Failed to fetch bounties");
  }
};

// Protected: paginated list of the logged-in user's own bounties.
// userId comes from auth middleware (decoded token), not from query/body —
// so a user can never fetch someone else's bounties by tampering with input.
export const getMyBounties = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;

    const activeFilter =
      req.query.active === "true"
        ? true
        : req.query.active === "false"
        ? false
        : undefined;

    const bounties = await prisma.bounty.findMany({
      where: {
        userId,
        ...(activeFilter !== undefined && { active: activeFilter }),
      },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { id: "desc" },
    });

    const hasMore = bounties.length > limit;
    const rawItems = hasMore ? bounties.slice(0, limit) : bounties;
    const nextCursor = hasMore ? rawItems[rawItems.length - 1]?.id ?? null : null;

    const items = await Promise.all(
      rawItems.map(async (bounty) => ({
        ...bounty,
        filePath: await getSignedReadUrl(bounty.filePath),
      }))
    );

    return response(res, 200, true, "Your bounties fetched successfully", {
      bounties: items,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("Get my bounties error:", error);
    return response(res, 500, false, "Failed to fetch your bounties");
  }
};