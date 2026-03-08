import prisma from "../config/db.js";

// ── Find babysitter profile by user ID ──
export const findSitterByUserId = (userId: string) =>
  prisma.babysitter.findUnique({ where: { userId } });

// ── Create certification record ──
export const createCertification = (data: {
  babysitterId: string;
  title: string;
  documentUrl: string;
  issuedBy?: string | null;
  issueDate?: Date | null;
}) =>
  prisma.certification.create({ data });

// ── Update user profile picture ──
export const updateProfilePicture = (userId: string, filePath: string) =>
  prisma.user.update({ where: { id: userId }, data: { profilePicture: filePath } });
