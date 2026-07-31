'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  Calendar,
  FileText,
  Star,
  Bell,
  MapPin,
  Video,
  Clock,
  MoreVertical,
  PlusCircle,
  UploadCloud,
  Download,
  ShieldCheck,
  X,
  Heart,
  ArrowRight,
  Sparkles,
  HeartCrack,
  CalendarDays
} from 'lucide-react';
import DashboardShell from '@/components/layouts/DashboardShell';
import { getToken } from '@/app/actions/token';
import Link from 'next/link';

// --- Types ---
type Appointment = {
  id: string;
  doctorName: string;
  specialty: string;
  avatar: string;
  date: string;
  time: string;
  type: 'Video' | 'In-Clinic';
  status: 'Confirmed' | 'Pending' | 'checked-in' | 'in-progress' | 'Upcoming';
};

// --- Components ---
const QuickActionCard = ({ icon: Icon, title, desc, color, href }: { icon: any, title: string, desc: string, color: string, href: string }) => (
  <Link href={href} className="flex flex-col items-start p-5 bg-white border border-slate-100 rounded-2xl hover:shadow-elevated hover:border-[#16BCC8]/15 hover:-translate-y-0.5 transition-all duration-300 text-left w-full group">
    <div className={`p-3 rounded-xl ${color} mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
      <Icon size={22} className="text-white" />
    </div>
    <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
    <p className="text-xs text-slate-400 mt-1">{desc}</p>
  </Link>
);

const AppointmentRow = ({ apt }: { apt: Appointment }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:shadow-elevated hover:border-[#16BCC8]/10 transition-all duration-300 group">
    <div className="flex items-center gap-4 mb-4 md:mb-0">
      <div className="relative">
        <img src={apt.avatar} alt={apt.doctorName} className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-50 shadow-sm" />
        <div className={`absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full border-2 border-white ${apt.type === 'Video' ? 'bg-blue-500' : 'bg-[#16BCC8]'}`}>
          {apt.type === 'Video' ? <Video size={8} className="text-white" /> : <MapPin size={8} className="text-white" />}
        </div>
      </div>
      <div>
        <h4 className="font-bold text-slate-800 group-hover:text-[#16BCC8] transition-colors duration-200">{apt.doctorName}</h4>
        <p className="text-sm text-slate-400">{apt.specialty}</p>
        <div className="flex items-center gap-3 mt-1.5 text-xs font-medium text-slate-400">
          <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(apt.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <span className="flex items-center gap-1"><Clock size={11} /> {new Date(apt.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>

    <div className="flex items-center justify-between md:gap-8 w-full md:w-auto">
      <div className="flex flex-col items-end gap-1.5">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
          apt.status === 'Confirmed' || apt.status === 'Upcoming' ? 'bg-[#20AC6B]/10 text-[#20AC6B]' : 'bg-amber-50 text-amber-600'
        }`}>
          <ShieldCheck size={11} />
          {apt.status}
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-400">
          {apt.type === 'Video' ? <Video size={11} className="text-blue-500" /> : <MapPin size={11} className="text-[#16BCC8]" />}
          {apt.type} Visit
        </span>
      </div>

      <div className="flex items-center gap-2 md:ml-6">
        <Link href="/patient/appointments" className="px-4 py-2 text-sm font-semibold text-[#16BCC8] bg-[#16BCC8]/8 hover:bg-[#16BCC8]/15 rounded-xl transition-all duration-200 border border-[#16BCC8]/10">
          View
        </Link>
      </div>
    </div>
  </div>
);

