import { Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as UserModel from "../models/userModel.js";
import { sendRegistrationEmail } from "../services/emailService.js";
import { AuthRequest } from "../types/index.js";

// --- REGISTER USER ---
export const registerUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, role, name, location, phone } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await UserModel.createWithProfile({
      email, password: hashedPassword, role, name, location, phone,
    });

    const token = jwt.sign(
      { id: result.id, role: result.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    try { await sendRegistrationEmail(result); }
    catch (emailError) { console.error("Failed to send registration email:", emailError); }

    const { password: _, ...userData } = result;
    res.status(201).json({ success: true, message: "Registration successful!", token, user: userData });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// --- SOCIAL LOGIN (Google / Facebook) ---
export const socialLogin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, name, provider } = req.body;

    if (!email || !name || !provider) {
      res.status(400).json({ message: "Email, name, and provider are required" });
      return;
    }

    let user = await UserModel.findByEmail(email);

    if (!user) {
      const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-12), 10);
      user = await UserModel.createSocialUser(email, name, randomPassword);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    const { password: _, ...userData } = user;
    res.status(200).json({ success: true, message: `${provider} login successful`, token, user: userData });
  } catch (error) {
    console.error("Social Login Error:", error);
    res.status(500).json({ message: "Social login failed" });
  }
};

// --- LOGIN USER ---
export const loginUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findByEmail(email);
    if (!user) { res.status(400).json({ message: "Invalid credentials" }); return; }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) { res.status(400).json({ message: "Invalid credentials" }); return; }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    const { password: _, ...userData } = user;
    res.status(200).json({ success: true, message: "Login successful", token, user: userData });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
