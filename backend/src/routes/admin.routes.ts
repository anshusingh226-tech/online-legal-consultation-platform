import { Router } from "express";
import {
  updateLawyerVerification,
  getAllLawyers,
  getAllUsers,
  toggleUserActiveStatus,
  getAllConsultations,
  getAdminAnalytics,
} from "../controllers/admin.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

// All routes require ADMIN role
router.use(authenticate, authorize("ADMIN"));

router.get("/analytics", getAdminAnalytics);
router.get("/lawyers", getAllLawyers);
router.patch("/lawyers/:id/verification", updateLawyerVerification);
router.get("/users", getAllUsers);
router.patch("/users/:id/status", toggleUserActiveStatus);
router.get("/consultations", getAllConsultations);

export default router;
