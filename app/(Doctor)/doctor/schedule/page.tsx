'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar, Settings, Clock, Plus, Save, RotateCcw, Video, MapPin, Coffee, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Users, CalendarCheck, ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import { getToken } from '@/app/actions/token';
import DashboardShell from '@/components/layouts/DashboardShell';

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

const generateSlotsForDuration = (dayPrefix: string, durationMin: number): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 9;
  const endHour = 17; 
  let currentMin = startHour * 60;
  const endMin = endHour * 60;
  
  let i = 0;
  while (currentMin < endMin) {
    const hh = String(Math.floor(currentMin / 60)).padStart(2, '0');
    const mm = String(currentMin % 60).padStart(2, '0');
    slots.push({
      id: `${dayPrefix}-${i}`,
      time: `${hh}:${mm}`,
      status: 'available'
    });
    currentMin += durationMin;
    i++;
  }
  return slots;
};

const defaultSchedule: DaySchedule[] = [
  { day: 'Mon', date: 'Monday', isWorkingDay: true, slots: generateSlotsForDuration('mon', 60) },
  { day: 'Tue', date: 'Tuesday', isWorkingDay: true, slots: generateSlotsForDuration('tue', 60) },
  { day: 'Wed', date: 'Wednesday', isWorkingDay: true, slots: generateSlotsForDuration('wed', 60) },
  { day: 'Thu', date: 'Thursday', isWorkingDay: true, slots: generateSlotsForDuration('thu', 60) },
  { day: 'Fri', date: 'Friday', isWorkingDay: true, slots: generateSlotsForDuration('fri', 60) },
  { day: 'Sat', date: 'Saturday', isWorkingDay: false, slots: [] },
  { day: 'Sun', date: 'Sunday', isWorkingDay: false, slots: [] },
];

