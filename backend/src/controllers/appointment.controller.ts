import { Request, Response } from "express";
import prisma from "../utils/prisma.js";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: "CLIENT" | "LAWYER" | "ADMIN";
  };
}

export const createAppointment = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const clientId = req.user?.userId;

    if (!clientId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      lawyerId,
      scheduledAt,
      duration,
      mode,
      notes,
    } = req.body;

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

    if (
      !Number.isInteger(Number(appointmentDuration)) ||
      Number(appointmentDuration) <= 0
    ) {
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
        id: lawyerId,
        verificationStatus: "APPROVED",
        user: {
          isActive: true,
        },
      },
    });

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: "Approved lawyer not found",
      });
    }

    const dayOfWeek = appointmentDate.getDay();

    const hours = appointmentDate.getHours()
      .toString()
      .padStart(2, "0");

    const minutes = appointmentDate.getMinutes()
      .toString()
      .padStart(2, "0");

    const appointmentTime = `${hours}:${minutes}`;

    const availability =
      await prisma.lawyerAvailability.findFirst({
        where: {
          lawyerId,
          dayOfWeek,
          isActive: true,
          startTime: {
            lte: appointmentTime,
          },
          endTime: {
            gte: appointmentTime,
          },
        },
      });

    if (!availability) {
      return res.status(400).json({
        success: false,
        message: "Lawyer is not available at the selected time",
      });
    }

    const appointmentEnd = new Date(
      appointmentDate.getTime() +
        Number(appointmentDuration) * 60 * 1000
    );

    const conflictingAppointment =
      await prisma.appointment.findFirst({
        where: {
          lawyerId,
          status: {
            in: ["PENDING", "ACCEPTED"],
          },
          scheduledAt: {
            lt: appointmentEnd,
          },
          AND: [
            {
              scheduledAt: {
                gte: new Date(
                  appointmentDate.getTime() -
                    Number(appointmentDuration) * 60 * 1000
                ),
              },
            },
          ],
        },
      });

    if (conflictingAppointment) {
      return res.status(409).json({
        success: false,
        message: "Lawyer already has an appointment around this time",
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientId,
        lawyerId,
        scheduledAt: appointmentDate,
        duration: Number(appointmentDuration),
        mode,
        notes,
        status: "PENDING",
      },
      include: {
        lawyer: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
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

export const getMyAppointments = async (
  req: AuthRequest,
  res: Response
) => {
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
        where: {
          clientId: userId,
        },
        orderBy: {
          scheduledAt: "desc",
        },
        include: {
          lawyer: {
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true,
                },
              },
            },
          },
          consultation: true,
          review: true,
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
        where: {
          userId,
        },
      });

      if (!lawyer) {
        return res.status(404).json({
          success: false,
          message: "Lawyer profile not found",
        });
      }

      const appointments = await prisma.appointment.findMany({
        where: {
          lawyerId: lawyer.id,
        },
        orderBy: {
          scheduledAt: "desc",
        },
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          consultation: true,
          review: true,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Appointments fetched successfully",
        data: appointments,
      });
    }

    return res.status(403).json({
      success: false,
      message: "This endpoint is not available for administrators",
    });
  } catch (error) {
    console.error("Get appointments error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};