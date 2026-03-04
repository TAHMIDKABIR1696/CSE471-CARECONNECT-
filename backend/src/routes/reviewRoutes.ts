import express from "express";
import {
  createReview,
  getSitterReviews,
  getMyReviews,
  getReviewsReceived,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect as express.RequestHandler, createReview as express.RequestHandler);
router.get("/my", protect as express.RequestHandler, getMyReviews as express.RequestHandler);
router.get("/received", protect as express.RequestHandler, getReviewsReceived as express.RequestHandler);
router.get("/sitter/:id", getSitterReviews as express.RequestHandler);

export default router;
