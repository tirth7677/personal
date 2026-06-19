import { Router } from "express";
import { createOrder, verifyPayment, getPaymentHistory,getBcoinsUsage } from "../controllers/payment.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/create-order", requireAuth, createOrder);
router.post("/verify", requireAuth, verifyPayment);
router.get("/history", requireAuth, getPaymentHistory);
router.get("/bcoins-usage", requireAuth, getBcoinsUsage);

export default router;