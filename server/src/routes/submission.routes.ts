import { Router } from "express";
import {
  getSubmissionUploadUrl,
  createSubmission,
  getSubmissionsByBounty,
  getMySubmissions,
} from "../controllers/submission.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/upload-url", requireAuth, getSubmissionUploadUrl);
router.post("/create", requireAuth, createSubmission);
router.get("/mine", requireAuth, getMySubmissions);
router.get("/bounty/:bountyId", getSubmissionsByBounty);

export default router;