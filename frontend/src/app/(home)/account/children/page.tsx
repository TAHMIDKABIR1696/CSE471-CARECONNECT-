"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/use-auth";
import { getApiUrl } from "@/lib/api-config";
import {
  Baby,
  Plus,
  Trash2,
  Heart,
  Activity,
  Loader2,
  X,
  Pencil,
  AlertTriangle,
} from "lucide-react";

// Types
interface IChild {
  id: number;
  name: string;
  age: number;
  gender: string;
  stubbornnessLvl: number;
  specialNeeds?: string;
  interests?: string;
}

interface IChildInput {
  name: string;
  age: number;
  gender: string;
  stubbornnessLvl: number;
  specialNeeds: string;
  interests: string;
}

export default function ChildrenPage() {
  const { isAuthenticated } = useAuth();
  const [children, setChildren] = useState<IChild[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for Form & Editing
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔥 NEW: Delete Modal State
  const [deleteId, setDeleteId] = useState<number | null>(null); // ID to delete
  const [isDeleting, setIsDeleting] = useState(false); // Delete loading state

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IChildInput>({
    defaultValues: { stubbornnessLvl: 1 },
  });

  const stubbornnessValue = watch("stubbornnessLvl");

  // Fetch Data
  const fetchChildren = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${getApiUrl()}/children`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setChildren(response.data.children);
      }
    } catch (error) {
      console.error("Fetch error", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchChildren();
  }, [isAuthenticated]);

  // Create or Update Handler
  const onSubmit: SubmitHandler<IChildInput> = async (data) => {
    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      if (editingId) {
        // UPDATE
        const response = await axios.put(
          `${getApiUrl()}/children/${editingId}`,
          data,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          toast.success("Profile updated successfully!");
          setChildren(
            children.map((child) =>
              child.id === editingId ? response.data.child : child
            )
          );
        }
      } else {
        // ADD
        const response = await axios.post(
          `${getApiUrl()}/children`,
          data,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          toast.success("Child added successfully!");
          setChildren([response.data.child, ...children]);
        }
      }
      resetForm();
    } catch (error) {
      toast.error("Operation failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (child: IChild) => {
    setEditingId(child.id);
    setShowForm(true);
    setValue("name", child.name);
    setValue("age", child.age);
    setValue("gender", child.gender);
    setValue("stubbornnessLvl", child.stubbornnessLvl);
    setValue("interests", child.interests || "");
    setValue("specialNeeds", child.specialNeeds || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🔥 UPDATED: Just open the modal, don't delete yet
  const promptDelete = (id: number) => {
    setDeleteId(id);
  };

  // 🔥 NEW: Actual Delete Execution
  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${getApiUrl()}/children/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Profile deleted");
      setChildren(children.filter((c) => c.id !== deleteId));
      setDeleteId(null); // Close Modal
    } catch (error) {
      toast.error("Failed to delete.");
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    reset({ stubbornnessLvl: 1 });
    setEditingId(null);
    setShowForm(false);
  };

  if (isLoading)
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin text-purple-600" />
      </div>
    );

  return (
    <div className="space-y-6 relative">
      {/* 🔥 Custom Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Delete Profile?
              </h3>
              <p className="text-slate-500 mt-2 text-sm">
                Are you sure you want to remove this child profile? This action
                cannot be undone and will affect matching.
              </p>
            </div>
            <div className="flex border-t border-slate-100 bg-slate-50/50">
              <button
                disabled={isDeleting}
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-4 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors border-r border-slate-100"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={confirmDelete}
                className="flex-1 px-4 py-4 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Baby className="h-6 w-6 text-purple-600" /> My Children
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage profiles for better matching.
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all"
          >
            <Plus className="h-4 w-4" /> Add Child
          </button>
        )}
      </div>

      {/* Form (Add / Edit) */}
      {showForm && (
        <div className="bg-white p-8 rounded-2xl shadow-md border border-purple-100 animate-in fade-in slide-in-from-top-2 relative">
          <button
            onClick={resetForm}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
          >
            <X className="h-6 w-6" />
          </button>

          <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2">
            {editingId ? "Edit Child Profile" : "Add New Child"}
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* ... (Form Inputs Same as before) ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">
                  Name
                </label>
                <input
                  {...register("name", { required: true })}
                  className="w-full p-2.5 bg-slate-50 border rounded-lg focus:ring-purple-500 outline-none"
                  placeholder="Child's Name"
                />
                {errors.name && (
                  <span className="text-xs text-red-500">Name is required</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">
                    Age
                  </label>
                  <input
                    type="number"
                    {...register("age", { required: true })}
                    className="w-full p-2.5 bg-slate-50 border rounded-lg focus:ring-purple-500 outline-none"
                    placeholder="Age"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">
                    Gender
                  </label>
                  <select
                    {...register("gender")}
                    className="w-full p-2.5 bg-slate-50 border rounded-lg focus:ring-purple-500 outline-none"
                  >
                    <option value="Male">Boy</option>
                    <option value="Female">Girl</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 flex justify-between">
                  Stubbornness Level (1-5)
                  <span className="text-xs text-slate-400 font-normal">
                    Personality Match
                  </span>
                </label>
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    {...register("stubbornnessLvl")}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <span className="font-bold text-purple-700 w-6 text-center text-lg">
                    {stubbornnessValue || 1}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">
                  Interests / Hobbies
                </label>
                <input
                  {...register("interests")}
                  className="w-full p-2.5 bg-slate-50 border rounded-lg focus:ring-purple-500 outline-none"
                  placeholder="Drawing, Lego, Football..."
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-semibold text-slate-700">
                  Special Needs / Allergies (Optional)
                </label>
                <textarea
                  {...register("specialNeeds")}
                  className="w-full p-2.5 bg-slate-50 border rounded-lg focus:ring-purple-500 outline-none"
                  placeholder="Any allergies or medical conditions..."
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                type="submit"
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-600 transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : editingId ? (
                  "Update Profile"
                ) : (
                  "Save Profile"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Children List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children.length === 0 && !isLoading && !showForm && (
          <div className="col-span-2 text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <Baby className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-slate-900 font-bold">No profiles yet</h3>
            <p className="text-slate-500 text-sm mb-4">
              Add your children to start matching.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="text-purple-600 font-bold hover:underline"
            >
              Add First Child
            </button>
          </div>
        )}

        {children.map((child) => (
          <div
            key={child.id}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all relative group"
          >
            {/* Action Buttons (Edit & Delete) */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(child)}
                className="p-2 bg-slate-100 hover:bg-purple-50 text-slate-500 hover:text-purple-600 rounded-lg transition-colors"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>

              {/* 🔥 Button Calls promptDelete instead of handleDelete */}
              <button
                onClick={() => promptDelete(child.id)}
                className="p-2 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Child Info Card Content (Same as before) */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-sm ${
                    child.gender === "Male"
                      ? "bg-blue-50 text-blue-600 border border-blue-100"
                      : "bg-pink-50 text-pink-600 border border-pink-100"
                  }`}
                >
                  {child.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">
                    {child.name}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">
                    {child.age} Years • {child.gender}
                  </p>
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  child.stubbornnessLvl >= 4
                    ? "bg-red-50 text-red-600 border-red-100"
                    : child.stubbornnessLvl >= 3
                    ? "bg-orange-50 text-orange-600 border-orange-100"
                    : "bg-green-50 text-green-600 border-green-100"
                }`}
              >
                Stubbornness: {child.stubbornnessLvl}
              </div>
            </div>

            <div className="mt-6 space-y-3 border-t border-slate-50 pt-4">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Activity className="h-4 w-4 text-purple-500" />
                <span className="truncate font-medium">
                  {child.interests || "No specific interests listed"}
                </span>
              </div>
              {child.specialNeeds && (
                <div className="flex items-start gap-3 text-sm text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                  <Heart className="h-4 w-4 mt-0.5 shrink-0" />
                  <span className="font-medium leading-tight">
                    {child.specialNeeds}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
