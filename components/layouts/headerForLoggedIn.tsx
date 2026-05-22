"use client"
import { Button } from "@/components/UI/button";
import { Heart, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface HeaderProps {
    userRole: string; // 👈 You can also be specific: 'patient' | 'doctor' | 'admin'
  }

const HeaderForLoggedIn = ({ userRole }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const role = userRole ? userRole.trim().toLowerCase() : "";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

// 2. Define links
let navLinks: { href: string; label: string }[] = [];

if (role === "patient") {
  navLinks = [
    { href: "/patient/dashboard", label: "Dashboard" },
    { href: "/patient/findDoctors", label: "Find Doctors" },
    { href: "/patient/appointments", label: "My Appointments" },
    { href: "/patient/history", label: "Medical History" },
  ];
} else if (role === "admin") {
  navLinks = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/doctors", label: "Doctors" },
    { href: "/admin/users", label: "Users" },
  ];
} else if (role === "doctor") {
  navLinks = [
    { href: "/doctor/dashboard", label: "Dashboard" },
    { href: "/doctor/schedule", label: "Schedule" },
    { href: "/doctor/appointments", label: "Appointments" },
    { href: "/doctor/profile", label: "Profile" },
  ];
}

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_20px_50px_-15px_rgba(0,0,0,0.05)] border-b border-slate-100"
            : "bg-white/60 backdrop-blur-md border-b border-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-[68px] items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#16BCC8] to-[#0ea5a9] shadow-[0_2px_8px_rgba(22,188,200,0.35)] transition-transform duration-300 group-hover:scale-105">
                <Heart className="h-[18px] w-[18px] text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">
                MediBook
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive(link.href)
                      ? "text-[#16BCC8] bg-[#16BCC8]/8"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-5 bg-[#16BCC8] rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 md:hidden transition-all duration-200"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              <div className="relative w-5 h-5">
                <span className={`absolute left-0 block h-0.5 w-5 bg-current transform transition-all duration-300 ${isOpen ? "top-2.5 rotate-45" : "top-1"}`} />
                <span className={`absolute left-0 top-2.5 block h-0.5 w-5 bg-current transition-all duration-200 ${isOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"}`} />
                <span className={`absolute left-0 block h-0.5 w-5 bg-current transform transition-all duration-300 ${isOpen ? "top-2.5 -rotate-45" : "top-4"}`} />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in" />
          
          {/* Panel */}
          <div
            className="absolute top-[68px] left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-elevated animate-slide-down"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? "bg-[#16BCC8]/8 text-[#16BCC8]"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeaderForLoggedIn;
