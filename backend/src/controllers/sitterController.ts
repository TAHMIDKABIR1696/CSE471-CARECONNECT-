import { Request, Response } from "express";
import prisma from "../config/db.js";
import { AuthRequest } from "../types/index.js";

// @route   POST /api/sitters/availability
// @desc    Update Availability
export const updateAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { schedule } = req.body as {
      schedule?: Array<{ dayOfWeek: string; startTime: string; endTime: string }>;
    };

    const sitterProfile = await prisma.babysitter.findUnique({
      where: { userId },
    });

    if (!sitterProfile) {
      res.status(404).json({ message: "Sitter profile not found" });
      return;
    }

    await prisma.availability.deleteMany({
      where: { babysitterId: sitterProfile.id },
    });

    if (schedule && schedule.length > 0) {
      const formattedData = schedule.map((item) => ({
        babysitterId: sitterProfile.id,
        dayOfWeek: item.dayOfWeek,
        startTime: item.startTime,
        endTime: item.endTime,
      }));

      await prisma.availability.createMany({
        data: formattedData,
      });
    }

    res.status(200).json({ success: true, message: "Availability updated!" });
  } catch (error) {
    console.error("Update Availability Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get My Sitter Profile
// @route   GET /api/sitters/me
// @access  Private (Babysitter only)
export const getMySitterProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const sitter = await prisma.babysitter.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phoneNumber: true,
            profilePicture: true,
          },
        },
        certifications: {
          orderBy: { issueDate: "desc" },
        },
        availabilities: true,
      },
    });

    if (!sitter) {
      res.status(404).json({ message: "Sitter profile not found" });
      return;
    }

    res.status(200).json({
      success: true,
      sitter,
    });
  } catch (error) {
    console.error("Get My Sitter Profile Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get All Sitters (With Filters)
// @route   GET /api/sitters
export const getSitters = async (req: Request, res: Response): Promise<void> => {
  try {
    const { location, minPrice, maxPrice } = req.query as {
      location?: string;
      minPrice?: string;
      maxPrice?: string;
    };

    const filterClause: Record<string, unknown> = {
      role: "BABYSITTER",
      isApproved: true,
    };

    if (location || minPrice || maxPrice) {
      filterClause.babysitter = {
        ...(location && {
          locationAddress: {
            contains: location,
          },
        }),
        ...(minPrice && { hourlyRate: { gte: parseFloat(minPrice) } }),
        ...(maxPrice && { hourlyRate: { lte: parseFloat(maxPrice) } }),
      };
    }

    const sitters = await prisma.user.findMany({
      where: filterClause,
      select: {
        id: true,
        name: true,
        babysitter: {
          select: {
            id: true,
            bio: true,
            hourlyRate: true,
            locationAddress: true,
            experienceYears: true,
            averageRating: true,
            availabilities: true,
          },
        },
      },
    });

    res.status(200).json({ success: true, sitters });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get Single Sitter by ID
// @route   GET /api/sitters/:id
export const getSitterById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    let sitter = await prisma.babysitter.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phoneNumber: true,
            isApproved: true,
            profilePicture: true,
          },
        },
        availabilities: true,
        certifications: true,
      },
    });

    if (!sitter) {
      sitter = await prisma.babysitter.findUnique({
        where: { userId: id },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phoneNumber: true,
              isApproved: true,
              profilePicture: true,
            },
          },
          availabilities: true,
          certifications: true,
        },
      });
    }

    if (!sitter) {
      res.status(404).json({ message: "Sitter not found" });
      return;
    }

    const reviews = await prisma.review.findMany({
      where: { revieweeId: sitter.userId },
      include: {
        reviewer: {
          select: {
            name: true,
            profilePicture: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    res.status(200).json({
      success: true,
      sitter: {
        ...sitter,
        reviews,
        averageRating: sitter.averageRating,
        totalRatings: sitter.totalRatings,
      },
    });
  } catch (error) {
    console.error("Get Sitter Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get My Availability
// @route   GET /api/sitters/availability
export const getMyAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const sitter = await prisma.babysitter.findUnique({
      where: { userId },
      include: { availabilities: true },
    });

    if (!sitter) {
      res.status(404).json({ message: "Sitter profile not found" });
      return;
    }

    res.status(200).json({ success: true, schedule: sitter.availabilities });
  } catch (error) {
    console.error("Get Availability Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
