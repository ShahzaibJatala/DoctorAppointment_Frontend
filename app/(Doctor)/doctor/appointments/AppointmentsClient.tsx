'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar, Search, Clock, MapPin, Video,
  CheckCircle, XCircle, LayoutDashboard, Users, Star, Settings,
  Menu, FileText, X, Loader2, Pill
} from 'lucide-react';
import axios from "axios";
import { getToken } from "@/app/actions/token";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setAppointmentStatus as setReduxStatus, AppointmentStatus as ReduxStatus } from "@/lib/redux/features/appointment/appointmentSlice";
import DashboardShell from '@/components/layouts/DashboardShell';

// --- Types ---
type AppointmentStatus = ReduxStatus;
type AppointmentType = 'In-Clinic' | 'Video';

interface Appointment {
  id: string;
  patientName: string;
  age: number | string;
  gender: string;
  avatar: string;
  date: string;
  time: string;
  type: AppointmentType;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
  phone?: string;
  prescription?: string;
}

// --- Props ---
interface AppointmentsClientProps {
  specialization: string; // ← passed as prop from the Server Component
}

// --- Helper Components ---
const StatusBadge = ({ status }: { status: AppointmentStatus }) => {
  const styles = {
    Upcoming: 'bg-blue-50 text-blue-700 border-blue-200',
    Completed: 'bg-green-50 text-green-700 border-green-200',
    Cancelled: 'bg-red-50 text-red-700 border-red-200',
    'No-Show': 'bg-slate-100 text-slate-600 border-slate-200'
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status}
    </span>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
      <Calendar className="w-8 h-8 text-slate-300" />
    </div>
    <h3 className="text-lg font-bold text-slate-800">No appointments found</h3>
    <p className="text-slate-500 text-sm max-w-xs mt-1">
      Try adjusting your filters or select a different date range.
    </p>
  </div>
);

// --- Time Formatting Helpers ---
const formatTime = (isoString: string) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (isoString: string) => {
  if (!isoString) return 'TBD';
  return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

// --- localStorage Persistence Helpers ---
const LS_KEY = 'appointment_overrides';

type AppointmentOverride = {
  status?: AppointmentStatus;
  prescription?: string;
};

const getOverrides = (): Record<string, AppointmentOverride> => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  } catch {
    return {};
  }
};

const saveOverride = (id: string, data: AppointmentOverride) => {
  const overrides = getOverrides();
  overrides[id] = { ...overrides[id], ...data };
  localStorage.setItem(LS_KEY, JSON.stringify(overrides));
};

