import { Response } from "express";
import crypto from "crypto";
import { prisma } from "../config/db";
import { bucket,getSignedUrl } from "../config/storage";
import { response } from "../utils/response";
import { AuthRequest } from "../middleware/auth.middleware";

// Uploads a single file buffer to GCP under bounty/<userId>/<uuid>_<originalname>
// Returns the storage path (not a public URL) for storing in the database.
const uploadFileToGCP = async (
  userId: number,
  file: Express.Multer.File
): Promise<string> => {
  const uniqueId = crypto.randomUUID();
  const destinationPath = `bounty/${userId}/${uniqueId}_${file.originalname}`;

  const blob = bucket.file(destinationPath);

  await new Promise<void>((resolve, reject) => {
    const stream = blob.createWriteStream({
      metadata: { contentType: file.mimetype },
    });

    stream.on("error", (err) => reject(err));
    stream.on("finish", () => resolve());
    stream.end(file.buffer);
  });

  return destinationPath;
};

export const createBounty = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { title, price, timeLimit, description } = req.body;
    const file = req.file; // populated by multer, optional

    // Basic presence/type validation
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

    // Check balance BEFORE uploading anything or starting the transaction
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

    // Upload file to GCP first (outside the DB transaction — GCP has no rollback
    // concept that Prisma's $transaction can participate in)
    let filePath: string | null = null;
    if (file) {
      filePath = await uploadFileToGCP(userId, file);
    }

    // Atomically: debit Bcoins, log the debit, create the bounty
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
          filePath,
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

    // Convert each stored filePath into a temporary signed URL the frontend can load directly
    const items = await Promise.all(
      rawItems.map(async (bounty) => ({
        ...bounty,
        filePath: await getSignedUrl(bounty.filePath),
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
        filePath: await getSignedUrl(bounty.filePath),
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