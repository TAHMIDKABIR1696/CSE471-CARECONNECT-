import { Response } from "express";
import * as ReviewModel from "../models/reviewModel.js";
import * as SitterModel from "../models/sitterModel.js";
import { AuthRequest } from "../types/index.js";

// @desc    Create a Review for a Booking
// @route   POST /api/reviews
export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId, revieweeId, rating, comment, punctuality, professionalism, communication } = req.body;
    const reviewerId = req.user!.id;
    const parsedRating = parseInt(rating, 10);

    if (!bookingId || Number.isNaN(parsedRating)) {
      res.status(400).json({ message: "Booking ID and a valid rating are required." }); return;
    }
    if (parsedRating < 1 || parsedRating > 5) {
      res.status(400).json({ message: "Rating must be between 1 and 5." }); return;
    }

    const booking = await ReviewModel.findBookingById(bookingId);
    if (!booking || (booking.status !== "CONFIRMED" && booking.status !== "COMPLETED")) {
      res.status(400).json({ message: "You can only review confirmed or completed bookings." }); return;
    }

    const isParentReviewer = booking.parent.userId === reviewerId;
    const isSitterReviewer = booking.babysitter.userId === reviewerId;
    if (!isParentReviewer && !isSitterReviewer) {
      res.status(403).json({ message: "You can only review your own confirmed or completed bookings." }); return;
    }

    const derivedRevieweeId = isParentReviewer
      ? booking.babysitter.userId
      : booking.parent.userId;

    if (revieweeId && revieweeId !== derivedRevieweeId) {
      res.status(400).json({ message: "Invalid review target for this booking." }); return;
    }

    const existingReview = await ReviewModel.findByBookingAndReviewer(bookingId, reviewerId);
    if (existingReview) {
      res.status(400).json({ message: "You already reviewed this booking." }); return;
    }

    const review = await ReviewModel.create({
      bookingId, reviewerId, revieweeId: derivedRevieweeId,
      rating: parsedRating, comment,
      punctuality: punctuality ? parseInt(punctuality, 10) : null,
      professionalism: professionalism ? parseInt(professionalism, 10) : null,
      communication: communication ? parseInt(communication, 10) : null,
    });

    // Update babysitter's average rating if reviewee is a babysitter
    const reviewee = await ReviewModel.findRevieweeWithSitter(derivedRevieweeId);
    if (reviewee && reviewee.babysitter) {
      const allReviews = await ReviewModel.findAllByReviewee(derivedRevieweeId);
      const totalRatings = allReviews.length;
      const avgRating = totalRatings > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings
        : 0;
      await SitterModel.updateRating(
        reviewee.babysitter.id,
        Math.round(avgRating * 100) / 100,
        totalRatings
      );
    }

    res.status(201).json({ success: true, message: "Review submitted!", review });
  } catch (error) {
    console.error("Create Review Error:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      res.status(400).json({ message: "You already reviewed this booking." }); return;
    }
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get Reviews for a Sitter
// @route   GET /api/reviews/sitter/:id
export const getSitterReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reviews = await ReviewModel.findBySitterId(req.params.id as string);
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
    const reviews = await ReviewModel.findByReviewerId(req.user!.id);
    res.status(200).json({ success: true, reviews, count: reviews.length });
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
    const reviews = await ReviewModel.findReceivedByUserId(req.user!.id);

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    const punctualityReviews = reviews.filter((r) => r.punctuality);
    const avgPunctuality = punctualityReviews.length > 0
      ? punctualityReviews.reduce((sum, r) => sum + (r.punctuality || 0), 0) / punctualityReviews.length : 0;
    const professionalismReviews = reviews.filter((r) => r.professionalism);
    const avgProfessionalism = professionalismReviews.length > 0
      ? professionalismReviews.reduce((sum, r) => sum + (r.professionalism || 0), 0) / professionalismReviews.length : 0;
    const communicationReviews = reviews.filter((r) => r.communication);
    const avgCommunication = communicationReviews.length > 0
      ? communicationReviews.reduce((sum, r) => sum + (r.communication || 0), 0) / communicationReviews.length : 0;

    res.status(200).json({
      success: true, reviews, count: reviews.length,
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
