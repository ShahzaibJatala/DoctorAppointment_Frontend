// app/page.tsx
import React from 'react';
import { 
  LayoutDashboard, 
  Stethoscope, 
  Users, 
  CalendarCheck, 
  Activity, 
  Star, 
  Settings, 
  Search, 
  Bell, 
  Menu,
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
  Heart,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

// --- Types for Static Data ---
type Appointment = {
  id: string;
  patient: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  avatar: string;
};

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  image: string;
};

// --- Mock Data ---
const stats = [
  { label: 'Total Doctors', value: '540', icon: Stethoscope, trend: '+12%', color: 'text-[#16BCC8]', bg: 'bg-[#16BCC8]/8' },
  { label: 'Total Patients', value: '52.3k', icon: Users, trend: '+5.4%', color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Appointments Today', value: '185', icon: CalendarCheck, trend: '-2%', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { label: 'Avg. Rating', value: '4.9', icon: Star, trend: '+0.2', color: 'text-[#F59F0A]', bg: 'bg-amber-50' },
];

const appointments: Appointment[] = [
  { id: '1', patient: 'Sarah Johnson', doctor: 'Dr. Emily Chen', specialty: 'Cardiology', date: 'Oct 24, 2024', time: '10:00 AM', status: 'Confirmed', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', patient: 'Michael Brown', doctor: 'Dr. James Wilson', specialty: 'Neurology', date: 'Oct 24, 2024', time: '11:30 AM', status: 'Pending', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', patient: 'Emma Davis', doctor: 'Dr. Sarah Lee', specialty: 'Dermatology', date: 'Oct 24, 2024', time: '02:00 PM', status: 'Cancelled', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: '4', patient: 'Robert Miller', doctor: 'Dr. Emily Chen', specialty: 'Cardiology', date: 'Oct 24, 2024', time: '04:15 PM', status: 'Confirmed', avatar: 'https://i.pravatar.cc/150?u=4' },
];

const topDoctors: Doctor[] = [
  { id: '1', name: 'Dr. Emily Chen', specialty: 'Cardiology', rating: 5.0, reviews: 120, image: 'https://i.pravatar.cc/150?u=10' },
  { id: '2', name: 'Dr. James Wilson', specialty: 'Neurology', rating: 4.9, reviews: 98, image: 'https://i.pravatar.cc/150?u=11' },
  { id: '3', name: 'Dr. Sarah Lee', specialty: 'Dermatology', rating: 4.8, reviews: 85, image: 'https://i.pravatar.cc/150?u=12' },
];

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group ${active ? 'bg-[#16BCC8]/8 text-[#16BCC8] font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
    <Icon size={20} className={`transition-colors duration-200 ${active ? 'text-[#16BCC8]' : 'group-hover:text-[#16BCC8]'}`} />
    <span>{label}</span>
  </div>
);

const StatusBadge = ({ status }: { status: Appointment['status'] }) => {
  const styles = {
    Confirmed: 'bg-[#20AC6B]/10 text-[#20AC6B] border-[#20AC6B]/20',
    Pending: 'bg-amber-50 text-amber-600 border-amber-200/50',
    Cancelled: 'bg-red-50 text-red-600 border-red-200/50',
  };

  const icons = {
    Confirmed: CheckCircle,
    Pending: Clock,
    Cancelled: XCircle,
  };

  const Icon = icons[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${styles[status]}`}>
      <Icon size={12} />
      {status}
    </span>
  );
};

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      
      {/* --- Sidebar --- */}
      <aside className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-slate-100 hidden lg:flex flex-col z-20 shadow-sm">
        <div className="p-7">
          <Link href="/" className="flex items-center gap-2.5 mb-9 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#16BCC8] to-[#0ea5a9] shadow-[0_2px_8px_rgba(22,188,200,0.3)] transition-transform duration-300 group-hover:scale-105">
              <Activity className="h-[18px] w-[18px] text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">MediBook</span>
          </Link>

          <nav className="space-y-1">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active />
            <SidebarItem icon={Stethoscope} label="Doctors" />
            <SidebarItem icon={Users} label="Patients" />
            <SidebarItem icon={CalendarCheck} label="Appointments" />
            <SidebarItem icon={Activity} label="Specialties" />
            <SidebarItem icon={Star} label="Reviews" />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          <SidebarItem icon={Settings} label="Settings" />
          <div className="mt-6 flex items-center gap-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100">
            <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" className="h-10 w-10 rounded-xl border-2 border-white shadow-sm" />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-800 truncate">Dr. Admin</span>
              <span className="text-xs text-[#16BCC8] font-medium">Super Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 lg:ml-72">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 lg:hidden">
            <Menu className="text-slate-500" />
            <span className="font-bold text-lg">MediBook</span>
          </div>
          
          <h1 className="text-2xl font-bold text-slate-800 hidden lg:block">Admin Dashboard</h1>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-slate-50 rounded-xl px-4 py-2.5 w-72 border border-transparent focus-within:border-[#16BCC8]/30 focus-within:ring-2 focus-within:ring-[#16BCC8]/10 transition-all duration-200">
              <Search className="text-slate-300 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search doctors, patients..." 
                className="bg-transparent border-none outline-none text-sm ml-2 w-full text-slate-700 placeholder:text-slate-300"
              />
            </div>
            
            <button className="relative p-2.5 rounded-xl hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-100">
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#16BCC8] rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 max-w-7xl mx-auto space-y-8">
          
          {/* Stats Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((stat, index) => (
              <div key={index} className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300 animate-fade-up stagger-${index + 1}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                    <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className={`font-semibold ${stat.trend.startsWith('+') ? 'text-[#20AC6B]' : 'text-red-500'}`}>
                    {stat.trend}
                  </span>
                  <span className="text-slate-300 ml-1.5">from last month</span>
                </div>
              </div>
            ))}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Recent Appointments Table */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Recent Appointments</h2>
                <button className="text-sm text-[#16BCC8] font-semibold hover:text-[#0ea5a9] transition-colors duration-200 flex items-center gap-1">
                  View All <ArrowRight size={14} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80 text-slate-400 text-xs uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Patient</th>
                      <th className="px-6 py-4">Doctor</th>
                      <th className="px-6 py-4">Date & Time</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={apt.avatar} alt="" className="w-9 h-9 rounded-xl border border-slate-100" />
                            <span className="text-sm font-semibold text-slate-700">{apt.patient}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm text-slate-700 font-medium">{apt.doctor}</span>
                            <span className="text-xs text-slate-400">{apt.specialty}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm text-slate-700 font-medium">{apt.date}</span>
                            <span className="text-xs text-slate-400">{apt.time}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={apt.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-slate-300 hover:text-[#16BCC8] transition-colors duration-200 p-1.5 rounded-lg hover:bg-[#16BCC8]/8">
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Rated Doctors */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800">Top Rated Doctors</h2>
              </div>
              <div className="p-6 space-y-5">
                {topDoctors.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-4 group">
                    <img src={doc.image} alt={doc.name} className="w-12 h-12 rounded-xl border-2 border-slate-50 object-cover shadow-sm" />
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#16BCC8] transition-colors duration-200">{doc.name}</h4>
                      <p className="text-xs text-slate-400">{doc.specialty}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-100/50">
                      <Star size={13} className="text-[#F59F0A] fill-[#F59F0A]" />
                      <span className="text-xs font-bold text-amber-700">{doc.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-slate-100 text-center">
                <button className="text-sm text-[#16BCC8] font-semibold hover:text-[#0ea5a9] transition-colors duration-200">View All Doctors</button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}