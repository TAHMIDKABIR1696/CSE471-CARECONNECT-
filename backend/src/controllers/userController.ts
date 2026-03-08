import { Response } from "express";
import * as UserModel from "../models/userModel.js";
import { AuthRequest } from "../types/index.js";

// @desc    Update user profile
// @route   PUT /api/user/update-profile
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const updatedUser = await UserModel.updateProfile(userId, userRole, req.body);
    const { password, ...userResponse } = updatedUser;

    res.status(200).json({ success: true, message: "Profile updated successfully!", user: userResponse });
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
    const user = await UserModel.findByIdWithProfile(req.user!.id);
    if (!user) { res.status(404).json({ message: "User not found" }); return; }

    const { password, ...userResponse } = user;
    res.status(200).json({ success: true, user: userResponse });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
