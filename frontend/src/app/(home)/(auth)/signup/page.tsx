"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Lock,
  MapPin,
  Phone,
  Loader2,
  Baby,
  Briefcase,
} from "lucide-react";
import ImageWithFallback from "@/components/image-with-fallback";
import { getApiUrl } from "@/lib/api-config";

type UserRole = "PARENT" | "BABYSITTER";

interface ISignupInput {
  name: string;
  email: string;
  phone: string;
  location: string;
  password: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("PARENT");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ISignupInput>();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/account");
    } else {
      const timer = setTimeout(() => {
        setCheckingAuth(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [router]);
  const onSubmit: SubmitHandler<ISignupInput> = async (data) => {
    const payload = { ...data, role };
    try {
      const apiUrl = getApiUrl();
      const response = await axios.post(
        `${apiUrl}/auth/register`,
        payload
      );

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        toast.success(`Welcome ${data.name}! Redirecting...`);

        router.push("/account");
        router.refresh();
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            "Registration failed. Check API URL and backend CORS settings."
        );
      }
    }
  };

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    setSocialLoading(provider);
    try {
      const email = prompt(`Enter your ${provider === "google" ? "Google" : "Facebook"} email:`);
      if (!email) {
        setSocialLoading(null);
        return;
      }
      const name = email.split("@")[0];
      const apiUrl = getApiUrl();
      const response = await axios.post(`${apiUrl}/auth/social`, {
        email,
        name,
        provider,
      });
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        toast.success(`${provider === "google" ? "Google" : "Facebook"} signup successful!`);
        router.push("/account");
        router.refresh();
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            "Social signup failed. Check API URL and backend CORS settings."
        );
      }
    } finally {
      setSocialLoading(null);
    }
  };

  if (checkingAuth) {
    return null;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 order-2 lg:order-1">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Create Account</h2>
              <p className="text-gray-600">Join CareConnect and find trusted childcare</p>
            </div>

            {/* Role Toggle */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setRole("PARENT")}
                className={`flex items-center justify-center gap-2 border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                  role === "PARENT"
                    ? "border-purple-600 text-purple-600 bg-purple-50"
                    : "border-gray-300 text-gray-700 hover:border-purple-600"
                }`}
              >
                <Baby className="h-4 w-4" /> Parent
              </button>
              <button
                type="button"
                onClick={() => setRole("BABYSITTER")}
                className={`flex items-center justify-center gap-2 border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                  role === "BABYSITTER"
                    ? "border-purple-600 text-purple-600 bg-purple-50"
                    : "border-gray-300 text-gray-700 hover:border-purple-600"
                }`}
              >
                <Briefcase className="h-4 w-4" /> Sitter
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    {...register("name", { required: "Name is required" })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    {...register("email", { required: "Email is required" })}
                    type="email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      {...register("phone", { required: "Required" })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="+880..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      {...register("location", { required: "Required" })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Dhaka"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    {...register("password", { required: "Required", minLength: 6 })}
                    type="password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="••••••••"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex items-start">
                <input type="checkbox" required className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
                <label className="ml-2 text-sm text-gray-700">
                  I agree to the{" "}
                  <a href="#" className="text-purple-600 hover:text-purple-500">Terms of Service</a>{" "}
                  and{" "}
                  <a href="#" className="text-purple-600 hover:text-purple-500">Privacy Policy</a>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
              </button>
            </form>

            {/* Social Sign Up */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSocialLogin("google")}
                  disabled={socialLoading !== null}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
                >
                  {socialLoading === "google" ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  Google
                </button>
                <button
                  onClick={() => handleSocialLogin("facebook")}
                  disabled={socialLoading !== null}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
                >
                  {socialLoading === "facebook" ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  )}
                  Facebook
                </button>
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-purple-600 hover:text-purple-500 font-semibold">
                Sign in
              </Link>
            </p>
          </div>

          {/* Right Side - Image */}
          <div className="hidden lg:block order-1 lg:order-2">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1758687126864-96b61e1b3af0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBjaGlsZHJlbiUyMHBhcmVudCUyMHNtaWxpbmd8ZW58MXx8fHwxNzcyNzMwOTAzfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Happy family"
                width={1080}
                height={720}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
