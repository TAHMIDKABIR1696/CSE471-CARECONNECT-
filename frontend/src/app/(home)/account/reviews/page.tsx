"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import proxy from "@/lib/proxy";
import toast from "react-hot-toast";
import {
  Star,
  MessageSquare,
  Clock,
  CheckCircle2,
  User,
  Calendar,
  Send,
  X,
  Loader2,
  Award,
  TrendingUp,
} from "lucide-react";
import StarRating from "@/components/star-rating";

interface IBooking {
  id: number;
  startTime: string;
  endTime: string;
  status: string;
  parent?: {
    user: { id: number; name: string; email: string };
  };
  babysitter?: {
    user: { id: number; name: string; email: string };
  };
  review?: {
    id: number;
    rating: number;
  };
}

interface IReview {
  id: number;
  rating: number;
  punctuality?: number | null;
  professionalism?: number | null;
  communication?: number | null;
  comment: string | null;
  createdAt: string;
  reviewer: {
    id: number;
    name: string;
    profilePicture?: string | null;
  };
  reviewee: {
    id: number;
    name: string;
  };
  booking: {
    id: number;
    startTime: string;
  };
}

interface IReviewForm {
  overallRating: number;
  punctuality: number;
  professionalism: number;
  communication: number;
  comment: string;
}

