import { Router } from "express";
import { updateLawyerVerification } from "../controllers/admin.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.patch(
  "/lawyers/:id/verification",
  authenticate,
  authorize("ADMIN"),
  updateLawyerVerification
);

export default router;