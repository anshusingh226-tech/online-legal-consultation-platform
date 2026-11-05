import { Request, Response } from "express";
import prisma from "../utils/prisma.js";

const toStr = (val: unknown): string => {
  if (Array.isArray(val)) return String(val[0] || "");
  if (typeof val === "string") return val;
  return "";
};

export const getLegalDomains = async (req: Request, res: Response) => {
  try {
    const { includeInactive } = req.query;

    const where: any = {};
    if (includeInactive !== "true") {
      where.isActive = true;
    }

    const domains = await prisma.legalDomain.findMany({
      where,
      include: {
        _count: {
          select: {
            lawyers: {
              where: {
                lawyer: {
                  verificationStatus: "APPROVED",
                },
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const formatted = domains.map((domain) => ({
      id: domain.id,
      name: domain.name,
      description: domain.description,
      isActive: domain.isActive,
      verifiedLawyersCount: domain._count.lawyers,
      createdAt: domain.createdAt,
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("Get legal domains error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createLegalDomain = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Legal domain name is required" });
    }

    const existing = await prisma.legalDomain.findUnique({
      where: { name: name.trim() },
    });

    if (existing) {
      return res.status(409).json({ success: false, message: "A legal domain with this name already exists" });
    }

    const domain = await prisma.legalDomain.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        isActive: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Legal domain created successfully",
      data: domain,
    });
  } catch (error) {
    console.error("Create legal domain error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateLegalDomain = async (req: Request, res: Response) => {
  try {
    const id = toStr(req.params.id);
    const { name, description, isActive } = req.body;

    const domain = await prisma.legalDomain.findUnique({ where: { id } });
    if (!domain) {
      return res.status(404).json({ success: false, message: "Legal domain not found" });
    }

    const data: any = {};
    if (name && name.trim()) data.name = name.trim();
    if (description !== undefined) data.description = description;
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const updated = await prisma.legalDomain.update({
      where: { id },
      data,
    });

    return res.status(200).json({
      success: true,
      message: "Legal domain updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update legal domain error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
