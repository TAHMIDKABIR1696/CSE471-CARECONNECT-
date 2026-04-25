import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "./config/db.js";
import { requestId } from "./middleware/requestId.js";
import { sanitizeInputs } from "./middleware/sanitizer.js";
import { apiLimiter, authLimiter } from "./middleware/rateLimiter.js";
import {
  globalErrorHandler,
  notFoundHandler,
  handleUnhandledRejection,
  handleUncaughtException,
} from "./middleware/errorMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import userRoutes from "./routes/userRoutes.js";
import childRoutes from "./routes/childRoutes.js";
import sitterRoutes from "./routes/sitterRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import matchingRoutes from "./routes/matchingRoutes.js";
import messagingRoutes from "./routes/messagingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import sosRoutes from "./routes/sosRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";

const app = express();

// --- Security Middlewares ---
const parseAllowedOrigins = (origins?: string): string[] =>
  (origins ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const allowedOrigins = Array.from(
  new Set([
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    ...parseAllowedOrigins(process.env.CLIENT_URLS),
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://192.168.31.224:3000",
  "https://careconnect-orpin.vercel.app",
  ].filter(Boolean))
) as string[];

const allowVercelPreviewOrigins =
  (process.env.ALLOW_VERCEL_PREVIEW_ORIGINS ?? "true").toLowerCase() === "true";

const isVercelPreviewOrigin = (origin: string): boolean =>
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);

const corsOptions: cors.CorsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    if (!origin) return callback(null, true);

    const isAllowedOrigin =
      allowedOrigins.includes(origin) ||
      (allowVercelPreviewOrigins && isVercelPreviewOrigin(origin));

    if (isAllowedOrigin || process.env.NODE_ENV === "development") {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["Authorization"],
  maxAge: 86400,
};

app.use(cors(corsOptions));

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// --- Request Tracing & Sanitization ---
app.use(requestId);
app.use(sanitizeInputs);
app.use(apiLimiter);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// --- Route Mounting ---
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/children", childRoutes);
app.use("/api/sitters", sitterRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/matching", matchingRoutes);
app.use("/api/messaging", messagingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/stripe", stripeRoutes);

// --- Health Check ---
app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "CareConnect API is running successfully! 🚀",
    version: "2.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// 404 Handler
app.use(notFoundHandler);

// --- Global Error Handler (must be last) ---
app.use(globalErrorHandler);

// --- Database Connection Check ---
const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

connectDB();

export { handleUnhandledRejection, handleUncaughtException };
export default app;
