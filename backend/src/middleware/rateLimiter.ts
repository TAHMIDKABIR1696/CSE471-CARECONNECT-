import { NextFunction, Request, Response } from "express";

/**
 * Rate limiting was intentionally disabled.
 * These middleware exports are retained as pass-through handlers so the
 * existing route wiring continues to compile without enforcing limits.
 */

const passThrough = (_req: Request, _res: Response, next: NextFunction): void => {
  next();
};

export const authLimiter = passThrough;
export const apiLimiter = passThrough;
export const sensitiveLimiter = passThrough;
