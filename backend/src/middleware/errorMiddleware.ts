import { Request, Response, NextFunction } from "express";

/**
 * Global Error Handling Middleware
 */

export class AppError extends Error {
  public statusCode: number;
  public code: string | null;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500, code: string | null = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

interface PrismaError extends Error {
  code?: string;
}

interface ValidationError extends Error {
  errors?: Record<string, { message: string }>;
}

const handlePrismaError = (error: PrismaError): { message: string; statusCode: number } => {
  let message = "Database error occurred";
  let statusCode = 500;

  switch (error.code) {
    case "P2002":
      message = "A record with this value already exists";
      statusCode = 409;
      break;
    case "P2025":
      message = "Record not found";
      statusCode = 404;
      break;
    case "P2003":
      message = "Invalid reference to related record";
      statusCode = 400;
      break;
    case "P2014":
      message = "Required relation missing";
      statusCode = 400;
      break;
    default:
      message = "Database operation failed";
  }

  return { message, statusCode };
};

const handleJWTError = (error: Error): { message: string; statusCode: number } => {
  if (error.name === "JsonWebTokenError") {
    return {
      message: "Invalid token. Please log in again.",
      statusCode: 401,
    };
  }
  if (error.name === "TokenExpiredError") {
    return {
      message: "Your token has expired. Please log in again.",
      statusCode: 401,
    };
  }
  return {
    message: "Token verification failed",
    statusCode: 401,
  };
};

const handleValidationError = (
  error: ValidationError
): { message: string; statusCode: number; errors: string[] } | null => {
  if (error.name === "ValidationError" && error.errors) {
    const errors = Object.values(error.errors).map((err) => err.message);
    return {
      message: "Validation failed",
      statusCode: 400,
      errors,
    };
  }
  return null;
};

// Global error handler middleware
export const globalErrorHandler = (
  err: AppError & PrismaError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const error: {
    message: string;
    statusCode: number;
    errors?: string[];
    code?: string | null;
  } = {
    message: err.message,
    statusCode: err.statusCode || 500,
    code: err.code || null,
  };

  console.error("Error:", {
    message: error.message,
    statusCode: error.statusCode,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Handle Prisma errors
  if (err.code && err.code.startsWith("P")) {
    const prismaError = handlePrismaError(err);
    error.message = prismaError.message;
    error.statusCode = prismaError.statusCode;
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    const jwtError = handleJWTError(err);
    error.message = jwtError.message;
    error.statusCode = jwtError.statusCode;
  }

  // Handle validation errors
  const validationError = handleValidationError(err);
  if (validationError) {
    error.message = validationError.message;
    error.statusCode = validationError.statusCode;
    error.errors = validationError.errors;
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && {
      error: err.message,
      stack: err.stack,
      code: err.code,
    }),
    ...(error.errors && { errors: error.errors }),
    ...(error.code && { errorCode: error.code }),
  });
};

// 404 handler
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    "ROUTE_NOT_FOUND"
  );
  next(error);
};

// Async handler wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Unhandled rejection handler
export const handleUnhandledRejection = (): void => {
  process.on("unhandledRejection", (err: Error) => {
    console.error("UNHANDLED REJECTION! 💥 Shutting down...");
    console.error("Error:", err);
    process.exit(1);
  });
};

// Uncaught exception handler
export const handleUncaughtException = (): void => {
  process.on("uncaughtException", (err: Error) => {
    console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
    console.error("Error:", err);
    process.exit(1);
  });
};