export default function ReviewsPage() {
  const { user } = useAuth();
  const [completedBookings, setCompletedBookings] = useState<IBooking[]>([]);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<IReviewForm>({
    overallRating: 0,
    punctuality: 0,
    professionalism: 0,
    communication: 0,
    comment: "",
  });

  useEffect(() => {
    fetchBookings();
    fetchMyReviews();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await proxy.get("/bookings");
      if (response.data.success && response.data.bookings) {
        const allBookings = Array.isArray(response.data.bookings)
          ? response.data.bookings
          : [];
        // Filter confirmed/completed bookings that this user hasn't reviewed
        const completed = allBookings.filter(
          (b: IBooking) =>
            (b.status === "CONFIRMED" || b.status === "COMPLETED") && !b.review
        );
        setCompletedBookings(completed);
      }
    } catch (error: any) {
      console.error("Fetch Bookings Error:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReviews = async () => {
    try {
      const response = await proxy.get("/reviews/my");
      if (response.data.success && response.data.reviews) {
        setReviews(Array.isArray(response.data.reviews) ? response.data.reviews : []);
      }
    } catch (error: any) {
      console.error("Fetch Reviews Error:", error);
      // Ignore 404 for reviews endpoint if not implemented
    }
  };

  const openReviewModal = (booking: IBooking) => {
    setSelectedBooking(booking);
    setFormData({
      overallRating: 0,
      punctuality: 0,
      professionalism: 0,
      communication: 0,
      comment: "",
    });
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    if (formData.overallRating === 0) {
      toast.error("Please provide an overall rating");
      return;
    }

    try {
      setSubmitting(true);
      const isParent = user?.role === "PARENT";
      const revieweeId = isParent
        ? selectedBooking.babysitter?.user.id
        : selectedBooking.parent?.user.id;

      if (!revieweeId) {
        toast.error("Unable to identify reviewee");
        return;
      }

      const response = await proxy.post("/reviews", {
        bookingId: selectedBooking.id,
        revieweeId: revieweeId,
        rating: formData.overallRating,
        punctuality: formData.punctuality || null,
        professionalism: formData.professionalism || null,
        communication: formData.communication || null,
        comment: formData.comment || null,
      });

      if (response.data.success) {
        toast.success("Review submitted successfully! ⭐");
        setShowReviewModal(false);
        fetchBookings();
        fetchMyReviews();
      }
    } catch (error: any) {
      console.error("Submit Review Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit review"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isParent = user?.role === "PARENT";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-slate-800 rounded-3xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Star className="h-8 w-8" />
          Ratings & Reviews
        </h1>
        <p className="text-purple-100 mt-2">
          Share your experience and help others make informed decisions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="bg-purple-50 p-3 rounded-xl">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{reviews.length}</p>
              <p className="text-xs font-semibold text-slate-400 uppercase">
                Reviews Given
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-50 p-3 rounded-xl">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {completedBookings.length}
              </p>
              <p className="text-xs font-semibold text-slate-400 uppercase">
                Pending Reviews
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="bg-green-50 p-3 rounded-xl">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {reviews.length + completedBookings.length}
              </p>
              <p className="text-xs font-semibold text-slate-400 uppercase">
                Total Bookings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Reviews Section */}
      {completedBookings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            Pending Reviews
          </h2>
          <div className="grid gap-4">
            {completedBookings.map((booking) => {
              const otherParty = isParent
                ? booking.babysitter?.user
                : booking.parent?.user;

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <User className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-900">
                            Booking #{booking.id}
                          </h3>
                          {otherParty && (
                            <p className="text-sm text-slate-600">
                              {isParent ? "Babysitter" : "Parent"}: {otherParty.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600 ml-12">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(booking.startTime)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => openReviewModal(booking)}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                      <Star className="h-5 w-5" />
                      Write Review
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* My Reviews Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-purple-600" />
          My Reviews ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <MessageSquare className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">No reviews yet</p>
            <p className="text-slate-400 text-sm mt-1">
              Confirm or complete a booking and share your experience!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <User className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">
                          {review.reviewee.name}
                        </h3>
                        <p className="text-sm text-slate-600">
                          Booking #{review.booking.id} • {formatDate(review.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-300"
                            }`}
                          />
                        ))}
                        <span className="ml-2 font-bold text-slate-700">
                          {review.rating}.0
                        </span>
                      </div>
                    </div>

                    {/* Multi-factor Ratings */}
                    {(review.punctuality ||
                      review.professionalism ||
                      review.communication) && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl">
                        {review.punctuality && (
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                              Punctuality
                            </p>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${
                                    star <= review.punctuality!
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-slate-300"
                                  }`}
                                />
                              ))}
                              <span className="ml-1 text-xs font-bold text-slate-600">
                                {review.punctuality}
                              </span>
                            </div>
                          </div>
                        )}
                        {review.professionalism && (
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                              Professionalism
                            </p>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${
                                    star <= review.professionalism!
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-slate-300"
                                  }`}
                                />
                              ))}
                              <span className="ml-1 text-xs font-bold text-slate-600">
                                {review.professionalism}
                              </span>
                            </div>
                          </div>
                        )}
                        {review.communication && (
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                              Communication
                            </p>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${
                                    star <= review.communication!
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-slate-300"
                                  }`}
                                />
                              ))}
                              <span className="ml-1 text-xs font-bold text-slate-600">
                                {review.communication}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {review.comment && (
                      <p className="text-slate-700 leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Write a Review</h2>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-600">
                <span className="font-bold">Booking #{selectedBooking.id}</span>
                {" • "}
                {isParent
                  ? `Babysitter: ${selectedBooking.babysitter?.user.name}`
                  : `Parent: ${selectedBooking.parent?.user.name}`}
              </p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-6">
              {/* Overall Rating */}
              <div>
                <label className="text-sm font-bold text-slate-700 mb-3 block">
                  Overall Rating *
                </label>
                <StarRating
                  rating={formData.overallRating}
                  setRating={(rating) =>
                    setFormData({ ...formData, overallRating: rating })
                  }
                />
              </div>

              {/* Multi-factor Ratings */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-700 block">
                  Detailed Ratings (Optional)
                </label>

                <div>
                  <StarRating
                    label="Punctuality"
                    rating={formData.punctuality}
                    setRating={(rating) =>
                      setFormData({ ...formData, punctuality: rating })
                    }
                  />
                </div>

                <div>
                  <StarRating
                    label="Professionalism"
                    rating={formData.professionalism}
                    setRating={(rating) =>
                      setFormData({ ...formData, professionalism: rating })
                    }
                  />
                </div>

                <div>
                  <StarRating
                    label="Communication"
                    rating={formData.communication}
                    setRating={(rating) =>
                      setFormData({ ...formData, communication: rating })
                    }
                  />
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">
                  Your Review (Optional)
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) =>
                    setFormData({ ...formData, comment: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
                  placeholder="Share your experience with this booking..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || formData.overallRating === 0}
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
