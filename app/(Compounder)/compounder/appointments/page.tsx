'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, User, Phone, AlignLeft, ShieldCheck, ArrowRight, Loader2, CheckCircle2, Video, MapPin, Sparkles
} from 'lucide-react';
import axios from 'axios';
import { getToken } from '@/app/actions/token';
import DashboardShell from '@/components/layouts/DashboardShell';

export default function BookWalkIn() {
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

  // Static hourly slots for walk-in booking
  const slots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  ];

  const [selectedSlot, setSelectedSlot] = useState('');

  useEffect(() => {
    async function fetchDoc() {
      try {
        const token = await getToken();
        if (!token) return;
        const cleanToken = token.replace(/"/g, '').trim();
        const docResponse = await axios.get(`${serverUrl}/compounder/my-doctor`, {
          headers: { Authorization: `Bearer ${cleanToken}` }
        });
        setDoctor(docResponse.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchDoc();
  }, []);

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
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2.5 rounded-xl border font-bold text-xs transition-all ${
                        selectedSlot === slot
                          ? 'border-teal-600 bg-teal-600 text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-teal-400 hover:text-teal-700'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
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
