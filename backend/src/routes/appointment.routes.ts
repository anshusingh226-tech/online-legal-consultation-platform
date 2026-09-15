import { Router } from "express";
import {
  createAppointment,
  getMyAppointments,
} from "../controllers/appointment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  createAppointment
);

router.get(
  "/",
  authenticate,
  getMyAppointments
);

export default router;
