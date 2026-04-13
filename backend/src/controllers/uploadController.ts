import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { Response } from "express";
import prisma from "../config/db.js";
import { AuthRequest } from "../types/index.js";

/**
 * File Upload & Management System
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDirs: Record<string, string> = {
  profiles: path.join(__dirname, "../../uploads/profiles"),
  documents: path.join(__dirname, "../../uploads/documents"),
  activities: path.join(__dirname, "../../uploads/activities"),
};

Object.values(uploadDirs).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadType = (_req as AuthRequest).body.uploadType || "profiles";
    const uploadDir = uploadDirs[uploadType] || uploadDirs.profiles;
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `file-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Only images and documents are allowed!"));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

// Upload profile picture
export const uploadProfilePicture = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const userId = req.user!.id;
    const filePath = `/uploads/profiles/${req.file.filename}`;

    await prisma.user.update({
      where: { id: userId },
      data: { profilePicture: filePath },
    });

    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      filePath,
      url: `${process.env.BASE_URL || "http://localhost:5000"}${filePath}`,
    });
  } catch (error) {
    console.error("Upload Profile Picture Error:", error);
    res.status(500).json({ message: "Failed to upload profile picture" });
  }
};

// Upload document
export const uploadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const userId = req.user!.id;
    const { documentType, title, issuedBy, issueDate } = req.body;
    const filePath = `/uploads/documents/${req.file.filename}`;

    if (documentType === "certification") {
      const sitter = await prisma.babysitter.findUnique({
        where: { userId },
      });

      if (!sitter) {
        res.status(404).json({ message: "Babysitter profile not found" });
        return;
      }

      const certification = await prisma.certification.create({
        data: {
          babysitterId: sitter.id,
          title: title || "Certification",
          documentUrl: filePath,
          issuedBy: issuedBy || null,
          issueDate: issueDate ? new Date(issueDate) : null,
        },
      });

      res.status(201).json({
        success: true,
        message: "Document uploaded successfully",
        certification,
        filePath,
        url: `${process.env.BASE_URL || "http://localhost:5000"}${filePath}`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Document uploaded successfully",
      filePath,
      url: `${process.env.BASE_URL || "http://localhost:5000"}${filePath}`,
    });
  } catch (error) {
    console.error("Upload Document Error:", error);
    res.status(500).json({ message: "Failed to upload document" });
  }
};

// Upload activity photo
export const uploadActivityPhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const filePath = `/uploads/activities/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: "Activity photo uploaded successfully",
      filePath,
      url: `${process.env.BASE_URL || "http://localhost:5000"}${filePath}`,
    });
  } catch (error) {
    console.error("Upload Activity Photo Error:", error);
    res.status(500).json({ message: "Failed to upload activity photo" });
  }
};
