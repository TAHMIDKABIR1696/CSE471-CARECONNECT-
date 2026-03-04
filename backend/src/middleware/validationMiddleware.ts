import { Request, Response, NextFunction } from "express";

/**
 * Request Validation Middleware
 */

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRequired = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missing: string[] = [];

    for (const field of fields) {
      const value = req.body[field];
      if (!value || (typeof value === "string" && !value.trim())) {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
        missingFields: missing,
      });
      return;
    }

    next();
  };
};

export const validateEmail = (field = "email") => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.body[field] && !isValidEmail(req.body[field])) {
      res.status(400).json({
        success: false,
        message: `Invalid email format for field: ${field}`,
      });
      return;
    }
    next();
  };
};

export const validateNumeric = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const invalid: string[] = [];

    for (const field of fields) {
      if (req.body[field] && isNaN(parseFloat(req.body[field]))) {
        invalid.push(field);
      }
    }

    if (invalid.length > 0) {
      res.status(400).json({
        success: false,
        message: `Invalid numeric values for fields: ${invalid.join(", ")}`,
        invalidFields: invalid,
      });
      return;
    }

    next();
  };
};

export const validateLength = (field: string, min?: number, max?: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body[field]) {
      return next();
    }

    const length: number = req.body[field].length;

    if (min && length < min) {
      res.status(400).json({
        success: false,
        message: `${field} must be at least ${min} characters`,
      });
      return;
    }

    if (max && length > max) {
      res.status(400).json({
        success: false,
        message: `${field} must be at most ${max} characters`,
      });
      return;
    }

    next();
  };
};

export const validateEnum = (field: string, allowedValues: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body[field]) {
      return next();
    }

    if (!allowedValues.includes(req.body[field])) {
      res.status(400).json({
        success: false,
        message: `${field} must be one of: ${allowedValues.join(", ")}`,
        allowedValues,
      });
      return;
    }

    next();
  };
};

export const validateDate = (field: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body[field]) {
      return next();
    }

    const date = new Date(req.body[field]);
    if (isNaN(date.getTime())) {
      res.status(400).json({
        success: false,
        message: `Invalid date format for field: ${field}`,
      });
      return;
    }

    next();
  };
};

export const validatePhone = (field = "phoneNumber") => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body[field]) {
      return next();
    }

    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(req.body[field])) {
      res.status(400).json({
        success: false,
        message: `Invalid phone number format for field: ${field}`,
      });
      return;
    }

    next();
  };
};

export const customValidation = (
  validator: (req: Request) => { error?: string } | void
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = validator(req);
      if (result && result.error) {
        res.status(400).json({
          success: false,
          message: result.error,
        });
        return;
      }
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Validation error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
};

type MiddlewareFn = (req: Request, res: Response, next: NextFunction) => void;

export const combineValidators = (...validators: MiddlewareFn[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    let index = 0;
    const runNext = (): void => {
      if (index < validators.length) {
        const validator = validators[index++];
        validator(req, res, (err?: unknown) => {
          if (err) {
            return next(err);
          }
          runNext();
        });
      } else {
        next();
      }
    };
    runNext();
  };
};
