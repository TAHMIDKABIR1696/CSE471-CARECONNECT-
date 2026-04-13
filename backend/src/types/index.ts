import { Request } from "express";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name: string | null;
  isApproved: boolean;
  isBanned?: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}

export interface GpsLog {
  lat: number | null;
  lng: number | null;
  time: string;
}
