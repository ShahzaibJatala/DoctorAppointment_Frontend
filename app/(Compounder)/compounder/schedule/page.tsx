'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  CalendarDays, Clock, MapPin, Search, Loader2, FileText, CheckCircle2, ShieldCheck, User, Award, AlertCircle, Calendar
} from 'lucide-react';
import axios from 'axios';
import { getToken } from '@/app/actions/token';
import DashboardShell from '@/components/layouts/DashboardShell';

export default function DoctorSchedule() {
  const [doctor, setDoctor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [isCheckingIn, setIsCheckingIn] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;


  async function fetchQueue() {
    try {
      const token = await getToken();
      if (!token) return;
      const cleanToken = token.replace(/"/g, '').trim();
      const res = await axios.get(`${serverUrl}/compounder/queue`, {
        headers: { Authorization: `Bearer ${cleanToken}` }
      });
      setTodayAppointments(res.data);
    } catch (err) {
      console.error('Queue load error:', err);
    }
  }

  useEffect(() => {
    async function fetchDoc() {
      try {
        const token = await getToken();
        if (!token) {
          setErrorMsg('Authentication token not found. Please log in again.');
          setIsLoading(false);
          return;
        }
        const cleanToken = token.replace(/"/g, '').trim();
        const docResponse = await axios.get(`${serverUrl}/compounder/my-doctor`, {
          headers: { Authorization: `Bearer ${cleanToken}` }
        });
        setDoctor(docResponse.data);
        await fetchQueue();
      } catch (err: any) {
        console.error(err);
        const msg = err.response?.data?.message || err.message || 'Unknown error occurred.';
        setErrorMsg(msg);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDoc();
  }, []);

  useEffect(() => {
    if (!doctor) return;
    const eventSource = new EventSource(`${serverUrl}/realtime/stream`);
    eventSource.onmessage = (event) => {
      try {
        const sseData = JSON.parse(event.data);
        if (sseData.type === 'availability_updated' && sseData.data.doctorId === doctor._id) {
          setDoctor((prev: any) => ({
            ...prev,
            availability: sseData.data.availability,
          }));
        } else if (
          (sseData.type === 'appointment_booked' || sseData.type === 'appointment_updated') &&
          sseData.data.doctorId === doctor._id
        ) {
          fetchQueue();
        }
      } catch (err) {
        console.error('SSE error:', err);
      }
    };
    return () => {
      eventSource.close();
    };
  }, [doctor, serverUrl]);

  const handleCheckIn = async (appointmentId: string) => {
    setIsCheckingIn(appointmentId);
    try {
      const token = await getToken();
      if (!token) return;
      const cleanToken = token.replace(/"/g, '').trim();
      await axios.post(`${serverUrl}/compounder/check-in/${appointmentId}`, {}, {
        headers: { Authorization: `Bearer ${cleanToken}` }
      });
      await fetchQueue();
    } catch (err) {
      console.error('Check-in error:', err);
    } finally {
      setIsCheckingIn(null);
    }
  };

  const todaySlots = useMemo(() => {
    if (!doctor || !doctor.availability) return [];
    const today = new Date();
    const dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = dayNamesFull[today.getDay()];
    
    // Get all availability slots configured for today
    const slotsForDay = doctor.availability.filter(
      (slot: any) => slot.day === currentDayName
    );

    // Format a 24h time string (e.g. "09:00") into 12h format (e.g. "09:00 AM")
    const format12h = (t24: string) => {
      const [hStr, mStr] = t24.split(':');
      let h = parseInt(hStr);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      h = h ? h : 12;
      return `${String(h).padStart(2, '0')}:${mStr} ${ampm}`;
    };

    // Keep active slots configured by the doctor
    const availableSlots = slotsForDay.filter((s: any) => s.isAvailable);

    // Also include slots that already have booked appointments for today (in 12h format)
    const appointmentSlots = todayAppointments.map(app => {
      const d = new Date(app.startTime);
      let hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      const hoursStr = hours < 10 ? '0' + hours : hours;
      return `${hoursStr}:${minutesStr} ${ampm}`;
    });

    const formattedAvail = availableSlots.map((s: any) => format12h(s.startTime));
    const allSlotsSet = new Set([...formattedAvail, ...appointmentSlots]);
    const allSlots = Array.from(allSlotsSet);

    // Helper to convert 12h time to minutes for chronological sorting
    const parseTimeToMinutes = (str: string) => {
      const [timePart, period] = str.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    return allSlots.sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));
  }, [doctor, todayAppointments]);

  const hasShifts = useMemo(() => {
    return doctor?.availability?.some((slot: any) => slot.isAvailable) || false;
  }, [doctor]);

  const getDayShiftRanges = (day: string) => {
    if (!doctor || !doctor.availability) return [];
    const activeSlots = doctor.availability.filter((s: any) => s.day === day && s.isAvailable);
    if (activeSlots.length === 0) return [];
    
    const toMin = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    
    const sorted = [...activeSlots].sort((a, b) => toMin(a.startTime) - toMin(b.startTime));
    
    const groups: { start: string; end: string }[] = [];
    let currentGroup: { start: string; end: string } | null = null;
    
    sorted.forEach(slot => {
      if (!currentGroup) {
        currentGroup = { start: slot.startTime, end: slot.endTime };
      } else {
        const currentEndMin = toMin(currentGroup.end);
        const slotStartMin = toMin(slot.startTime);
        
        if (slotStartMin === currentEndMin) {
          currentGroup.end = slot.endTime;
        } else {
          groups.push(currentGroup);
          currentGroup = { start: slot.startTime, end: slot.endTime };
        }
      }
    });
    
    if (currentGroup) {
      groups.push(currentGroup);
    }
    
    const format12h = (t24: string) => {
      const [hStr, mStr] = t24.split(':');
      let h = parseInt(hStr);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      h = h ? h : 12;
      return `${String(h).padStart(2, '0')}:${mStr} ${ampm}`;
    };
    
    return groups.map(g => `${format12h(g.start)} - ${format12h(g.end)}`);
  };

  const getSlotAppointment = (slot: string) => {
    return todayAppointments.find(app => {
      const d = new Date(app.startTime);
      let hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      const hoursStr = hours < 10 ? '0' + hours : hours;
      const appSlot = `${hoursStr}:${minutesStr} ${ampm}`;
      return appSlot === slot && app.status !== 'cancelled';
    });
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <DashboardShell role="compounder" activeHref="/compounder/schedule">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 sm:px-8 py-5">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Doctor Schedule Desk 📅</h1>
        <p className="text-sm text-slate-400">View weekly consultation schedules and shift hours</p>
      </header>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-40">
          <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Retrieving schedule logs...</p>
        </div>
      ) : (
        <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-up">
          {doctor ? (
            <div className="space-y-6">
              {/* Doctor Details summary card */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-4">
                <img
                  src={doctor.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.fullName)}&background=0D9488&color=fff`}
                  alt=""
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-sm"
                />
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{doctor.fullName}</h3>
                  <p className="text-sm text-teal-600 font-medium">{doctor.specialization}</p>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin size={12} /> {doctor.clinicName || 'Clinic Desk'}, {doctor.clinicAddress || 'Hospital address'}
                  </p>
                </div>
              </div>

              {/* Weekly Availability Desk */}
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 text-sm">Weekly Shift Hours</h3>
                </div>

                <div className="divide-y divide-slate-100">
                  {hasShifts ? (
                    daysOfWeek.map((day) => {
                      const shiftRanges = getDayShiftRanges(day);
                      if (shiftRanges.length === 0) return null;
                      return (
                        <div key={day} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <span className="font-bold text-slate-700 w-32">{day}</span>
                          <div className="flex-1 flex flex-wrap gap-2">
                            {shiftRanges.map((range, idx) => (
                              <span
                                key={idx}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 bg-teal-50 text-teal-700 border-teal-100 shadow-sm"
                              >
                                <Clock size={12} />
                                {range}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-sm italic">
                      No shift hours configured by the doctor yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Today's Appointment Slots Desk */}
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Today's Appointment Slots</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Real-time status updates of today's shifts</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-100 rounded-full text-[10px] font-bold text-teal-700">
                    <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
                    <span>Live Tracker</span>
                  </div>
                </div>

                <div className="p-6">
                  {todaySlots.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm italic">
                      No shift hours scheduled for today.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {todaySlots.map((slot) => {
                        const app = getSlotAppointment(slot);
                        return (
                          <div
                            key={slot}
                            className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                              app
                                ? app.status === 'checked-in'
                                  ? 'bg-emerald-50/40 border-emerald-100'
                                  : app.status === 'in-progress'
                                  ? 'bg-amber-50/40 border-amber-100'
                                  : 'bg-teal-50/30 border-teal-100/50'
                                : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                app
                                  ? app.status === 'checked-in'
                                    ? 'bg-emerald-500 text-white'
                                    : app.status === 'in-progress'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-teal-600 text-white'
                                  : 'bg-slate-200 text-slate-500'
                              }`}>
                                {app && app.tokenNumber ? `#${app.tokenNumber}` : <Clock size={16} />}
                              </div>
                              <div>
                                <p className="text-xs font-extrabold text-slate-400">{slot}</p>
                                {app ? (
                                  <div className="space-y-0.5">
                                    <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                                      {app.name || 'Walk-In Patient'}
                                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                        app.status === 'checked-in'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : app.status === 'in-progress'
                                          ? 'bg-amber-100 text-amber-800'
                                          : app.status === 'completed'
                                          ? 'bg-slate-200 text-slate-700'
                                          : 'bg-blue-100 text-blue-800'
                                      }`}>
                                        {app.status}
                                      </span>
                                    </h4>
                                    <p className="text-[10px] text-slate-400 font-medium">
                                      {app.phoneNumber} · {app.paymentMethod === 'cash' ? 'Cash' : 'Card'}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-sm font-semibold text-slate-500 italic">Available Slot</p>
                                )}
                              </div>
                            </div>

                            {app ? (
                              app.status === 'confirmed' && (
                                <button
                                  disabled={isCheckingIn === app.appointmentId}
                                  onClick={() => handleCheckIn(app.appointmentId)}
                                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-sm flex items-center gap-1.5 hover:shadow disabled:bg-slate-200 disabled:cursor-not-allowed"
                                >
                                  {isCheckingIn === app.appointmentId ? (
                                    <Loader2 size={12} className="animate-spin" />
                                  ) : (
                                    'Check In'
                                  )}
                                </button>
                              )
                            ) : (
                              <a
                                href={`/compounder/appointments?slot=${encodeURIComponent(slot)}`}
                                className="px-3 py-2 border border-slate-200 bg-white hover:bg-teal-50 hover:border-teal-300 text-[10px] font-extrabold rounded-xl text-slate-500 hover:text-teal-700 transition-all"
                              >
                                Book Walk-In
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : errorMsg ? (
            <div className="p-12 text-center bg-white border border-red-100 rounded-2xl text-red-500 text-sm">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2 animate-bounce" />
              <p className="font-semibold mb-1">Failed to load doctor profile</p>
              <p className="text-xs opacity-75">{errorMsg}</p>
            </div>
          ) : (
            <div className="p-12 text-center bg-white border border-slate-100 rounded-2xl text-slate-400 text-sm">
              Doctor profile details not found.
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
