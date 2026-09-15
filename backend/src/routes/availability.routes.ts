import { Router } from "express";
import {
  createAvailability,
  getMyAvailability,
  deleteAvailability,
} from "../controllers/availability.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("LAWYER"),
  createAvailability
);

router.get(
  "/",
  authenticate,
  authorize("LAWYER"),
  getMyAvailability
);

router.delete(
  "/:id",
  authenticate,
  authorize("LAWYER"),
  deleteAvailability
);

export default router;
