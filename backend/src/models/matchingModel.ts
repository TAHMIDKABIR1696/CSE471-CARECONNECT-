import prisma from "../config/db.js";

// ── Get parent with children ──
export const getParentWithChildren = (userId: string) =>
  prisma.parent.findUnique({
    where: { userId },
    include: { children: true },
  });

// ── Get all approved & unbanned sitters with details ──
export const getApprovedSitters = () =>
  prisma.babysitter.findMany({
    where: {
      user: { isApproved: true, isBanned: false },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePicture: true,
          phoneNumber: true,
        },
      },
      availabilities: true,
      certifications: true,
    },
  });
