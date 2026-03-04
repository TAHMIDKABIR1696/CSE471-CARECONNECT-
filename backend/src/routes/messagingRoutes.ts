import express from "express";
import {
  getOrCreateConversation,
  sendMessage,
  getMyConversations,
  markAsRead,
  translateMessage,
  getMessageHistory,
} from "../controllers/messagingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect as express.RequestHandler);
router.post("/conversation", getOrCreateConversation as express.RequestHandler);
router.post("/send", sendMessage as express.RequestHandler);
router.get("/conversations", getMyConversations as express.RequestHandler);
router.put("/conversation/:conversationId/read", markAsRead as express.RequestHandler);
router.post("/translate", translateMessage as express.RequestHandler);
router.get("/conversation/:conversationId/history", getMessageHistory as express.RequestHandler);

export default router;
