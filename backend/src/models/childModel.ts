import prisma from "../config/db.js";

// ── Get parent profile by user ID ──
export const getParentByUserId = (userId: string) =>
  prisma.parent.findUnique({ where: { userId } });

// ── Create a new child ──
export const create = (data: {
  parentId: string;
  name: string;
  age: number;
  gender: string;
  specialNeeds?: string;
  stubbornnessLvl: number;
  interests?: string;
}) =>
  prisma.child.create({ data });

// ── Get all children for a parent ──
export const findByParentId = (parentId: string) =>
  prisma.child.findMany({
    where: { parentId },
    orderBy: { id: "desc" },
  });

// ── Update a child ──
export const update = (
  childId: string,
  data: {
    name: string;
    age: number;
    gender: string;
    specialNeeds?: string;
    stubbornnessLvl: number;
    interests?: string;
  }
) =>
  prisma.child.update({ where: { id: childId }, data });

// ── Delete a child ──
export const remove = (childId: string) =>
  prisma.child.delete({ where: { id: childId } });
