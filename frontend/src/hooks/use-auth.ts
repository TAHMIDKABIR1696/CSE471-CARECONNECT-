// src/hooks/use-auth.ts
"use client";

import { useState, useEffect } from "react";

// @ts-ignore
import { usePathname } from "next/navigation";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{
    id?: number;
    name?: string;
    email?: string;
    role?: string;
    isApproved?: boolean;
    phoneNumber?: string;
  } | null>(null);

  // 🛠️ লোডিং স্টেট ডিফল্ট true রাখুন
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // এই ফাংশনটি শুধুমাত্র ব্রাউজারে রান করবে
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          // Ensure role is uppercase and properly formatted
          if (parsedUser) {
            parsedUser.role = parsedUser.role?.toUpperCase() || parsedUser.role;
          }
          setIsAuthenticated(true);
          setUser(parsedUser);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // এরর হলেও সেফলি লগআউট দেখাবে
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        // সব কাজ শেষ হলে লোডিং বন্ধ হবে
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [pathname]); // Re-run when pathname changes

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = "/login";
  };

  return { isAuthenticated, isLoading, user, logout };
}