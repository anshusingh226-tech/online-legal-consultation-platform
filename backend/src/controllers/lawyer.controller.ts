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

export const applyAsLawyer = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      barRegistrationNumber,
      barCouncil,
      yearsOfExperience,
      location,
      consultationFee,
      bio,
      legalDomainIds,
    } = req.body;

    if (
      !barRegistrationNumber ||
      !barCouncil ||
      yearsOfExperience === undefined ||
      !location ||
      consultationFee === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All required lawyer details must be provided",
      });
    }

    if (!Array.isArray(legalDomainIds) || legalDomainIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one legal domain is required",
      });
    }

    if (!Number.isInteger(Number(yearsOfExperience)) || Number(yearsOfExperience) < 0) {
      return res.status(400).json({
        success: false,
        message: "Years of experience must be a valid non-negative integer",
      });
    }

    if (Number(consultationFee) < 0) {
      return res.status(400).json({
        success: false,
        message: "Consultation fee cannot be negative",
      });
    }

    const existingLawyer = await prisma.lawyer.findUnique({
      where: { userId },
    });

    if (existingLawyer) {
      return res.status(409).json({
        success: false,
        message: "Lawyer application already exists for this user",
      });
    }

    const existingBarNumber = await prisma.lawyer.findUnique({
      where: { barRegistrationNumber: String(barRegistrationNumber) },
    });

    if (existingBarNumber) {
      return res.status(409).json({
        success: false,
        message: "Bar registration number already registered on the platform",
      });
    }

    const domains = await prisma.legalDomain.findMany({
      where: {
        id: { in: legalDomainIds },
        isActive: true,
      },
      select: { id: true },
    });

    if (domains.length !== legalDomainIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more legal domains are invalid or inactive",
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: "LAWYER" },
    });

    const lawyer = await prisma.lawyer.create({
      data: {
        userId,
        barRegistrationNumber: String(barRegistrationNumber),
        barCouncil: String(barCouncil),
        yearsOfExperience: Number(yearsOfExperience),
        location: String(location),
        consultationFee: Number(consultationFee),
        bio: bio ? String(bio) : null,
        verificationStatus: "PENDING",
        legalDomains: {
          create: legalDomainIds.map((legalDomainId: string) => ({
            legalDomain: { connect: { id: String(legalDomainId) } },
          })),
        },
      },
      include: {
        legalDomains: { include: { legalDomain: true } },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Lawyer application submitted successfully. Your profile is now under review by platform admins.",
      data: lawyer,
    });
  } catch (error) {
    console.error("Lawyer application error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getLawyers = async (req: Request, res: Response) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
    const legalDomain = typeof req.query.legalDomain === "string" ? req.query.legalDomain.trim() : undefined;
    const location = typeof req.query.location === "string" ? req.query.location.trim() : undefined;
    const minExperience = typeof req.query.minExperience === "string" ? req.query.minExperience : undefined;
    const maxExperience = typeof req.query.maxExperience === "string" ? req.query.maxExperience : undefined;
    const minFee = typeof req.query.minFee === "string" ? req.query.minFee : undefined;
    const maxFee = typeof req.query.maxFee === "string" ? req.query.maxFee : undefined;

    const where: any = {
      verificationStatus: "APPROVED",
      user: { isActive: true },
    };

    if (search) {
      where.OR = [
        { user: { fullName: { contains: search, mode: "insensitive" } } },
        { bio: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        {
          legalDomains: {
            some: {
              legalDomain: {
                name: { contains: search, mode: "insensitive" },
              },
            },
          },
        },
      ];
    }

    if (location) {
      where.location = {
        contains: location,
        mode: "insensitive",
      };
    }

    if (legalDomain) {
      where.legalDomains = {
        some: {
          legalDomain: {
            OR: [
              { id: legalDomain },
              { name: { contains: legalDomain, mode: "insensitive" } },
            ],
          },
        },
      };
    }

    if (minExperience !== undefined || maxExperience !== undefined) {
      where.yearsOfExperience = {};
      if (minExperience !== undefined) {
        const val = Number(minExperience);
        if (!Number.isNaN(val) && val >= 0) where.yearsOfExperience.gte = val;
      }
      if (maxExperience !== undefined) {
        const val = Number(maxExperience);
        if (!Number.isNaN(val) && val >= 0) where.yearsOfExperience.lte = val;
      }
    }

    if (minFee !== undefined || maxFee !== undefined) {
      where.consultationFee = {};
      if (minFee !== undefined) {
        const val = Number(minFee);
        if (!Number.isNaN(val) && val >= 0) where.consultationFee.gte = val;
      }
      if (maxFee !== undefined) {
        const val = Number(maxFee);
        if (!Number.isNaN(val) && val >= 0) where.consultationFee.lte = val;
      }
    }

    const lawyers = await prisma.lawyer.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        legalDomains: {
          include: {
            legalDomain: { select: { id: true, name: true, description: true } },
          },
        },
        reviews: {
          where: { isPublished: true },
          select: { rating: true, comment: true, createdAt: true },
        },
        availability: {
          where: { isActive: true },
        },
      },
      orderBy: { yearsOfExperience: "desc" },
    });

    const formattedLawyers = lawyers.map((lawyer) => {
      const ratings = lawyer.reviews.map((r) => r.rating);
      const averageRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : 0;

      return {
        id: lawyer.id,
        userId: lawyer.userId,
        fullName: lawyer.user.fullName,
        email: lawyer.user.email,
        phone: lawyer.user.phone,
        location: lawyer.location,
        yearsOfExperience: lawyer.yearsOfExperience,
        consultationFee: Number(lawyer.consultationFee),
        bio: lawyer.bio,
        barRegistrationNumber: lawyer.barRegistrationNumber,
        barCouncil: lawyer.barCouncil,
        verificationStatus: lawyer.verificationStatus,
        legalDomains: lawyer.legalDomains.map((ld) => ld.legalDomain),
        availability: lawyer.availability,
        averageRating: Number(averageRating.toFixed(2)),
        totalReviews: lawyer.reviews.length,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Lawyers fetched successfully",
      data: formattedLawyers,
    });
  } catch (error) {
    console.error("Lawyer discovery error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getLawyerById = async (req: Request, res: Response) => {
  try {
    const lawyerId = toStr(req.params.id);

    const lawyer = await prisma.lawyer.findFirst({
      where: {
        id: lawyerId,
        user: { isActive: true },
      },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        legalDomains: {
          include: {
            legalDomain: { select: { id: true, name: true, description: true } },
          },
        },
        reviews: {
          where: { isPublished: true },
          include: { client: { select: { fullName: true } } },
          orderBy: { createdAt: "desc" },
        },
        availability: {
          where: { isActive: true },
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
      },
    });

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: "Lawyer not found",
      });
    }

    const ratings = lawyer.reviews.map((r: { rating: number }) => r.rating);
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length
        : 0;

    return res.status(200).json({
      success: true,
      message: "Lawyer profile fetched successfully",
      data: {
        id: lawyer.id,
        userId: lawyer.userId,
        fullName: lawyer.user.fullName,
        email: lawyer.user.email,
        phone: lawyer.user.phone,
        barRegistrationNumber: lawyer.barRegistrationNumber,
        barCouncil: lawyer.barCouncil,
        yearsOfExperience: lawyer.yearsOfExperience,
        location: lawyer.location,
        consultationFee: Number(lawyer.consultationFee),
        bio: lawyer.bio,
        verificationStatus: lawyer.verificationStatus,
        legalDomains: lawyer.legalDomains.map((ld: { legalDomain: any }) => ld.legalDomain),
        averageRating: Number(averageRating.toFixed(2)),
        totalReviews: lawyer.reviews.length,
        reviews: lawyer.reviews,
        availability: lawyer.availability,
      },
    });
  } catch (error) {
    console.error("Lawyer profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMyLawyerProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const lawyer = await prisma.lawyer.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        legalDomains: {
          include: {
            legalDomain: true,
          },
        },
        availability: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
        reviews: {
          include: { client: { select: { fullName: true } } },
        },
      },
    });

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: "Lawyer profile not found. You can apply as a lawyer first.",
      });
    }

    const ratings = lawyer.reviews.map((r: { rating: number }) => r.rating);
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length
        : 0;

    const verificationDocuments = await prisma.document.findMany({
      where: {
        uploadedById: userId,
        type: "LAWYER_VERIFICATION",
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      message: "My lawyer profile fetched successfully",
      data: {
        ...lawyer,
        consultationFee: Number(lawyer.consultationFee),
        averageRating: Number(averageRating.toFixed(2)),
        totalReviews: lawyer.reviews.length,
        verificationDocuments,
      },
    });
  } catch (error) {
    console.error("Get my lawyer profile error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateLawyerProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const lawyer = await prisma.lawyer.findUnique({ where: { userId } });
    if (!lawyer) {
      return res.status(404).json({ success: false, message: "Lawyer profile not found" });
    }

    const {
      bio,
      location,
      consultationFee,
      yearsOfExperience,
      legalDomainIds,
    } = req.body;

    const data: any = {};
    if (bio !== undefined) data.bio = bio;
    if (location !== undefined) data.location = location;
    if (consultationFee !== undefined) data.consultationFee = Number(consultationFee);
    if (yearsOfExperience !== undefined) data.yearsOfExperience = Number(yearsOfExperience);

    if (Array.isArray(legalDomainIds)) {
      await prisma.lawyerLegalDomain.deleteMany({
        where: { lawyerId: lawyer.id },
      });
      data.legalDomains = {
        create: legalDomainIds.map((legalDomainId: string) => ({
          legalDomain: { connect: { id: String(legalDomainId) } },
        })),
      };
    }

    const updated = await prisma.lawyer.update({
      where: { id: lawyer.id },
      data,
      include: {
        legalDomains: { include: { legalDomain: true } },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Lawyer profile updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update lawyer profile error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getLawyerEarnings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const lawyer = await prisma.lawyer.findUnique({ where: { userId } });
    if (!lawyer) {
      return res.status(404).json({ success: false, message: "Lawyer profile not found" });
    }

    const appointments = await prisma.appointment.findMany({
      where: { lawyerId: lawyer.id },
      include: {
        client: { select: { id: true, fullName: true, email: true } },
        consultation: true,
      },
      orderBy: { scheduledAt: "desc" },
    });

    const fee = Number(lawyer.consultationFee);

    const completed = appointments.filter((a) => a.status === "COMPLETED");
    const accepted = appointments.filter((a) => a.status === "ACCEPTED");
    const pending = appointments.filter((a) => a.status === "PENDING");

    const totalEarned = completed.length * fee;
    const pendingEarnings = accepted.length * fee;

    const monthlyMap = new Map<string, { month: string; amount: number; consultations: number }>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`;
      monthlyMap.set(key, { month: key, amount: 0, consultations: 0 });
    }

    for (const appt of completed) {
      const d = new Date(appt.scheduledAt);
      const key = `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`;
      if (monthlyMap.has(key)) {
        const item = monthlyMap.get(key)!;
        item.amount += fee;
        item.consultations += 1;
      }
    }

    const earningsHistory = completed.map((appt) => ({
      id: appt.id,
      clientName: appt.client.fullName,
      clientEmail: appt.client.email,
      date: appt.scheduledAt,
      duration: appt.duration,
      mode: appt.mode,
      amount: fee,
      status: "COMPLETED",
    }));

    return res.status(200).json({
      success: true,
      message: "Earnings dashboard fetched successfully",
      data: {
        consultationFee: fee,
        totalEarned,
        pendingEarnings,
        completedCount: completed.length,
        acceptedCount: accepted.length,
        pendingCount: pending.length,
        totalAppointments: appointments.length,
        monthlyTrend: Array.from(monthlyMap.values()),
        recentEarnings: earningsHistory.slice(0, 10),
      },
    });
  } catch (error) {
    console.error("Get lawyer earnings error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
