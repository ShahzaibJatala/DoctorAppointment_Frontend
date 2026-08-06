import Link from "next/link";
import Header from "@/components/layouts/header";
import Footer from "@/components/layouts/footer";
import LiveDoctorCard from "@/components/shared/LiveDoctorCard";
import {
  Search,
  Calendar,
  Shield,
  Clock,
  Star,
  CheckCircle2,
  ArrowRight,
  Stethoscope,
  HeartPulse,
  Baby,
  Brain,
  Bone,
  Eye,
  Sparkles,
  Video,
  UserCheck,
  BadgeCheck,
  ChevronRight,
  MessageCircle,
} from "lucide-react";

// ── Server-side data fetch (real doctors, no mock data) ─────────────────
async function getTopDoctors() {
  try {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";
    const res = await fetch(`${serverUrl}/patient/allDoctors`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data: any[] = await res.json();
    // Sort by rating desc, then take top 3
    return data
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 3);
  } catch {
    return [];
  }
}

// ── Specialty pills ─────────────────────────────────────────────────────
const SPECIALTIES = [
  { name: "Cardiology", icon: HeartPulse, color: "bg-red-50 text-red-600 border-red-100 hover:bg-red-100" },
  { name: "Dermatology", icon: Sparkles, color: "bg-pink-50 text-pink-600 border-pink-100 hover:bg-pink-100" },
  { name: "Pediatrics", icon: Baby, color: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100" },
  { name: "Neurology", icon: Brain, color: "bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100" },
  { name: "Orthopedics", icon: Bone, color: "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100" },
  { name: "General Practice", icon: Stethoscope, color: "bg-teal-50 text-teal-600 border-teal-100 hover:bg-teal-100" },
  { name: "Psychiatry", icon: Brain, color: "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100" },
  { name: "Ophthalmology", icon: Eye, color: "bg-cyan-50 text-cyan-600 border-cyan-100 hover:bg-cyan-100" },
];

// ── Steps (How It Works) ────────────────────────────────────────────────
const HOW_STEPS = [
  {
    step: "01",
    icon: Search,
    title: "Find Your Doctor",
    desc: "Search by specialty, name, or your symptoms. Filter by location, availability, and fee to find the right match.",
    color: "from-[#16BCC8] to-[#0ea5a9]",
    bg: "bg-[#16BCC8]/8",
  },
  {
    step: "02",
    icon: Calendar,
    title: "Choose a Time Slot",
    desc: "View the doctor's real-time availability and pick a slot that fits your schedule — in-person or video.",
    color: "from-violet-500 to-violet-600",
    bg: "bg-violet-50",
  },
  {
    step: "03",
    icon: UserCheck,
    title: "Attend Your Visit",
    desc: "Meet your doctor at the clinic or join a secure video call. Get the care you need, without the wait.",
    color: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
  },
];

// ── Why Choose Us ───────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: BadgeCheck,
    title: "Verified Doctors Only",
    desc: "Every doctor on MediBook is manually verified by our admin team before appearing on the platform.",
    accent: "text-[#16BCC8]",
    bg: "bg-[#16BCC8]/8",
  },
  {
    icon: Video,
    title: "Video Consultations",
    desc: "Consult with a doctor from your home via secure video calls. No travel, no waiting rooms.",
    accent: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    icon: Clock,
    title: "Real-Time Availability",
    desc: "See exactly when doctors are free and book instantly — no phone tag or waiting for callbacks.",
    accent: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Shield,
    title: "Your Privacy, Protected",
    desc: "Your health data is encrypted and stored securely. We never share your information.",
    accent: "text-blue-600",
    bg: "bg-blue-50",
  },
];

// ── Stats ───────────────────────────────────────────────────────────────
const STATS = [
  { value: "500+", label: "Expert Doctors" },
  { value: "50K+", label: "Happy Patients" },
  { value: "100+", label: "Specialties" },
  { value: "4.9★", label: "Average Rating" },
];

