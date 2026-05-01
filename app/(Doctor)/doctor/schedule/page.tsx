'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Star,
  Settings,
  Bell,
  Menu,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Save,
  RotateCcw,
  Video,
  MapPin,
  Coffee,
  CalendarOff,
  Copy,
  CheckCircle2,
  Heart
} from 'lucide-react';
import Link from 'next/link';

// --- Types ---
type SlotStatus = 'available' | 'booked' | 'unavailable';

interface TimeSlot {
  id: string;
  time: string;
  status: SlotStatus;
  patientName?: string;
  type?: 'video' | 'clinic';
}

interface DaySchedule {
  day: string;
  date: string;
  isWorkingDay: boolean;
  slots: TimeSlot[];
}

// --- Mock Data Generator ---
const generateSlots = (dayPrefix: string): TimeSlot[] => {
  const times = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
  return times.map((time, i) => {
    const rand = Math.random();
    let status: SlotStatus = 'available';
    let patientName = undefined;
    let type: 'video' | 'clinic' | undefined = undefined;

    if (rand > 0.8) {
      status = 'booked';
      patientName = 'John Doe';
      type = Math.random() > 0.5 ? 'video' : 'clinic';
    } else if (rand > 0.6) {
      status = 'unavailable';
    }

    return { id: `${dayPrefix}-${i}`, time, status, patientName, type };
  });
};

