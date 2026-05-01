
import { Button } from "@/components/UI/button";
import { 
  Search, 
  Calendar, 
  Shield, 
  Clock, 
  Star, 
  CheckCircle2,
  ArrowRight,
  Users,
  Stethoscope,
  HeartPulse,
  Sparkles,
  Quote,
} from "lucide-react";
import { doctors } from "@/data/mockData";
import DoctorCard from "@/components/shared/DoctorCard";
import Link from "next/link";
import Header from "@/components/layouts/header";
import Footer from "@/components/layouts/footer";


export default function Home() {
    const stats = [
      { value: "500+", label: "Expert Doctors", suffix: "" },
      { value: "50K+", label: "Happy Patients", suffix: "" },
      { value: "100+", label: "Specialties", suffix: "" },
      { value: "4.9", label: "Average Rating", suffix: "★" },
    ];
  
    const features = [
      {
        icon: Search,
        title: "Find Your Doctor",
        description: "Search through our network of qualified healthcare professionals by specialty, location, or availability.",
        accent: "from-[#16BCC8] to-[#0ea5a9]",
      },
      {
        icon: Calendar,
        title: "Easy Booking",
        description: "Book appointments online in seconds. Choose your preferred time slot and confirm instantly.",
        accent: "from-blue-500 to-blue-600",
      },
      {
        icon: Shield,
        title: "Secure & Private",
        description: "Your health data is protected with enterprise-grade security and HIPAA compliance.",
        accent: "from-emerald-500 to-emerald-600",
      },
      {
        icon: Clock,
        title: "24/7 Availability",
        description: "Access our platform anytime. Video consultations available for remote care.",
        accent: "from-violet-500 to-violet-600",
      },
    ];
  
    const testimonials = [
      {
        name: "Sarah Johnson",
        role: "Patient",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
        content: "MediBook made finding a specialist so easy. I booked my appointment in minutes and the doctor was excellent!",
        rating: 5,
      },
      {
        name: "Dr. Michael Chen",
        role: "Cardiologist",
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face",
        content: "As a doctor, this platform helps me manage my schedule efficiently and connect with patients seamlessly.",
        rating: 5,
      },
      {
        name: "Emily Davis",
        role: "Patient",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
        content: "The video consultation feature is a game-changer. I got medical advice without leaving my home!",
        rating: 5,
      },
    ];
  

  return (
    <div className="min-h-screen bg-white">
    <Header />

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#f0fafb] to-[#e8f7f9] pb-24 pt-16 lg:pb-36 lg:pt-24">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#16BCC8]/[0.04] blur-[80px]" />
          <div className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-[#16BCC8]/[0.03] blur-[80px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-[#16BCC8]/[0.02] blur-[120px]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(22,188,200,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(22,188,200,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="container relative mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Hero Content */}
            <div className="animate-fade-up text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#16BCC8]/8 px-4 py-2 text-sm font-medium text-[#16BCC8] border border-[#16BCC8]/10">
                <HeartPulse className="h-4 w-4" />
                <span>Trusted by 50,000+ patients</span>
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              </div>

              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.5rem]">
                Your Health, Our{" "}
                <span className="relative">
                  <span className="text-gradient">Priority</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                    <path d="M2 8C50 2 150 2 198 8" stroke="#16BCC8" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.3" />
                  </svg>
                </span>
              </h1>

              <p className="mt-6 text-lg text-slate-500 leading-relaxed lg:text-xl lg:max-w-lg">
                Book appointments with top doctors in minutes. Quality healthcare 
                made simple, accessible, and convenient for everyone.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link href="/doctors">
                  <Button variant="hero" size="xl" className="cursor-pointer text-white rounded-2xl shadow-[0_4px_20px_rgba(22,188,200,0.35)] hover:shadow-[0_6px_30px_rgba(22,188,200,0.45)] transition-all duration-300">
                    Find a Doctor
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" size="xl" className="cursor-pointer rounded-2xl border-slate-200 hover:border-[#16BCC8]/30 hover:bg-[#16BCC8]/5 transition-all duration-300">
                    Join as Doctor
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 lg:justify-start">
                {["Verified Doctors", "Secure Booking", "Easy Rescheduling"].map((badge) => (
                  <div key={badge} className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#20AC6B]/10">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#20AC6B]" />
                    </div>
                    <span className="text-sm text-slate-500 font-medium">{badge}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative animate-fade-up" style={{ animationDelay: "0.15s" }}>
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Image */}
                <div className="aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-[#16BCC8] to-[#0ea5a9] p-[3px] shadow-[0_20px_60px_-15px_rgba(22,188,200,0.3)]">
                  <div className="h-full w-full overflow-hidden rounded-[calc(1.5rem-3px)] bg-white">
                    <img
                      src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&h=600&fit=crop"
                      alt="Doctor with patient"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Floating Cards */}
                <div className="absolute -left-4 top-1/4 animate-float-gentle glass-card rounded-2xl p-4 shadow-elevated sm:-left-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#20AC6B]/10">
                      <Users className="h-5 w-5 text-[#20AC6B]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">50+ Doctors</p>
                      <p className="text-xs text-slate-400">Available Now</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-4 bottom-1/4 animate-float-gentle glass-card rounded-2xl p-4 shadow-elevated sm:-right-8" style={{ animationDelay: "2s" }}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                      <Star className="h-5 w-5 text-[#F59F0A]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">4.9 Rating</p>
                      <p className="text-xs text-slate-400">50K+ Reviews</p>
                    </div>
                  </div>
                </div>

                {/* New: Pulse indicator */}
                <div className="absolute top-6 right-8 sm:top-8 sm:right-12">
                  <div className="h-3 w-3 rounded-full bg-[#20AC6B] animate-pulse-ring" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== STATS SECTION ==================== */}
      <section className="relative -mt-8 z-10 pb-8">
        <div className="container mx-auto px-4">
          <div className="glass-card rounded-2xl border border-white/60 shadow-elevated p-8">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`text-center animate-fade-up stagger-${index + 1} ${
                    index < stats.length - 1
                      ? "md:border-r md:border-slate-100"
                      : ""
                  }`}
                >
                  <p className="text-3xl font-extrabold text-gradient tracking-tight lg:text-4xl">
                    {stat.value}
                    {stat.suffix && <span className="ml-1">{stat.suffix}</span>}
                  </p>
                  <p className="mt-1.5 text-sm text-slate-400 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURES SECTION ==================== */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#16BCC8]/8 px-4 py-1.5 text-xs font-semibold text-[#16BCC8] uppercase tracking-wider mb-4 border border-[#16BCC8]/10">
              Our Features
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight lg:text-4xl">
              Why Choose MediBook?
            </h2>
            <p className="mt-4 text-lg text-slate-500 leading-relaxed">
              We make healthcare accessible with modern technology and a patient-first approach.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative rounded-2xl border border-slate-100 bg-white p-7 transition-all duration-400 hover:border-[#16BCC8]/15 hover:shadow-elevated hover:-translate-y-1 animate-fade-up stagger-${index + 1}`}
              >
                {/* Gradient accent line */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-transparent to-transparent transition-all duration-500 group-hover:via-[#16BCC8]/30 rounded-t-2xl" />
                
                <div className={`mb-5 flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.accent} shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  {feature.title}
                </h3>
                <p className="mt-2.5 text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FEATURED DOCTORS ==================== */}
      <section className="bg-gradient-to-b from-slate-50/50 to-white py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#16BCC8]/8 px-4 py-1.5 text-xs font-semibold text-[#16BCC8] uppercase tracking-wider mb-3 border border-[#16BCC8]/10">
                Top Professionals
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight lg:text-4xl">
                Top Rated Doctors
              </h2>
              <p className="mt-2 text-slate-500">
                Meet our highly qualified healthcare professionals
              </p>
            </div>
            <Link href="/doctors">
              <Button variant="outline" className="rounded-xl border-slate-200 hover:border-[#16BCC8]/30 hover:bg-[#16BCC8]/5 transition-all duration-300">
                View All Doctors
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {doctors.slice(0, 3).map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#16BCC8]/8 px-4 py-1.5 text-xs font-semibold text-[#16BCC8] uppercase tracking-wider mb-4 border border-[#16BCC8]/10">
              Testimonials
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight lg:text-4xl">
              What People Say
            </h2>
            <p className="mt-4 text-lg text-slate-500 leading-relaxed">
              Trusted by thousands of patients and healthcare providers
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`group relative rounded-2xl border border-slate-100 bg-white p-7 shadow-card transition-all duration-400 hover:shadow-elevated hover:-translate-y-1 hover:border-[#16BCC8]/15 animate-fade-up stagger-${index + 1}`}
              >
                {/* Quote icon */}
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#16BCC8]/8">
                  <Quote className="h-5 w-5 text-[#16BCC8]" />
                </div>

                {/* Stars */}
                <div className="flex items-center gap-0.5 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-[#F59F0A] text-[#F59F0A]"
                    />
                  ))}
                </div>

                <p className="text-slate-600 leading-relaxed text-[15px]">
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                <div className="mt-6 flex items-center gap-3 pt-5 border-t border-slate-50">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-sm"
                  />
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{testimonial.name}</p>
                    <p className="text-xs text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#16BCC8] via-[#14b0bc] to-[#0ea5a9] py-20 lg:py-24">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white/[0.06] blur-[40px]" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/[0.04] blur-[40px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-2xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm shadow-[0_0_0_1px_rgba(255,255,255,0.2)]">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight lg:text-4xl">
              Ready to Take Control of Your Health?
            </h2>
            <p className="mt-4 text-lg text-white/80 leading-relaxed">
              Join thousands of patients who trust MediBook for their healthcare needs.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/register">
                <Button variant="secondary" size="xl" className="bg-white text-[#16BCC8] hover:bg-white/90 cursor-pointer rounded-2xl font-bold shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_30px_rgba(0,0,0,0.15)] transition-all duration-300">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/doctors">
                <Button 
                  variant="outline" 
                  size="xl"
                  className="border-white/25 text-white hover:bg-white/10 cursor-pointer rounded-2xl backdrop-blur-sm transition-all duration-300"
                >
                  Browse Doctors
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    <Footer />
    </div>

  );
}
