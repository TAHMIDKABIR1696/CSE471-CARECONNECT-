import express from "express";
import {
  updateProfile,
  getUserProfile,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", protect as express.RequestHandler, getUserProfile as express.RequestHandler);
router.put("/update-profile", protect as express.RequestHandler, updateProfile as express.RequestHandler);

export default router;
