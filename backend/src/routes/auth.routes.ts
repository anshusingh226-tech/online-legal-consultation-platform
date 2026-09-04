import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import { authenticate, AuthRequest } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authenticate, (req: AuthRequest, res) => {
  return res.status(200).json({
    success: true,
    message: "Authentication successful",
    data: {
      userId: req.user?.userId,
      role: req.user?.role,
    },
  });
});

router.get("/client-only", authenticate, authorize("CLIENT"), (req: AuthRequest, res) => {
  return res.status(200).json({
    success: true,
    message: "Client authorization successful",
    data: {
      userId: req.user?.userId,
      role: req.user?.role,
    },
  });
});

export default router;