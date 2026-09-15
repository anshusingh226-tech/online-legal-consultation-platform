import { Router } from "express";
import {
  applyAsLawyer,
  getLawyers,
  getLawyerById,
} from "../controllers/lawyer.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getLawyers);

router.get("/:id", getLawyerById);

router.post("/apply", authenticate, applyAsLawyer);

export default router;