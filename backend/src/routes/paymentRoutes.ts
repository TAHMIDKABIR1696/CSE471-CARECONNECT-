import express from "express";
import {
  createPayment,
  confirmPayment,
  rejectPayment,
  getPaymentHistory,
  getPaymentById,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect as express.RequestHandler);
router.post("/", createPayment as express.RequestHandler);
router.put("/:paymentId/approve", confirmPayment as express.RequestHandler);
router.put("/:paymentId/reject", rejectPayment as express.RequestHandler);
router.get("/", getPaymentHistory as express.RequestHandler);
router.get("/:id", getPaymentById as express.RequestHandler);

export default router;
