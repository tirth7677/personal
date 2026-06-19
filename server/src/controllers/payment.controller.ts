import { Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { prisma } from "../config/db";
import { config } from "../config/env";
import { response } from "../utils/response";
import { AuthRequest } from "../middleware/auth.middleware";

const razorpay = new Razorpay({
    key_id: config.razorpayKeyId,
    key_secret: config.razorpayKeySecret,
});

// Step 1: Create a Razorpay order for the logged-in user
export const createOrder = async (req: AuthRequest, res: Response) => {
    try {
        const { amount } = req.body; // amount in INR (whole rupees), e.g. 100

        if (!amount || typeof amount !== "number" || amount <= 0) {
            return response(res, 400, false, "A valid positive amount is required");
        }

        const order = await razorpay.orders.create({
            amount: amount * 100, // Razorpay expects amount in paise
            currency: "INR",
            receipt: `receipt_user_${req.userId}_${Date.now()}`,
        });

        return response(res, 201, true, "Order created successfully", {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: config.razorpayKeyId, // safe to expose to frontend, needed by Razorpay Checkout
        });
    } catch (error) {
        console.error("Create order error:", error);
        return response(res, 500, false, "Failed to create payment order");
    }
};

// Step 2: Verify payment signature, credit Bcoins on success, log either outcome
// Step 2: Verify payment signature, credit Bcoins on success, log either outcome
export const verifyPayment = async (req: AuthRequest, res: Response) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    amount, // INR amount that was charged, sent back from frontend for logging
  } = req.body;

  const userId = req.userId!;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !amount) {
    return response(res, 400, false, "Missing required payment verification fields");
  }

  // Recompute the expected signature using our key secret.
  // If it doesn't match what Razorpay sent, the payment claim is forged or tampered with.
  const expectedSignature = crypto
    .createHmac("sha256", config.razorpayKeySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const isSignatureValid = expectedSignature === razorpay_signature;

  if (!isSignatureValid) {
    await prisma.paymentHistory.create({
      data: {
        userId,
        amount: amount * 100,
        status: "failed",
      },
    });

    return response(res, 400, false, "Payment verification failed. Signature mismatch.");
  }

  // Signature valid — apply 10% platform fee, credit the remainder as Bcoins,
  // log both the payment record and the Bcoins ledger entry, all atomically.
  const PLATFORM_FEE_PERCENT = 0.1;
  const platformFee = Math.ceil(amount * PLATFORM_FEE_PERCENT);
  const bcoinsToCredit = Math.floor(amount * (1 - PLATFORM_FEE_PERCENT));

  const result = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { bcoins: { increment: bcoinsToCredit } },
      select: { id: true, email: true, bcoins: true },
    });

    const paymentRecord = await tx.paymentHistory.create({
      data: {
        userId,
        amount: amount * 100,
        status: "success",
      },
    });

    await tx.bcoinsUsage.create({
      data: {
        userId,
        type: "credit",
        amount: bcoinsToCredit,
        reason: "payment",
      },
    });

    return { updatedUser, paymentRecord };
  });

  return response(res, 200, true, "Payment verified and Bcoins credited successfully", {
    user: result.updatedUser,
    payment: result.paymentRecord,
    breakdown: {
      amountPaid: amount,
      platformFee,
      bcoinsCredited: bcoinsToCredit,
    },
  });
};

// Fetch paginated payment history for the logged-in user, newest first, cursor-based
export const getPaymentHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const limit = Math.min(Number(req.query.limit) || 10, 50); // cap at 50 to prevent abuse
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;

    const payments = await prisma.paymentHistory.findMany({
      where: { userId },
      orderBy: { id: "desc" },
      take: limit + 1, // fetch one extra to know if there's more data
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1, // skip the cursor row itself, since it was already shown
      }),
    });

    const hasMore = payments.length > limit;
    const rawResults = hasMore ? payments.slice(0, limit) : payments;
    const nextCursor = hasMore ? rawResults[rawResults.length - 1]?.id ?? null : null;

    const PLATFORM_FEE_PERCENT = 0.1;

    // Add a transparent fee breakdown to every transaction, computed from the stored paise amount.
    // Only meaningful for successful payments — failed attempts never charged a fee or credited Bcoins.
    const results = rawResults.map((payment) => {
      const amountPaid = payment.amount / 100; // convert paise back to whole rupees

      if (payment.status !== "success") {
        return {
          ...payment,
          breakdown: {
            amountPaid,
            platformFee: 0,
            bcoinsCredited: 0,
          },
        };
      }

      const platformFee = Math.ceil(amountPaid * PLATFORM_FEE_PERCENT);
      const bcoinsCredited = Math.floor(amountPaid * (1 - PLATFORM_FEE_PERCENT));

      return {
        ...payment,
        breakdown: {
          amountPaid,
          platformFee,
          bcoinsCredited,
        },
      };
    });

    return response(res, 200, true, "Payment history fetched successfully", {
      payments: results,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("Get payment history error:", error);
    return response(res, 500, false, "Failed to fetch payment history");
  }
};

// Fetch paginated Bcoins usage ledger for the logged-in user, newest first, cursor-based.
// Unlike getPaymentHistory (Razorpay top-ups only), this covers every Bcoins movement —
// payments, bounty postings, bounty winnings, etc.
export const getBcoinsUsage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;

    const usage = await prisma.bcoinsUsage.findMany({
      where: { userId },
      orderBy: { id: "desc" },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    const hasMore = usage.length > limit;
    const results = hasMore ? usage.slice(0, limit) : usage;
    const nextCursor = hasMore ? results[results.length - 1]?.id ?? null : null;

    return response(res, 200, true, "Bcoins usage fetched successfully", {
      usage: results,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("Get Bcoins usage error:", error);
    return response(res, 500, false, "Failed to fetch Bcoins usage");
  }
};