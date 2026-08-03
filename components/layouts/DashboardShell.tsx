"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Stethoscope,
  Search,
  FileText,
  Calendar,
  Settings,
  Heart,
  LogOut,
  Menu,
  X,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { removeToken, getToken } from "@/app/actions/token";
import { jwtDecode } from "jwt-decode";
import { io, type Socket } from "socket.io-client";
import VideoConsultationRoom from "@/components/video/VideoConsultationRoom";

type Role = "patient" | "doctor" | "admin" | "compounder";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const NAV_CONFIG: Record<Role, NavItem[]> = {
  patient: [
    { href: "/patient/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/patient/findDoctors", label: "Find Doctors", icon: Search },
    { href: "/patient/appointments", label: "My Appointments", icon: Calendar },
    { href: "/patient/history", label: "Medical History", icon: FileText },
  ],
  doctor: [
    { href: "/doctor/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/doctor/schedule", label: "Schedule", icon: CalendarDays },
    { href: "/doctor/appointments", label: "Appointments", icon: Calendar },
    { href: "/doctor/compounders", label: "Compounders", icon: Users },
    { href: "/doctor/profile", label: "Profile", icon: Settings },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/doctors", label: "Doctors", icon: Stethoscope },
    { href: "/admin/users", label: "Users", icon: Users },
  ],
  compounder: [
    {
      href: "/compounder/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    { href: "/compounder/appointments", label: "Book Walk-In", icon: Search },
    {
      href: "/compounder/schedule",
      label: "Doctor Schedule",
      icon: CalendarDays,
    },
  ],
};

const ROLE_HOME: Record<Role, string> = {
  patient: "/patient/dashboard",
  doctor: "/doctor/dashboard",
  admin: "/admin/dashboard",
  compounder: "/compounder/dashboard",
};

export interface DashboardShellProps {
  role: Role;
  activeHref: string;
  children: React.ReactNode;
  sidebarWidth?: "default" | "narrow";
  showHealthTip?: boolean;
}

export default function DashboardShell({
  role,
  activeHref,
  children,
  sidebarWidth = "default",
  showHealthTip = true,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [globalIncomingCall, setGlobalIncomingCall] = useState<{
    appointmentId: string;
    doctorName: string;
    ringingAt?: string;
  } | null>(null);
  const lastIncomingAttemptRef = useRef<string | null>(null);
  const navItems = NAV_CONFIG[role];
  const isNarrow = sidebarWidth === "narrow";
  const sidebarWidthClass = isNarrow ? "lg:w-[72px]" : "lg:w-64";
  const mainOffsetClass = isNarrow ? "lg:pl-[72px]" : "lg:pl-64";

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (role !== "patient") return;
    let active = true;
    let patientSocket: Socket | undefined;
    let syncTimer: number | undefined;
    let incomingExpiryTimer: number | undefined;
    const handleCallAccepted = () => {
      if (incomingExpiryTimer !== undefined) {
        window.clearTimeout(incomingExpiryTimer);
        incomingExpiryTimer = undefined;
      }
    };
    window.addEventListener(
      "medibook:video-call-accepted",
      handleCallAccepted,
    );

    void getToken().then((token) => {
      if (!active || !token) return;
      patientSocket = io(
        `${process.env.NEXT_PUBLIC_SERVER_URL || ""}/video-calls`,
        {
          auth: { token: token.replace(/"/g, "").trim() },
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 500,
          reconnectionDelayMax: 5_000,
          transports: ["websocket", "polling"],
          tryAllTransports: true,
        },
      );
      const syncIncomingCalls = () =>
        patientSocket?.emit("sync-incoming-calls");
      patientSocket.on("connect", syncIncomingCalls);
      syncTimer = window.setInterval(() => {
        if (patientSocket?.connected) syncIncomingCalls();
      }, 5_000);
      patientSocket.on("incoming-call", (payload) => {
        if (!payload?.appointmentId) return;
        const attemptKey = `${payload.appointmentId}:${payload.ringingAt || ""}`;
        if (lastIncomingAttemptRef.current === attemptKey) return;
        lastIncomingAttemptRef.current = attemptKey;
        const incomingEvent = new CustomEvent("medibook:incoming-video-call", {
          detail: payload,
          cancelable: true,
        });
        const handledByAppointment = !window.dispatchEvent(incomingEvent);
        if (!handledByAppointment) {
          setGlobalIncomingCall({
            appointmentId: payload.appointmentId,
            doctorName: payload.doctorName || "Your doctor",
            ringingAt: payload.ringingAt,
          });
        }
        if (incomingExpiryTimer !== undefined) {
          window.clearTimeout(incomingExpiryTimer);
        }
        const ringingStartedAt = new Date(
          payload.ringingAt || Date.now(),
        ).getTime();
        incomingExpiryTimer = window.setTimeout(
          () => {
            lastIncomingAttemptRef.current = null;
            setGlobalIncomingCall((current) =>
              current?.appointmentId === payload.appointmentId ? null : current,
            );
          },
          Math.max(0, ringingStartedAt + 45_000 - Date.now()),
        );
        if (
          typeof Notification !== "undefined" &&
          Notification.permission === "granted"
        ) {
          new Notification(
            `Incoming call from ${payload.doctorName || "your doctor"}`,
            {
              body: "Open MediBook to accept your video consultation.",
              tag: `video-call-${payload.appointmentId}`,
            },
          );
        }
      });
      patientSocket.on("call-missed", (payload) => {
        if (incomingExpiryTimer !== undefined) {
          window.clearTimeout(incomingExpiryTimer);
        }
        lastIncomingAttemptRef.current = null;
        setGlobalIncomingCall((current) =>
          !payload?.appointmentId ||
          current?.appointmentId === payload.appointmentId
            ? null
            : current,
        );
      });
    });

    return () => {
      active = false;
      if (syncTimer !== undefined) window.clearInterval(syncTimer);
      if (incomingExpiryTimer !== undefined) {
        window.clearTimeout(incomingExpiryTimer);
      }
      window.removeEventListener(
        "medibook:video-call-accepted",
        handleCallAccepted,
      );
      patientSocket?.disconnect();
    };
  }, [role]);

  useEffect(() => {
    async function verifyRole() {
      try {
        const token = await getToken();
        if (!token) {
          router.push("/login");
          return;
        }
        const cleanToken = token.replace(/"/g, "").trim();
        const decoded = jwtDecode<{ role: string }>(cleanToken);
        if (decoded.role !== role) {
          console.warn(
            `Role mismatch: token role is '${decoded.role}', page role is '${role}'`,
          );
          if (
            decoded.role === "patient" ||
            decoded.role === "doctor" ||
            decoded.role === "admin" ||
            decoded.role === "compounder"
          ) {
            router.push(`/${decoded.role}/dashboard`);
          } else {
            router.push("/login");
          }
        }
      } catch (err) {
        console.error("Failed to verify role from token:", err);
        router.push("/login");
      }
    }
    verifyRole();
  }, [role, router]);

  const handleLogout = () => {
    startTransition(async () => {
      await removeToken();
      router.push("/");
      router.refresh();
    });
  };

  const isActive = (href: string) =>
    activeHref === href || pathname === href || pathname.startsWith(`${href}/`);

  const sidebarContent = (
    <>
      <div
        className={`flex items-center border-b border-slate-100 shrink-0 ${isNarrow ? "lg:justify-center lg:px-0 px-5 h-[68px]" : "px-5 h-[68px] gap-2.5"}`}
      >
        <Link
          href={ROLE_HOME[role]}
          className={`flex items-center group ${isNarrow ? "lg:justify-center" : "gap-2.5"}`}
          onClick={() => setSidebarOpen(false)}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#16BCC8] to-[#0ea5a9] shadow-[0_2px_8px_rgba(22,188,200,0.35)] transition-transform duration-300 group-hover:scale-105">
            <Heart className="h-[18px] w-[18px] text-white" />
          </div>
          <span
            className={`text-lg font-bold tracking-tight text-slate-800 ${isNarrow ? "lg:hidden" : ""}`}
          >
            MediBook
          </span>
        </Link>
        <button
          type="button"
          className="ml-auto p-2 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isNarrow ? "lg:justify-center lg:px-2.5" : ""} ${
                active
                  ? "bg-[#16BCC8]/10 text-[#16BCC8]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={20} className="shrink-0" />
              <span className={isNarrow ? "lg:hidden" : ""}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {showHealthTip && (
        <div
          className={`mx-3 mb-3 p-4 rounded-2xl bg-gradient-to-br from-[#16BCC8]/10 to-[#0ea5a9]/5 border border-[#16BCC8]/15 ${isNarrow ? "lg:hidden" : ""}`}
        >
          <div className="flex items-center gap-2 text-[#16BCC8] mb-2">
            <Sparkles size={16} />
            <span className="text-xs font-bold uppercase tracking-wide">
              Health tip
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Drink water regularly and take short breaks during long screen
            sessions.
          </p>
        </div>
      )}

      <div className="p-3 border-t border-slate-100 shrink-0">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isPending}
          title="Log out"
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 disabled:opacity-60 ${
            isNarrow ? "lg:justify-center lg:px-2.5" : ""
          }`}
        >
          <LogOut size={20} className="shrink-0" />
          <span className={isNarrow ? "lg:hidden" : ""}>
            {isPending ? "Logging out…" : "Log out"}
          </span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-100 shadow-2xl lg:shadow-none transition-transform duration-300 ease-out w-[min(85vw,280px)] ${sidebarWidthClass} ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {sidebarContent}
      </aside>

      <div className={`flex-1 flex flex-col min-w-0 w-full ${mainOffsetClass}`}>
        <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-100 bg-white/90 backdrop-blur-xl px-4 lg:hidden">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <Link href={ROLE_HOME[role]} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#16BCC8] to-[#0ea5a9]">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-800">MediBook</span>
          </Link>
        </div>

        <main className="flex min-h-0 min-w-0 max-w-full flex-1 flex-col overflow-x-hidden">
          {children}
        </main>
        {globalIncomingCall && (
          <VideoConsultationRoom
            appointmentId={globalIncomingCall.appointmentId}
            role="patient"
            otherPartyName={globalIncomingCall.doctorName}
            consultationMethod="platform"
            ringingAt={globalIncomingCall.ringingAt}
            compact
          />
        )}
      </div>
    </div>
  );
}
