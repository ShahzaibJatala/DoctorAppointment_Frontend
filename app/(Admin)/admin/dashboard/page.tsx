'use client';

import React, { useEffect, useState } from 'react';
import { 
  Stethoscope, 
  Users, 
  CalendarCheck, 
  Star, 
  Search, 
  Bell, 
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import DashboardShell from '@/components/layouts/DashboardShell';
import { getToken } from '@/app/actions/token';

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

  const Icon = icons[status] || Clock;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${styles[status]}`}>
      <Icon size={12} />
      {status}
    </span>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { label: 'Total Doctors', value: '...', icon: Stethoscope, trend: '+0%', color: 'text-[#16BCC8]', bg: 'bg-[#16BCC8]/8' },
    { label: 'Total Patients', value: '...', icon: Users, trend: '+0%', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Appointments', value: '...', icon: CalendarCheck, trend: '+0%', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Avg. Rating', value: '4.9', icon: Star, trend: '+0.0', color: 'text-[#F59F0A]', bg: 'bg-amber-50' },
  ]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [topDoctors, setTopDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const token = await getToken();
        if (!token) return;
        const cleanToken = token.replace(/"/g, '').trim();
        const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

        // Fetch stats
        const statsRes = await axios.get(`${serverUrl}/admin/stats`, {
          headers: { Authorization: `Bearer ${cleanToken}` }
        });
        if (statsRes.data) {
          setStats([
            { label: 'Total Doctors', value: statsRes.data.totalDoctors.toString(), icon: Stethoscope, trend: '+10%', color: 'text-[#16BCC8]', bg: 'bg-[#16BCC8]/8' },
            { label: 'Total Patients', value: statsRes.data.totalPatients.toString(), icon: Users, trend: '+5%', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Total Appointments', value: statsRes.data.totalAppointments.toString(), icon: CalendarCheck, trend: '+15%', color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Avg. Rating', value: statsRes.data.avgRating.toString(), icon: Star, trend: '+0.1', color: 'text-[#F59F0A]', bg: 'bg-amber-50' },
          ]);
        }

        // Fetch recent appointments
        const apptsRes = await axios.get(`${serverUrl}/admin/appointments`, {
          headers: { Authorization: `Bearer ${cleanToken}` }
        });
        if (apptsRes.data) {
          setAppointments(apptsRes.data);
        }

        // Fetch doctors list for top doctors
        const docsRes = await axios.get(`${serverUrl}/admin/doctors`, {
          headers: { Authorization: `Bearer ${cleanToken}` }
        });
        if (docsRes.data) {
          const sorted = docsRes.data
            .map((d: any) => ({
              id: d.id,
              name: d.name,
              specialty: d.specialty,
              rating: d.rating || 4.9,
              reviews: d.reviews || 10,
              image: d.avatar
            }))
            .slice(0, 4);
          setTopDoctors(sorted);
        }

      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <DashboardShell role="admin" activeHref="/admin/dashboard" sidebarWidth="narrow" showHealthTip={false}>
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Admin Dashboard</h1>

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
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[350px]">
              <Loader2 className="w-8 h-8 text-[#16BCC8] animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Loading system metrics...</p>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((stat, index) => (
                  <div key={index} className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300 animate-fade-up`}>
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
                      <span className={`font-semibold text-[#20AC6B]`}>
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
                    <Link href="/admin/doctors" className="text-sm text-[#16BCC8] font-semibold hover:text-[#0ea5a9] transition-colors duration-200 flex items-center gap-1">
                      View All <ArrowRight size={14} />
                    </Link>
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
                        {appointments.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                              No recent appointments found.
                            </td>
                          </tr>
                        ) : appointments.map((apt) => (
                          <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img src={apt.avatar} alt="" className="w-9 h-9 rounded-xl border border-slate-100 object-cover" />
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
                    {topDoctors.length === 0 ? (
                      <p className="text-sm text-slate-500 italic text-center py-6">No active doctors registered yet.</p>
                    ) : topDoctors.map((doc) => (
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
                    <Link href="/admin/doctors" className="text-sm text-[#16BCC8] font-semibold hover:text-[#0ea5a9] transition-colors duration-200">
                      View All Doctors
                    </Link>
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
    </DashboardShell>
  );
}