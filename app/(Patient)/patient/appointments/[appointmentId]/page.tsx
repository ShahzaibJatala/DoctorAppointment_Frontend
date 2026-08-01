'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, CreditCard, MapPin, Phone, User, Video } from 'lucide-react';
import DashboardShell from '@/components/layouts/DashboardShell';
import { getToken } from '@/app/actions/token';

type AppointmentDetails = {
  id: string;
  doctorName?: string;
  specialty?: string;
  avatar?: string;
  date: string;
  time: string;
  endTime?: string;
  type?: string;
  status?: string;
  tokenNumber?: number;
  location?: string;
  clinicName?: string;
  clinicAddress?: string;
  doctorPhone?: string;
  paymentMethod?: string;
  mobileWalletNumber?: string;
  bankTransferReceiptUrl?: string;
  consultationFee?: number;
  videoConsultationFee?: number;
  patientName?: string;
  patientAge?: number;
  patientPhone?: string;
  patientGender?: string;

  videoConsultationMethod?: 'platform' | 'whatsapp';
  videoCallStatus?: string;
  videoRecordingUrl?: string;
};
export default function AppointmentDetailsPage() {
  const params = useParams();
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRecording, setShowRecording] = useState(false);

  useEffect(() => {
    async function loadAppointment() {
      try {
        const token = await getToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/patient/my-appointments`, {
          headers: { Authorization: `Bearer ${String(token || '').replace(/"/g, '').trim()}` },
        });
        if (!response.ok) throw new Error('Could not load appointment.');
        const appointments: AppointmentDetails[] = await response.json();
        setAppointment(appointments.find(item => item.id === params.appointmentId) || null);
      } finally {
        setLoading(false);
      }
    }
    loadAppointment();
  }, [params.appointmentId]);

  if (loading) {
    return <DashboardShell role="patient" activeHref="/patient/appointments"><div className="p-8 text-slate-500">Loading appointment details...</div></DashboardShell>;
  }

  if (!appointment) {
    return <DashboardShell role="patient" activeHref="/patient/appointments"><div className="p-8"><p className="mb-4 text-slate-600">Appointment not found.</p><Link href="/patient/appointments" className="text-teal-600">Back to appointments</Link></div></DashboardShell>;
  }

  const start = new Date(appointment.time || appointment.date);
  const end = appointment.endTime ? new Date(appointment.endTime) : null;
  const isVideo = ['video', 'online'].includes((appointment.type || '').toLowerCase());
  const fee = isVideo ? appointment.videoConsultationFee : appointment.consultationFee;
  const rows = [
    { label: 'Date', value: start.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), icon: Calendar },
    { label: 'Time', value: `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${end ? ` - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}`, icon: Clock },
    { label: 'Appointment Type', value: isVideo ? 'Video Consultation' : 'In-Clinic Visit', icon: isVideo ? Video : MapPin },
    { label: 'Clinic', value: isVideo ? 'Online video consultation' : (appointment.location || appointment.clinicName || 'Clinic'), icon: MapPin },
    { label: 'Doctor Phone', value: appointment.doctorPhone || 'Not provided', icon: Phone },
    { label: 'Payment', value: `${appointment.paymentMethod || 'Not provided'}${fee != null ? ` · PKR ${fee}` : ''}`, icon: CreditCard },
    ...(isVideo ? [{ label: 'Video Method', value: appointment.videoConsultationMethod === 'whatsapp' ? 'WhatsApp Video Call' : 'Video on this platform', icon: Video }] : []),
  ];

  return (
    <DashboardShell role="patient" activeHref="/patient/appointments">
      <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        <Link href="/patient/appointments" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-teal-600">
          <ArrowLeft size={17} /> Back to appointments
        </Link>
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white sm:p-8">
            <p className="text-sm text-teal-100">Appointment with</p>
            <h1 className="mt-1 text-2xl font-extrabold">{appointment.doctorName}</h1>
            <p className="mt-1 text-teal-100">{appointment.specialty}</p>
            <span className="mt-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-bold">{appointment.status}</span>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-8">
            {rows.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <Icon className="mt-0.5 text-teal-600" size={19} />
                <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 font-semibold capitalize text-slate-800">{value}</p></div>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 p-5 sm:p-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800"><User size={20} className="text-teal-600" /> Patient Details</h2>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <p><span className="text-slate-400">Name:</span> <b>{appointment.patientName || 'Not provided'}</b></p>
              <p><span className="text-slate-400">Age:</span> <b>{appointment.patientAge || 'Not provided'}</b></p>
              <p><span className="text-slate-400">Phone:</span> <b>{appointment.patientPhone || 'Not provided'}</b></p>
              <p><span className="text-slate-400">Gender:</span> <b>{appointment.patientGender || 'Not provided'}</b></p>
              {appointment.tokenNumber && <p><span className="text-slate-400">Token:</span> <b>#{appointment.tokenNumber}</b></p>}
            </div>
            {appointment.bankTransferReceiptUrl && (
              <a href={appointment.bankTransferReceiptUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex text-sm font-bold text-teal-600 hover:underline">View bank transfer receipt</a>
            )}
            {appointment.videoRecordingUrl && (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <button onClick={() => setShowRecording(value => !value)} className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white">
                  {showRecording ? 'Hide Consultation Video' : 'Video Consultation Booking'}
                </button>
                {showRecording && <video controls preload="metadata" className="mt-4 max-h-[480px] w-full rounded-xl bg-black"><source src={appointment.videoRecordingUrl} /></video>}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
