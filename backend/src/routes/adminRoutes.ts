import express from "express";
import {
  getAdminStats,
  getPendingApprovals,
  approveSitter,
  rejectSitter,
  getAllBookings,
  updateBookingStatus,
  getAllUsers,
  manageUser,
  getUserById,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", protect as express.RequestHandler, adminOnly as express.RequestHandler, getAdminStats as express.RequestHandler);
router.get("/approvals", protect as express.RequestHandler, adminOnly as express.RequestHandler, getPendingApprovals as express.RequestHandler);
router.put("/approve/:id", protect as express.RequestHandler, adminOnly as express.RequestHandler, approveSitter as express.RequestHandler);
router.put("/reject/:id", protect as express.RequestHandler, adminOnly as express.RequestHandler, rejectSitter as express.RequestHandler);
router.get("/users", protect as express.RequestHandler, adminOnly as express.RequestHandler, getAllUsers as express.RequestHandler);
router.patch("/users/:id", protect as express.RequestHandler, adminOnly as express.RequestHandler, manageUser as express.RequestHandler);
router.get("/users/:id", protect as express.RequestHandler, adminOnly as express.RequestHandler, getUserById as express.RequestHandler);
router.get("/bookings", protect as express.RequestHandler, adminOnly as express.RequestHandler, getAllBookings as express.RequestHandler);
router.patch("/bookings/:id/status", protect as express.RequestHandler, adminOnly as express.RequestHandler, updateBookingStatus as express.RequestHandler);

export default router;
