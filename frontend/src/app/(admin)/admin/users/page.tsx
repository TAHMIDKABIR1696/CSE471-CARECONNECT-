"use client";

import React, { useEffect, useState } from "react";
import proxy from "@/lib/proxy";
import toast from "react-hot-toast";
import {
  Search,
  Trash2,
  Ban,
  CheckCircle,
  MoreVertical,
  ShieldAlert,
  Filter,
  Loader2,
  Undo2,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Types
interface IUser {
  id: number;
  name: string;
  email: string;
  role: "PARENT" | "BABYSITTER" | "ADMIN";
  isApproved: boolean;
  isBanned: boolean;
  createdAt: string;
}

export default function AllUsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; // প্রতি পেজে ৭ জন ইউজার দেখাবে

  // Custom Action Modal State
  const [actionData, setActionData] = useState<{
    id: number;
    type: "ban" | "unban" | "delete";
  } | null>(null);

  // 1. Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await proxy.get("/admin/users");
      if (res.data.success) {
        setUsers(res.data.users);
        setFilteredUsers(res.data.users);
      }
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Filter Logic
  useEffect(() => {
    let result = users;

    if (search) {
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (roleFilter !== "ALL") {
      result = result.filter((u) => u.role === roleFilter);
    }

    setFilteredUsers(result);
    setCurrentPage(1); // ফিল্টার করলে প্রথম পেজে ফেরত যাবে
  }, [search, roleFilter, users]);

  // 3. Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // 4. Handle Actions (Confirm Logic)
  const confirmAction = async () => {
    if (!actionData) return;
    const { id, type } = actionData;

    try {
      const res = await proxy.patch(`/admin/users/${id}`, { action: type });
      if (res.data.success) {
        toast.success(res.data.message);
        // Update UI locally
        if (type === "delete") {
          setUsers((prev) => prev.filter((u) => u.id !== id));
        } else {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === id ? { ...u, isBanned: type === "ban" } : u
            )
          );
        }
      }
    } catch (error) {
      toast.error("Action failed");
    } finally {
      setActionData(null); // Modal বন্ধ করুন
    }
  };

  // 5. Export CSV Feature
  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "ID,Name,Email,Role,Status,Joined Date\n" +
      filteredUsers
        .map(
          (u) =>
            `${u.id},${u.name},${u.email},${u.role},${
              u.isBanned ? "Banned" : "Active"
            },${u.createdAt}`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users_list.csv");
    document.body.appendChild(link);
    link.click();
  };

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-purple-600 h-8 w-8" />
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500 text-sm">
            Manage all registered parents and babysitters.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-sm font-bold text-slate-600">
          Total Users: <span className="text-purple-600">{users.length}</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="PARENT">Parents</option>
            <option value="BABYSITTER">Babysitters</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">User Info</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    {/* User Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${
                            user.isBanned ? "bg-red-400" : "bg-purple-500"
                          }`}
                        >
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <p
                            className={`font-bold ${
                              user.isBanned
                                ? "text-red-600 line-through"
                                : "text-slate-800"
                            }`}
                          >
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          user.role === "PARENT"
                            ? "bg-blue-50 text-blue-600 border-blue-100"
                            : user.role === "BABYSITTER"
                            ? "bg-purple-50 text-purple-600 border-purple-100"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {user.isBanned ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                          <Ban className="h-3 w-3" /> Banned
                        </span>
                      ) : user.role === "BABYSITTER" && !user.isApproved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
                          <ShieldAlert className="h-3 w-3" /> Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                          <CheckCircle className="h-3 w-3" /> Active
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    {/* Dropdown Menu */}
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-2 hover:bg-slate-100 rounded-full outline-none transition-colors">
                          <MoreVertical className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          {user.isBanned ? (
                            <DropdownMenuItem
                              onClick={() =>
                                setActionData({ id: user.id, type: "unban" })
                              }
                              className="text-green-600 cursor-pointer"
                            >
                              <Undo2 className="h-4 w-4 mr-2" /> Unban User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() =>
                                setActionData({ id: user.id, type: "ban" })
                              }
                              className="text-orange-600 cursor-pointer"
                            >
                              <Ban className="h-4 w-4 mr-2" /> Ban User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() =>
                              setActionData({ id: user.id, type: "delete" })
                            }
                            className="text-red-600 cursor-pointer focus:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete Data
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredUsers.length > itemsPerPage && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <p className="text-xs text-slate-500 font-medium">
              Showing {indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, filteredUsers.length)} of{" "}
              {filteredUsers.length}
            </p>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🟢 Custom Confirmation Modal */}
      <AlertDialog open={!!actionData} onOpenChange={() => setActionData(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action{" "}
              {actionData?.type === "delete"
                ? "will permanently delete the user data."
                : actionData?.type === "ban"
                ? "will restrict the user from accessing the platform."
                : "will restore user access."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={
                actionData?.type === "unban"
                  ? "bg-green-600"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
