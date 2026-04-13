import express from "express";
import { findMatchingSitters } from "../controllers/matchingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/sitters", protect as express.RequestHandler, findMatchingSitters as express.RequestHandler);

export default router;
