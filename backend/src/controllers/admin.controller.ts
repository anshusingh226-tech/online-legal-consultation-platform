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

const validStatuses = [
  "PENDING",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
] as const;

type VerificationStatus = (typeof validStatuses)[number];

export const updateLawyerVerification = async (req: AuthRequest, res: Response) => {
  try {
    const lawyerId = toStr(req.params.id);
    const { status } = req.body;

    if (!validStatuses.includes(status as VerificationStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid verification status. Allowed: ${validStatuses.join(", ")}`,
      });
    }

    const lawyer = await prisma.lawyer.findUnique({
      where: { id: lawyerId },
      include: { user: true },
    });

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: "Lawyer not found",
      });
    }

    const updatedLawyer = await prisma.lawyer.update({
      where: { id: lawyerId },
      data: {
        verificationStatus: status as VerificationStatus,
      },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        legalDomains: { include: { legalDomain: true } },
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

export const getAllLawyers = async (req: AuthRequest, res: Response) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    const where: any = {};
    if (status && status !== "ALL") {
      where.verificationStatus = status as VerificationStatus;
    }

    if (search && search.trim()) {
      where.OR = [
        { user: { fullName: { contains: search.trim(), mode: "insensitive" } } },
        { user: { email: { contains: search.trim(), mode: "insensitive" } } },
        { barRegistrationNumber: { contains: search.trim(), mode: "insensitive" } },
        { location: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const lawyers = await prisma.lawyer.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true, isActive: true, createdAt: true } },
        legalDomains: { include: { legalDomain: true } },
        reviews: { select: { rating: true } },
        _count: { select: { appointments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Also attach verification documents for each lawyer
    const lawyerUserIds = lawyers.map((l) => l.userId);
    const documents = await prisma.document.findMany({
      where: {
        uploadedById: { in: lawyerUserIds },
        type: "LAWYER_VERIFICATION",
      },
    });

    const docsByUserId = new Map<string, typeof documents>();
    documents.forEach((doc) => {
      const arr = docsByUserId.get(doc.uploadedById) || [];
      arr.push(doc);
      docsByUserId.set(doc.uploadedById, arr);
    });

    const formatted = lawyers.map((lawyer) => {
      const ratings = lawyer.reviews.map((r) => r.rating);
      const avgRating =
        ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;

      return {
        id: lawyer.id,
        userId: lawyer.userId,
        fullName: lawyer.user.fullName,
        email: lawyer.user.email,
        phone: lawyer.user.phone,
        isActive: lawyer.user.isActive,
        barRegistrationNumber: lawyer.barRegistrationNumber,
        barCouncil: lawyer.barCouncil,
        yearsOfExperience: lawyer.yearsOfExperience,
        location: lawyer.location,
        consultationFee: Number(lawyer.consultationFee),
        bio: lawyer.bio,
        verificationStatus: lawyer.verificationStatus,
        createdAt: lawyer.createdAt,
        legalDomains: lawyer.legalDomains.map((ld) => ld.legalDomain),
        averageRating: Number(avgRating.toFixed(2)),
        totalAppointments: lawyer._count.appointments,
        verificationDocuments: docsByUserId.get(lawyer.userId) || [],
      };
    });

    return res.status(200).json({
      success: true,
      message: "Lawyers fetched successfully",
      data: formatted,
    });
  } catch (error) {
    console.error("Get all lawyers error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const role = typeof req.query.role === "string" ? req.query.role : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    const where: any = {};
    if (role && role !== "ALL") {
      where.role = role;
    }

    if (search && search.trim()) {
      where.OR = [
        { fullName: { contains: search.trim(), mode: "insensitive" } },
        { email: { contains: search.trim(), mode: "insensitive" } },
        { phone: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        lawyer: {
          select: {
            id: true,
            verificationStatus: true,
            barRegistrationNumber: true,
          },
        },
        _count: {
          select: {
            appointments: true,
            reviews: true,
            documents: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const toggleUserActiveStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = toStr(req.params.id);
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ success: false, message: "isActive boolean is required" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: { id: true, fullName: true, email: true, role: true, isActive: true },
    });

    return res.status(200).json({
      success: true,
      message: `User ${updated.fullName} is now ${isActive ? "active" : "deactivated"}`,
      data: updated,
    });
  } catch (error) {
    console.error("Toggle user status error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAllConsultations = async (req: AuthRequest, res: Response) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const mode = typeof req.query.mode === "string" ? req.query.mode : undefined;

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (mode && mode !== "ALL") {
      where.mode = mode;
    }

    const appointments = await prisma.appointment.findMany({
      where,
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
      },
      orderBy: { scheduledAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      message: "Consultations and appointments fetched successfully",
      data: appointments,
    });
  } catch (error) {
    console.error("Get all consultations error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAdminAnalytics = async (_req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const clientCount = await prisma.user.count({ where: { role: "CLIENT" } });
    const lawyerUserCount = await prisma.user.count({ where: { role: "LAWYER" } });
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });

    const totalLawyers = await prisma.lawyer.count();
    const verifiedLawyers = await prisma.lawyer.count({ where: { verificationStatus: "APPROVED" } });
    const pendingLawyers = await prisma.lawyer.count({ where: { verificationStatus: "PENDING" } });
    const underReviewLawyers = await prisma.lawyer.count({ where: { verificationStatus: "UNDER_REVIEW" } });
    const rejectedLawyers = await prisma.lawyer.count({
      where: { verificationStatus: { in: ["REJECTED", "SUSPENDED"] } },
    });

    const totalAppointments = await prisma.appointment.count();
    const completedAppointments = await prisma.appointment.count({ where: { status: "COMPLETED" } });
    const pendingAppointments = await prisma.appointment.count({ where: { status: "PENDING" } });
    const acceptedAppointments = await prisma.appointment.count({ where: { status: "ACCEPTED" } });
    const cancelledAppointments = await prisma.appointment.count({ where: { status: "CANCELLED" } });

    const bookingRate = clientCount > 0 ? (totalAppointments / clientCount).toFixed(2) : "0.00";

    const completedConsultations = await prisma.consultation.findMany({
      where: { status: "COMPLETED", duration: { not: null } },
      select: { duration: true },
    });

    const avgDuration =
      completedConsultations.length > 0
        ? Math.round(
            completedConsultations.reduce((sum, c) => sum + (c.duration || 0), 0) /
              completedConsultations.length
          )
        : 30;

    const reviews = await prisma.review.findMany({
      where: { isPublished: true },
      select: { rating: true },
    });

    const avgSatisfactionRating =
      reviews.length > 0
        ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2))
        : 5.0;

    const completedWithLawyer = await prisma.appointment.findMany({
      where: { status: "COMPLETED" },
      include: { lawyer: { select: { consultationFee: true } } },
    });

    const totalPlatformVolume = completedWithLawyer.reduce(
      (sum, appt) => sum + Number(appt.lawyer.consultationFee),
      0
    );

    const domainCounts = await prisma.legalDomain.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        _count: { select: { lawyers: true } },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Admin platform analytics and KPIs fetched successfully",
      data: {
        kpis: {
          totalRegisteredUsers: totalUsers,
          totalClients: clientCount,
          totalLawyers,
          verifiedLawyers,
          pendingLawyers,
          totalAppointments,
          completedAppointments,
          bookingRate: Number(bookingRate),
          averageConsultationDuration: avgDuration,
          userSatisfactionRating: avgSatisfactionRating,
          totalReviewsCount: reviews.length,
          totalPlatformVolume,
        },
        usersBreakdown: {
          clients: clientCount,
          lawyers: lawyerUserCount,
          admins: adminCount,
        },
        lawyerStatusBreakdown: {
          approved: verifiedLawyers,
          pending: pendingLawyers,
          underReview: underReviewLawyers,
          rejectedOrSuspended: rejectedLawyers,
        },
        appointmentBreakdown: {
          total: totalAppointments,
          completed: completedAppointments,
          accepted: acceptedAppointments,
          pending: pendingAppointments,
          cancelled: cancelledAppointments,
        },
        domainsDistribution: domainCounts.map((d) => ({
          name: d.name,
          lawyersCount: d._count.lawyers,
        })),
      },
    });
  } catch (error) {
    console.error("Get admin analytics error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
