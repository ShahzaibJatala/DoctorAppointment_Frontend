'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Search,
  Filter,
  MoreVertical,
  CalendarCheck,
  LayoutDashboard,
  FileText,
  ClipboardList,
  Settings,
  LogOut,
  Bell,
  Menu,
  ChevronRight,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Heart,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

// --- Types ---
type AppointmentStatus = 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
type AppointmentType = 'Video' | 'In-Clinic';

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  avatar: string;
  date: string;
  time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  location?: string; // Optional for In-Clinic
}

// --- Mock Data ---
const allAppointments: Appointment[] = [
  {
    id: '1',
    doctorName: 'Dr. Sarah Wilson',
    specialty: 'Cardiologist',
    avatar: 'https://i.pravatar.cc/150?u=30',
    date: 'Oct 26, 2024',
    time: '10:00 AM',
    type: 'Video',
    status: 'Confirmed'
  },
  {
    id: '2',
    doctorName: 'Dr. James Lee',
    specialty: 'Dermatologist',
    avatar: 'https://i.pravatar.cc/150?u=31',
    date: 'Oct 29, 2024',
    time: '02:30 PM',
    type: 'In-Clinic',
    status: 'Pending',
    location: 'MediBook Center, Room 302'
  },
  {
    id: '3',
    doctorName: 'Dr. Emma Chen',
    specialty: 'General Physician',
    avatar: 'https://i.pravatar.cc/150?u=32',
    date: 'Oct 15, 2024',
    time: '09:00 AM',
    type: 'Video',
    status: 'Completed'
  },
  {
    id: '4',
    doctorName: 'Dr. Michael Ross',
    specialty: 'Neurologist',
    avatar: 'https://i.pravatar.cc/150?u=33',
    date: 'Sep 20, 2024',
    time: '11:00 AM',
    type: 'In-Clinic',
    status: 'Cancelled',
    location: 'City Hospital, Wing A'
  },
  {
    id: '5',
    doctorName: 'Dr. Linda Kim',
    specialty: 'Pediatrician',
    avatar: 'https://i.pravatar.cc/150?u=34',
    date: 'Nov 02, 2024',
    time: '04:00 PM',
    type: 'Video',
    status: 'Confirmed'
  }
];

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group ${
    active 
      ? 'bg-[#16BCC8]/8 text-[#16BCC8] font-semibold' 
      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
  }`}>
    <Icon size={20} className={`transition-colors duration-200 ${active ? 'text-[#16BCC8]' : 'group-hover:text-[#16BCC8]'}`} />
    <span>{label}</span>
  </div>
);

const StatusBadge = ({ status }: { status: AppointmentStatus }) => {
  const styles = {
    Confirmed: 'bg-[#20AC6B]/10 text-[#20AC6B] border-[#20AC6B]/20',
    Pending: 'bg-amber-50 text-amber-600 border-amber-200/50',
    Completed: 'bg-slate-50 text-slate-500 border-slate-200/50',
    Cancelled: 'bg-red-50 text-red-600 border-red-200/50',
  };

  const icons = {
    Confirmed: CheckCircle2,
    Pending: Clock,
    Completed: CalendarCheck,
    Cancelled: X,
  };

  const Icon = icons[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${styles[status]}`}>
      <Icon size={12} />
      {status}
    </span>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl border border-slate-100 border-dashed animate-fade-up">
    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
      <Calendar className="w-7 h-7 text-slate-300" />
    </div>
    <h3 className="text-lg font-bold text-slate-800">No appointments found</h3>
    <p className="text-slate-400 text-sm max-w-xs mt-2 mb-6">
      You don't have any appointments in this category yet.
    </p>
    <button className="flex items-center gap-2 bg-gradient-to-r from-[#16BCC8] to-[#0ea5a9] text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-[0_2px_12px_rgba(22,188,200,0.3)] hover:shadow-[0_4px_20px_rgba(22,188,200,0.4)]">
      <Plus size={18} />
      Book Appointment
    </button>
  </div>
);