// --- Main Client Component ---
export default function AppointmentsClient({ specialization }: AppointmentsClientProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'All' | 'Upcoming' | 'Completed' | 'Cancelled'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [prescriptionText, setPrescriptionText] = useState('');
  const [reasonText, setReasonText] = useState(''); // ← editable reason field

  const dispatch = useAppDispatch();
  const reduxStatus = useAppSelector((state) => state.appointment.status);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();

        if (!token) {
          console.error("No token found, skipping fetch.");
          setIsLoading(false);
          return;
        }

        const cleanToken = token.replace(/"/g, '').trim();

        const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/doctor/getPatients`, {
          headers: {
            'Authorization': `Bearer ${cleanToken}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });

        if (!response.data) throw new Error('No data received from server');

        // Map Backend Data — use specialization as fallback reason when reasonForVisit is empty
        const mappedData: Appointment[] = response.data.map((patient: any) => ({
          id: patient._id,
          patientName: patient.name || patient.email.split('@')[0],
          age: patient.age || 'N/A',
          gender: patient.gender || 'Unspecified',
          avatar: patient.profilePictureUrl || `https://ui-avatars.com/api/?name=${patient.name || 'P'}&background=0D8ABC&color=fff`,
          date: formatDate(patient.startTime),
          time: `${formatTime(patient.startTime)} - ${formatTime(patient.endTime)}`,
          type: 'In-Clinic',
          // ← KEY: use reasonForVisit from backend, fallback to doctor's specialization
          reason: patient.reasonForVisit || specialization,
          status: patient.appointmentStatus || 'Upcoming',
          phone: patient.phone || 'No phone provided',
          prescription: patient.prescription || ''
        }));

        // Merge any locally saved status/prescription overrides on top of backend data
        const overrides = getOverrides();
        const mergedData = mappedData.map((apt) =>
          overrides[apt.id]
            ? { ...apt, ...overrides[apt.id] }
            : apt
        );

        setAppointments(mergedData);

      } catch (error) {
        console.error('Error in useEffect:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [specialization]);

  // Sync modal fields when modal opens
  useEffect(() => {
    if (selectedAppointment) {
      setPrescriptionText(selectedAppointment.prescription || '');
      setReasonText(selectedAppointment.reason || '');   // ← sync reason
      dispatch(setReduxStatus(selectedAppointment.status));
    }
  }, [selectedAppointment, dispatch]);

  // --- Handlers ---
  const handleUpdateStatus = async (id: string, newStatus: AppointmentStatus) => {
    saveOverride(id, { status: newStatus });
    setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: newStatus } : apt));
    if (selectedAppointment) {
      setSelectedAppointment({ ...selectedAppointment, status: newStatus });
      dispatch(setReduxStatus(newStatus));
    }
  };

  const handleSavePrescription = async () => {
    if (!selectedAppointment) return;

    try {
      const token = await getToken();
      if (!token) throw new Error("No authentication token found");
      const cleanToken = token.replace(/"/g, '').trim();

      const payload = {
        appointmentDate: new Date().toISOString(),
        prescription: prescriptionText,
        reasonForVisit: reasonText,          // ← use the editable reason state
        appointmentStatus: selectedAppointment.status
      };

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/patient/savePrescription/${selectedAppointment.id}`,
        { ...payload, appointmentStatus: reduxStatus },
        {
          headers: {
            'Authorization': `Bearer ${cleanToken}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      saveOverride(selectedAppointment.id, { prescription: prescriptionText });
      // Also update reason in the local list so the table reflects the new value
      setAppointments(prev => prev.map(apt =>
        apt.id === selectedAppointment.id
          ? { ...apt, prescription: prescriptionText, reason: reasonText }
          : apt
      ));

      console.log("Prescription saved successfully!", response.data);
      setSelectedAppointment(null);

    } catch (error: any) {
      console.log("Detailed Error:", error.response?.data);
      console.error("Failed to save prescription", error);
      alert("Failed to save the prescription. Please try again.");
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesTab = activeTab === 'All' ? true : apt.status === activeTab;
    const matchesSearch = apt.patientName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <DashboardShell role="doctor" activeHref="/doctor/appointments" sidebarWidth="narrow" showHealthTip={false}>
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-slate-200 px-4 sm:px-6 py-4">
          <h1 className="text-lg sm:text-xl font-bold text-slate-800">Appointments Manager</h1>
          <p className="text-xs text-teal-600 font-medium mt-0.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
            {specialization}
          </p>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">

          {/* Controls */}
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex overflow-x-auto bg-slate-100 p-1 rounded-lg self-start scrollbar-hide w-full md:w-auto">
              {(['All', 'Upcoming', 'Completed', 'Cancelled'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                    activeTab === tab ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search patient name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-[400px]">
                <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading appointments...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {/* --- MOBILE VIEW (CARDS) --- */}
                <div className="md:hidden divide-y divide-slate-100">
                  {filteredAppointments.map((apt) => (
                    <div key={apt.id} className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <img src={apt.avatar} alt="" className="w-12 h-12 rounded-full object-cover border border-slate-100 bg-slate-100" />
                          <div>
                            <p className="font-bold text-slate-800">{apt.patientName}</p>
                            <p className="text-xs text-slate-500">{apt.age}y, {apt.gender}</p>
                          </div>
                        </div>
                        <StatusBadge status={apt.status} />
                      </div>

                      <div className="bg-slate-50 p-3 rounded-lg flex flex-col gap-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar size={14} className="text-teal-500"/> {apt.date}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock size={14} className="text-teal-500"/> {apt.time}
                        </div>
                        {/* Show reason on mobile too */}
                        <div className="flex items-center gap-2 text-teal-600 font-medium">
                          <span className="text-xs">{apt.reason}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedAppointment(apt)}
                        className="w-full py-2 bg-teal-50 text-teal-700 font-medium rounded-lg text-sm"
                      >
                        Manage Appointment
                      </button>
                    </div>
                  ))}
                </div>

                {/* --- DESKTOP VIEW (TABLE) --- */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Patient</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAppointments.map((apt) => (
                        <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={apt.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-100 bg-slate-100" />
                              <div>
                                <p className="font-bold text-slate-800 text-sm">{apt.patientName}</p>
                                <p className="text-xs text-slate-500">{apt.age}y, {apt.gender}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-700">{apt.date}</span>
                              <span className="text-xs text-slate-500">{apt.time}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              {apt.type === 'Video' ? <Video size={16} className="text-blue-500" /> : <MapPin size={16} className="text-teal-500" />}
                              {apt.type}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {/* ← specialization shows here when reasonForVisit is empty */}
                            <span className="text-sm text-slate-700 font-medium">{apt.reason}</span>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={apt.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setSelectedAppointment(apt)}
                              className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            >
                              <FileText size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

      {/* --- MODAL --- */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fade-up relative">

            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <img src={selectedAppointment.avatar} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedAppointment.patientName}</h2>
                  <p className="text-sm text-slate-500">{selectedAppointment.age}y • {selectedAppointment.gender} • {selectedAppointment.phone}</p>
                  {/* Show reason in modal header too */}
                  <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">
                    {selectedAppointment.reason}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedAppointment(null)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

              {/* Info Grid — Time | Status | Reason (editable) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Time */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Time</p>
                  <p className="font-medium text-slate-800">{selectedAppointment.date}</p>
                  <p className="text-sm text-slate-500">{selectedAppointment.time}</p>
                </div>

                {/* Status */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                  <div className="mt-1"><StatusBadge status={selectedAppointment.status} /></div>
                </div>

                {/* Reason (editable input) */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Reason for Visit</p>
                  <input
                    value={reasonText}
                    onChange={(e) => setReasonText(e.target.value)}
                    placeholder="e.g. Cardiology"
                    className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 font-medium focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all"
                  />
                </div>
              </div>

              {/* Prescription */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Pill size={16} className="text-teal-600"/> Write Prescription / Notes
                </h3>
                <textarea
                  value={prescriptionText}
                  onChange={(e) => setPrescriptionText(e.target.value)}
                  placeholder="Type medicines, dosages, and medical notes here..."
                  className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all resize-y"
                />
              </div>

              {/* Status Actions */}
              {selectedAppointment.status === 'Upcoming' && (
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Quick Actions</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleUpdateStatus(selectedAppointment.id, 'Completed')}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-50 text-green-700 hover:bg-green-100 font-semibold rounded-xl transition-colors"
                    >
                      <CheckCircle size={18} /> Mark as Completed
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedAppointment.id, 'Cancelled')}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 font-semibold rounded-xl transition-colors"
                    >
                      <XCircle size={18} /> Cancel Appointment
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleSavePrescription}
                className="px-5 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm"
              >
                Save File
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
