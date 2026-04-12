import { Response } from "express";
import * as MatchingModel from "../models/matchingModel.js";
import { buildMatchContext, computeMatch } from "../services/matchingService.js";
import { AuthRequest } from "../types/index.js";

/**
 * Intelligent matching powered by live profile data and dynamic scoring.
 */

// Main Matching Function
export const findMatchingSitters = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parent = await MatchingModel.getParentWithChildren(req.user!.id);
    if (!parent) {
      res.status(404).json({ message: "Parent profile not found. Complete your profile first." });
      return;
    }

    const allSitters = await MatchingModel.getApprovedSitters();
    const context = buildMatchContext(parent, allSitters);

    const matches = allSitters
      .map((sitter) => computeMatch(parent, sitter, context))
      .sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({ success: true, matches, totalMatches: matches.length });
  } catch (error) {
    console.error("Matching Error:", error);
    res.status(500).json({ message: "Failed to find matching sitters" });
  }
};
