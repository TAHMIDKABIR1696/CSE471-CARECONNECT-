import express from "express";
import {
  createMeetingLink,
  getMeetingLink,
  getStreamToken,
} from "../controllers/videoController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect as express.RequestHandler);
router.post("/meeting", createMeetingLink as express.RequestHandler);
router.get("/meeting/:bookingId", getMeetingLink as express.RequestHandler);
router.post("/token", getStreamToken as express.RequestHandler);

export default router;
