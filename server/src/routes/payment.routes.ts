import { Router } from "express";
import { createOrder, verifyPayment, getPaymentHistory } from "../controllers/payment.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/create-order", requireAuth, createOrder);
router.post("/verify", requireAuth, verifyPayment);
router.get("/history", requireAuth, getPaymentHistory);

export default router;