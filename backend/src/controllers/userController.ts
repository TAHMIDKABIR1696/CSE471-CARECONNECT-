import { Response } from "express";
import prisma from "../config/db.js";
import { AuthRequest } from "../types/index.js";

// @desc    Update user profile
// @route   PUT /api/user/update-profile
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const {
      name,
      phone,
      profilePicture,
      location,
      minBudget,
      maxBudget,
      situation,
      bio,
      experienceYears,
      hourlyRate,
    } = req.body;

    const updateData: Record<string, unknown> = {
      name,
      phoneNumber: phone,
      profilePicture,
    };

    if (userRole === "PARENT") {
      updateData.parentProfile = {
        update: {
          locationAddress: location,
          minBudget: parseFloat(minBudget) || 0,
          maxBudget: parseFloat(maxBudget) || 0,
          situation: situation,
        },
      };
    } else if (userRole === "BABYSITTER") {
      updateData.babysitter = {
        update: {
          locationAddress: location,
          bio: bio,
          experienceYears: parseInt(experienceYears) || 0,
          hourlyRate: parseFloat(hourlyRate) || 0,
        },
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        parentProfile: true,
        babysitter: true,
      },
    });

    const { password, ...userResponse } = updatedUser;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      user: userResponse,
    });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/user/profile
// @access  Private
export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        parentProfile: {
          include: { children: true },
        },
        babysitter: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const { password, ...userResponse } = user;

    res.status(200).json({
      success: true,
      user: userResponse,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
