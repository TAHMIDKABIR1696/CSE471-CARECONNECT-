"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils"; // Shadcn utility
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CalendarDays,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import toast from "react-hot-toast";

interface AdminSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export default function AdminSidebar({
  isCollapsed,
  setIsCollapsed,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Navigation Items
  const navItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Approvals", href: "/admin/approvals", icon: ShieldCheck },
    { label: "All Users", href: "/admin/users", icon: Users },
    { label: "Bookings", href: "/admin/bookings", icon: CalendarDays },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out");
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen bg-slate-950 text-slate-100 border-r border-slate-800 transition-all duration-300 ease-in-out z-20",
        isCollapsed ? "w-[80px]" : "w-72"
      )}
    >
      {/* 🟢 Header / Logo */}
      <div className="h-20 flex items-center justify-center border-b border-slate-800 relative">
        {!isCollapsed ? (
          <h1 className="text-xl font-bold tracking-wider text-purple-400 animate-in fade-in duration-300">
            Care<span className="text-white">Connect</span>
            <span className="text-[10px] ml-1 bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 uppercase tracking-widest">
              Admin
            </span>
          </h1>
        ) : (
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            C
          </div>
        )}

        {/* Collapse Toggle Button (Absolute) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-7 w-6 h-6 rounded-full bg-purple-600 text-white hover:bg-purple-500 shadow-md border border-slate-900 z-50 hidden md:flex"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* 🟢 Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        <TooltipProvider delayDuration={0}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return isCollapsed ? (
              // Collapsed Mode (Only Icons with Tooltip)
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center justify-center h-12 w-12 rounded-xl transition-all mx-auto",
                      isActive
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-slate-800 text-white border-slate-700"
                >
                  {item.label}
                </TooltipContent>
              </Tooltip>
            ) : (
              // Expanded Mode (Icon + Text)
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                  isActive
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </TooltipProvider>
      </div>

      {/* 🟢 Footer / Logout */}
      <div className="p-4 border-t border-slate-800">
        {isCollapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="h-12 w-12 rounded-xl mx-auto flex items-center justify-center text-red-400 hover:bg-red-950/30 hover:text-red-300"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-red-900 text-white border-red-800"
              >
                Logout
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-red-400 hover:bg-red-950/30 hover:text-red-300 px-4 py-6 rounded-xl"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        )}
      </div>
    </aside>
  );
}
