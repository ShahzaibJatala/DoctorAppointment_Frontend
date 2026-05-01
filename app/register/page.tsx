"use client";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Heart, Mail, Lock, User, ArrowRight, Stethoscope, UserRound, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { registerAction } from "../actions/auth";


const Register = () => {
  // 1. Centralized state for all form inputs
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    password: "",
    age: 0,
    role: "patient", // Default value matching your "defaultChecked"
  });

  const [animate,setAnimate] = useState(false);

  // 2. Generic handler for text inputs
  const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // 3. Specific handler for radio buttons (Role)
  const handleRoleChange = (roleValue : string) => {
    setFormData((prev) => ({ ...prev, role: roleValue }));
  };

  // 4. Handle Form Submission
  const handleSubmit = async (e : React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    try {
      const data = new FormData();
      data.append("firstName", formData.firstName);
      data.append("age", formData.age.toString());
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("role", formData.role);

    // Call the server action
    setAnimate(true);
    await registerAction(data);     
    setAnimate(false);
      
    } catch (error) {
      console.log("register error :", error);      
    }

  };

  const roles = [
    { value: "patient", label: "Patient", icon: UserRound, desc: "Book appointments" },
    { value: "doctor", label: "Doctor", icon: Stethoscope, desc: "Manage practice" },
    { value: "admin", label: "Admin", icon: ShieldCheck, desc: "System admin" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Enhanced Visual Panel */}
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
              Join Our Healthcare Community
            </h2>
            <p className="mt-4 text-white/70 leading-relaxed">
              Whether you&apos;re a patient seeking care or a doctor looking to
              expand your practice, MediBook connects you with the healthcare
              you need.
            </p>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { value: "500+", label: "Doctors" },
                { value: "50K+", label: "Patients" },
                { value: "4.9★", label: "Rating" },
              ].map(({ value, label }) => (
                <div key={label} className="rounded-2xl bg-white/10 backdrop-blur-sm p-4 border border-white/10">
                  <p className="text-2xl font-extrabold text-white">{value}</p>
                  <p className="text-xs text-white/60 font-medium mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full flex-col justify-center px-6 py-10 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-[420px]">
          <Link href="/" className="mb-10 inline-flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#16BCC8] to-[#0ea5a9] shadow-[0_2px_8px_rgba(22,188,200,0.3)] transition-transform duration-300 group-hover:scale-105">
              <Heart className="h-[18px] w-[18px] text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">
              MediBook
            </span>
          </Link>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Create an account
          </h1>
          <p className="mt-2 text-slate-500">
            Start your journey to better healthcare today
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Role Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">
                I want to join as
              </label>

              <div className="grid grid-cols-3 gap-3">
                {roles.map(({ value, label, icon: Icon, desc }) => (
                  <label
                    key={value}
                    className={`relative flex flex-col items-center gap-2 cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 text-center ${
                      formData.role === value
                        ? "border-[#16BCC8] bg-[#16BCC8]/5 shadow-[0_0_0_1px_rgba(22,188,200,0.2)]"
                        : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={value}
                      checked={formData.role === value}
                      onChange={() => handleRoleChange(value)}
                      className="sr-only"
                    />
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ${
                      formData.role === value
                        ? "bg-[#16BCC8]/10 text-[#16BCC8]"
                        : "bg-slate-100 text-slate-400"
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-sm font-semibold transition-colors ${
                      formData.role === value ? "text-[#16BCC8]" : "text-slate-700"
                    }`}>
                      {label}
                    </span>
                    <span className="text-[10px] text-slate-400 leading-tight">{desc}</span>
                    {/* Check indicator */}
                    {formData.role === value && (
                      <div className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-[#16BCC8] flex items-center justify-center animate-scale-in">
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-slate-700 font-medium text-sm">First name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                  <Input
                    id="firstName"
                    placeholder="John"
                    className="pl-11 h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#16BCC8] transition-all duration-200"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="age" className="text-slate-700 font-medium text-sm">Age</Label>
                <Input
                  id="age"
                  placeholder="18"
                  type="number"
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#16BCC8] transition-all duration-200"
                  value={formData.age}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium text-sm">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-11 h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#16BCC8] transition-all duration-200"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-11 h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#16BCC8] transition-all duration-200"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Must be at least 8 characters with a number and special
                character
              </p>
            </div>

            <Button
              type="submit"
              variant="hero"
              className={`w-full h-12 rounded-xl text-white font-semibold shadow-[0_4px_16px_rgba(22,188,200,0.3)] hover:shadow-[0_6px_24px_rgba(22,188,200,0.4)] transition-all duration-300 ${animate ? 'opacity-70 cursor-not-allowed' : ''}`}
              size="lg"
              disabled={animate}
            >
              {animate ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-center text-xs text-slate-400 leading-relaxed">
              By creating an account, you agree to our{" "}
              <Link href="#" className="text-[#16BCC8] hover:text-[#0ea5a9] font-medium transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-[#16BCC8] hover:text-[#0ea5a9] font-medium transition-colors">
                Privacy Policy
              </Link>
            </p>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#16BCC8] hover:text-[#0ea5a9] transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;