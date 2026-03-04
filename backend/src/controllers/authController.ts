import { Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import { sendRegistrationEmail } from "../services/emailService.js";
import { AuthRequest } from "../types/index.js";

// --- REGISTER USER ---
export const registerUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, role, name, location, phone } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: (role as string).toUpperCase() as "ADMIN" | "PARENT" | "BABYSITTER",
          name,
          phoneNumber: phone,
          isApproved: false,
        },
      });

      if ((role as string).toUpperCase() === "PARENT") {
        await tx.parent.create({
          data: {
            userId: newUser.id,
            locationAddress: location || "",
            minBudget: 0,
            maxBudget: 0,
          },
        });
      } else if ((role as string).toUpperCase() === "BABYSITTER") {
        await tx.babysitter.create({
          data: {
            userId: newUser.id,
            locationAddress: location || "",
            experienceYears: 0,
            hourlyRate: 0,
          },
        });
      }

      return newUser;
    });

    const token = jwt.sign(
      { id: result.id, role: result.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    try {
      await sendRegistrationEmail(result);
    } catch (emailError) {
      console.error("Failed to send registration email:", emailError);
    }

    const { password: _, ...userData } = result;

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// --- LOGIN USER ---
export const loginUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    const { password: _, ...userData } = user;

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
