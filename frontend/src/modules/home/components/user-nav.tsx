"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Settings, LogOut, LayoutDashboard, ChevronDown, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth"; // হুক ইম্পোর্ট

export default function UserNav() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 🔥 সরাসরি হুক থেকে ইউজার এবং লগআউট ফাংশন নিন
  const { user, logout } = useAuth();

  // ক্লিক আউটসাইড লজিক (এটি ঠিক আছে)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full border border-slate-200 hover:shadow-md transition-all duration-200 group bg-white"
      >
        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center border border-purple-200 text-purple-700 font-bold shadow-sm">
          {initials}
        </div>
        <span className="text-sm font-semibold text-slate-700 max-w-[100px] truncate hidden md:block">
          {user?.name?.split(" ")[0]}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-slate-50 mb-1">
            <p className="text-sm font-bold text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            <span className="inline-block mt-2 px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-purple-100">
              {user?.role?.toUpperCase() || "USER"}
            </span>
          </div>

          <div className="space-y-1 mt-1">
            <Link
              href="/account"
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <LayoutDashboard className="h-4 w-4 text-slate-400" />
              Dashboard
            </Link>
            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-xl transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Shield className="h-4 w-4 text-purple-600" />
                Admin Panel
              </Link>
            )}
            <Link
              href="/account/settings"
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="h-4 w-4 text-slate-400" />
              Settings
            </Link>
          </div>

          <div className="border-t border-slate-50 my-1"></div>

          <button
            onClick={logout} // হুকের লগআউট ফাংশন ব্যবহার করুন
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
