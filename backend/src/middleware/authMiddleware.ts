import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import prisma from "../config/db.js";
import { AppError } from "./errorMiddleware.js";
import { AuthRequest } from "../types/index.js";

interface JwtPayload {
  id: string;
  role: string;
}

// @desc    Protect routes (Verify JWT Token)
export const protect = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
          isApproved: true,
          isBanned: true,
        },
      });

      if (!user) {
        return next(new AppError("User not found", 401, "USER_NOT_FOUND"));
      }

      if (user.isBanned) {
        return next(
          new AppError("Your account has been banned", 403, "ACCOUNT_BANNED")
        );
      }

      req.user = user;
      next();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "JsonWebTokenError") {
          return next(new AppError("Invalid token", 401, "INVALID_TOKEN"));
        }
        if (error.name === "TokenExpiredError") {
          return next(
            new AppError("Token expired. Please log in again", 401, "TOKEN_EXPIRED")
          );
        }
      }
      console.error("Auth Middleware Error:", error);
      return next(new AppError("Authentication failed", 401, "AUTH_FAILED"));
    }
  } else {
    return next(
      new AppError("Not authorized. No token provided", 401, "NO_TOKEN")
    );
  }
};

// @desc    Admin only middleware
export const adminOnly = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(new AppError("Authentication required", 401, "AUTH_REQUIRED"));
  }

  if (req.user.role === "ADMIN") {
    next();
  } else {
    return next(
      new AppError("Admin access required", 403, "ADMIN_REQUIRED")
    );
  }
};

// @desc    Parent only middleware
export const parentOnly = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(new AppError("Authentication required", 401, "AUTH_REQUIRED"));
  }

  if (req.user.role === "PARENT") {
    next();
  } else {
    return next(
      new AppError("Parent access required", 403, "PARENT_REQUIRED")
    );
  }
};

// @desc    Babysitter only middleware
export const babysitterOnly = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(new AppError("Authentication required", 401, "AUTH_REQUIRED"));
  }

  if (req.user.role === "BABYSITTER") {
    next();
  } else {
    return next(
      new AppError("Babysitter access required", 403, "BABYSITTER_REQUIRED")
    );
  }
};

// @desc    Check if user is approved
export const requireApproval = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(new AppError("Authentication required", 401, "AUTH_REQUIRED"));
  }

  if (!req.user.isApproved && req.user.role !== "ADMIN") {
    return next(
      new AppError(
        "Your account is pending approval",
        403,
        "ACCOUNT_PENDING"
      )
    );
  }

  next();
};

// @desc    Optional authentication
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
          isApproved: true,
        },
      });

      if (user) {
        req.user = user;
      }
    } catch {
      // Silently fail for optional auth
    }
  }

  next();
};
