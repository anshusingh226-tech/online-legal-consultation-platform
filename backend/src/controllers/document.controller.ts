import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import prisma from "../utils/prisma.js";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: "CLIENT" | "LAWYER" | "ADMIN";
  };
}

const toStr = (val: unknown): string => {
  if (Array.isArray(val)) return String(val[0] || "");
  if (typeof val === "string") return val;
  return "";
};

const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type. Only PDF, Images, Word, and Text documents are allowed."));
    }
  },
});

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const appointmentId = req.body.appointmentId ? String(req.body.appointmentId) : null;
    const documentType = req.body.type === "LAWYER_VERIFICATION" ? "LAWYER_VERIFICATION" : "CONSULTATION";

    if (appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
      });
      if (!appointment) {
        return res.status(404).json({ success: false, message: "Appointment not found" });
      }
    }

    const document = await prisma.document.create({
      data: {
        uploadedById: userId,
        appointmentId: appointmentId || null,
        fileName: req.file.originalname,
        storageKey: req.file.filename,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        type: documentType,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: document,
    });
  } catch (error: any) {
    console.error("Upload document error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to upload document" });
  }
};

export const getMyDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const documents = await prisma.document.findMany({
      where: { uploadedById: userId },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      message: "Documents fetched successfully",
      data: documents,
    });
  } catch (error) {
    console.error("Get my documents error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAppointmentDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const appointmentId = toStr(req.params.appointmentId);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { lawyer: true },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (
      userRole !== "ADMIN" &&
      appointment.clientId !== userId &&
      appointment.lawyer.userId !== userId
    ) {
      return res.status(403).json({ success: false, message: "Access denied to this appointment's documents" });
    }

    const documents = await prisma.document.findMany({
      where: { appointmentId },
      include: {
        uploadedBy: {
          select: { id: true, fullName: true, role: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json({
      success: true,
      message: "Appointment documents fetched successfully",
      data: documents,
    });
  } catch (error) {
    console.error("Get appointment documents error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getLawyerVerificationDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const lawyerId = toStr(req.params.lawyerId);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const lawyer = await prisma.lawyer.findUnique({
      where: { id: lawyerId },
    });

    if (!lawyer) {
      return res.status(404).json({ success: false, message: "Lawyer not found" });
    }

    if (userRole !== "ADMIN" && lawyer.userId !== userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const documents = await prisma.document.findMany({
      where: {
        uploadedById: lawyer.userId,
        type: "LAWYER_VERIFICATION",
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      message: "Lawyer verification documents fetched",
      data: documents,
    });
  } catch (error) {
    console.error("Get lawyer verification documents error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const downloadDocument = async (req: Request, res: Response) => {
  try {
    const documentId = toStr(req.params.id);
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    const filePath = path.join(uploadsDir, document.storageKey);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "File missing on storage disk" });
    }

    res.setHeader("Content-Disposition", `inline; filename="${document.fileName}"`);
    res.setHeader("Content-Type", document.mimeType);
    return res.sendFile(filePath);
  } catch (error) {
    console.error("Download document error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
