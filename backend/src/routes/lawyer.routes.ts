import { Router } from "express";
import {
  applyAsLawyer,
  getLawyers,
  getLawyerById,
  getMyLawyerProfile,
  updateLawyerProfile,
  getLawyerEarnings,
} from "../controllers/lawyer.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.get("/", getLawyers);
router.post("/apply", authenticate, applyAsLawyer);
router.get("/me/profile", authenticate, authorize("LAWYER"), getMyLawyerProfile);
router.patch("/me/profile", authenticate, authorize("LAWYER"), updateLawyerProfile);
router.get("/me/earnings", authenticate, authorize("LAWYER"), getLawyerEarnings);
router.get("/:id", getLawyerById);

export default router;
