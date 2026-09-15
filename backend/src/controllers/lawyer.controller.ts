import { Request, Response } from "express";
import prisma from "../utils/prisma.js";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: "CLIENT" | "LAWYER" | "ADMIN";
  };
}

export const applyAsLawyer = async (
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

    if (
      !Array.isArray(legalDomainIds) ||
      legalDomainIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one legal domain is required",
      });
    }

    if (
      !Number.isInteger(yearsOfExperience) ||
      yearsOfExperience < 0
    ) {
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
      where: {
        userId,
      },
    });

    if (existingLawyer) {
      return res.status(409).json({
        success: false,
        message: "Lawyer application already exists for this user",
      });
    }

    const existingBarNumber =
      await prisma.lawyer.findUnique({
        where: {
          barRegistrationNumber,
        },
      });

    if (existingBarNumber) {
      return res.status(409).json({
        success: false,
        message: "Bar registration number already exists",
      });
    }

    const domains = await prisma.legalDomain.findMany({
      where: {
        id: {
          in: legalDomainIds,
        },
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (domains.length !== legalDomainIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more legal domains are invalid or inactive",
      });
    }

    const lawyer = await prisma.lawyer.create({
      data: {
        userId,
        barRegistrationNumber,
        barCouncil,
        yearsOfExperience,
        location,
        consultationFee,
        bio,
        verificationStatus: "PENDING",
        legalDomains: {
          create: legalDomainIds.map(
            (legalDomainId: string) => ({
              legalDomain: {
                connect: {
                  id: legalDomainId,
                },
              },
            })
          ),
        },
      },
      include: {
        legalDomains: {
          include: {
            legalDomain: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Lawyer application submitted successfully",
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

export const getLawyers = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      legalDomain,
      location,
      minExperience,
      maxExperience,
      minFee,
      maxFee,
    } = req.query;

    const where: any = {
      verificationStatus: "APPROVED",
      user: {
        isActive: true,
      },
    };

    if (typeof location === "string" && location.trim()) {
      where.location = {
        contains: location.trim(),
        mode: "insensitive",
      };
    }

    if (
      typeof minExperience === "string" ||
      typeof maxExperience === "string"
    ) {
      where.yearsOfExperience = {};

      if (typeof minExperience === "string") {
        const value = Number(minExperience);

        if (!Number.isNaN(value) && value >= 0) {
          where.yearsOfExperience.gte = value;
        }
      }

      if (typeof maxExperience === "string") {
        const value = Number(maxExperience);

        if (!Number.isNaN(value) && value >= 0) {
          where.yearsOfExperience.lte = value;
        }
      }
    }

    if (
      typeof minFee === "string" ||
      typeof maxFee === "string"
    ) {
      where.consultationFee = {};

      if (typeof minFee === "string") {
        const value = Number(minFee);

        if (!Number.isNaN(value) && value >= 0) {
          where.consultationFee.gte = value;
        }
      }

      if (typeof maxFee === "string") {
        const value = Number(maxFee);

        if (!Number.isNaN(value) && value >= 0) {
          where.consultationFee.lte = value;
        }
      }
    }

    if (typeof legalDomain === "string" && legalDomain.trim()) {
      where.legalDomains = {
        some: {
          legalDomain: {
            name: {
              equals: legalDomain.trim(),
              mode: "insensitive",
            },
            isActive: true,
          },
        },
      };
    }

    const lawyers = await prisma.lawyer.findMany({
      where,
      orderBy: {
        yearsOfExperience: "desc",
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
            legalDomain: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        reviews: {
          where: {
            isPublished: true,
          },
          select: {
            rating: true,
            comment: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    const formattedLawyers = lawyers.map((lawyer) => {
      const ratings = lawyer.reviews.map((review) => review.rating);

      const averageRating =
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) /
            ratings.length
          : 0;

      return {
        id: lawyer.id,
        fullName: lawyer.user.fullName,
        location: lawyer.location,
        yearsOfExperience: lawyer.yearsOfExperience,
        consultationFee: lawyer.consultationFee,
        bio: lawyer.bio,
        barRegistrationNumber: lawyer.barRegistrationNumber,
        barCouncil: lawyer.barCouncil,
        verificationStatus: lawyer.verificationStatus,
        legalDomains: lawyer.legalDomains.map(
          (item) => item.legalDomain
        ),
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

export const getLawyerById = async (
  req: Request,
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

    const lawyer = await prisma.lawyer.findFirst({
      where: {
        id: lawyerId,
        verificationStatus: "APPROVED",
        user: {
          isActive: true,
        },
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
            legalDomain: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        reviews: {
          where: {
            isPublished: true,
          },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            client: {
              select: {
                fullName: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        availability: {
          where: {
            isActive: true,
          },
          orderBy: {
            dayOfWeek: "asc",
          },
        },
      },
    });

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: "Lawyer not found",
      });
    }

    const ratings = lawyer.reviews.map((review) => review.rating);

    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) /
          ratings.length
        : 0;

    return res.status(200).json({
      success: true,
      message: "Lawyer profile fetched successfully",
      data: {
        id: lawyer.id,
        fullName: lawyer.user.fullName,
        email: lawyer.user.email,
        phone: lawyer.user.phone,
        barRegistrationNumber: lawyer.barRegistrationNumber,
        barCouncil: lawyer.barCouncil,
        yearsOfExperience: lawyer.yearsOfExperience,
        location: lawyer.location,
        consultationFee: lawyer.consultationFee,
        bio: lawyer.bio,
        verificationStatus: lawyer.verificationStatus,
        legalDomains: lawyer.legalDomains.map(
          (item) => item.legalDomain
        ),
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