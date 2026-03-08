import prisma from "../config/db.js";

// ── Find sitter profile by user ID ──
export const findByUserId = (userId: string) =>
  prisma.babysitter.findUnique({ where: { userId } });

// ── Find sitter with full details ──
export const findByUserIdWithDetails = (userId: string) =>
  prisma.babysitter.findUnique({
    where: { userId },
    include: {
      user: {
        select: { name: true, email: true, phoneNumber: true, profilePicture: true },
      },
      certifications: { orderBy: { issueDate: "desc" } },
      availabilities: true,
    },
  });

// ── Find sitter by ID (try sitter ID first, then user ID) ──
export const findByIdWithDetails = async (id: string) => {
  let sitter = await prisma.babysitter.findUnique({
    where: { id },
    include: {
      user: {
        select: { name: true, email: true, phoneNumber: true, isApproved: true, profilePicture: true },
      },
      availabilities: true,
      certifications: true,
    },
  });

  if (!sitter) {
    sitter = await prisma.babysitter.findUnique({
      where: { userId: id },
      include: {
        user: {
          select: { name: true, email: true, phoneNumber: true, isApproved: true, profilePicture: true },
        },
        availabilities: true,
        certifications: true,
      },
    });
  }

  return sitter;
};

// ── Get reviews for a sitter ──
export const getReviewsForSitter = (sitterUserId: string) =>
  prisma.review.findMany({
    where: { revieweeId: sitterUserId },
    include: {
      reviewer: { select: { name: true, profilePicture: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

// ── Get all approved sitters with optional filters ──
export const findAll = (filters: {
  location?: string;
  minPrice?: string;
  maxPrice?: string;
}) => {
  const filterClause: Record<string, unknown> = {
    role: "BABYSITTER",
    isApproved: true,
  };

  if (filters.location || filters.minPrice || filters.maxPrice) {
    filterClause.babysitter = {
      ...(filters.location && { locationAddress: { contains: filters.location } }),
      ...(filters.minPrice && { hourlyRate: { gte: parseFloat(filters.minPrice) } }),
      ...(filters.maxPrice && { hourlyRate: { lte: parseFloat(filters.maxPrice) } }),
    };
  }

  return prisma.user.findMany({
    where: filterClause,
    select: {
      id: true,
      name: true,
      babysitter: {
        select: {
          id: true,
          bio: true,
          hourlyRate: true,
          locationAddress: true,
          experienceYears: true,
          averageRating: true,
          availabilities: true,
        },
      },
    },
  });
};

// ── Get sitter availability ──
export const getAvailability = (userId: string) =>
  prisma.babysitter.findUnique({
    where: { userId },
    include: { availabilities: true },
  });

// ── Replace availability schedule ──
export const replaceAvailability = async (
  sitterId: string,
  schedule: Array<{ dayOfWeek: string; startTime: string; endTime: string }>
) => {
  await prisma.availability.deleteMany({ where: { babysitterId: sitterId } });

  if (schedule.length > 0) {
    await prisma.availability.createMany({
      data: schedule.map((item) => ({
        babysitterId: sitterId,
        dayOfWeek: item.dayOfWeek,
        startTime: item.startTime,
        endTime: item.endTime,
      })),
    });
  }
};

// ── Update sitter rating aggregates ──
export const updateRating = (sitterId: string, averageRating: number, totalRatings: number) =>
  prisma.babysitter.update({
    where: { id: sitterId },
    data: { averageRating, totalRatings },
  });
