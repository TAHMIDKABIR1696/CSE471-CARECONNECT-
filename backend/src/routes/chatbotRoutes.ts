import express from "express";
import {
  chatWithBot,
  createChatbotConversation,
} from "../controllers/chatbotController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect as express.RequestHandler);
router.post("/conversation", createChatbotConversation as express.RequestHandler);
router.post("/chat", chatWithBot as express.RequestHandler);

export default router;
