import { Request, Response } from "express";
import prisma from "../utils/prisma.js";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: "CLIENT" | "LAWYER" | "ADMIN";
  };
}

const validStatuses = [
  "PENDING",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
] as const;

type VerificationStatus = (typeof validStatuses)[number];

export const updateLawyerVerification = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const lawyerId = req.params.id;

    if (typeof lawyerId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid lawyer ID",
      });
    }

    const { status } = req.body;

    if (
      typeof status !== "string" ||
      !validStatuses.includes(status as VerificationStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification status",
      });
    }

    const lawyer = await prisma.lawyer.findUnique({
      where: {
        id: lawyerId,
      },
    });

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: "Lawyer not found",
      });
    }

    const updatedLawyer = await prisma.lawyer.update({
      where: {
        id: lawyerId,
      },
      data: {
        verificationStatus: status as VerificationStatus,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        legalDomains: {
          include: {
            legalDomain: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: `Lawyer verification status updated to ${status}`,
      data: updatedLawyer,
    });
  } catch (error) {
    console.error("Lawyer verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};