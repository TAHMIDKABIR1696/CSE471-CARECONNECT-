import express from "express";
import {
  updateAvailability,
  getSitters,
  getSitterById,
  getMyAvailability,
  getMySitterProfile,
} from "../controllers/sitterController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getSitters as express.RequestHandler);
router.get("/me", protect as express.RequestHandler, getMySitterProfile as express.RequestHandler);
router.post("/availability", protect as express.RequestHandler, updateAvailability as express.RequestHandler);
router.get("/availability", protect as express.RequestHandler, getMyAvailability as express.RequestHandler);
router.get("/:id", getSitterById as express.RequestHandler);

export default router;