const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    type="button"
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
  const [slotDuration, setSlotDuration] = useState('60');
  const [schedule, setSchedule] = useState<DaySchedule[]>(defaultSchedule);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isClinicEnabled, setIsClinicEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [doctorName, setDoctorName] = useState('Doctor');

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  // Sync slots on duration change
  useEffect(() => {
    const durationNum = parseInt(slotDuration);
    setSchedule(prev => prev.map(day => {
      if (!day.isWorkingDay) return day;
      const newSlots = generateSlotsForDuration(day.day.toLowerCase(), durationNum);
      const updatedSlots = newSlots.map(ns => {
        const matchingPrev = day.slots.find(ps => ps.time === ns.time);
        if (matchingPrev) {
          return { ...ns, status: matchingPrev.status };
        }
        return ns;
      });
      return { ...day, slots: updatedSlots };
    }));
  }, [slotDuration]);

  const fetchDoctorProfile = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const cleanToken = token.replace(/"/g, '').trim();

      const res = await axios.get(`${serverUrl}/doctor/getProfile`, {
        headers: { Authorization: `Bearer ${cleanToken}` }
      });

      const profile = res.data;
      if (profile) {
        setDoctorName(profile.fullName || 'Doctor');
        
        if (profile.availability && profile.availability.length > 0) {
          // Detect slot duration from DB availability differences
          const firstDayWithSlots = profile.availability.filter((s: any) => s.isAvailable);
          if (firstDayWithSlots.length > 1) {
            const t1 = firstDayWithSlots[0].startTime;
            const t2 = firstDayWithSlots[1].startTime;
            const parseToMin = (s: string) => {
              const [h, m] = s.split(':').map(Number);
              return h * 60 + m;
            };
            const diff = Math.abs(parseToMin(t2) - parseToMin(t1));
            if ([10, 15, 30, 60].includes(diff)) {
              setSlotDuration(String(diff));
            }
          }

          const newSchedule: DaySchedule[] = defaultSchedule.map(day => {
            const fullDayName = day.date; 
            const dbSlots = profile.availability.filter((s: any) => s.day === fullDayName);
            
            if (dbSlots.length === 0) {
              return { ...day, isWorkingDay: false, slots: [] };
            }

            const isWorking = dbSlots.some((s: any) => s.isAvailable);
            const mappedSlots: TimeSlot[] = dbSlots.map((s: any, idx: number) => ({
              id: `${day.day.toLowerCase()}-${idx}`,
              time: s.startTime,
              status: s.isAvailable ? 'available' : 'unavailable',
            }));

            return {
              ...day,
              isWorkingDay: isWorking,
              slots: mappedSlots.length > 0 ? mappedSlots : generateSlotsForDuration(day.day.toLowerCase(), parseInt(slotDuration))
            };
          });
          setSchedule(newSchedule);
        }
      }
    } catch (err) {
      console.error('Error fetching doctor schedule:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

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
      newSchedule[dayIndex].slots = generateSlotsForDuration(newSchedule[dayIndex].day.toLowerCase(), parseInt(slotDuration));
    }
    
    setSchedule(newSchedule);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = await getToken();
      if (!token) return;
      const cleanToken = token.replace(/"/g, '').trim();

      const dayNamesFull: Record<string, string> = {
        'Mon': 'Monday', 'Tue': 'Tuesday', 'Wed': 'Wednesday', 'Thu': 'Thursday', 'Fri': 'Friday', 'Sat': 'Saturday', 'Sun': 'Sunday'
      };

      const dbAvailability: any[] = [];
      const durationNum = parseInt(slotDuration);
      
      schedule.forEach(day => {
        const fullDayName = dayNamesFull[day.day];
        
        if (!day.isWorkingDay) {
          dbAvailability.push({
            day: fullDayName,
            startTime: '09:00',
            endTime: '17:00',
            isAvailable: false
          });
        } else {
          day.slots.forEach(slot => {
            const [hh, mm] = slot.time.split(':').map(Number);
            const totalMins = hh * 60 + mm + durationNum;
            const endHH = String(Math.floor(totalMins / 60)).padStart(2, '0');
            const endMM = String(totalMins % 60).padStart(2, '0');
            
            dbAvailability.push({
              day: fullDayName,
              startTime: slot.time,
              endTime: `${endHH}:${endMM}`,
              isAvailable: slot.status === 'available'
            });
          });
        }
      });

      await axios.post(`${serverUrl}/doctor/updateAvailability`, {
        availability: dbAvailability
      }, {
        headers: { Authorization: `Bearer ${cleanToken}` }
      });

      alert('Schedule updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update availability schedule.');
    } finally {
      setIsSaving(false);
    }
  };

  const weeklyShiftHoursText = useMemo(() => {
    let absoluteMin = 24 * 60;
    let absoluteMax = 0;
    let found = false;

    schedule.forEach(day => {
      if (day.isWorkingDay) {
        day.slots.forEach(slot => {
          if (slot.status === 'available') {
            found = true;
            const [hh, mm] = slot.time.split(':').map(Number);
            const mins = hh * 60 + mm;
            if (mins < absoluteMin) absoluteMin = mins;
            if (mins > absoluteMax) absoluteMax = mins;
          }
        });
      }
    });

    if (found && absoluteMax >= absoluteMin) {
      const minHH = String(Math.floor(absoluteMin / 60)).padStart(2, '0');
      const minMM = String(absoluteMin % 60).padStart(2, '0');
      
      const duration = parseInt(slotDuration);
      const endMins = absoluteMax + duration;
      const maxHH = String(Math.floor(endMins / 60)).padStart(2, '0');
      const maxMM = String(endMins % 60).padStart(2, '0');
      
      return `${minHH}:${minMM} - ${maxHH}:${maxMM}`;
    }

    return '09:00 - 17:00';
  }, [schedule, slotDuration]);

  return (
    <DashboardShell role="doctor" activeHref="/doctor/schedule" showHealthTip={false}>
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
           <h1 className="text-lg sm:text-xl font-bold text-slate-800">Schedule Management</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDoctorProfile}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl text-sm font-semibold hover:border-[#16BCC8]/30 hover:text-[#16BCC8] transition-all duration-200"
          >
            <RotateCcw size={16} /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#16BCC8] to-[#0ea5a9] text-white rounded-xl text-sm font-semibold shadow-[0_2px_8px_rgba(22,188,200,0.3)] hover:shadow-[0_4px_16px_rgba(22,188,200,0.4)] transition-all duration-300 disabled:opacity-75"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>
          <div className="h-8 w-px bg-slate-100 hidden md:block"></div>
          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doctorName)}&background=0D9488&color=fff`} alt="Profile" className="w-9 h-9 rounded-xl border-2 border-white shadow-sm" />
        </div>
      </header>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-40">
          <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Retrieving schedule console...</p>
        </div>
      ) : (
        <div className="p-4 md:p-6 max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* Left Column: Settings Panel */}
          <div className="xl:col-span-1 space-y-6 animate-fade-up">
            <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card">
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
                    <option value="10">10 Minutes</option>
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
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
              </div>
            </section>

            {/* Legend */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card">
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Legend</h4>
               <div className="space-y-2.5 text-sm">
                 <div className="flex items-center gap-2.5">
                   <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-[#16BCC8]"></div>
                   <span className="text-slate-600 font-medium">Available / Working</span>
                 </div>
                 <div className="flex items-center gap-2.5">
                   <div className="w-3.5 h-3.5 rounded-full bg-slate-100 border-2 border-slate-300"></div>
                   <span className="text-slate-600 font-medium">Unavailable / Off</span>
                 </div>
               </div>
            </div>
          </div>

          {/* Right Column: Weekly Calendar */}
          <div className="xl:col-span-3">
             <div className="bg-white border border-slate-100 rounded-2xl shadow-card overflow-hidden flex flex-col h-full min-h-[600px] animate-fade-up" style={{ animationDelay: '0.05s' }}>
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                   <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#16BCC8]/8 text-[#16BCC8]">
                        <Clock size={16} />
                      </div>
                      <span className="text-sm font-bold text-slate-700">Weekly Shift Hours ({weeklyShiftHoursText})</span>
                   </div>
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 overflow-x-auto">
                   <div className="min-w-[560px] sm:min-w-[800px] h-full flex divide-x divide-slate-100">
                      {schedule.map((day, dIdx) => (
                        <div key={day.day} className={`flex-1 flex flex-col min-w-[120px] ${!day.isWorkingDay ? 'bg-slate-50/50' : 'bg-white'}`}>
                           
                           {/* Day Header */}
                           <div className="p-3 text-center border-b border-slate-100 sticky top-0 bg-white z-10">
                              <p className="text-xs font-bold text-slate-400 uppercase">{day.day}</p>
                              <p className={`text-sm font-extrabold ${day.isWorkingDay ? 'text-slate-800' : 'text-slate-300'}`}>{day.date}</p>
                              
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
                           <div className="p-2 space-y-2 flex-1 relative max-h-[500px] overflow-y-auto scrollbar-thin">
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
                               </div>
                             ))}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>

        </div>
      )}
    </DashboardShell>
  );
}