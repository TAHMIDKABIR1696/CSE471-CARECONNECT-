import { Request, Response } from "express";
import * as SitterModel from "../models/sitterModel.js";
import { AuthRequest } from "../types/index.js";

// @route   POST /api/sitters/availability
// @desc    Update Availability
export const updateAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { schedule } = req.body as {
      schedule?: Array<{ dayOfWeek: string; startTime: string; endTime: string }>;
    };

    const sitterProfile = await SitterModel.findByUserId(req.user!.id);
    if (!sitterProfile) { res.status(404).json({ message: "Sitter profile not found" }); return; }

    await SitterModel.replaceAvailability(sitterProfile.id, schedule || []);
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
    const sitter = await SitterModel.findByUserIdWithDetails(req.user!.id);
    if (!sitter) { res.status(404).json({ message: "Sitter profile not found" }); return; }

    res.status(200).json({ success: true, sitter });
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
      location?: string; minPrice?: string; maxPrice?: string;
    };

    const sitters = await SitterModel.findAll({ location, minPrice, maxPrice });
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
    const sitter = await SitterModel.findByIdWithDetails(req.params.id as string);
    if (!sitter) { res.status(404).json({ message: "Sitter not found" }); return; }

    const reviews = await SitterModel.getReviewsForSitter(sitter.userId);

    res.status(200).json({
      success: true,
      sitter: { ...sitter, reviews, averageRating: sitter.averageRating, totalRatings: sitter.totalRatings },
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
    const sitter = await SitterModel.getAvailability(req.user!.id);
    if (!sitter) { res.status(404).json({ message: "Sitter profile not found" }); return; }

    res.status(200).json({ success: true, schedule: sitter.availabilities });
  } catch (error) {
    console.error("Get Availability Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
