import express from "express";
import {
  upload,
  uploadProfilePicture,
  uploadDocument,
  uploadActivityPhoto,
} from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect as express.RequestHandler);
router.post("/profile", upload.single("file"), uploadProfilePicture as express.RequestHandler);
router.post("/document", upload.single("file"), uploadDocument as express.RequestHandler);
router.post("/activity", upload.single("file"), uploadActivityPhoto as express.RequestHandler);

export default router;
