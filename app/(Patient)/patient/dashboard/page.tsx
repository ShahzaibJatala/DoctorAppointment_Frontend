// app/page.tsx
import React from 'react';
import {
  LayoutDashboard,
  Search,
  Calendar,
  FileText,
  ClipboardList,
  Star,
  Settings,
  Bell,
  Menu,
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
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

// --- Types ---
type Appointment = {
  id: string;
  doctorName: string;
  specialty: string;
  doctorImage: string;
  date: string;
  time: string;
  type: 'Video' | 'In-Clinic';
  status: 'Confirmed' | 'Pending';
};

type Prescription = {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  medicationCount: number;
};

// --- Mock Data ---
const stats = [
  { label: 'Upcoming', value: '02', icon: Calendar, color: 'text-[#16BCC8]', bg: 'bg-[#16BCC8]/8' },
  { label: 'Completed', value: '14', icon: CheckCircleIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Saved Doctors', value: '08', icon: HeartIcon, color: 'text-rose-500', bg: 'bg-rose-50' },
  { label: 'Satisfaction', value: '4.8', icon: Star, color: 'text-[#F59F0A]', bg: 'bg-amber-50' },
];

const upcomingAppointments: Appointment[] = [
  { 
    id: '1', 
    doctorName: 'Dr. Sarah Wilson', 
    specialty: 'Cardiologist', 
    doctorImage: 'https://i.pravatar.cc/150?u=30', 
    date: 'Oct 26, 2024', 
    time: '10:00 AM', 
    type: 'Video', 
    status: 'Confirmed' 
  },
  { 
    id: '2', 
    doctorName: 'Dr. James Lee', 
    specialty: 'Dermatologist', 
    doctorImage: 'https://i.pravatar.cc/150?u=31', 
    date: 'Oct 29, 2024', 
    time: '02:30 PM', 
    type: 'In-Clinic', 
    status: 'Pending' 
  },
];

const prescriptions: Prescription[] = [
  { id: '1', doctorName: 'Dr. Sarah Wilson', specialty: 'Cardiology', date: 'Oct 12, 2024', medicationCount: 2 },
  { id: '2', doctorName: 'Dr. Emily Chen', specialty: 'General Physician', date: 'Sep 28, 2024', medicationCount: 3 },
];

// --- Helper Icons (Local wrapper for cleaner data) ---
function CheckCircleIcon({ className }: { className?: string }) { return <ShieldCheck className={className} />; }
function HeartIcon({ className }: { className?: string }) { return <Heart className={className} />; }

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active = false, href }: { icon: any, label: string, active?: boolean, href?: string }) => {
  const content = (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group ${
      active 
        ? 'bg-[#16BCC8]/8 text-[#16BCC8] font-semibold' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
    }`}>
      <Icon size={20} className={`transition-colors duration-200 ${active ? 'text-[#16BCC8]' : 'group-hover:text-[#16BCC8]'}`} />
      <span>{label}</span>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
};

const QuickActionCard = ({ icon: Icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) => (
  <button className="flex flex-col items-start p-5 bg-white border border-slate-100 rounded-2xl hover:shadow-elevated hover:border-[#16BCC8]/15 hover:-translate-y-0.5 transition-all duration-300 text-left w-full group">
    <div className={`p-3 rounded-xl ${color} mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
      <Icon size={22} className="text-white" />
    </div>
    <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
    <p className="text-xs text-slate-400 mt-1">{desc}</p>
  </button>
);

const AppointmentRow = ({ apt }: { apt: Appointment }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:shadow-elevated hover:border-[#16BCC8]/10 transition-all duration-300 group">
    <div className="flex items-center gap-4 mb-4 md:mb-0">
      <div className="relative">
        <img src={apt.doctorImage} alt={apt.doctorName} className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-50 shadow-sm" />
        <div className={`absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full border-2 border-white ${apt.type === 'Video' ? 'bg-blue-500' : 'bg-[#16BCC8]'}`}>
          {apt.type === 'Video' ? <Video size={8} className="text-white" /> : <MapPin size={8} className="text-white" />}
        </div>
      </div>
      <div>
        <h4 className="font-bold text-slate-800 group-hover:text-[#16BCC8] transition-colors duration-200">{apt.doctorName}</h4>
        <p className="text-sm text-slate-400">{apt.specialty}</p>
        <div className="flex items-center gap-3 mt-1.5 text-xs font-medium text-slate-400">
          <span className="flex items-center gap-1"><Calendar size={11} /> {apt.date}</span>
          <span className="flex items-center gap-1"><Clock size={11} /> {apt.time}</span>
        </div>
      </div>
    </div>

    <div className="flex items-center justify-between md:gap-8 w-full md:w-auto">
      <div className="flex flex-col items-end gap-1.5">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
          apt.status === 'Confirmed' ? 'bg-[#20AC6B]/10 text-[#20AC6B]' : 'bg-amber-50 text-amber-600'
        }`}>
          {apt.status === 'Confirmed' ? <ShieldCheck size={11} /> : <Clock size={11} />}
          {apt.status}
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-400">
          {apt.type === 'Video' ? <Video size={11} className="text-blue-500" /> : <MapPin size={11} className="text-[#16BCC8]" />}
          {apt.type} Visit
        </span>
      </div>

      <div className="flex items-center gap-2 md:ml-6">
        <button className="px-4 py-2 text-sm font-semibold text-[#16BCC8] bg-[#16BCC8]/8 hover:bg-[#16BCC8]/15 rounded-xl transition-all duration-200 border border-[#16BCC8]/10">
          View
        </button>
        <button className="p-2 text-slate-300 hover:text-slate-500 rounded-xl hover:bg-slate-50 transition-all duration-200">
          <MoreVertical size={18} />
        </button>
      </div>
    </div>
  </div>
);

export default function PatientDashboard() {
  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      
      {/* --- Sidebar --- */}
      <aside className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-slate-100 hidden lg:flex flex-col z-20 shadow-sm">
        <div className="p-7">
          <Link href="/" className="flex items-center gap-2.5 mb-9 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#16BCC8] to-[#0ea5a9] shadow-[0_2px_8px_rgba(22,188,200,0.3)] transition-transform duration-300 group-hover:scale-105">
              <Heart className="h-[18px] w-[18px] text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">MediBook</span>
          </Link>

          <nav className="space-y-1">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active />
            <SidebarItem icon={Search} label="Find Doctors" href="/patient/findDoctors" />
            <SidebarItem icon={Calendar} label="My Appointments" />
            <SidebarItem icon={FileText} label="Prescriptions" />
            <SidebarItem icon={ClipboardList} label="Medical Records" />
            <SidebarItem icon={Star} label="Reviews" />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          <SidebarItem icon={Settings} label="Settings" />
          
          <div className="mt-6 bg-gradient-to-br from-[#16BCC8]/8 to-[#0ea5a9]/5 rounded-2xl p-4 border border-[#16BCC8]/10">
             <div className="flex items-start gap-3">
               <div className="p-2 bg-white rounded-xl text-[#16BCC8] shadow-sm">
                 <ShieldCheck size={18} />
               </div>
               <div>
                 <p className="text-sm font-bold text-[#16BCC8]">Health Tip</p>
                 <p className="text-xs text-slate-500 mt-1 leading-relaxed">Drink 8 cups of water daily to stay hydrated.</p>
               </div>
             </div>
          </div>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 lg:ml-72">
        
        {/* Navbar */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 lg:hidden">
            <Menu className="text-slate-500" />
            <span className="font-bold text-lg text-slate-800">MediBook</span>
          </div>

          <div className="hidden lg:block">
            <h1 className="text-xl font-bold text-slate-800">Welcome back, Alex 👋</h1>
            <p className="text-sm text-slate-400">How are you feeling today?</p>
          </div>

          <div className="flex items-center gap-4 md:gap-5">
            <div className="hidden md:flex items-center bg-slate-50 rounded-xl px-4 py-2.5 w-72 focus-within:ring-2 focus-within:ring-[#16BCC8]/20 focus-within:border-[#16BCC8] border border-transparent transition-all duration-200">
              <Search className="text-slate-300 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search doctors, symptoms..." 
                className="bg-transparent border-none outline-none text-sm ml-2 w-full text-slate-700 placeholder:text-slate-300"
              />
            </div>
            
            <button className="relative p-2.5 rounded-xl hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-100">
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <img 
              src="https://i.pravatar.cc/150?u=patient" 
              alt="Profile" 
              className="w-10 h-10 rounded-xl border-2 border-white shadow-sm cursor-pointer hover:border-[#16BCC8]/30 transition-all duration-200" 
            />
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="p-6 max-w-7xl mx-auto space-y-8">
          
          {/* Reminder Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-[#16BCC8] via-[#14b0bc] to-[#0ea5a9] rounded-2xl p-6 text-white shadow-[0_4px_20px_rgba(22,188,200,0.3)] animate-fade-up">
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
                <p className="text-white/70 text-sm mt-1">You have a video consultation with Dr. Sarah Wilson in 2 hours.</p>
              </div>
              <div className="flex gap-3">
                <button className="px-5 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl text-sm font-medium transition-all duration-200 border border-white/10">Reschedule</button>
                <button className="px-5 py-2.5 bg-white text-[#16BCC8] rounded-xl text-sm font-bold hover:bg-white/90 transition-all duration-200 shadow-sm">Join Call</button>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {stats.map((stat, index) => (
              <div key={index} className={`bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-card flex flex-col items-center text-center hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300 animate-fade-up stagger-${index + 1}`}>
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
                <button className="text-sm font-semibold text-[#16BCC8] hover:text-[#0ea5a9] transition-colors duration-200 flex items-center gap-1">
                  See All <ArrowRight size={14} />
                </button>
              </div>
              
              <div className="space-y-4">
                {upcomingAppointments.map((apt) => (
                  <AppointmentRow key={apt.id} apt={apt} />
                ))}
              </div>

              {/* Recent Prescriptions */}
              <div className="pt-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Prescriptions</h2>
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-card">
                  {prescriptions.map((script, idx) => (
                    <div key={script.id} className={`flex items-center justify-between p-4 ${idx !== prescriptions.length - 1 ? 'border-b border-slate-50' : ''} hover:bg-slate-50/50 transition-all duration-200 group`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                          <FileText size={18} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm group-hover:text-[#16BCC8] transition-colors duration-200">{script.doctorName}</h4>
                          <p className="text-xs text-slate-400">{script.specialty} • {script.date}</p>
                        </div>
                      </div>
                      <button className="text-slate-300 hover:text-[#16BCC8] transition-colors duration-200" title="Download PDF">
                        <Download size={18} />
                      </button>
                    </div>
                  ))}
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
                 />
                 <QuickActionCard 
                   icon={MapPin} 
                   title="Near You" 
                   desc="Find clinics" 
                   color="bg-gradient-to-br from-indigo-500 to-indigo-600" 
                 />
                 <QuickActionCard 
                   icon={UploadCloud} 
                   title="Upload" 
                   desc="Medical reports" 
                   color="bg-gradient-to-br from-orange-500 to-orange-600" 
                 />
                 <QuickActionCard 
                   icon={FileText} 
                   title="Records" 
                   desc="History" 
                   color="bg-gradient-to-br from-blue-500 to-blue-600" 
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
      </main>
    </div>
  );
}