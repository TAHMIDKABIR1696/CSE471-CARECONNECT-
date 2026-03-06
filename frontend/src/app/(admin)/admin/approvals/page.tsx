"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import proxy from "@/lib/proxy";
import { Eye, ShieldAlert, Calendar, Loader2 } from "lucide-react";

export default function ApprovalsListPage() {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await proxy.get("/admin/approvals");
        if (res.data.success) setApplicants(res.data.users);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-purple-600 h-8 w-8" />
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-orange-500" /> Pending
          Applications
        </h1>
        <p className="text-slate-500 mt-1">
          Review and verify babysitter applications.
        </p>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {applicants.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            No pending approvals. Good job! 🎉
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Applicant Name</th>
                <th className="px-6 py-4">Applied Date</th>
                <th className="px-6 py-4">Experience</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {applicants.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {user.babysitter?.experienceYears || 0} Years
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/approvals/${user.id}`} // 👈 Dynamic Link
                      className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" /> Review Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
