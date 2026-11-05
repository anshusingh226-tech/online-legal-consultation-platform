import { Router } from "express";
import {
  getLegalDomains,
  createLegalDomain,
  updateLegalDomain,
} from "../controllers/legal-domain.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.get("/", getLegalDomains);
router.post("/", authenticate, authorize("ADMIN"), createLegalDomain);
router.patch("/:id", authenticate, authorize("ADMIN"), updateLegalDomain);

export default router;
