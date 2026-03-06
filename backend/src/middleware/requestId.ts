import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

/**
 * Request ID Middleware
 * Generates a unique ID for each request for tracing and debugging.
 */
export const requestId = (req: Request, _res: Response, next: NextFunction): void => {
  req.headers["x-request-id"] = req.headers["x-request-id"] || randomUUID();
  next();
};
