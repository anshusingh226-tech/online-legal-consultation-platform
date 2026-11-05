import { Router } from "express";
import {
  upload,
  uploadDocument,
  getMyDocuments,
  getAppointmentDocuments,
  getLawyerVerificationDocuments,
  downloadDocument,
} from "../controllers/document.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/upload", authenticate, upload.single("file"), uploadDocument);
router.get("/my", authenticate, getMyDocuments);
router.get("/appointment/:appointmentId", authenticate, getAppointmentDocuments);
router.get("/lawyer/:lawyerId", authenticate, getLawyerVerificationDocuments);
router.get("/download/:id", downloadDocument);

export default router;
