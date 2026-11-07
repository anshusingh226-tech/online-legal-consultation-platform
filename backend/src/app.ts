import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";

import authRoutes from "./routes/auth.routes.js";
import lawyerRoutes from "./routes/lawyer.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import availabilityRoutes from "./routes/availability.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import consultationRoutes from "./routes/consultation.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import documentRoutes from "./routes/document.routes.js";
import legalDomainRoutes from "./routes/legal-domain.routes.js";

dotenv.config();

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());

// Serve static uploads
const uploadsDir = path.resolve(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsDir));

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Online Legal Consultation Platform API is operational",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/lawyers/availability", availabilityRoutes);
app.use("/api/v1/lawyers", lawyerRoutes);
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/consultations", consultationRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/documents", documentRoutes);
app.use("/api/v1/legal-domains", legalDomainRoutes);
app.use("/api/v1/admin", adminRoutes);

export default app;
