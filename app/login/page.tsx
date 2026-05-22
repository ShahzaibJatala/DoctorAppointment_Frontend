"use client";

import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Heart, Mail, Lock, ArrowRight, X, KeyRound, AlertCircle, Shield, Star, Users } from "lucide-react"; // Added AlertCircle
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { loginAction } from "../actions/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { redirect } from 'next/navigation'


// 1. The Main Content Component
const LoginContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Login Form State
  const [form, setForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState(""); // 👈 Added Error State
  const [animate, setAnimate] = useState(false);

  // Forgot Password Flow States
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  // Modals Control
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isNewPasswordModalOpen, setIsNewPasswordModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // A. Handle Google Login Redirect
  useEffect(() => {
    const token = searchParams.get("token");
    const role = searchParams.get("role");

    if (token) {
      if (role && role !== "undefined") {
        router.push(`/${role}/dashboard`);
      } else {
        router.push("/dashboard");
      }
    }
  }, [searchParams, router]);

  // B. Handle Regular Form Login
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError(""); // 👈 Clear previous errors
    setAnimate(true);
    try {
      const data = new FormData();
      data.append("email", form.email);
      data.append("password", form.password);
      
      // Assuming loginAction throws an error if credentials are wrong
      const {role} = await loginAction(data);

      router.push(`/${role}/dashboard`)
      setAnimate(false);
    } catch (error) {
      console.log("Login Error:", error);
      // 👈 Set the error message to display to the user
      setLoginError("Invalid email or password. Please try again.");
      setAnimate(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/google`;
  }

  // ... (Keep all your Forgot Password Logic exactly as it was) ...
  // [FORGOT PASSWORD LOGIC HIDDEN FOR BREVITY - PASTE YOUR EXISTING LOGIC HERE]
  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3003/auth/sendOTP', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });
      if (!res.ok) throw new Error('Failed to send OTP');
      setIsEmailModalOpen(false);
      setIsOtpModalOpen(true);
      alert(`OTP sent to ${resetEmail}`); 
    } catch (error) {
      alert("Error sending OTP. User may not exist.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3003/auth/verifyOTP', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, otp }),
      });
      if (!res.ok) throw new Error('Invalid OTP');
      setIsOtpModalOpen(false);
      setIsNewPasswordModalOpen(true);
    } catch (error) {
      alert("Invalid Code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3003/auth/forgotPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, password: newPassword }),
      });
      if (!res.ok) throw new Error('Failed to reset password');
      setIsNewPasswordModalOpen(false);
      setResetEmail("");
      setOtp("");
      setNewPassword("");
      alert("Password reset successfully! You can now login.");
    } catch (error) {
      alert("Error resetting password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Login Form */}
      <div className="flex w-full flex-col justify-center px-6 py-10 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-[420px]">
          {/* Logo */}
          <Link href="/" className="mb-10 inline-flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#16BCC8] to-[#0ea5a9] shadow-[0_2px_8px_rgba(22,188,200,0.3)] transition-transform duration-300 group-hover:scale-105">
              <Heart className="h-[18px] w-[18px] text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">MediBook</span>
          </Link>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h1>
          <p className="mt-2 text-slate-500">Sign in to access your appointments and health records</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            
            {/* 👇 ERROR MESSAGE DISPLAY */}
            {loginError && (
              <div className="flex items-center gap-2.5 rounded-xl bg-red-50 p-3.5 text-sm text-red-600 border border-red-100 animate-slide-down">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 shrink-0">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium text-sm">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-11 h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#16BCC8] transition-all duration-200"
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    setLoginError(""); // Clear error when user types
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700 font-medium text-sm">Password</Label>
                <p
                  className="text-sm text-[#16BCC8] hover:text-[#0ea5a9] font-medium cursor-pointer transition-colors duration-200"
                  onClick={() => setIsEmailModalOpen(true)}
                >
                  Forgot password?
                </p>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-11 h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#16BCC8] transition-all duration-200"
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    setLoginError(""); // Clear error when user types
                  }}
                />
              </div>
            </div>

            <Button
              variant="hero"
              className={`w-full h-12 rounded-xl text-white font-semibold shadow-[0_4px_16px_rgba(22,188,200,0.3)] hover:shadow-[0_6px_24px_rgba(22,188,200,0.4)] transition-all duration-300 ${animate ? 'opacity-70 cursor-not-allowed' : ''}`}
              size="lg"
              disabled={animate}
            >
              {animate ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                <>
                  Sign In <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Social Login & Signup Links */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-3 text-slate-400 font-medium tracking-wider">Or continue with</span></div>
          </div>
          <div>
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-all duration-200 font-medium"
              onClick={handleGoogleLogin}
            >
               <svg className="mr-2.5 h-4.5 w-4.5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
               Continue with Google
            </Button>
          </div>
          <p className="mt-8 text-center text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-[#16BCC8] hover:text-[#0ea5a9] transition-colors duration-200">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Enhanced Visual Panel */}
      <div className="hidden relative overflow-hidden bg-gradient-to-br from-[#16BCC8] via-[#14b0bc] to-[#0ea5a9] lg:block lg:w-1/2">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white/[0.06] blur-[50px]" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/[0.04] blur-[50px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="relative flex h-full items-center justify-center p-12 xl:p-16">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-sm shadow-[0_0_0_1px_rgba(255,255,255,0.2)]">
              <Heart className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-white leading-tight">
              Quality Healthcare at Your Fingertips
            </h2>
            <p className="mt-4 text-white/70 leading-relaxed">
              Access trusted medical professionals, book appointments instantly, and manage your health journey — all in one place.
            </p>

            {/* Feature pills */}
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {[
                { icon: Shield, label: "HIPAA Compliant" },
                { icon: Star, label: "4.9★ Rated" },
                { icon: Users, label: "50K+ Users" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 border border-white/10">
                  <Icon className="h-3.5 w-3.5 text-white/80" />
                  <span className="text-sm font-medium text-white/90">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}
      {/* 1. Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900">Reset Password</h2>
              <button onClick={() => setIsEmailModalOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"><X className="h-5 w-5 cursor-pointer" /></button>
            </div>
            <p className="mb-6 text-slate-500 text-sm">Enter your email address and we&apos;ll send you a 4-digit OTP.</p>
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                  <Input id="reset-email" type="email" required placeholder="you@example.com" className="pl-11 h-12 rounded-xl" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
                </div>
              </div>
              <Button type="submit" variant="hero" className="w-full h-12 rounded-xl cursor-pointer text-white" disabled={isLoading}>{isLoading ? "Sending..." : "Send OTP"}</Button>
            </form>
          </div>
        </div>
      )}

      {/* 2. OTP Modal */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900">Enter OTP</h2>
              <button onClick={() => setIsOtpModalOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"><X className="h-5 w-5" /></button>
            </div>
            <p className="mb-6 text-slate-500 text-sm">We&apos;ve sent a code to <span className="font-semibold text-slate-800">{resetEmail}</span>.</p>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">One-Time Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                  <Input id="otp" type="text" inputMode="numeric" maxLength={4} required placeholder="0000" className="pl-11 h-12 rounded-xl text-center text-lg tracking-[0.5em] font-bold" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} />
                </div>
              </div>
              <Button type="submit" variant="hero" className="w-full h-12 rounded-xl text-white" disabled={isLoading}>{isLoading ? "Verifying..." : "Verify Code"}</Button>
              <div className="text-center text-sm"><button type="button" onClick={handleSendOtp} className="font-medium text-[#16BCC8] hover:text-[#0ea5a9] transition-colors">Resend Code</button></div>
            </form>
          </div>
        </div>
      )}

      {/* 3. New Password Modal */}
      {isNewPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900">New Password</h2>
              <button onClick={() => setIsNewPasswordModalOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"><X className="h-5 w-5" /></button>
            </div>
            <p className="mb-6 text-slate-500 text-sm">Please enter your new password below.</p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                  <Input id="new-password" type="password" required placeholder="••••••••" minLength={6} className="pl-11 h-12 rounded-xl" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
              </div>
              <Button type="submit" variant="hero" className="w-full h-12 rounded-xl text-white" disabled={isLoading}>{isLoading ? "Updating..." : "Update Password"}</Button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

const Login = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 border-2 border-[#16BCC8]/30 border-t-[#16BCC8] rounded-full animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  );
};

export default Login;
