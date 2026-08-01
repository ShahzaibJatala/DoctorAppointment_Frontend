'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Search,
  Filter,
  CalendarCheck,
  Bell,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import DashboardShell from '@/components/layouts/DashboardShell';
import { getToken } from '@/app/actions/token';
import Image from 'next/image';
import Link from 'next/link';
import VideoConsultationRoom from '@/components/video/VideoConsultationRoom';

// --- Types ---
type AppointmentStatus = 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled' | 'checked-in' | 'in-progress' | 'Upcoming';
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
  videoConsultationMethod?: 'platform' | 'whatsapp';
  videoCallStatus?: string;
  videoRecordingUrl?: string;
  location?: string; // Optional for In-Clinic
}

interface AppointmentApiResponse {
  id?: string;
  _id?: string;
  doctorName?: string;
  specialty?: string;
  avatar?: string;
  date: string;
  time: string;
  type?: string;
  status?: AppointmentStatus;
  videoConsultationMethod?: 'platform' | 'whatsapp';
  videoCallStatus?: string;
  videoRecordingUrl?: string;
  location?: string;
}

// --- Components ---

const StatusBadge = ({ status }: { status: AppointmentStatus }) => {
  const statusLower = status?.toLowerCase();
  const normalizedStatus = 
    statusLower === 'upcoming' || statusLower === 'pending' ? 'Pending' :
    statusLower === 'checked-in' || statusLower === 'in-progress' || statusLower === 'confirmed' ? 'Confirmed' :
    statusLower === 'completed' ? 'Completed' :
    'Cancelled';

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

  const Icon = icons[normalizedStatus as 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${styles[normalizedStatus as 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled']}`}>
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
      You don&apos;t have any appointments in this category yet.
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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      if (!token) return;
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
      const res = await fetch(`${serverUrl}/patient/my-appointments`, {
        headers: {
          'Authorization': `Bearer ${token.replace(/"/g, '').trim()}`,
        }
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((item: AppointmentApiResponse) => ({
          id: item.id || item._id,
          doctorName: item.doctorName || 'Doctor',
          specialty: item.specialty || 'Specialist',
          avatar: item.avatar,
          date: new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
          time: new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: ['online', 'video'].includes(item.type?.toLowerCase() || '') ? 'Video' : 'In-Clinic',
          status: item.status || 'Pending',
          location: item.location || 'Clinic Cabin',
          videoConsultationMethod: item.videoConsultationMethod,
          videoCallStatus: item.videoCallStatus,
          videoRecordingUrl: item.videoRecordingUrl,
        }));
        setAppointments(mapped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function verifyPayments() {
      const params = new URLSearchParams(window.location.search);
      const statusParam = params.get('status');
      const sessionId = params.get('session_id');
      const mockJc = params.get('mock_jc');
      const mockEp = params.get('mock_ep');

      if (statusParam === 'success') {
        try {
          const token = await getToken();
          if (!token) return;
          const cleanToken = token.replace(/"/g, '').trim();
          const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

          if (sessionId) {
            // Verify Stripe Session
            const res = await fetch(`${serverUrl}/payment/verify-checkout-session/${sessionId}`, {
              headers: {
                'Authorization': `Bearer ${cleanToken}`,
              }
            });
            if (res.ok) {
              alert('Stripe card payment verified and slot booked successfully!');
              window.history.replaceState({}, document.title, window.location.pathname);
              await fetchAppointments();
            } else {
              const errData = await res.json();
              alert(`Payment verification failed: ${errData.error || 'Unknown error'}`);
            }
          } else if (mockJc) {
            // Verify Mock JazzCash
            const res = await fetch(`${serverUrl}/payment/jazzcash/verify-mock`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${cleanToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ description: decodeURIComponent(mockJc) })
            });
            if (res.ok) {
              alert('JazzCash payment completed and slot booked successfully!');
              window.history.replaceState({}, document.title, window.location.pathname);
              await fetchAppointments();
            }
          } else if (mockEp) {
            // Verify Mock EasyPaisa
            const res = await fetch(`${serverUrl}/payment/easypaisa/verify-mock`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${cleanToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ description: decodeURIComponent(mockEp) })
            });
            if (res.ok) {
              alert('EasyPaisa payment completed and slot booked successfully!');
              window.history.replaceState({}, document.title, window.location.pathname);
              await fetchAppointments();
            }
          }
        } catch (err) {
          console.error('Payment verification error:', err);
        }
      } else if (statusParam === 'cancelled') {
        alert('Payment was cancelled or failed.');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    verifyPayments();
    fetchAppointments();
  }, []);

  // Filter Logic
  const filteredAppointments = appointments.filter(apt => {
    const statusLower = apt.status?.toLowerCase();
    const matchesTab = 
      activeTab === 'Upcoming' ? (statusLower === 'confirmed' || statusLower === 'pending' || statusLower === 'checked-in' || statusLower === 'in-progress' || statusLower === 'upcoming') :
      activeTab === 'Completed' ? statusLower === 'completed' :
      statusLower === 'cancelled';
    
    const matchesSearch = apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          apt.specialty.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <DashboardShell role="patient" activeHref="/patient/appointments">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold text-slate-800">My Appointments</h1>


          <div className="flex items-center gap-4">
            <button className="relative p-2.5 rounded-xl hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-100">
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <Image 
              src={""} 
              alt="Profile" 
              width={40} 
              height={40} 
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
                <h4 className="font-bold text-[#16BCC8] text-sm">Don&apos;t forget!</h4>
                <p className="text-slate-500 text-xs mt-1">
                  Your next appointment is with {filteredAppointments[0].doctorName} on {filteredAppointments[0].date} at {filteredAppointments[0].time}.
                </p>
              </div>
            </div>
          )}

          {/* Appointments List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="h-8 w-8 border-2 border-teal-600/30 border-t-teal-600 rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-medium text-sm">Loading appointments...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
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
                        {['confirmed', 'pending', 'checked-in', 'in-progress', 'upcoming'].includes(apt.status.toLowerCase()) ? (
                          <>
                            {apt.type === 'Video' && apt.videoConsultationMethod !== 'whatsapp' && (
                              <VideoConsultationRoom appointmentId={apt.id} role="patient" otherPartyName={apt.doctorName} consultationMethod={apt.videoConsultationMethod} compact />
                            )}
                            <Link
                              href={`/patient/appointments/${apt.id}`}
                              className="px-4 py-2 bg-gradient-to-r from-[#16BCC8] to-[#0ea5a9] text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-sm hover:shadow-[0_2px_12px_rgba(22,188,200,0.3)]"
                            >
                              View Details
                            </Link>
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
    </DashboardShell>
  );
}
