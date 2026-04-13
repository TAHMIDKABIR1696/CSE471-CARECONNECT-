import express from "express";
import {
  addChild,
  getMyChildren,
  deleteChild,
  updateChild,
} from "../controllers/childController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect as express.RequestHandler, addChild as express.RequestHandler).get(protect as express.RequestHandler, getMyChildren as express.RequestHandler);
router.route("/:id").delete(protect as express.RequestHandler, deleteChild as express.RequestHandler).put(protect as express.RequestHandler, updateChild as express.RequestHandler);

export default router;
