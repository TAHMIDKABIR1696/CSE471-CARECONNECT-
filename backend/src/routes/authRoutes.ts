import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import {
  validateRequired,
  validateEmail,
  validateLength,
  combineValidators,
} from "../middleware/validationMiddleware.js";

const router = express.Router();

router.post(
  "/register",
  combineValidators(
    validateRequired(["email", "password", "name", "role"]),
    validateEmail("email"),
    validateLength("password", 6, 100),
    validateLength("name", 2, 100)
  ),
  registerUser as express.RequestHandler
);

router.post(
  "/login",
  combineValidators(
    validateRequired(["email", "password"]),
    validateEmail("email")
  ),
  loginUser as express.RequestHandler
);

export default router;
