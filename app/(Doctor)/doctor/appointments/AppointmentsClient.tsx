'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar, Search, Clock, MapPin, Video,
  CheckCircle, XCircle, LayoutDashboard, Users, Star, Settings,
  Menu, FileText, X, Loader2, Pill, UploadCloud, Download
} from 'lucide-react';
import axios from "axios";
import { getToken } from "@/app/actions/token";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setAppointmentStatus as setReduxStatus, AppointmentStatus as ReduxStatus } from "@/lib/redux/features/appointment/appointmentSlice";
import DashboardShell from '@/components/layouts/DashboardShell';
import { downloadPdf } from '@/lib/downloadPdf';

import VideoConsultationRoom from '@/components/video/VideoConsultationRoom';
// --- Types ---
type AppointmentStatus = ReduxStatus;
type AppointmentType = 'In-Clinic' | 'Video';

interface Appointment {
  id: string;
  patientUserId: string;
  patientDocId?: string;
  patientName: string;
  age: number | string;
  gender: string;
  avatar: string;
  date: string;
  startTime: string;
  time: string;
  type: AppointmentType;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
  phone?: string;
  prescription?: string;
  medicalRecords?: any[];
  paymentMethod?: string;
  bankTransferReceiptUrl?: string;
  videoConsultationMethod?: 'platform' | 'whatsapp';
  videoCallStatus?: string;
  videoRecordingUrl?: string;
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
  const [activeTab, setActiveTab] = useState<'All' | 'Today' | 'Upcoming' | 'Completed' | 'Cancelled'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Modal states
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [prescriptionText, setPrescriptionText] = useState('');
  const [reasonText, setReasonText] = useState(''); // ← editable reason field
  const [uploadedReports, setUploadedReports] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [showRecording, setShowRecording] = useState(false);
  const dispatch = useAppDispatch();
  const reduxStatus = useAppSelector((state) => state.appointment.status);

  const fetchAppointments = async () => {
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

      const mappedData: Appointment[] = response.data.map((patient: any) => {
        const statusLower = patient.status?.toLowerCase();
        const normalizedStatus: AppointmentStatus = 
          statusLower === 'confirmed' || statusLower === 'upcoming' || statusLower === 'pending' || statusLower === 'checked-in' || statusLower === 'in-progress'
            ? 'Upcoming' 
            : statusLower === 'completed'
            ? 'Completed'
            : statusLower === 'cancelled'
            ? 'Cancelled'
            : 'Upcoming';

        return {
          id: patient.appointmentId || patient._id,
          patientUserId: patient._id,
          patientName: patient.patientName || patient.name || patient.email.split('@')[0],
          age: patient.patientAge || patient.age || 'N/A',
          gender: patient.patientGender || patient.gender || 'Unspecified',
          avatar: patient.profilePictureUrl || `https://ui-avatars.com/api/?name=${patient.name || 'P'}&background=0D8ABC&color=fff`,
          date: formatDate(patient.startTime),
          startTime: patient.startTime,
          time: `${formatTime(patient.startTime)} - ${formatTime(patient.endTime)}`,
          type: ['video', 'online'].includes(String(patient.appointmentType || '').toLowerCase()) ? 'Video' : 'In-Clinic',
          reason: patient.reasonForVisit || specialization,
          status: normalizedStatus,
          phone: patient.patientPhone || patient.phoneNumber || patient.phone || 'No phone provided',
          prescription: patient.prescription || '',
          medicalRecords: patient.medicalRecords || [],
          patientDocId: patient.patientDocId,
          paymentMethod: patient.paymentMethod,
          bankTransferReceiptUrl: patient.bankTransferReceiptUrl,
          videoConsultationMethod: patient.videoConsultationMethod,
          videoCallStatus: patient.videoCallStatus,
          videoRecordingUrl: patient.videoRecordingUrl,
        };
      });

      // Merge any locally saved status/prescription overrides on top of backend data
      const overrides = getOverrides();
      const mergedData = mappedData.map((apt) =>
        overrides[apt.id]
          ? { ...apt, ...overrides[apt.id] }
          : apt
      );

      setAppointments(mergedData);

    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [specialization]);

