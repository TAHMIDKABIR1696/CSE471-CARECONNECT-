import express from "express";
import {
  createBooking,
  getMyBookings,
  updateBookingStatus,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect as express.RequestHandler, createBooking as express.RequestHandler);
router.get("/", protect as express.RequestHandler, getMyBookings as express.RequestHandler);
router.patch("/:id", protect as express.RequestHandler, updateBookingStatus as express.RequestHandler);

export default router;
