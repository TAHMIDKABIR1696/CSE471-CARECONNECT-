import express from "express";
import {
  createPaymentIntent,
  handleStripeWebhook,
  verifyPayment,
} from "../controllers/stripeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook as express.RequestHandler
);

router.post("/create-intent", protect as express.RequestHandler, createPaymentIntent as express.RequestHandler);
router.post("/verify", protect as express.RequestHandler, verifyPayment as express.RequestHandler);

export default router;
