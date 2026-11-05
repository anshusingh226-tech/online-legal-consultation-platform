import { Request, Response } from "express";
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

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "CLIENT" | "LAWYER" | "ADMIN";
  text: string;
  timestamp: string;
}

const consultationChats = new Map<string, ChatMessage[]>();

export const getConsultation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;
    const appointmentId = toStr(req.params.appointmentId);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        client: { select: { id: true, fullName: true, email: true, phone: true } },
        lawyer: {
          include: {
            user: { select: { id: true, fullName: true, email: true, phone: true } },
            legalDomains: { include: { legalDomain: true } },
          },
        },
        consultation: true,
        documents: {
          include: {
            uploadedBy: { select: { id: true, fullName: true, role: true } },
          },
        },
      },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (
      role !== "ADMIN" &&
      appointment.clientId !== userId &&
      appointment.lawyer.userId !== userId
    ) {
      return res.status(403).json({ success: false, message: "Access denied to this consultation room" });
    }

    let consultation = appointment.consultation;
    if (!consultation && appointment.status !== "CANCELLED" && appointment.status !== "REJECTED") {
      consultation = await prisma.consultation.create({
        data: {
          appointmentId: appointment.id,
          status: appointment.status === "COMPLETED" ? "COMPLETED" : "SCHEDULED",
        },
      });
    }

    const messages = consultationChats.get(appointmentId) || [];

    return res.status(200).json({
      success: true,
      message: "Consultation retrieved successfully",
      data: {
        appointment,
        consultation,
        messages,
      },
    });
  } catch (error) {
    console.error("Get consultation error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const startConsultation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
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

    if (appointment.clientId !== userId && appointment.lawyer.userId !== userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const consultation = await prisma.consultation.upsert({
      where: { appointmentId },
      update: {
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
      create: {
        appointmentId,
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Consultation started",
      data: consultation,
    });
  } catch (error) {
    console.error("Start consultation error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const endConsultation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;
    const appointmentId = toStr(req.params.appointmentId);
    const { summary } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { lawyer: true, consultation: true },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.lawyer.userId !== userId && appointment.clientId !== userId && role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const startedAt = appointment.consultation?.startedAt || appointment.scheduledAt;
    const endedAt = new Date();
    const durationMinutes = Math.max(1, Math.round((endedAt.getTime() - new Date(startedAt).getTime()) / 60000));

    const consultation = await prisma.consultation.upsert({
      where: { appointmentId },
      update: {
        status: "COMPLETED",
        endedAt,
        duration: durationMinutes,
        summary: summary || appointment.consultation?.summary || "Consultation completed successfully.",
      },
      create: {
        appointmentId,
        status: "COMPLETED",
        startedAt,
        endedAt,
        duration: durationMinutes,
        summary: summary || "Consultation completed successfully.",
      },
    });

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: "COMPLETED" },
    });

    return res.status(200).json({
      success: true,
      message: "Consultation ended and marked as completed",
      data: consultation,
    });
  } catch (error) {
    console.error("End consultation error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const saveConsultationSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const appointmentId = toStr(req.params.appointmentId);
    const { summary } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (!summary || typeof summary !== "string") {
      return res.status(400).json({ success: false, message: "Summary text is required" });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { lawyer: true },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.lawyer.userId !== userId) {
      return res.status(403).json({ success: false, message: "Only the assigned lawyer can save consultation notes" });
    }

    const consultation = await prisma.consultation.upsert({
      where: { appointmentId },
      update: { summary },
      create: {
        appointmentId,
        summary,
        status: "SCHEDULED",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Consultation summary saved successfully",
      data: consultation,
    });
  } catch (error) {
    console.error("Save summary error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const sendChatMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role || "CLIENT";
    const appointmentId = toStr(req.params.appointmentId);
    const { text } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Message text cannot be empty" });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        client: { select: { id: true, fullName: true } },
        lawyer: { include: { user: { select: { id: true, fullName: true } } } },
      },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    let senderName = "User";
    if (appointment.clientId === userId) {
      senderName = appointment.client.fullName;
    } else if (appointment.lawyer.userId === userId) {
      senderName = appointment.lawyer.user.fullName;
    } else if (role === "ADMIN") {
      senderName = "Platform Admin";
    } else {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const message: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      senderId: userId,
      senderName,
      senderRole: role,
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    const existing = consultationChats.get(appointmentId) || [];
    existing.push(message);
    consultationChats.set(appointmentId, existing);

    return res.status(201).json({
      success: true,
      message: "Message sent",
      data: message,
    });
  } catch (error) {
    console.error("Send chat message error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getChatMessages = async (req: AuthRequest, res: Response) => {
  try {
    const appointmentId = toStr(req.params.appointmentId);
    const messages = consultationChats.get(appointmentId) || [];

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Get chat messages error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
