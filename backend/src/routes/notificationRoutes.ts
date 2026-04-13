import express from "express";
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect as express.RequestHandler);
router.get("/", getMyNotifications as express.RequestHandler);
router.get("/unread-count", getUnreadNotificationCount as express.RequestHandler);
router.patch("/read-all", markAllNotificationsRead as express.RequestHandler);
router.patch("/:id/read", markNotificationRead as express.RequestHandler);

export default router;
