import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import lawyerRoutes from "./routes/lawyer.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import availabilityRoutes from "./routes/availability.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use("/api/v1/appointments", appointmentRoutes);

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Online Legal Consultation Platform API is running",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/lawyers/availability", availabilityRoutes);
app.use("/api/v1/lawyers", lawyerRoutes);
app.use("/api/v1/admin", adminRoutes);

export default app;