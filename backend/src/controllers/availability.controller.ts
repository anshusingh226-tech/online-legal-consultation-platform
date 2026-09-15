import { Request, Response } from "express";
import prisma from "../utils/prisma.js";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: "CLIENT" | "LAWYER" | "ADMIN";
  };
}

export const createAvailability = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      dayOfWeek,
      startTime,
      endTime,
    } = req.body;

    if (
      dayOfWeek === undefined ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Day, start time and end time are required",
      });
    }

    if (
      !Number.isInteger(Number(dayOfWeek)) ||
      Number(dayOfWeek) < 0 ||
      Number(dayOfWeek) > 6
    ) {
      return res.status(400).json({
        success: false,
        message: "Day of week must be between 0 and 6",
      });
    }

    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (!timePattern.test(startTime) || !timePattern.test(endTime)) {
      return res.status(400).json({
        success: false,
        message: "Time must be in HH:MM format",
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "Start time must be before end time",
      });
    }

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

    if (lawyer.verificationStatus !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: "Only approved lawyers can set availability",
      });
    }

    const availability = await prisma.lawyerAvailability.create({
      data: {
        lawyerId: lawyer.id,
        dayOfWeek: Number(dayOfWeek),
        startTime,
        endTime,
        isActive: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Availability created successfully",
      data: availability,
    });
  } catch (error) {
    console.error("Create availability error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMyAvailability = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

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

    const availability = await prisma.lawyerAvailability.findMany({
      where: {
        lawyerId: lawyer.id,
        isActive: true,
      },
      orderBy: [
        {
          dayOfWeek: "asc",
        },
        {
          startTime: "asc",
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Availability fetched successfully",
      data: availability,
    });
  } catch (error) {
    console.error("Get availability error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteAvailability = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const availabilityId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (typeof availabilityId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid availability ID",
      });
    }

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

    const availability =
      await prisma.lawyerAvailability.findFirst({
        where: {
          id: availabilityId,
          lawyerId: lawyer.id,
        },
      });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability not found",
      });
    }

    await prisma.lawyerAvailability.delete({
      where: {
        id: availabilityId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Availability deleted successfully",
    });
  } catch (error) {
    console.error("Delete availability error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};