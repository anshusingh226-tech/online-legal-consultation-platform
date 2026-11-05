import { Router } from "express";
import {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointmentStatus,
} from "../controllers/appointment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authenticate, createAppointment);
router.get("/", authenticate, getMyAppointments);
router.get("/:id", authenticate, getAppointmentById);
router.patch("/:id/status", authenticate, updateAppointmentStatus);

export default router;
