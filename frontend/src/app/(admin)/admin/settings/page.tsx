"use client";

import React, { useState } from "react";
import {
  User,
  Lock,
  Settings,
  Bell,
  Globe,
  Save,
  Loader2,
  ShieldCheck,
  Mail,
  Database,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Settings updated successfully!");
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Admin Settings</h1>
        <p className="text-slate-500 text-sm">
          Configure your profile and system preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-white border border-slate-200 p-1 h-14 rounded-2xl gap-2 shadow-sm mb-8">
          <TabsTrigger
            value="profile"
            className="rounded-xl px-6 py-2.5 data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all font-bold text-sm flex gap-2"
          >
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="rounded-xl px-6 py-2.5 data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all font-bold text-sm flex gap-2"
          >
            <Lock className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="rounded-xl px-6 py-2.5 data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all font-bold text-sm flex gap-2"
          >
            <Settings className="h-4 w-4" /> System
          </TabsTrigger>
        </TabsList>

        {/* 🟢 Profile Settings Tab */}
        <TabsContent value="profile" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-purple-600" /> Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Admin User"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue="admin@careconnect.com"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
                <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-purple-100 relative group">
                  <span className="text-3xl font-bold text-purple-600">A</span>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Globe className="text-white h-5 w-5" />
                  </div>
                </div>
                <h4 className="font-bold text-slate-800">Profile Picture</h4>
                <p className="text-xs text-slate-400 mt-2">
                  JPG, PNG allowed. Max 2MB.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 rounded-xl w-full border-slate-200 text-slate-600 font-bold"
                >
                  Update Photo
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 🟢 Security Settings Tab */}
        <TabsContent value="security" className="space-y-6 outline-none">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm max-w-2xl">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6 text-lg">
              <ShieldCheck className="h-6 w-6 text-blue-500" /> Password &
              Security
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Min 8 chars"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <Button className="mt-4 bg-slate-900 hover:bg-black rounded-xl px-8 font-bold">
                Change Password
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* 🟢 System Settings Tab (Recommended) */}
        <TabsContent value="system" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
                <Database className="h-5 w-5 text-purple-600" /> Platform
                Configuration
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-slate-700">
                      Platform Commission (%)
                    </p>
                    <p className="text-xs text-slate-400">
                      Fee charged on each successful booking.
                    </p>
                  </div>
                  <input
                    type="number"
                    defaultValue="10"
                    className="w-20 p-2 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-purple-600"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-slate-700">
                      Maintenance Mode
                    </p>
                    <p className="text-xs text-slate-400">
                      Disable the website for all users.
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-slate-700">
                      Auto-approve Sitters
                    </p>
                    <p className="text-xs text-slate-400">
                      New sitters skip the review process.
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
                <Bell className="h-5 w-5 text-orange-500" /> Notification
                Settings
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-slate-700">
                      System Alerts
                    </p>
                    <p className="text-xs text-slate-400">
                      Notify admin about high-volume traffic.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-slate-700">
                      New Registration Email
                    </p>
                    <p className="text-xs text-slate-400">
                      Receive email for every new user.
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Save Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-6 rounded-2xl font-bold text-lg shadow-xl shadow-purple-100 transition-all flex items-center gap-3"
        >
          {loading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          Save All Changes
        </Button>
      </div>
    </div>
  );
}
