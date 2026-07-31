'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar, Clock, User, Phone, AlignLeft, ShieldCheck, ArrowRight, Loader2, CheckCircle2, Video, MapPin, Sparkles, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { getToken } from '@/app/actions/token';
import { useSearchParams } from 'next/navigation';
import DashboardShell from '@/components/layouts/DashboardShell';

function BookWalkInContent() {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('Male');
  const [startTime, setStartTime] = useState('');
  const [doctor, setDoctor] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;


  const searchParams = useSearchParams();
  const urlSlot = searchParams.get('slot') || '';
  const [selectedSlot, setSelectedSlot] = useState('');

  useEffect(() => {
    if (urlSlot) {
      setSelectedSlot(urlSlot);
    }
  }, [urlSlot]);

  const [bookedAppointments, setBookedAppointments] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDocAndAppointments() {
      try {
        const token = await getToken();
        if (!token) {
          setErrorMsg('Authentication token not found. Please log in again.');
          return;
        }
        const cleanToken = token.replace(/"/g, '').trim();
        const docResponse = await axios.get(`${serverUrl}/compounder/my-doctor`, {
          headers: { Authorization: `Bearer ${cleanToken}` }
        });
        setDoctor(docResponse.data);

        const bookedRes = await axios.get(`${serverUrl}/patient/doctor-appointments/${docResponse.data._id}`, {
          headers: { Authorization: `Bearer ${cleanToken}` }
        });
        setBookedAppointments(bookedRes.data);
      } catch (err: any) {
        console.error(err);
        const msg = err.response?.data?.message || err.message || 'Failed to load doctor configuration.';
        setErrorMsg(msg);
      }
    }
    fetchDocAndAppointments();
  }, [serverUrl]);

  useEffect(() => {
    if (!doctor) return;
    const eventSource = new EventSource(`${serverUrl}/realtime/stream`);
    eventSource.onmessage = (event) => {
      try {
        const sseData = JSON.parse(event.data);
        if (sseData.type === 'appointment_booked' && sseData.data.doctorId === doctor._id) {
          setBookedAppointments((prev) => {
            const exists = prev.some(
              (app) => new Date(app.startTime).getTime() === new Date(sseData.data.startTime).getTime()
            );
            if (exists) return prev;
            return [...prev, sseData.data];
          });
        } else if (sseData.type === 'appointment_updated' && sseData.data.doctorId === doctor._id) {
          setBookedAppointments((prev) => {
            if (sseData.data.status === 'cancelled') {
              return prev.filter(
                (app) => new Date(app.startTime).getTime() !== new Date(sseData.data.startTime).getTime()
              );
            } else {
              const index = prev.findIndex(
                (app) => new Date(app.startTime).getTime() === new Date(sseData.data.startTime).getTime()
              );
              if (index === -1) {
                return [...prev, sseData.data];
              }
              const next = [...prev];
              next[index] = { ...next[index], status: sseData.data.status };
              return next;
            }
          });
        }
      } catch (err) {
        console.error('SSE error:', err);
      }
    };
    return () => {
      eventSource.close();
    };
  }, [doctor, serverUrl]);

  const bookedTimesToday = useMemo(() => {
    const today = new Date();
    return bookedAppointments
      .filter((app) => {
        const appDate = new Date(app.startTime);
        return (
          appDate.getDate() === today.getDate() &&
          appDate.getMonth() === today.getMonth() &&
          appDate.getFullYear() === today.getFullYear() &&
          app.status !== 'cancelled'
        );
      })
      .map((app) => {
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
  }, [bookedAppointments]);

  const activeSlotsToday = useMemo(() => {
    if (!doctor || !doctor.availability) return [];
    const today = new Date();
    const dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = dayNamesFull[today.getDay()];
    
    const slotsForDay = doctor.availability.filter(
      (slot: any) => slot.day === currentDayName && slot.isAvailable
    );
    if (slotsForDay.length === 0) return [];
    
    const format12h = (t24: string) => {
      const [hStr, mStr] = t24.split(':');
      let h = parseInt(hStr);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      h = h ? h : 12;
      return `${String(h).padStart(2, '0')}:${mStr} ${ampm}`;
    };

    const toMin = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const sortedSlots = [...slotsForDay].sort((a, b) => toMin(a.startTime) - toMin(b.startTime));
    return sortedSlots.map((s: any) => format12h(s.startTime));
  }, [doctor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !age || !phoneNumber || !selectedSlot) {
      setErrorMsg('Please fill all fields.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const token = await getToken();
      if (!token) return;
      const cleanToken = token.replace(/"/g, '').trim();

      // Convert slot name to ISO startTime today
      const today = new Date();
      const [timePart, period] = selectedSlot.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      today.setHours(hours, minutes, 0, 0);

      await axios.post(`${serverUrl}/compounder/book-walk-in`, {
        fullName,
        age: Number(age),
        phoneNumber,
        gender,
        startTime: today.toISOString(),
      }, {
        headers: { Authorization: `Bearer ${cleanToken}` }
      });

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to book slot. It might be already taken.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFullName('');
    setAge('');
    setPhoneNumber('');
    setGender('Male');
    setStartTime('');
    setSelectedSlot('');
    setSuccess(false);
    setErrorMsg('');
  };

  return (
    <DashboardShell role="compounder" activeHref="/compounder/appointments">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 sm:px-8 py-5">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Walk-In Booking Desk 🎫</h1>
        <p className="text-sm text-slate-400">Register new clinic arrivals and schedule them in slots instantly</p>
      </header>

      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative overflow-hidden">
          {success ? (
            <div className="text-center py-8 space-y-5 animate-fade-up">
              <div className="w-16 h-16 bg-teal-50 border-4 border-teal-100 rounded-full flex items-center justify-center mx-auto text-teal-600">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800">Walk-In Booked Successfully!</h2>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">
                Patient <strong>{fullName}</strong> has been registered and added to the queue for today at <strong>{selectedSlot}</strong>.
              </p>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
              >
                Register Next Patient
              </button>
            </div>
            ) : errorMsg ? (
            <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2 animate-bounce" />
              <p className="font-semibold mb-1">Failed to load doctor desk configuration</p>
              <p className="text-xs opacity-75">{errorMsg}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 border border-teal-100">
                <Sparkles size={12} />
                <span>Walk-In Registration Mode</span>
              </div>

              {/* Patient Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Patient Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4.5 h-4.5" />
                    <input
                      required
                      type="text"
                      placeholder="e.g. Ali Khan"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="pl-11 pr-4 py-3 w-full border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Patient Age</label>
                  <input
                    required
                    type="number"
                    placeholder="e.g. 24"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    className="px-4 py-3 w-full border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4.5 h-4.5" />
                    <input
                      required
                      type="tel"
                      placeholder="e.g. 03001234567"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      className="pl-11 pr-4 py-3 w-full border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Gender</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    className="px-4 py-3 w-full border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all cursor-pointer bg-white"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              {/* Time Slots Selector */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Select Available Time Slot Today</label>
                {activeSlotsToday.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-sm bg-slate-50 border border-slate-100 rounded-xl italic">
                    Doctor is OFF today. Walk-in appointments are unavailable.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {activeSlotsToday.map((slot) => {
                      const isBooked = bookedTimesToday.includes(slot);
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2.5 rounded-xl border font-bold text-xs transition-all relative ${
                            isBooked
                              ? 'border-slate-200 bg-slate-100 text-slate-400 line-through cursor-not-allowed opacity-60'
                              : selectedSlot === slot
                              ? 'border-teal-600 bg-teal-600 text-white shadow-sm'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-teal-400 hover:text-teal-700'
                          }`}
                        >
                          {slot}
                          {isBooked && (
                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                  <span>⚠️</span>
                  <p>{errorMsg}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl text-white font-bold bg-teal-600 hover:bg-teal-700 shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Confirm Booking
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

export default function BookWalkIn() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    }>
      <BookWalkInContent />
    </React.Suspense>
  );
}
