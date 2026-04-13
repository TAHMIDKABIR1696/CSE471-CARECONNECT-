"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import proxy from "@/lib/proxy";
import toast from "react-hot-toast";
import {
  FileBadge,
  Plus,
  Upload,
  X,
  Calendar,
  Award,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Download,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ICertification {
  id: number;
  title: string;
  documentUrl: string;
  issuedBy: string | null;
  issueDate: string | null;
}

export default function CertificationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [certifications, setCertifications] = useState<ICertification[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    issuedBy: "",
    issueDate: "",
    file: null as File | null,
  });

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) {
      return;
    }

    // Check if user is authenticated
    if (!user) {
      router.push("/login");
      return;
    }

    // Check if user is babysitter
    if (user.role !== "BABYSITTER" && user.role !== "babysitter") {
      router.push("/account");
      return;
    }

    // Fetch certifications only if user is babysitter
    fetchCertifications();
  }, [user, authLoading, router]);

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      const response = await proxy.get("/sitters/me");
      if (response.data.success && response.data.sitter?.certifications) {
        setCertifications(
          Array.isArray(response.data.sitter.certifications)
            ? response.data.sitter.certifications
            : []
        );
      } else {
        setCertifications([]);
      }
    } catch (error: any) {
      console.error("Fetch Certifications Error:", error);
      toast.error(error.response?.data?.message || "Failed to load certifications");
      setCertifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setFormData({ ...formData, file: file });
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file || !formData.title) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append("file", formData.file);
      uploadFormData.append("documentType", "certification");
      uploadFormData.append("title", formData.title);
      if (formData.issuedBy) {
        uploadFormData.append("issuedBy", formData.issuedBy);
      }
      if (formData.issueDate) {
        uploadFormData.append("issueDate", formData.issueDate);
      }

      const response = await proxy.post("/upload/document", uploadFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Certification uploaded successfully!");
        setShowUploadModal(false);
        setFormData({ title: "", issuedBy: "", issueDate: "", file: null });
        fetchCertifications();
      }
    } catch (error: any) {
      console.error("Upload Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to upload certification"
      );
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Show loading while auth is loading
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-purple-600" />
      </div>
    );
  }

  // Check if user is babysitter after loading
  if (user?.role !== "BABYSITTER" && user?.role !== "babysitter") {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-slate-800 rounded-3xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FileBadge className="h-8 w-8" />
              My Certifications
            </h1>
            <p className="text-purple-100 mt-2">
              Showcase your qualifications and credentials
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-white text-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Add Certification
          </button>
        </div>
      </div>

      {/* Certifications Grid */}
      {certifications.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
          <Award className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium text-lg mb-2">
            No Certifications Yet
          </p>
          <p className="text-slate-400 text-sm mb-6">
            Add your certifications to build trust with parents
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 mx-auto"
          >
            <Plus className="h-5 w-5" />
            Add Your First Certification
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certifications.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-purple-50 p-3 rounded-xl">
                  <FileBadge className="h-6 w-6 text-purple-600" />
                </div>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>

              <h3 className="font-bold text-lg text-slate-900 mb-2">
                {cert.title}
              </h3>

              <div className="space-y-2 text-sm text-slate-600 mb-4">
                {cert.issuedBy && (
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-slate-400" />
                    <span>{cert.issuedBy}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>{formatDate(cert.issueDate)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <a
                  href={`http://localhost:5001${cert.documentUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <Download className="h-4 w-4" />
                  View Document
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Add Certification
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">
                  Certification Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  placeholder="e.g., First Aid Certificate"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">
                  Issued By
                </label>
                <input
                  type="text"
                  value={formData.issuedBy}
                  onChange={(e) =>
                    setFormData({ ...formData, issuedBy: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  placeholder="e.g., Red Cross"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, issueDate: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">
                  Document (PDF, Image) *
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-purple-500 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    id="certFile"
                    required
                  />
                  <label
                    htmlFor="certFile"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-slate-400" />
                    <span className="text-sm text-slate-600 font-medium">
                      {formData.file
                        ? formData.file.name
                        : "Click to upload or drag and drop"}
                    </span>
                    <span className="text-xs text-slate-400">
                      PDF, JPG, PNG up to 5MB
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

