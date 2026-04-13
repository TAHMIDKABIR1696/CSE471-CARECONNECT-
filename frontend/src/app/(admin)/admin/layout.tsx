"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import AdminSidebar from "@/modules/admin/admin-sidebar";
import AdminHeader from "@/modules/admin/admin-header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300">
        {/* 🟢 Top Header */}
        <AdminHeader />

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-8">
          {/* 👇 পরিবর্তন করা হয়েছে এখানে */}
          <div
            className={cn(
              "w-full transition-all duration-300", // max-w-7xl এবং mx-auto সরানো হয়েছে
              isCollapsed ? "px-4" : "px-0"
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
