import { Router } from "express";
import { createBounty, getAllBounties, getMyBounties } from "../controllers/bounty.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

const router = Router();

router.post("/create", requireAuth, upload.single("file"), createBounty);
router.get("/all", getAllBounties);
router.get("/mine", requireAuth, getMyBounties);

export default router;