const initialSchedule: DaySchedule[] = [
  { day: 'Mon', date: '21 Oct', isWorkingDay: true, slots: generateSlots('mon') },
  { day: 'Tue', date: '22 Oct', isWorkingDay: true, slots: generateSlots('tue') },
  { day: 'Wed', date: '23 Oct', isWorkingDay: true, slots: generateSlots('wed') },
  { day: 'Thu', date: '24 Oct', isWorkingDay: true, slots: generateSlots('thu') },
  { day: 'Fri', date: '25 Oct', isWorkingDay: true, slots: generateSlots('fri') },
  { day: 'Sat', date: '26 Oct', isWorkingDay: false, slots: [] },
  { day: 'Sun', date: '27 Oct', isWorkingDay: false, slots: [] },
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

const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#16BCC8]/30 focus:ring-offset-2 ${
      enabled ? 'bg-[#16BCC8]' : 'bg-slate-200'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

export default function DoctorSchedule() {
  const [schedule, setSchedule] = useState<DaySchedule[]>(initialSchedule);
  const [slotDuration, setSlotDuration] = useState('60');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isClinicEnabled, setIsClinicEnabled] = useState(true);

  const handleSlotClick = (dayIndex: number, slotId: string) => {
    const day = schedule[dayIndex];
    if (!day.isWorkingDay) return;

    const updatedSlots = day.slots.map(slot => {
      if (slot.id === slotId) {
        if (slot.status === 'booked') return slot;
        return { ...slot, status: slot.status === 'available' ? 'unavailable' : 'available' as SlotStatus };
      }
      return slot;
    });

    const newSchedule = [...schedule];
    newSchedule[dayIndex] = { ...day, slots: updatedSlots };
    setSchedule(newSchedule);
  };

  const toggleDayStatus = (dayIndex: number) => {
    const newSchedule = [...schedule];
    const isNowWorking = !newSchedule[dayIndex].isWorkingDay;
    newSchedule[dayIndex].isWorkingDay = isNowWorking;
    
    if (isNowWorking && newSchedule[dayIndex].slots.length === 0) {
      newSchedule[dayIndex].slots = generateSlots(`new-${dayIndex}`);
    }
    
    setSchedule(newSchedule);
  };

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
            <SidebarItem icon={LayoutDashboard} label="Dashboard" />
            <SidebarItem icon={Calendar} label="My Appointments" />
            <SidebarItem icon={Clock} label="Schedule" active />
            <SidebarItem icon={Users} label="Patients" />
            <SidebarItem icon={Star} label="Reviews" />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          <SidebarItem icon={Settings} label="Settings" />
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

          <div className="flex items-center gap-4">
             <h1 className="text-xl font-bold text-slate-800 hidden md:block">Schedule Management</h1>
             <div className="flex items-center bg-slate-100/80 rounded-xl p-1">
               <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-all duration-200"><ChevronLeft size={18} /></button>
               <span className="px-4 text-sm font-semibold text-slate-600">Oct 21 - Oct 27</span>
               <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-all duration-200"><ChevronRight size={18} /></button>
             </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl text-sm font-semibold hover:border-[#16BCC8]/30 hover:text-[#16BCC8] transition-all duration-200">
                <RotateCcw size={16} /> Reset
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#16BCC8] to-[#0ea5a9] text-white rounded-xl text-sm font-semibold shadow-[0_2px_8px_rgba(22,188,200,0.3)] hover:shadow-[0_4px_16px_rgba(22,188,200,0.4)] transition-all duration-300">
                <Save size={16} /> Save Changes
              </button>
            </div>
            <div className="h-8 w-px bg-slate-100 hidden md:block"></div>
            <img src="https://i.pravatar.cc/150?u=doctor" alt="Profile" className="w-9 h-9 rounded-xl border-2 border-white shadow-sm" />
          </div>
        </header>

        <div className="p-4 md:p-6 max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* --- Left Column: Settings Panel --- */}
          <div className="xl:col-span-1 space-y-6">
            
            {/* Availability Settings */}
            <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card animate-fade-up">
              <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#16BCC8]/8 text-[#16BCC8]">
                  <Settings size={16} />
                </div>
                Configuration
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Slot Duration</label>
                  <select 
                    value={slotDuration}
                    onChange={(e) => setSlotDuration(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#16BCC8] focus:ring-2 focus:ring-[#16BCC8]/10 transition-all duration-200 cursor-pointer"
                  >
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="45">45 Minutes</option>
                    <option value="60">60 Minutes</option>
                  </select>
                </div>

                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Appointment Types</label>
                   <div className="space-y-3">
                     <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                       <div className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
                         <Video size={16} className="text-blue-500" /> Video Consult
                       </div>
                       <Toggle enabled={isVideoEnabled} onChange={() => setIsVideoEnabled(!isVideoEnabled)} />
                     </div>
                     <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                       <div className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
                         <MapPin size={16} className="text-[#16BCC8]" /> In-Clinic
                       </div>
                       <Toggle enabled={isClinicEnabled} onChange={() => setIsClinicEnabled(!isClinicEnabled)} />
                     </div>
                   </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-all duration-200 border border-slate-100">
                    <CalendarOff size={16} /> Mark Time Off
                  </button>
                </div>
              </div>
            </section>

            {/* Quick Stats */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#16BCC8] to-[#0ea5a9] rounded-2xl p-6 text-white shadow-[0_4px_20px_rgba(22,188,200,0.3)] animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-white/[0.08] rounded-full blur-[20px]"></div>
              <h3 className="font-bold text-lg mb-1 relative">Weekly Summary</h3>
              <p className="text-white/60 text-sm mb-5 relative">Oct 21 - Oct 27</p>
              
              <div className="grid grid-cols-2 gap-4 relative">
                 <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/5">
                   <p className="text-xs text-white/60 font-medium">Total Hours</p>
                   <p className="text-2xl font-extrabold mt-1">32h</p>
                 </div>
                 <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/5">
                   <p className="text-xs text-white/60 font-medium">Booked</p>
                   <p className="text-2xl font-extrabold mt-1">18</p>
                 </div>
              </div>
            </section>

            {/* Legend */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card">
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Legend</h4>
               <div className="space-y-2.5 text-sm">
                 <div className="flex items-center gap-2.5">
                   <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-[#16BCC8]"></div>
                   <span className="text-slate-600 font-medium">Available</span>
                 </div>
                 <div className="flex items-center gap-2.5">
                   <div className="w-3.5 h-3.5 rounded-full bg-indigo-100 border-2 border-indigo-500"></div>
                   <span className="text-slate-600 font-medium">Booked</span>
                 </div>
                 <div className="flex items-center gap-2.5">
                   <div className="w-3.5 h-3.5 rounded-full bg-slate-100 border-2 border-slate-300"></div>
                   <span className="text-slate-600 font-medium">Unavailable</span>
                 </div>
               </div>
            </div>

          </div>

          {/* --- Right Column: Weekly Calendar --- */}
          <div className="xl:col-span-3">
             <div className="bg-white border border-slate-100 rounded-2xl shadow-card overflow-hidden flex flex-col h-full min-h-[600px] animate-fade-up" style={{ animationDelay: '0.05s' }}>
                
                {/* Calendar Header */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                   <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#16BCC8]/8 text-[#16BCC8]">
                        <Clock size={16} />
                      </div>
                      <span className="text-sm font-bold text-slate-700">Standard Hours (09:00 - 18:00)</span>
                   </div>
                   <button className="text-[#16BCC8] text-sm font-bold hover:text-[#0ea5a9] flex items-center gap-1.5 transition-colors duration-200">
                     <Copy size={14} /> Copy last week
                   </button>
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 overflow-x-auto">
                   <div className="min-w-[800px] h-full flex divide-x divide-slate-100">
                      
                      {schedule.map((day, dIdx) => (
                        <div key={day.day} className={`flex-1 flex flex-col min-w-[120px] ${!day.isWorkingDay ? 'bg-slate-50/50' : 'bg-white'}`}>
                           
                           {/* Day Header */}
                           <div className="p-3 text-center border-b border-slate-100 sticky top-0 bg-white z-10">
                              <p className="text-xs font-bold text-slate-400 uppercase">{day.day}</p>
                              <p className={`text-lg font-extrabold ${day.isWorkingDay ? 'text-slate-800' : 'text-slate-300'}`}>{day.date.split(' ')[0]}</p>
                              
                              <div className="mt-2 flex justify-center">
                                 <button 
                                   onClick={() => toggleDayStatus(dIdx)}
                                   className={`text-[10px] px-3 py-1 rounded-lg font-bold border transition-all duration-200 ${
                                     day.isWorkingDay 
                                     ? 'bg-[#16BCC8]/8 text-[#16BCC8] border-[#16BCC8]/10 hover:bg-[#16BCC8]/15' 
                                     : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                                   }`}
                                 >
                                   {day.isWorkingDay ? 'Working' : 'Off'}
                                 </button>
                              </div>
                           </div>

                           {/* Slots Container */}
                           <div className="p-2 space-y-2 flex-1 relative">
                             {!day.isWorkingDay && (
                               <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                                  <Coffee size={48} className="text-slate-900" />
                               </div>
                             )}

                             {day.isWorkingDay && day.slots.map((slot) => (
                               <div 
                                 key={slot.id}
                                 onClick={() => handleSlotClick(dIdx, slot.id)}
                                 className={`
                                   relative group p-2.5 rounded-xl border text-center cursor-pointer transition-all duration-200
                                   ${slot.status === 'available' ? 'bg-white border-[#16BCC8]/20 text-slate-700 hover:border-[#16BCC8] hover:shadow-md' : ''}
                                   ${slot.status === 'unavailable' ? 'bg-slate-50/80 border-slate-100 text-slate-300' : ''}
                                   ${slot.status === 'booked' ? 'bg-indigo-50 border-indigo-200/60 cursor-default' : ''}
                                 `}
                               >
                                 <span className="text-sm font-bold">{slot.time}</span>
                                 
                                 {slot.status === 'available' && (
                                   <div className="hidden group-hover:flex absolute -top-2 -right-2 w-5 h-5 bg-[#16BCC8] rounded-full text-white items-center justify-center shadow-sm">
                                     <CheckCircle2 size={12} />
                                   </div>
                                 )}

                                 {slot.status === 'booked' && (
                                   <div className="mt-1 flex flex-col items-center">
                                     <span className="text-[10px] font-semibold text-indigo-700 truncate w-full">{slot.patientName}</span>
                                     <div className="flex gap-1 mt-0.5">
                                       {slot.type === 'video' 
                                         ? <Video size={10} className="text-indigo-400" /> 
                                         : <MapPin size={10} className="text-indigo-400" />
                                       }
                                     </div>
                                   </div>
                                 )}
                               </div>
                             ))}

                             {day.isWorkingDay && (
                               <button className="w-full py-2.5 border border-dashed border-slate-200 rounded-xl text-slate-300 hover:text-[#16BCC8] hover:border-[#16BCC8]/30 hover:bg-[#16BCC8]/[0.03] transition-all duration-200 flex items-center justify-center">
                                 <Plus size={16} />
                               </button>
                             )}
                           </div>

                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}