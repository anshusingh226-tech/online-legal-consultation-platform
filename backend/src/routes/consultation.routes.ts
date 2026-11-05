import { Router } from "express";
import {
  getConsultation,
  startConsultation,
  endConsultation,
  saveConsultationSummary,
  sendChatMessage,
  getChatMessages,
} from "../controllers/consultation.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/:appointmentId", authenticate, getConsultation);
router.post("/:appointmentId/start", authenticate, startConsultation);
router.post("/:appointmentId/end", authenticate, endConsultation);
router.post("/:appointmentId/summary", authenticate, saveConsultationSummary);
router.post("/:appointmentId/chat", authenticate, sendChatMessage);
router.get("/:appointmentId/chat", authenticate, getChatMessages);

export default router;
