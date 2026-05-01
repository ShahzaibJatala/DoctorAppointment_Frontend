"use client"
import { Button } from "@/components/UI/button";
import { Heart, Menu, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

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

            {/* Desktop Auth Buttons */}
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer text-slate-600 hover:text-slate-900 font-medium rounded-xl px-5 transition-all duration-200"
                >
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="hero"
                  size="sm"
                  className="cursor-pointer text-white rounded-xl px-6 shadow-[0_2px_12px_rgba(22,188,200,0.3)] hover:shadow-[0_4px_20px_rgba(22,188,200,0.4)] transition-all duration-300"
                >
                  Get Started
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
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
            <div className="container mx-auto px-4 py-6 space-y-3">
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full rounded-xl h-12 text-base font-medium border-slate-200 hover:border-[#16BCC8] hover:text-[#16BCC8] transition-all duration-200">
                  Log in
                </Button>
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)}>
                <Button variant="hero" className="w-full rounded-xl h-12 text-base font-medium text-white shadow-[0_2px_12px_rgba(22,188,200,0.3)]">
                  Get Started
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
