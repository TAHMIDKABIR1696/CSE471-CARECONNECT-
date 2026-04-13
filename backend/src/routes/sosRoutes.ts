import express from "express";
import {
  createSOSAlert,
  getActiveAlerts,
  resolveAlert,
  getAlertById,
} from "../controllers/sosController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect as express.RequestHandler);
router.post("/", createSOSAlert as express.RequestHandler);
router.get("/", getActiveAlerts as express.RequestHandler);
router.get("/:id", getAlertById as express.RequestHandler);
router.put("/:alertId/resolve", resolveAlert as express.RequestHandler);

export default router;
