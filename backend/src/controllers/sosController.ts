import { Response } from "express";
import * as SosModel from "../models/sosModel.js";
import { AuthRequest } from "../types/index.js";

/**
 * Emergency & SOS Alerts System
 */

// Create SOS Alert
export const createSOSAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user!.id;

    if (!latitude || !longitude) {
      res.status(400).json({ message: "Latitude and longitude are required" }); return;
    }

    const sosAlert = await SosModel.create(userId, parseFloat(latitude), parseFloat(longitude));
    res.status(201).json({ success: true, message: "SOS alert created successfully", alert: sosAlert });
  } catch (error) {
    console.error("Create SOS Alert Error:", error);
    res.status(500).json({ message: "Failed to create SOS alert" });
  }
};

// Get active SOS alerts
export const getActiveAlerts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    const alerts = role === "ADMIN"
      ? await SosModel.findAllActive()
      : await SosModel.findByUserId(userId);

    res.status(200).json({
      success: true, alerts,
      activeCount: alerts.filter((a) => a.status === "ACTIVE").length,
    });
  } catch (error) {
    console.error("Get Alerts Error:", error);
    res.status(500).json({ message: "Failed to get alerts" });
  }
};

// Resolve SOS alert
export const resolveAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const alertId = req.params.alertId as string;
    const userId = req.user!.id;
    const role = req.user!.role;

    const alert = await SosModel.findById(alertId);
    if (!alert) { res.status(404).json({ message: "Alert not found" }); return; }
    if (role !== "ADMIN" && alert.userId !== userId) {
      res.status(403).json({ message: "Not authorized" }); return;
    }

    const updatedAlert = await SosModel.resolve(alert.id);
    res.status(200).json({ success: true, message: "Alert resolved successfully", alert: updatedAlert });
  } catch (error) {
    console.error("Resolve Alert Error:", error);
    res.status(500).json({ message: "Failed to resolve alert" });
  }
};

// Get alert by ID
export const getAlertById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;
    const role = req.user!.role;

    const alert = await SosModel.findByIdWithUser(id);
    if (!alert) { res.status(404).json({ message: "Alert not found" }); return; }
    if (role !== "ADMIN" && alert.userId !== userId) {
      res.status(403).json({ message: "Not authorized" }); return;
    }

    res.status(200).json({ success: true, alert });
  } catch (error) {
    console.error("Get Alert Error:", error);
    res.status(500).json({ message: "Failed to get alert" });
  }
};