export default function MyAppointments() {
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Completed' | 'Cancelled'>('Upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter Logic
  const filteredAppointments = allAppointments.filter(apt => {
    const matchesTab = 
      activeTab === 'Upcoming' ? (apt.status === 'Confirmed' || apt.status === 'Pending') :
      activeTab === 'Completed' ? apt.status === 'Completed' :
      apt.status === 'Cancelled';
    
    const matchesSearch = apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          apt.specialty.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      
      {/* --- Sidebar (Hidden on Mobile) --- */}
     

      {/* --- Main Content --- */}
      <main className="flex-1 lg:ml-72">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 lg:hidden">
            <Menu className="text-slate-500" />
            <span className="font-bold text-lg text-slate-800">MediBook</span>
          </div>

          <h1 className="text-xl font-bold text-slate-800 hidden lg:block">My Appointments</h1>

          <div className="flex items-center gap-4">
            <button className="relative p-2.5 rounded-xl hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-100">
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <img 
              src="https://i.pravatar.cc/150?u=patient" 
              alt="Profile" 
              className="w-10 h-10 rounded-xl border-2 border-white shadow-sm" 
            />
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
          
          {/* Controls: Tabs & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-up">
            
            {/* Tabs */}
            <div className="bg-slate-100/80 p-1 rounded-xl flex items-center w-full md:w-auto">
              {(['Upcoming', 'Completed', 'Cancelled'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab 
                      ? 'bg-white text-[#16BCC8] shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search & Filter */}
            <div className="flex gap-3 w-full md:w-auto">
              <div className="flex-1 md:w-72 flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-[#16BCC8]/20 focus-within:border-[#16BCC8] transition-all duration-200">
                <Search className="text-slate-300 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search doctor or specialty..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm ml-2 w-full text-slate-700 placeholder:text-slate-300"
                />
              </div>
              <button className="bg-white border border-slate-200 p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-[#16BCC8] hover:border-[#16BCC8]/20 transition-all duration-200">
                <Filter size={20} />
              </button>
            </div>
          </div>

          {/* Reminder Banner (Only for Upcoming) */}
          {activeTab === 'Upcoming' && filteredAppointments.length > 0 && (
            <div className="bg-gradient-to-r from-[#16BCC8]/8 to-[#0ea5a9]/5 border border-[#16BCC8]/10 rounded-2xl p-4 flex items-start gap-4 animate-slide-down">
              <div className="p-2 bg-[#16BCC8]/10 text-[#16BCC8] rounded-xl shrink-0">
                <AlertCircle size={18} />
              </div>
              <div>
                <h4 className="font-bold text-[#16BCC8] text-sm">Don't forget!</h4>
                <p className="text-slate-500 text-xs mt-1">
                  You have a video consultation coming up with Dr. Sarah Wilson on Oct 26.
                </p>
              </div>
            </div>
          )}

          {/* Appointments List */}
          <div className="space-y-4">
            {filteredAppointments.length === 0 ? (
              <EmptyState />
            ) : (
              filteredAppointments.map((apt, index) => (
                <div key={apt.id} className={`group bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-elevated hover:border-[#16BCC8]/10 transition-all duration-300 animate-fade-up stagger-${Math.min(index + 1, 6)}`}>
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    
                    {/* Date Block (Desktop Only) */}
                    <div className="hidden md:flex flex-col items-center justify-center w-20 h-20 bg-slate-50 rounded-2xl border border-slate-100 shrink-0 group-hover:border-[#16BCC8]/15 transition-all duration-200">
                      <span className="text-xs font-bold text-slate-400 uppercase">{apt.date.split(' ')[0]}</span>
                      <span className="text-2xl font-extrabold text-slate-800">{apt.date.split(' ')[1].replace(',', '')}</span>
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="relative shrink-0">
                         <img src={apt.avatar} alt={apt.doctorName} className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-50 shadow-sm" />
                         <div className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-white text-white ${apt.type === 'Video' ? 'bg-blue-500' : 'bg-[#16BCC8]'}`}>
                           {apt.type === 'Video' ? <Video size={9} /> : <MapPin size={9} />}
                         </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg text-slate-800 group-hover:text-[#16BCC8] transition-colors duration-200">{apt.doctorName}</h3>
                            <p className="text-sm text-slate-400 font-medium">{apt.specialty}</p>
                          </div>
                          {/* Mobile Date shown here since block is hidden */}
                          <div className="md:hidden text-right">
                             <p className="text-sm font-bold text-slate-800">{apt.date}</p>
                             <p className="text-xs text-slate-400">{apt.time}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-slate-400">
                          <span className="hidden md:flex items-center gap-1"><Clock size={13} /> {apt.time}</span>
                          <span className="flex items-center gap-1">
                            {apt.type === 'Video' ? <Video size={13} /> : <MapPin size={13} />} 
                            {apt.type === 'Video' ? 'Online Video Call' : apt.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 md:border-l border-slate-50 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                      <StatusBadge status={apt.status} />
                      
                      <div className="flex items-center gap-2">
                        {apt.status === 'Confirmed' || apt.status === 'Pending' ? (
                          <>
                            <button className="px-4 py-2 bg-gradient-to-r from-[#16BCC8] to-[#0ea5a9] text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-sm hover:shadow-[0_2px_12px_rgba(22,188,200,0.3)]">
                              {apt.type === 'Video' ? 'Join Call' : 'View Details'}
                            </button>
                            <button className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200" title="Cancel Appointment">
                              <X size={18} />
                            </button>
                          </>
                        ) : apt.status === 'Completed' ? (
                           <button className="px-4 py-2 bg-white border border-slate-200 hover:border-[#16BCC8]/30 hover:text-[#16BCC8] text-slate-600 text-sm font-semibold rounded-xl transition-all duration-200">
                             Leave Review
                           </button>
                        ) : (
                          <button className="px-4 py-2 bg-slate-50 hover:bg-[#16BCC8]/8 hover:text-[#16BCC8] text-slate-500 text-sm font-semibold rounded-xl transition-all duration-200">
                             Book Again
                           </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </main>
    </div>
  );
}