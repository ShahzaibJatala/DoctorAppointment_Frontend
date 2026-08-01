'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Search, Clock, MapPin, Video, CheckCircle, XCircle, Users, Star, Settings, Menu, FileText, X, Loader2, Pill, ShieldCheck, ArrowRight, Activity, Award } from 'lucide-react';
import axios from 'axios';
import { getToken } from '@/app/actions/token';
import DashboardShell from '@/components/layouts/DashboardShell';

interface PatientQueueItem {
  appointmentId: string;
  name?: string;
  email: string;
  age?: number;
  gender?: string;
  patientName?: string;
  patientAge?: number;
  patientPhone?: string;
  patientGender?: string;
  avatar?: string;
  startTime: string;
  endTime: string;
  appointmentType: 'Clinic' | 'Online';
  paymentMethod: 'card' | 'cash' | 'easypaisa' | 'jazzcash' | 'bank_transfer';
  status: 'pending' | 'confirmed' | 'cancelled' | 'checked-in' | 'in-progress' | 'Completed' | 'completed';
  tokenNumber?: number;
  mobileWalletNumber?: string;
  bankTransferReceiptUrl?: string;
}

export default function CompounderDashboard() {
  const [queue, setQueue] = useState<PatientQueueItem[]>([]);
  const [doctor, setDoctor] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [invitations, setInvitations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  const fetchQueueData = async (requestedDoctorId?: string) => {
    try {
      const token = await getToken();
      if (!token) return;
      const cleanToken = token.replace(/"/g, '').trim();

      const [doctorsResponse, invitationsResponse] = await Promise.all([
        axios.get(`${serverUrl}/compounder/doctors`, {
          headers: { Authorization: `Bearer ${cleanToken}` },
        }),
        axios.get(`${serverUrl}/compounder/invitations`, {
          headers: { Authorization: `Bearer ${cleanToken}` },
        }),
      ]);
      const linkedDoctors = doctorsResponse.data || [];
      setDoctors(linkedDoctors);
      setInvitations(invitationsResponse.data || []);
      const storedDoctorId = typeof window !== 'undefined' ? localStorage.getItem('compounderDoctorId') : '';
      const activeDoctorId = requestedDoctorId || selectedDoctorId || storedDoctorId || linkedDoctors[0]?._id || '';
      const activeDoctor = linkedDoctors.find((item: any) => item._id === activeDoctorId) || linkedDoctors[0] || null;
      setDoctor(activeDoctor);
      setSelectedDoctorId(activeDoctor?._id || '');
      if (activeDoctor?._id && typeof window !== 'undefined') localStorage.setItem('compounderDoctorId', activeDoctor._id);
      if (!activeDoctor?._id) {
        setQueue([]);
        return;
      }
      const queueResponse = await axios.get(`${serverUrl}/compounder/queue`, {
        params: { doctorId: activeDoctor._id },
        headers: { Authorization: `Bearer ${cleanToken}` },
      });
      setQueue(queueResponse.data);
    } catch (error) {
      console.error('Error fetching compounder queue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueData();
  }, []);

  const respondToInvitation = async (invitationId: string, accept: boolean) => {
    try {
      const token = await getToken();
      await axios.post(
        `${serverUrl}/compounder/invitations/${invitationId}/respond`,
        { accept },
        {
          headers: {
            Authorization: `Bearer ${String(token || '')
              .replace(/"/g, '')
              .trim()}`,
          },
        },
      );
      await fetchQueueData();
    } catch (error) {
      console.error(error);
    }
  };

  const selectDoctor = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    if (typeof window !== 'undefined') localStorage.setItem('compounderDoctorId', doctorId);
    setIsLoading(true);
    fetchQueueData(doctorId);
  };

  const handleCheckIn = async (appointmentId: string) => {
    setIsProcessing(appointmentId);

    try {
      const token = await getToken();
      if (!token) return;
      const cleanToken = token.replace(/"/g, '').trim();

      await axios.post(
        `${serverUrl}/compounder/check-in/${appointmentId}`,
        {},
        {
          params: { doctorId: selectedDoctorId },
          headers: { Authorization: `Bearer ${cleanToken}` },
        },
      );
      await fetchQueueData(); // Refresh list to get new token and status
    } catch (err) {
      console.error(err);
      alert('Failed to check in patient');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    setIsProcessing(appointmentId);
    try {
      const token = await getToken();
      if (!token) return;
      const cleanToken = token.replace(/"/g, '').trim();

      await axios.post(
        `${serverUrl}/doctor/updateStatus/${appointmentId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${cleanToken}` },
        },
      );
      await fetchQueueData(); // Refresh queue
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    } finally {
      setIsProcessing(null);
    }
  };

  const filteredQueue = queue.filter((item) => {
    const pName = item.patientName || item.name || item.email.split('@')[0] || '';
    return pName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalPatients = queue.length;
  const waitingPatients = queue.filter((i) => i.status === 'confirmed').length;
  const checkedInPatients = queue.filter((i) => i.status === 'checked-in').length;
  const completedPatients = queue.filter((i) => i.status === 'Completed' || i.status === 'completed').length;

  return (
    <DashboardShell role="compounder" activeHref="/compounder/dashboard" showHealthTip={false}>
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Clinic Queue Desk 📋</h1>
          {doctor && (
            <p className="text-sm text-teal-600 font-medium mt-1 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block"></span>
              Assigned Doctor: {doctor.fullName} ({doctor.specialization})
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full bg-slate-50 border border-transparent rounded-xl text-sm focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all duration-200"
            />
          </div>
        </div>
        {doctors.length > 0 && (
          <select
            value={selectedDoctorId}
            onChange={(event) => selectDoctor(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-teal-500"
          >
            {doctors.map((item) => (
              <option key={item._id} value={item._id}>
                {item.fullName} · {item.clinicName || 'Clinic'}
              </option>
            ))}
          </select>
        )}
      </header>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-40">
          <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Loading clinic queue details...</p>
        </div>
      ) : (
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-up">
          {invitations.length > 0 && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h2 className="font-bold text-amber-900">Doctor Invitations</h2>
              <div className="mt-3 space-y-3">
                {invitations.map((invitation) => (
                  <div key={invitation.invitationId} className="flex flex-col gap-3 rounded-xl bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{invitation.doctor?.fullName || 'Doctor'}</p>
                      <p className="text-xs text-slate-500">
                        {invitation.doctor?.clinicName || 'Clinic'} · {invitation.doctor?.specialization || ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => respondToInvitation(invitation.invitationId, false)} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
                        Decline
                      </button>
                      <button onClick={() => respondToInvitation(invitation.invitationId, true)} className="rounded-lg bg-teal-600 px-3 py-2 text-xs font-bold text-white">
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Daily Stats Grid */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                label: "Today's Bookings",
                value: totalPatients,
                icon: Users,
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                label: 'Awaiting Check-in',
                value: waitingPatients,
                icon: Clock,
                color: 'text-amber-500',
                bg: 'bg-amber-50',
              },
              {
                label: 'Checked In / Waiting Room',
                value: checkedInPatients,
                icon: Activity,
                color: 'text-teal-600',
                bg: 'bg-teal-50',
              },
              {
                label: 'Visits Finished',
                value: completedPatients,
                icon: CheckCircle,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
              },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold text-slate-800">{stat.value}</h3>
                <p className="text-slate-400 text-sm mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </section>

          {/* Queue Desk Table */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">Patients Check-In Registry</h2>
              <span className="text-xs font-semibold px-3 py-1 bg-teal-50 text-teal-700 rounded-full border border-teal-100">Live Desk</span>
            </div>

            {filteredQueue.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                  <Users size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-700">Empty Queue Desk</h3>
                <p className="text-sm text-slate-400 max-w-sm mt-1">There are no appointments registered for today matching your search.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Token</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Schedule Time</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Method</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Desk Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredQueue.map((item) => {
                      const patientName = item.patientName || item.name || item.email.split('@')[0] || 'Patient';
                      const pfp = item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(patientName)}&background=0D8ABC&color=fff`;

                      return (
                        <tr key={item.appointmentId} className="hover:bg-slate-50/50 transition-colors">
                          {/* Token number */}
                          <td className="px-6 py-4">
                            {item.tokenNumber ? (
                              <span className="w-9 h-9 rounded-xl bg-teal-600 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">#{item.tokenNumber}</span>
                            ) : (
                              <span className="text-xs text-slate-400 font-semibold italic">Unissued</span>
                            )}
                          </td>

                          {/* Patient profile */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={pfp} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-100" />
                              <div>
                                <p className="font-bold text-slate-800 text-sm">{patientName}</p>
                                <p className="text-xs text-slate-500">
                                  {item.patientAge || item.age || 'N/A'}y · {item.patientGender || item.gender || 'Unspecified'}
                                </p>
                                <p className="text-xs text-slate-400">{item.patientPhone || 'No phone provided'}</p>
                              </div>
                            </div>
                          </td>

                          {/* Time */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-slate-700">{new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <span className="text-xs text-slate-400">30 mins visit</span>
                            </div>
                          </td>

                          {/* Type */}
                          <td className="px-6 py-4">
                            <span className="flex items-center gap-1.5 text-sm text-slate-600">
                              {item.appointmentType === 'Online' ? <Video size={16} className="text-blue-500" /> : <MapPin size={16} className="text-teal-500" />}
                              {item.appointmentType}
                            </span>
                          </td>

                          {/* Payment */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-xs uppercase font-bold text-slate-600 tracking-wider">{item.paymentMethod}</span>
                              {item.mobileWalletNumber && <span className="text-[10px] font-mono text-slate-400 mt-0.5">No: {item.mobileWalletNumber}</span>}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                item.status === 'checked-in'
                                  ? 'bg-teal-50 text-teal-700 border-teal-200'
                                  : item.status === 'in-progress'
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                    : item.status === 'Completed' || item.status === 'completed'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : item.status === 'cancelled'
                                        ? 'bg-red-50 text-red-700 border-red-200'
                                        : 'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex gap-2 justify-end">
                              {/* 1. Check in button */}
                              {item.status === 'confirmed' && (
                                <button
                                  onClick={() => handleCheckIn(item.appointmentId)}
                                  disabled={isProcessing === item.appointmentId}
                                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-sm flex items-center gap-1 disabled:opacity-60"
                                >
                                  {isProcessing === item.appointmentId ? <Loader2 size={12} className="animate-spin" /> : null}
                                  Check In
                                </button>
                              )}

                              {/* 2. Start Visit button */}
                              {item.status === 'checked-in' && (
                                <button
                                  onClick={() => handleUpdateStatus(item.appointmentId, 'in-progress')}
                                  disabled={isProcessing === item.appointmentId}
                                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm flex items-center gap-1 disabled:opacity-60"
                                >
                                  {isProcessing === item.appointmentId ? <Loader2 size={12} className="animate-spin" /> : null}
                                  Start Visit
                                </button>
                              )}

                              {/* 3. Complete visit button */}
                              {item.status === 'in-progress' && (
                                <button
                                  onClick={() => handleUpdateStatus(item.appointmentId, 'Completed')}
                                  disabled={isProcessing === item.appointmentId}
                                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm flex items-center gap-1 disabled:opacity-60"
                                >
                                  {isProcessing === item.appointmentId ? <Loader2 size={12} className="animate-spin" /> : null}
                                  Complete
                                </button>
                              )}

                              {/* 4. Cancel button */}
                              {(item.status === 'confirmed' || item.status === 'checked-in') && (
                                <button
                                  onClick={() => handleUpdateStatus(item.appointmentId, 'cancelled')}
                                  disabled={isProcessing === item.appointmentId}
                                  className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  title="Cancel Slot"
                                >
                                  <XCircle size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
