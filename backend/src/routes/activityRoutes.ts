import express from "express";
import {
  createDailyReport,
  addActivityLog,
  getDailyReport,
  getActivities,
  deleteActivityLog,
} from "../controllers/activityController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect as express.RequestHandler);
router.post("/report", createDailyReport as express.RequestHandler);
router.post("/log", addActivityLog as express.RequestHandler);
router.get("/report/:bookingId", getDailyReport as express.RequestHandler);
router.get("/:bookingId", getActivities as express.RequestHandler);
router.delete("/log/:activityId", deleteActivityLog as express.RequestHandler);

export default router;