export default function PatientDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = await getToken();
        if (!token) return;
        const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
        
        // 1. Fetch Profile
        const profileRes = await fetch(`${serverUrl}/patient/my-profile`, {
          headers: { 'Authorization': `Bearer ${token.replace(/"/g, '').trim()}` }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }

        // 2. Fetch Appointments
        const aptRes = await fetch(`${serverUrl}/patient/my-appointments`, {
          headers: { 'Authorization': `Bearer ${token.replace(/"/g, '').trim()}` }
        });
        if (aptRes.ok) {
          const aptData = await aptRes.json();
          const mapped = aptData.map((item: any) => ({
            id: item.id || item._id,
            doctorName: item.doctorName,
            specialty: item.specialty,
            avatar: item.avatar || `https://ui-avatars.com/api/?name=${item.doctorName || 'D'}&background=16BCC8&color=fff`,
            date: item.startTime,
            time: item.startTime,
            type: item.appointmentType === 'Online' ? 'Video' : 'In-Clinic',
            status: item.status,
          }));
          setAppointments(mapped);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const patientName = profile?.fullName || profile?.email?.split('@')[0] || 'Patient';
  
  // Filter active upcoming appointments
  const upcomingApts = appointments.filter(a => 
    a.status === 'Confirmed' || a.status === 'Pending' || a.status === 'checked-in' || a.status === 'in-progress' || a.status === 'Upcoming'
  );

  // Recent prescriptions from medical records
  const recentPrescriptions = profile?.medicalRecords
    ? [...profile.medicalRecords].reverse().slice(0, 3)
    : [];

  const stats = [
    { label: 'Upcoming Appts', value: String(upcomingApts.length).padStart(2, '0'), icon: Calendar, color: 'text-[#16BCC8]', bg: 'bg-[#16BCC8]/8' },
    { label: 'Completed Visits', value: String(profile?.medicalRecords?.length || 0).padStart(2, '0'), icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Prescriptions', value: String(recentPrescriptions.filter((r: any) => r.prescription).length || 0).padStart(2, '0'), icon: FileText, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'Satisfaction Rate', value: '4.9★', icon: Star, color: 'text-[#F59F0A]', bg: 'bg-amber-50' },
  ];

  return (
    <DashboardShell role="patient" activeHref="/patient/dashboard">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800">Welcome back, {patientName} 👋</h1>
          <p className="text-sm text-slate-400">How are you feeling today?</p>
        </div>

        <div className="flex items-center gap-4 md:gap-5">
          <button className="relative p-2.5 rounded-xl hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-100">
            <Bell className="w-5 h-5 text-slate-400" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(patientName)}&background=16BCC8&color=fff`} 
            alt="Profile" 
            className="w-10 h-10 rounded-xl border-2 border-white shadow-sm cursor-pointer hover:border-[#16BCC8]/30 transition-all duration-200" 
          />
        </div>
      </header>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-40">
          <div className="h-10 w-10 border-4 border-teal-600/30 border-t-teal-600 rounded-full animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Loading your health dashboard...</p>
        </div>
      ) : (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-up">
          
          {/* Upcoming Alert Banner */}
          {upcomingApts.length > 0 && (
            <div className="relative overflow-hidden bg-gradient-to-r from-[#16BCC8] via-[#14b0bc] to-[#0ea5a9] rounded-2xl p-6 text-white shadow-[0_4px_20px_rgba(22,188,200,0.3)]">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/[0.06] blur-[30px]" />
                <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/[0.04] blur-[30px]" />
              </div>
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-white/80" />
                    <span className="text-sm font-medium text-white/80">Reminder</span>
                  </div>
                  <h3 className="font-bold text-lg">Upcoming Appointment</h3>
                  <p className="text-white/70 text-sm mt-1">
                    You have a visit scheduled with {upcomingApts[0].doctorName} on {new Date(upcomingApts[0].date).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(upcomingApts[0].time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link href="/patient/appointments" className="px-5 py-2.5 bg-white text-[#16BCC8] rounded-xl text-sm font-bold hover:bg-white/90 transition-all duration-200 shadow-sm">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Stats Overview */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-card flex flex-col items-center text-center hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300">
                <div className={`p-3 rounded-xl ${stat.bg} mb-3`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800">{stat.value}</h3>
                <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column (Appointments) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Upcoming Appointments</h2>
                <Link href="/patient/appointments" className="text-sm font-semibold text-[#16BCC8] hover:text-[#0ea5a9] transition-colors duration-200 flex items-center gap-1">
                  See All <ArrowRight size={14} />
                </Link>
              </div>
              
              <div className="space-y-4">
                {upcomingApts.length > 0 ? (
                  upcomingApts.slice(0, 3).map((apt) => (
                    <AppointmentRow key={apt.id} apt={apt} />
                  ))
                ) : (
                  <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl text-slate-400 text-sm">
                    No upcoming appointments.
                  </div>
                )}
              </div>

              {/* Recent Prescriptions */}
              <div className="pt-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Prescriptions</h2>
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-card">
                  {recentPrescriptions.length > 0 ? (
                    recentPrescriptions.map((script: any, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-4 ${idx !== recentPrescriptions.length - 1 ? 'border-b border-slate-50' : ''} hover:bg-slate-50/50 transition-all duration-200 group`}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                            <FileText size={18} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm group-hover:text-[#16BCC8] transition-colors duration-200">{script.doctorName}</h4>
                            <p className="text-xs text-slate-400">{new Date(script.appointmentDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            <p className="text-xs text-slate-500 mt-1 italic">Prescription: {script.prescription}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-sm">
                      No prescriptions found.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column (Quick Actions) */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-800">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                 <QuickActionCard 
                   icon={PlusCircle} 
                   title="Book New" 
                   desc="Find a doctor" 
                   color="bg-gradient-to-br from-[#16BCC8] to-[#0ea5a9]" 
                   href="/patient/findDoctors"
                 />
                 <QuickActionCard 
                   icon={MapPin} 
                   title="Near You" 
                   desc="Find clinics" 
                   color="bg-gradient-to-br from-indigo-500 to-indigo-600" 
                   href="/patient/findDoctors"
                 />
                 <QuickActionCard 
                   icon={UploadCloud} 
                   title="Upload" 
                   desc="Medical reports" 
                   color="bg-gradient-to-br from-orange-500 to-orange-600" 
                   href="/patient/history"
                 />
                 <QuickActionCard 
                   icon={FileText} 
                   title="Records" 
                   desc="History" 
                   color="bg-gradient-to-br from-blue-500 to-blue-600" 
                   href="/patient/history"
                 />
              </div>

              {/* Satisfaction Card */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-[#16BCC8] rounded-full blur-[40px] opacity-15"></div>
                <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-24 h-24 bg-[#16BCC8] rounded-full blur-[30px] opacity-10"></div>
                
                <h3 className="font-bold text-lg mb-2 relative">How was your last visit?</h3>
                <p className="text-slate-400 text-sm mb-4 relative">Your feedback helps us improve.</p>
                
                <div className="flex gap-2 mb-4 relative">
                   {[1, 2, 3, 4, 5].map((star) => (
                     <Star key={star} className="text-[#F59F0A] fill-[#F59F0A] cursor-pointer hover:scale-125 transition-transform duration-200" size={22} />
                   ))}
                </div>
                <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-all duration-200 border border-white/5 relative">
                  Write a Review
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </DashboardShell>
  );
}