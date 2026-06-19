import { Router } from "express";
import {
  createBounty,
  getAllBounties,
  getMyBounties,
  getBountyUploadUrl,
} from "../controllers/bounty.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/upload-url", requireAuth, getBountyUploadUrl);
router.post("/create", requireAuth, createBounty);
router.get("/all", getAllBounties);
router.get("/mine", requireAuth, getMyBounties);

export default router;