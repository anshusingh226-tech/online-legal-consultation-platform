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

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const clientId = req.user?.userId;
    if (!clientId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const { appointmentId, rating, comment } = req.body;

    if (!appointmentId || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID and numeric rating (1-5) are required",
      });
    }

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
      });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: String(appointmentId) },
      include: { review: true },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.clientId !== clientId) {
      return res.status(403).json({
        success: false,
        message: "You can only review consultations you participated in as a client",
      });
    }

    if (appointment.status !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "You can only leave a review after the consultation is completed",
      });
    }

    if (appointment.review) {
      return res.status(409).json({
        success: false,
        message: "A review has already been submitted for this appointment",
      });
    }

    const review = await prisma.review.create({
      data: {
        clientId,
        lawyerId: appointment.lawyerId,
        appointmentId: String(appointmentId),
        rating: numericRating,
        comment: comment?.trim() || null,
        isPublished: true,
      },
      include: {
        client: { select: { fullName: true } },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Thank you! Your review has been submitted successfully.",
      data: review,
    });
  } catch (error) {
    console.error("Create review error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getLawyerReviews = async (req: Request, res: Response) => {
  try {
    const lawyerId = toStr(req.params.lawyerId);

    const reviews = await prisma.review.findMany({
      where: {
        lawyerId,
        isPublished: true,
      },
      include: {
        client: { select: { fullName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        averageRating: Number(averageRating.toFixed(2)),
        totalReviews: reviews.length,
      },
    });
  } catch (error) {
    console.error("Get lawyer reviews error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
