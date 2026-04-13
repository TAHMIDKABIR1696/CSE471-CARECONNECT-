import { Response } from "express";
import prisma from "../config/db.js";
import { AuthRequest } from "../types/index.js";

// @desc    Create a Review for a Booking
// @route   POST /api/reviews
export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      bookingId,
      revieweeId,
      rating,
      comment,
      punctuality,
      professionalism,
      communication,
    } = req.body;
    const reviewerId = req.user!.id;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.status !== "COMPLETED") {
      res.status(400).json({ message: "You can only review completed bookings." });
      return;
    }

    const review = await prisma.review.create({
      data: {
        bookingId,
        reviewerId,
        revieweeId,
        rating: parseInt(rating),
        comment,
        punctuality: punctuality ? parseInt(punctuality) : null,
        professionalism: professionalism ? parseInt(professionalism) : null,
        communication: communication ? parseInt(communication) : null,
      },
    });

    // Update babysitter's average rating if reviewee is a babysitter
    const reviewee = await prisma.user.findUnique({
      where: { id: revieweeId },
      include: { babysitter: true },
    });

    if (reviewee && reviewee.babysitter) {
      const allReviews = await prisma.review.findMany({
        where: { revieweeId },
      });

      const totalRatings = allReviews.length;
      const sumRatings = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

      await prisma.babysitter.update({
        where: { id: reviewee.babysitter.id },
        data: {
          averageRating: Math.round(avgRating * 100) / 100,
          totalRatings,
        },
      });
    }

    res.status(201).json({ success: true, message: "Review submitted!", review });
  } catch (error) {
    console.error("Create Review Error:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      res.status(400).json({ message: "You already reviewed this booking." });
      return;
    }
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get Reviews for a Sitter
// @route   GET /api/reviews/sitter/:id
export const getSitterReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sitterUserId = req.params.id as string;
    const reviews = await prisma.review.findMany({
      where: { revieweeId: sitterUserId },
      include: {
        reviewer: {
          select: { id: true, name: true, profilePicture: true },
        },
        booking: {
          select: { id: true, startTime: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error("Get Sitter Reviews Error:", error);
    res.status(500).json({ message: "Failed to load reviews" });
  }
};

// @desc    Get My Reviews (Reviews I've given)
// @route   GET /api/reviews/my
// @access  Private
export const getMyReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const reviews = await prisma.review.findMany({
      where: { reviewerId: userId },
      include: {
        reviewee: { select: { id: true, name: true } },
        booking: { select: { id: true, startTime: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      reviews,
      count: reviews.length,
    });
  } catch (error) {
    console.error("Get My Reviews Error:", error);
    res.status(500).json({ message: "Failed to load reviews" });
  }
};

// @desc    Get Reviews Received
// @route   GET /api/reviews/received
// @access  Private
export const getReviewsReceived = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const reviews = await prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: {
          select: { id: true, name: true, profilePicture: true },
        },
        booking: { select: { id: true, startTime: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    const punctualityReviews = reviews.filter((r) => r.punctuality);
    const avgPunctuality =
      punctualityReviews.length > 0
        ? punctualityReviews.reduce((sum, r) => sum + (r.punctuality || 0), 0) /
          punctualityReviews.length
        : 0;

    const professionalismReviews = reviews.filter((r) => r.professionalism);
    const avgProfessionalism =
      professionalismReviews.length > 0
        ? professionalismReviews.reduce((sum, r) => sum + (r.professionalism || 0), 0) /
          professionalismReviews.length
        : 0;

    const communicationReviews = reviews.filter((r) => r.communication);
    const avgCommunication =
      communicationReviews.length > 0
        ? communicationReviews.reduce((sum, r) => sum + (r.communication || 0), 0) /
          communicationReviews.length
        : 0;

    res.status(200).json({
      success: true,
      reviews,
      count: reviews.length,
      averages: {
        overall: Math.round(avgRating * 100) / 100,
        punctuality: Math.round(avgPunctuality * 100) / 100,
        professionalism: Math.round(avgProfessionalism * 100) / 100,
        communication: Math.round(avgCommunication * 100) / 100,
      },
    });
  } catch (error) {
    console.error("Get Reviews Received Error:", error);
    res.status(500).json({ message: "Failed to load reviews" });
  }
};