export default async function Home() {
  const topDoctors = await getTopDoctors();

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#f4fbfc] to-[#e8f7f9] pt-10 pb-16 lg:pt-16 lg:pb-24">
        {/* Soft blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-[#16BCC8]/[0.05] blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#16BCC8]/[0.04] blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(22,188,200,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(22,188,200,0.025)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          {/* ── Hero Content — centered ── */}
          <div className="flex flex-col items-center text-center">
            {/* Pill badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#16BCC8]/20 bg-white px-4 py-1.5 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
                Verified Doctors Available Now
              </span>
            </div>

            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Your Health,{" "}
              <span className="relative inline-block">
                <span className="text-gradient">Simplified.</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 300 10"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 6C80 1 220 1 298 6"
                    stroke="#16BCC8"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeOpacity="0.35"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-lg text-slate-500 leading-relaxed">
              Book appointments with verified doctors in minutes. In-person visits or
              video consultations — from your phone, any time.
            </p>

            {/* Search bar — invites action */}
            <div className="mt-8 flex w-full max-w-lg items-center gap-3 rounded-2xl bg-white p-2 shadow-elevated border border-slate-100">
              <div className="flex flex-1 items-center gap-2 pl-3">
                <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="text-sm text-slate-400 select-none">Search by doctor, specialty, or symptom...</span>
              </div>
              <Link href="/patient/findDoctors">
                <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#16BCC8] to-[#0ea5a9] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_3px_12px_rgba(22,188,200,0.35)] hover:shadow-[0_5px_20px_rgba(22,188,200,0.5)] transition-all duration-200 hover:scale-[1.02] cursor-pointer">
                  Search
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>

            {/* Quick specialty pills */}
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {["Cardiology", "Dermatology", "Pediatrics", "Neurology", "General Practice"].map((s) => (
                <Link key={s} href={`/patient/findDoctors?specialty=${encodeURIComponent(s)}`}>
                  <span className="cursor-pointer rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-medium text-slate-600 hover:border-[#16BCC8]/40 hover:text-[#16BCC8] hover:bg-[#16BCC8]/5 transition-all duration-150">
                    {s}
                  </span>
                </Link>
              ))}
            </div>

            {/* Trust badges */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-5 text-sm text-slate-500">
              {["Verified Doctors", "Secure Booking", "Easy Rescheduling", "Free Cancellation"].map((b) => (
                <span key={b} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* ── Hero Illustration row ── */}
          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              { icon: Stethoscope, title: "Find a Doctor", desc: "Search 500+ verified specialists", color: "bg-[#16BCC8]/8 text-[#16BCC8]", href: "/patient/findDoctors" },
              { icon: Video, title: "Video Consult", desc: "Meet doctors from anywhere", color: "bg-violet-50 text-violet-600", href: "/patient/findDoctors" },
              { icon: HeartPulse, title: "Your Health Record", desc: "View your appointment history", color: "bg-emerald-50 text-emerald-600", href: "/patient/dashboard" },
            ].map((card) => (
              <Link key={card.title} href={card.href}>
                <div className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                  <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${card.color}`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm group-hover:text-[#16BCC8] transition-colors">{card.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{card.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 ml-auto group-hover:text-[#16BCC8] group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          STATS BAR
      ═══════════════════════════════════════════════════════════════ */}
      <section className="border-y border-slate-100 bg-white py-8">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {STATS.map((stat, i) => (
              <div
                key={i}
                className={`text-center ${i < STATS.length - 1 ? "md:border-r md:border-slate-100" : ""}`}
              >
                <p className="text-3xl font-extrabold text-gradient">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20 bg-slate-50/60">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <div className="mb-12 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#16BCC8]/15 bg-[#16BCC8]/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#16BCC8]">
              Simple &amp; Fast
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 lg:text-4xl">
              Book in 3 Easy Steps
            </h2>
            <p className="mt-3 text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
              No forms. No phone calls. Just open the app, find your doctor, and you're done.
            </p>
          </div>

          {/* Steps */}
          <div className="grid gap-6 md:grid-cols-3">
            {HOW_STEPS.map((s, i) => (
              <div key={i} className="group relative rounded-2xl border border-slate-100 bg-white p-7 shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-300">
                {/* Step number */}
                <div className="mb-5 flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} shadow-lg`}>
                    <s.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-4xl font-black text-slate-100 group-hover:text-slate-200 transition-colors select-none">{s.step}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                {i < HOW_STEPS.length - 1 && (
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-6 w-6 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm">
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA under steps */}
          <div className="mt-10 flex justify-center">
            <Link href="/patient/findDoctors">
              <button className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#16BCC8] to-[#0ea5a9] px-8 py-3.5 text-sm font-bold text-white shadow-[0_4px_20px_rgba(22,188,200,0.35)] hover:shadow-[0_6px_30px_rgba(22,188,200,0.5)] transition-all duration-200 hover:scale-[1.02] cursor-pointer">
                Find a Doctor Now
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURED DOCTORS (Real Data)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row mb-10">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#16BCC8]/15 bg-[#16BCC8]/8 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#16BCC8]">
                Top Rated
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Our Best Doctors
              </h2>
              <p className="mt-1.5 text-slate-500 text-sm">
                Sorted by real patient ratings &amp; reviews
              </p>
            </div>
            <Link
              href="/patient/findDoctors"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-[#16BCC8]/30 hover:text-[#16BCC8] hover:bg-[#16BCC8]/5 transition-all duration-200"
            >
              View All Doctors
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {topDoctors.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {topDoctors.map((doctor) => (
                <LiveDoctorCard key={doctor._id} doctor={doctor} />
              ))}
            </div>
          ) : (
            /* Fallback when no doctors yet */
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
              <Stethoscope className="mx-auto h-10 w-10 text-slate-300 mb-3" />
              <p className="font-semibold text-slate-500">Doctors are being onboarded</p>
              <p className="mt-1 text-sm text-slate-400">Check back soon — our network is growing daily.</p>
              <Link href="/register">
                <button className="mt-5 rounded-xl bg-[#16BCC8] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0ea5a9] transition-colors cursor-pointer">
                  Join as a Doctor
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          BROWSE BY SPECIALTY
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20 bg-slate-50/60">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#16BCC8]/15 bg-[#16BCC8]/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#16BCC8]">
              All Specialties
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Browse by Specialty
            </h2>
            <p className="mt-2 text-slate-500 text-sm max-w-lg mx-auto">
              Find the right specialist for your health needs, from cardiology to pediatrics.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
            {SPECIALTIES.map((sp) => (
              <Link key={sp.name} href={`/patient/findDoctors?specialty=${encodeURIComponent(sp.name)}`}>
                <div className={`group flex items-center gap-3 rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${sp.color}`}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70"><sp.icon className="h-5 w-5" aria-hidden="true" /></span>
                  <span className="text-sm font-semibold">{sp.name}</span>
                  <ChevronRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          WHY CHOOSE MEDIBOOK
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#16BCC8]/15 bg-[#16BCC8]/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#16BCC8]">
              Why MediBook
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight lg:text-4xl">
              Healthcare the Right Way
            </h2>
            <p className="mt-3 text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
              We built MediBook because accessing quality healthcare should be simple — not complicated.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${f.bg}`}>
                  <f.icon className={`h-5 w-5 ${f.accent}`} />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FOR DOCTORS SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-[#16BCC8]/10 blur-[80px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
        </div>
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#16BCC8]">
                For Doctors
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight lg:text-4xl">
                Grow Your Practice with MediBook
              </h2>
              <p className="mt-4 text-slate-400 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Join our network of verified doctors. Set your own hours, accept bookings online, and 
                manage your patients — all from one dashboard.
              </p>
              <ul className="mt-6 space-y-3">
                {["Manage appointments with ease", "Video consultations built-in", "Get discovered by thousands of patients", "Your data, your control"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-[#16BCC8] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row justify-center lg:justify-start">
                <Link href="/register">
                  <button className="flex items-center gap-2 rounded-xl bg-[#16BCC8] px-7 py-3 text-sm font-bold text-white hover:bg-[#0ea5a9] shadow-[0_4px_20px_rgba(22,188,200,0.3)] hover:shadow-[0_6px_30px_rgba(22,188,200,0.5)] transition-all duration-200 cursor-pointer">
                    Join as a Doctor
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="/login">
                  <button className="flex items-center gap-2 rounded-xl border border-white/15 px-7 py-3 text-sm font-semibold text-white hover:bg-white/5 transition-all duration-200 cursor-pointer">
                    Sign In
                  </button>
                </Link>
              </div>
            </div>
            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              {[
                { icon: UserCheck, value: "500+", label: "Active Doctors", color: "text-[#16BCC8]", bg: "bg-[#16BCC8]/10" },
                { icon: Star, value: "4.9", label: "Avg Rating", color: "text-amber-400", bg: "bg-amber-400/10" },
                { icon: Calendar, value: "50K+", label: "Appointments", color: "text-violet-400", bg: "bg-violet-400/10" },
                { icon: MessageCircle, value: "98%", label: "Satisfaction", color: "text-emerald-400", bg: "bg-emerald-400/10" },
              ].map((s, i) => (
                <div key={i} className="rounded-xl border border-white/8 bg-white/5 p-5 text-center">
                  <div className={`mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${s.bg}`}>
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                  </div>
                  <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#16BCC8] via-[#14b0bc] to-[#0ea5a9] py-16 lg:py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white/[0.08] blur-[40px]" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/[0.05] blur-[40px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
        <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 text-center relative">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 shadow-[0_0_0_1px_rgba(255,255,255,0.2)] backdrop-blur-sm">
            <HeartPulse className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight lg:text-4xl">
            Ready to Take Control of Your Health?
          </h2>
          <p className="mt-4 text-lg text-white/80 leading-relaxed">
            Join thousands of patients who trust MediBook for fast, verified, and affordable healthcare.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row justify-center">
            <Link href="/register">
              <button className="flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-sm font-bold text-[#16BCC8] shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_30px_rgba(0,0,0,0.18)] transition-all duration-200 hover:scale-[1.02] cursor-pointer">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link href="/patient/findDoctors">
              <button className="flex items-center gap-2 rounded-2xl border border-white/25 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-200 cursor-pointer">
                Browse Doctors
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