  const handleUploadReport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const invalidFile = Array.from(files).find(file => file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf'));
    if (invalidFile) {
      alert('Only PDF report files are allowed.');
      e.target.value = '';
      return;
    }
    setIsUploading(true);

    try {
      const token = await getToken();
      if (!token) throw new Error("No token found");
      const cleanToken = token.replace(/"/g, '').trim();

      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);

        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/patient/upload-report-file`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${cleanToken}`,
              'Content-Type': 'multipart/form-data',
            }
          }
        );
        if (res.data?.url) {
          setUploadedReports(prev => [...prev, res.data.url]);
        }
      }
      alert('Report files uploaded and attached successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to upload PDF reports.');
    } finally {
      setIsUploading(false);
    }
  };

  // Sync modal fields when modal opens
  useEffect(() => {
    if (selectedAppointment) {
      // Find latest mapped record details in state to display up-to-date data
      const currentApt = appointments.find(a => a.id === selectedAppointment.id) || selectedAppointment;
      setPrescriptionText(currentApt.prescription || '');
      setReasonText(currentApt.reason || '');   // ← sync reason
      dispatch(setReduxStatus(currentApt.status));
      setUploadedReports([]);
    }
  }, [selectedAppointment, appointments, dispatch]);

  // --- Handlers ---
  const handleUpdateStatus = async (id: string, newStatus: AppointmentStatus) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("No token found");
      const cleanToken = token.replace(/"/g, '').trim();

      const dbStatus = newStatus === 'Upcoming' ? 'confirmed' : newStatus.toLowerCase();
      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/doctor/updateStatus/${id}`,
        { status: dbStatus },
        {
          headers: {
            'Authorization': `Bearer ${cleanToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      saveOverride(id, { status: newStatus });
      await fetchAppointments();
      if (selectedAppointment) {
        setSelectedAppointment(prev => prev ? { ...prev, status: newStatus } : null);
        dispatch(setReduxStatus(newStatus));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update status on backend.');
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
        appointmentStatus: selectedAppointment.status,
        reports: uploadedReports
      };

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/patient/savePrescription/${selectedAppointment.patientUserId}`,
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
      console.log("Prescription saved successfully!", response.data);
      
      await fetchAppointments();
      setSelectedAppointment(null);

    } catch (error: any) {
      console.log("Detailed Error:", error.response?.data);
      console.error("Failed to save prescription", error);
      alert("Failed to save the prescription. Please try again.");
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const appointmentDate = new Date(apt.startTime);
    const today = new Date();
    const isToday = appointmentDate.toDateString() === today.toDateString();
    const matchesTab = activeTab === 'All' ? true : activeTab === 'Today' ? isToday : apt.status === activeTab;
    const matchesSearch = apt.patientName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(filteredAppointments.length / PAGE_SIZE);
  const paginatedAppointments = filteredAppointments.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <DashboardShell role="doctor" activeHref="/doctor/appointments" showHealthTip={false}>
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
              {(['All', 'Today', 'Upcoming', 'Completed', 'Cancelled'] as const).map(tab => (
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
                  {paginatedAppointments.map((apt) => (
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
                      {paginatedAppointments.map((apt) => (
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

                {/* Pagination Footer */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
                     <span className="text-xs text-slate-500 font-medium">
                       Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, filteredAppointments.length)} of {filteredAppointments.length} appointments
                     </span>
                     <div className="flex gap-2">
                       <button
                         onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                         disabled={currentPage === 1}
                         className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
                       >
                         Previous
                       </button>
                       <span className="text-xs font-semibold text-slate-600 flex items-center px-1">
                         Page {currentPage} of {totalPages}
                       </span>
                       <button
                         onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                         disabled={currentPage === totalPages}
                         className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
                       >
                         Next
                       </button>
                     </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      {/* --- MODAL --- */}
      {selectedAppointment && (() => {
        // Resolve latest data from state
        const currentApt = appointments.find(a => a.id === selectedAppointment.id) || selectedAppointment;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fade-up relative">

              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <img src={currentApt.avatar} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{currentApt.patientName}</h2>
                    <p className="text-sm text-slate-500">{currentApt.age}y • {currentApt.gender} • {currentApt.phone}</p>
                    <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">
                      {currentApt.reason}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedAppointment(null)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100">
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

                {/* Info Grid — Time | Status | Reason */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Time</p>
                    <p className="font-medium text-slate-800">{currentApt.date}</p>
                    <p className="text-sm text-slate-500">{currentApt.time}</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                    <div className="mt-1"><StatusBadge status={currentApt.status} /></div>
                  </div>

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

                {/* Bank Transfer Receipt */}
                {currentApt.type === 'Video' && (
                  <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Patient's selected video method</p>
                    <p className="mt-1 font-bold text-slate-800">{currentApt.videoConsultationMethod === 'whatsapp' ? 'WhatsApp Video Call' : 'Video on this platform'}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {currentApt.videoConsultationMethod === 'whatsapp' ? (
                        <a href={`https://wa.me/92${String(currentApt.phone || '').replace(/\D/g, '').replace(/^0/, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">
                          Contact on WhatsApp
                        </a>
                      ) : (
                        <VideoConsultationRoom appointmentId={currentApt.id} role="doctor" otherPartyName={currentApt.patientName} consultationMethod={currentApt.videoConsultationMethod} />
                      )}
                      {currentApt.videoRecordingUrl && (
                        <button onClick={() => setShowRecording(value => !value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700">
                          {showRecording ? 'Hide Consultation Video' : 'Video Consultation Booking'}
                        </button>
                      )}
                    </div>
                    {showRecording && currentApt.videoRecordingUrl && (
                      <video controls preload="metadata" className="mt-4 max-h-80 w-full rounded-xl bg-black">
                        <source src={currentApt.videoRecordingUrl} />
                      </video>
                    )}
                    <p className="mt-3 text-xs text-slate-500">Patient: {currentApt.patientName} · {currentApt.age} years · {currentApt.gender} · {currentApt.phone}</p>
                  </div>
                )}

                {currentApt.paymentMethod === 'bank_transfer' && (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Download size={16} className="text-blue-600" /> Bank Transfer Receipt
                    </h3>
                    {currentApt.bankTransferReceiptUrl ? (
                      <div className="space-y-3">
                        <img
                          src={currentApt.bankTransferReceiptUrl}
                          alt="Bank transfer receipt"
                          className="w-full max-h-48 object-contain rounded-xl border border-blue-100 bg-white"
                        />
                        <a
                          href={currentApt.bankTransferReceiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
                        >
                          <Download size={14} /> View Full Receipt
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-amber-700">Receipt not yet uploaded by patient.</p>
                    )}
                  </div>
                )}

                {/* Prescription */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Pill size={16} className="text-teal-600"/> Write Prescription / Notes
                  </h3>
                  <textarea
                    value={prescriptionText}
                    onChange={(e) => setPrescriptionText(e.target.value)}
                    placeholder="Type medicines, dosages, and medical notes here..."
                    className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all resize-y animate-fade-up"
                  />
                </div>

                {/* Reports upload for Doctor */}
                <div className="space-y-3 pt-3 border-t border-slate-100 animate-fade-up">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <UploadCloud size={16} className="text-teal-600"/> Patient Report Vault (PDFs)
                  </h3>
                  
                  {/* Existing reports from this doctor's medical records */}
                  {currentApt.medicalRecords && currentApt.medicalRecords.length > 0 && (() => {
                    const allReports = currentApt.medicalRecords.flatMap((rec: any) => rec.reports || []);
                    return allReports.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saved Reports</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {allReports.map((url: string, uIdx: number) => (
                            <button
                              type="button"
                              key={uIdx}
                              onClick={() => void downloadPdf(url, `report-${uIdx + 1}.pdf`)}
                              className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-teal-50 hover:border-teal-200 transition-all group"
                            >
                              <div className="p-1.5 rounded-lg bg-rose-50 shrink-0">
                                <FileText size={14} className="text-rose-500" />
                              </div>
                              <span className="text-xs font-semibold text-slate-700 truncate flex-1">Report #{uIdx + 1}.pdf</span>
                              <span className="text-[10px] text-teal-600 font-bold group-hover:underline shrink-0">↓ Download</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* Newly uploaded in this session */}
                  {uploadedReports.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Just Uploaded (Session)</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {uploadedReports.map((url, uIdx) => (
                          <button
                            type="button"
                            key={uIdx}
                            onClick={() => void downloadPdf(url, `new-report-${uIdx + 1}.pdf`)}
                            className="flex items-center gap-2 p-3 rounded-xl border border-teal-100 bg-teal-50/50 group"
                          >
                            <FileText size={16} className="text-teal-500 shrink-0" />
                            <span className="text-xs font-semibold text-slate-700 truncate flex-1">New Report #{uIdx + 1}.pdf</span>
                            <span className="text-[10px] text-teal-600 font-bold group-hover:underline shrink-0">↓ Download</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-teal-500/30 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-all">
                    {isUploading ? (
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Loader2 size={16} className="animate-spin text-teal-600" />
                        <span>Uploading PDF documents...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center">
                        <UploadCloud size={20} className="text-teal-600 mb-1.5" />
                        <span className="text-xs font-bold text-slate-700">Attach PDF Patient Reports</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Click to choose one or more files to attach to this visit record</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      multiple 
                      disabled={isUploading}
                      onChange={handleUploadReport}
                      className="hidden" 
                    />
                  </label>
                </div>

                {/* Status Actions */}
                {currentApt.status === 'Upcoming' && (
                  <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-slate-800 mb-3">Quick Actions</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => handleUpdateStatus(currentApt.id, 'Completed')}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-50 text-green-700 hover:bg-green-100 font-semibold rounded-xl transition-colors"
                      >
                        <CheckCircle size={18} /> Mark as Completed
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(currentApt.id, 'Cancelled')}
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
        );
      })()}
    </DashboardShell>
  );
}
