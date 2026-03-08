import { Response } from "express";
import * as ChildModel from "../models/childModel.js";
import { AuthRequest } from "../types/index.js";

// @desc    Add a new child
// @route   POST /api/children
// @access  Private (Parent Only)
export const addChild = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, age, gender, specialNeeds, stubbornnessLvl, interests } = req.body;

    const parentProfile = await ChildModel.getParentByUserId(req.user!.id);
    if (!parentProfile) {
      res.status(404).json({ message: "Parent profile not found. Please complete your profile first." });
      return;
    }

    const newChild = await ChildModel.create({
      parentId: parentProfile.id, name, age: parseInt(age), gender,
      specialNeeds, stubbornnessLvl: parseInt(stubbornnessLvl), interests,
    });

    res.status(201).json({ success: true, message: "Child added successfully!", child: newChild });
  } catch (error) {
    console.error("Add Child Error:", error);
    res.status(500).json({ message: "Server error while adding child." });
  }
};

// @desc    Get all children of logged-in parent
// @route   GET /api/children
// @access  Private (Parent Only)
export const getMyChildren = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parentProfile = await ChildModel.getParentByUserId(req.user!.id);
    if (!parentProfile) { res.status(404).json({ message: "Parent profile not found." }); return; }

    const children = await ChildModel.findByParentId(parentProfile.id);
    res.status(200).json({ success: true, children });
  } catch (error) {
    console.error("Get Children Error:", error);
    res.status(500).json({ message: "Server error fetching children." });
  }
};

// @desc    Delete a child
// @route   DELETE /api/children/:id
// @access  Private
export const deleteChild = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await ChildModel.remove(req.params.id as string);
    res.status(200).json({ success: true, message: "Child profile deleted." });
  } catch (error) {
    console.error("Delete Child Error:", error);
    res.status(500).json({ message: "Failed to delete child." });
  }
};

// @desc    Update child profile
// @route   PUT /api/children/:id
export const updateChild = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, age, gender, specialNeeds, stubbornnessLvl, interests } = req.body;
    const updatedChild = await ChildModel.update(req.params.id as string, {
      name, age: parseInt(age), gender, specialNeeds,
      stubbornnessLvl: parseInt(stubbornnessLvl), interests,
    });
    res.status(200).json({ success: true, message: "Child profile updated!", child: updatedChild });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Failed to update child." });
  }
};
