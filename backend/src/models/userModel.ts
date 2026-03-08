import prisma from "../config/db.js";

// ── Find user by email ──
export const findByEmail = (email: string) =>
  prisma.user.findUnique({ where: { email } });

// ── Find user by ID with role profiles ──
export const findByIdWithProfile = (id: string) =>
  prisma.user.findUnique({
    where: { id },
    include: {
      parentProfile: { include: { children: true } },
      babysitter: true,
    },
  });

// ── Create user + role profile in a transaction ──
export const createWithProfile = (data: {
  email: string;
  password: string;
  role: string;
  name: string;
  phone?: string;
  location?: string;
}) => {
  const normalizedRole = (data.role as string).toUpperCase() as "ADMIN" | "PARENT" | "BABYSITTER";

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: data.email,
        password: data.password,
        role: normalizedRole,
        name: data.name,
        phoneNumber: data.phone,
        isApproved: false,
      },
    });

    if (normalizedRole === "PARENT") {
      await tx.parent.create({
        data: {
          userId: user.id,
          locationAddress: data.location || "",
          minBudget: 0,
          maxBudget: 0,
        },
      });
    } else if (normalizedRole === "BABYSITTER") {
      await tx.babysitter.create({
        data: {
          userId: user.id,
          locationAddress: data.location || "",
          experienceYears: 0,
          hourlyRate: 0,
        },
      });
    }

    return user;
  });
};

// ── Create social-login user (auto-register as PARENT) ──
export const createSocialUser = (email: string, name: string, hashedPassword: string) =>
  prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email, password: hashedPassword, role: "PARENT", name, isApproved: false },
    });
    await tx.parent.create({
      data: { userId: user.id, locationAddress: "", minBudget: 0, maxBudget: 0 },
    });
    return user;
  });

// ── Update user profile (with nested role-specific data) ──
export const updateProfile = (
  userId: string,
  role: string,
  data: Record<string, unknown>
) => {
  const updateData: Record<string, unknown> = {
    name: data.name,
    phoneNumber: data.phone,
    profilePicture: data.profilePicture,
  };

  if (role === "PARENT") {
    updateData.parentProfile = {
      update: {
        locationAddress: data.location,
        minBudget: parseFloat(data.minBudget as string) || 0,
        maxBudget: parseFloat(data.maxBudget as string) || 0,
        situation: data.situation,
      },
    };
  } else if (role === "BABYSITTER") {
    updateData.babysitter = {
      update: {
        locationAddress: data.location,
        bio: data.bio,
        experienceYears: parseInt(data.experienceYears as string) || 0,
        hourlyRate: parseFloat(data.hourlyRate as string) || 0,
      },
    };
  }

  return prisma.user.update({
    where: { id: userId },
    data: updateData,
    include: { parentProfile: true, babysitter: true },
  });
};

// ── Update profile picture path ──
export const updateProfilePicture = (userId: string, filePath: string) =>
  prisma.user.update({ where: { id: userId }, data: { profilePicture: filePath } });
