import { Response } from "express";
import prisma from "../config/db.js";
import { AuthRequest } from "../types/index.js";

/**
 * Intelligent AI Matching Algorithm - 7-Factor Smart Matching System
 */

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const checkAvailabilityMatch = (
  parentRequiredDays: string | null,
  sitterAvailabilities: Array<{ dayOfWeek: string }> | undefined
): number => {
  if (!parentRequiredDays || !sitterAvailabilities?.length) return 0.5;

  const requiredDays = parentRequiredDays.split(",").map((d) => d.trim().toUpperCase());
  const availableDays = sitterAvailabilities.map((a) => a.dayOfWeek.toUpperCase());

  const matchedDays = requiredDays.filter((day) => availableDays.includes(day));
  return matchedDays.length / requiredDays.length;
};

const checkBudgetMatch = (
  parentMinBudget: number | null,
  parentMaxBudget: number | null,
  sitterRate: number | null
): number => {
  if (!parentMinBudget || !parentMaxBudget || !sitterRate) return 0.5;

  const minBudget = parseFloat(parentMinBudget.toString());
  const maxBudget = parseFloat(parentMaxBudget.toString());
  const rate = parseFloat(sitterRate.toString());

  if (rate >= minBudget && rate <= maxBudget) return 1.0;
  if (rate < minBudget) return 0.3;
  if (rate > maxBudget * 1.2) return 0.1;
  return 0.6;
};

const checkPersonalityMatch = (childStubbornness: number, sitterExperience: number): number => {
  const stubbornness = childStubbornness || 1;
  const experience = sitterExperience || 0;

  if (stubbornness >= 4 && experience >= 3) return 1.0;
  if (stubbornness >= 3 && experience >= 2) return 0.8;
  if (stubbornness <= 2 && experience >= 1) return 0.9;
  return 0.5;
};

// Main Matching Function
export const findMatchingSitters = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const parent = await prisma.parent.findUnique({
      where: { userId },
      include: { children: true },
    });

    if (!parent) {
      res.status(404).json({ message: "Parent profile not found. Complete your profile first." });
      return;
    }

    const allSitters = await prisma.babysitter.findMany({
      where: {
        user: { isApproved: true, isBanned: false },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            phoneNumber: true,
          },
        },
        availabilities: true,
        certifications: true,
      },
    });

    const matches = allSitters
      .map((sitter) => {
        let locationScore = 0.5;
        if (parent.latitude && parent.longitude && sitter.latitude && sitter.longitude) {
          const distance = calculateDistance(
            parent.latitude,
            parent.longitude,
            sitter.latitude,
            sitter.longitude
          );
          locationScore = Math.max(0, 1 - distance / 50);
        }

        const availabilityScore = checkAvailabilityMatch(
          parent.requiredDays,
          sitter.availabilities
        );

        const budgetScore = checkBudgetMatch(parent.minBudget, parent.maxBudget, sitter.hourlyRate);

        const avgStubbornness =
          parent.children.length > 0
            ? parent.children.reduce((sum, child) => sum + (child.stubbornnessLvl || 1), 0) /
              parent.children.length
            : 1;
        const personalityScore = checkPersonalityMatch(avgStubbornness, sitter.experienceYears);

        const experienceScore = Math.min(sitter.experienceYears / 10, 1.0);
        const ratingScore = sitter.averageRating / 5.0;
        const daysScore = availabilityScore;

        const weights = {
          location: 0.2,
          availability: 0.2,
          budget: 0.15,
          personality: 0.15,
          experience: 0.1,
          rating: 0.15,
          days: 0.05,
        };

        const totalScore =
          locationScore * weights.location +
          availabilityScore * weights.availability +
          budgetScore * weights.budget +
          personalityScore * weights.personality +
          experienceScore * weights.experience +
          ratingScore * weights.rating +
          daysScore * weights.days;

        return {
          sitter: {
            id: sitter.id,
            userId: sitter.userId,
            name: sitter.user.name,
            email: sitter.user.email,
            profilePicture: sitter.user.profilePicture,
            phoneNumber: sitter.user.phoneNumber,
            bio: sitter.bio,
            experienceYears: sitter.experienceYears,
            hourlyRate: sitter.hourlyRate,
            locationAddress: sitter.locationAddress,
            latitude: sitter.latitude,
            longitude: sitter.longitude,
            averageRating: sitter.averageRating,
            totalRatings: sitter.totalRatings,
            badges: sitter.badges,
            availabilities: sitter.availabilities,
            certifications: sitter.certifications,
          },
          matchScore: Math.round(totalScore * 100) / 100,
          factorScores: {
            location: Math.round(locationScore * 100) / 100,
            availability: Math.round(availabilityScore * 100) / 100,
            budget: Math.round(budgetScore * 100) / 100,
            personality: Math.round(personalityScore * 100) / 100,
            experience: Math.round(experienceScore * 100) / 100,
            rating: Math.round(ratingScore * 100) / 100,
          },
        };
      })
      .filter((match) => match.matchScore > 0.3)
      .sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      matches,
      totalMatches: matches.length,
    });
  } catch (error) {
    console.error("Matching Error:", error);
    res.status(500).json({ message: "Failed to find matching sitters" });
  }
};
