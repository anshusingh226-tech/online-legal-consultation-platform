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

export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const clientId = req.user?.userId;
    if (!clientId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { lawyerId, scheduledAt, duration, mode, notes } = req.body;

    if (!lawyerId || !scheduledAt || !mode) {
      return res.status(400).json({
        success: false,
        message: "Lawyer, scheduled time and consultation mode are required",
      });
    }

    const allowedModes = ["AUDIO", "VIDEO", "CHAT"];
    if (!allowedModes.includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid consultation mode",
      });
    }

    const appointmentDuration = duration ?? 30;
    if (!Number.isInteger(Number(appointmentDuration)) || Number(appointmentDuration) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Duration must be a positive integer",
      });
    }

    const appointmentDate = new Date(scheduledAt);
    if (Number.isNaN(appointmentDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date and time",
      });
    }

    if (appointmentDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Appointment must be scheduled for a future time",
      });
    }

    const lawyer = await prisma.lawyer.findFirst({
      where: {
        id: String(lawyerId),
        verificationStatus: "APPROVED",
        user: { isActive: true },
      },
    });

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: "Approved lawyer not found",
      });
    }

    const dayOfWeek = appointmentDate.getDay();
    const hours = appointmentDate.getHours().toString().padStart(2, "0");
    const minutes = appointmentDate.getMinutes().toString().padStart(2, "0");
    const appointmentTime = `${hours}:${minutes}`;

    const availability = await prisma.lawyerAvailability.findFirst({
      where: {
        lawyerId: String(lawyerId),
        dayOfWeek,
        isActive: true,
        startTime: { lte: appointmentTime },
        endTime: { gte: appointmentTime },
      },
    });

    if (!availability) {
      return res.status(400).json({
        success: false,
        message: "Lawyer is not available at the selected time. Please check the lawyer's available schedule.",
      });
    }

    const appointmentEnd = new Date(
      appointmentDate.getTime() + Number(appointmentDuration) * 60 * 1000
    );

    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        lawyerId: String(lawyerId),
        status: { in: ["PENDING", "ACCEPTED"] },
        scheduledAt: { lt: appointmentEnd },
        AND: [
          {
            scheduledAt: {
              gte: new Date(appointmentDate.getTime() - Number(appointmentDuration) * 60 * 1000),
            },
          },
        ],
      },
    });

    if (conflictingAppointment) {
      return res.status(409).json({
        success: false,
        message: "Lawyer already has an appointment booked around this time slot",
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientId,
        lawyerId: String(lawyerId),
        scheduledAt: appointmentDate,
        duration: Number(appointmentDuration),
        mode,
        notes,
        status: "PENDING",
      },
      include: {
        lawyer: {
          include: {
            user: { select: { fullName: true, email: true, phone: true } },
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Appointment request created successfully",
      data: appointment,
    });
  } catch (error) {
    console.error("Create appointment error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMyAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId || !role) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (role === "CLIENT") {
      const appointments = await prisma.appointment.findMany({
        where: { clientId: userId },
        orderBy: { scheduledAt: "desc" },
        include: {
          lawyer: {
            include: {
              user: { select: { fullName: true, email: true, phone: true } },
              legalDomains: { include: { legalDomain: true } },
            },
          },
          consultation: true,
          review: true,
          documents: true,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Appointments fetched successfully",
        data: appointments,
      });
    }

    if (role === "LAWYER") {
      const lawyer = await prisma.lawyer.findUnique({
        where: { userId },
      });

      if (!lawyer) {
        return res.status(404).json({
          success: false,
          message: "Lawyer profile not found",
        });
      }

      const appointments = await prisma.appointment.findMany({
        where: { lawyerId: lawyer.id },
        orderBy: { scheduledAt: "desc" },
        include: {
          client: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
          consultation: true,
          review: true,
          documents: true,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Appointments fetched successfully",
        data: appointments,
      });
    }

    if (role === "ADMIN") {
      const appointments = await prisma.appointment.findMany({
        orderBy: { scheduledAt: "desc" },
        include: {
          client: { select: { id: true, fullName: true, email: true, phone: true } },
          lawyer: {
            include: {
              user: { select: { fullName: true, email: true } },
              legalDomains: { include: { legalDomain: true } },
            },
          },
          consultation: true,
          review: true,
        },
      });

      return res.status(200).json({
        success: true,
        message: "All appointments fetched successfully",
        data: appointments,
      });
    }

    return res.status(403).json({
      success: false,
      message: "Access forbidden",
    });
  } catch (error) {
    console.error("Get appointments error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAppointmentById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;
    const appointmentId = toStr(req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
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
        review: true,
        documents: {
          include: {
            uploadedBy: { select: { id: true, fullName: true, role: true } },
          },
        },
      },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (
      role !== "ADMIN" &&
      appointment.clientId !== userId &&
      appointment.lawyer.userId !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this appointment",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Appointment details fetched successfully",
      data: appointment,
    });
  } catch (error) {
    console.error("Get appointment by id error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;
    const appointmentId = toStr(req.params.id);
    const { status, notes } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const allowedStatuses = ["ACCEPTED", "REJECTED", "CANCELLED", "COMPLETED", "NO_SHOW"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(", ")}`,
      });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { lawyer: true },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (status === "ACCEPTED" || status === "REJECTED") {
      if (role !== "LAWYER" || appointment.lawyer.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: "Only the assigned lawyer can accept or reject this consultation request",
        });
      }
      if (appointment.status !== "PENDING") {
        return res.status(400).json({
          success: false,
          message: `Cannot change status to ${status} from current status ${appointment.status}`,
        });
      }
    } else if (status === "CANCELLED") {
      const isClient = appointment.clientId === userId;
      const isLawyer = appointment.lawyer.userId === userId;
      if (!isClient && !isLawyer && role !== "ADMIN") {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to cancel this appointment",
        });
      }
      if (appointment.status === "COMPLETED" || appointment.status === "REJECTED") {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel an appointment that is already ${appointment.status}`,
        });
      }
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status,
        ...(notes ? { notes } : {}),
      },
      include: {
        client: { select: { id: true, fullName: true, email: true } },
        lawyer: { include: { user: { select: { fullName: true } } } },
        consultation: true,
      },
    });

    if (status === "ACCEPTED") {
      await prisma.consultation.upsert({
        where: { appointmentId },
        update: { status: "SCHEDULED" },
        create: {
          appointmentId,
          status: "SCHEDULED",
        },
      });
    }

    if (status === "COMPLETED") {
      await prisma.consultation.upsert({
        where: { appointmentId },
        update: { status: "COMPLETED", endedAt: new Date() },
        create: {
          appointmentId,
          status: "COMPLETED",
          startedAt: new Date(),
          endedAt: new Date(),
          duration: appointment.duration,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    console.error("Update appointment status error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
