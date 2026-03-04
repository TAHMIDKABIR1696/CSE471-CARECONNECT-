import express from "express";
import {
  startSession,
  updateLocation,
  endSession,
  getSessionDetails,
  getLiveSessions,
} from "../controllers/sessionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect as express.RequestHandler);
router.post("/start", startSession as express.RequestHandler);
router.post("/location", updateLocation as express.RequestHandler);
router.post("/end", endSession as express.RequestHandler);
router.get("/live", getLiveSessions as express.RequestHandler);
router.get("/:bookingId", getSessionDetails as express.RequestHandler);

export default router;
