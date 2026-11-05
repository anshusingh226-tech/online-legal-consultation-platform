import { Router } from "express";
import { createReview, getLawyerReviews } from "../controllers/review.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authenticate, createReview);
router.get("/lawyer/:lawyerId", getLawyerReviews);

export default router;
