'use client';

import React, { useEffect, useState } from 'react';
import {
  CalendarDays, Clock, MapPin, Search, Loader2, FileText, CheckCircle2, ShieldCheck, User, Award, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { getToken } from '@/app/actions/token';
import DashboardShell from '@/components/layouts/DashboardShell';

export default function DoctorSchedule() {
  const [doctor, setDoctor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

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
      } finally {
        setIsLoading(false);
      }
    }
    fetchDoc();
  }, []);

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
                  {daysOfWeek.map((day) => {
                    const slots = doctor.availability?.filter((slot: any) => slot.day === day) || [];
                    return (
                      <div key={day} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <span className="font-bold text-slate-700 w-32">{day}</span>
                        <div className="flex-1 flex flex-wrap gap-2">
                          {slots.length > 0 ? (
                            slots.map((slot: any, idx: number) => (
                              <span
                                key={idx}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                                  slot.isAvailable
                                    ? 'bg-teal-50 text-teal-700 border-teal-100'
                                    : 'bg-slate-50 text-slate-400 border-slate-100'
                                }`}
                              >
                                <Clock size={12} />
                                {slot.startTime} - {slot.endTime}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 font-medium italic">No shift hours assigned</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
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
