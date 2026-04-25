import express from "express";
import {
  createSubscriptionPayment,
  confirmSubscriptionPayment,
  rejectSubscriptionPayment,
  getSubscriptionPayments,
} from "../controllers/subscriptionPaymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect as express.RequestHandler);

router.post("/", createSubscriptionPayment as express.RequestHandler);
router.get("/", getSubscriptionPayments as express.RequestHandler);
router.put("/:paymentId/approve", confirmSubscriptionPayment as express.RequestHandler);
router.put("/:paymentId/reject", rejectSubscriptionPayment as express.RequestHandler);

export default router;
