'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  CreditCard,
  ChevronRight,
  CheckCircle2,
  ArrowLeft,
  Check,
  Loader2,
  Info,
  Star,
  ShieldCheck,
  User,
  AlertCircle,
  Building2,
  UploadCloud,
  FileImage,
} from 'lucide-react';
import axios from 'axios';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { getToken } from '@/app/actions/token';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────
type BookingStep = 'datetime' | 'payment' | 'confirmed';
type BookingType = 'Clinic' | 'Video';
type TimePeriod = 'Morning' | 'Afternoon' | 'Evening';
type TimeSlot = { time: string; period: TimePeriod };
type DayOption = { label: string; date: Date; display: string; month: string };

// ─── Static time slots ────────────────────────────────────────────────────────
const TIME_SLOTS: TimeSlot[] = [
  { time: '09:00 AM', period: 'Morning' },
  { time: '09:30 AM', period: 'Morning' },
  { time: '10:00 AM', period: 'Morning' },
  { time: '10:30 AM', period: 'Morning' },
  { time: '11:00 AM', period: 'Morning' },
  { time: '11:30 AM', period: 'Morning' },
  { time: '02:00 PM', period: 'Afternoon' },
  { time: '02:30 PM', period: 'Afternoon' },
  { time: '03:00 PM', period: 'Afternoon' },
  { time: '04:00 PM', period: 'Afternoon' },
  { time: '06:00 PM', period: 'Evening' },
  { time: '06:30 PM', period: 'Evening' },
  { time: '07:00 PM', period: 'Evening' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getNextSevenDays(): DayOption[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : DAY_NAMES[d.getDay()],
      date: d,
      display: String(d.getDate()),
      month: MONTH_NAMES[d.getMonth()],
    };
  });
}

function parseSlotToDateTime(dateObj: Date, timeStr: string): Date {
  const clone = new Date(dateObj);
  const [timePart, period] = timeStr.split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  clone.setHours(hours, minutes, 0, 0);
  return clone;
}

const formatCard = (v: string) =>
  v
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
const formatExpiry = (v: string) =>
  v
    .replace(/\D/g, '')
    .slice(0, 4)
    .replace(/^(\d{2})(\d)/, '$1/$2');

// ─── Step Indicator ──────────────────────────────────────────────────────────
function StepIndicator({ step }: { step: BookingStep }) {
  const steps = [
    { key: 'datetime', label: 'Select Slot' },
    { key: 'payment', label: 'Payment' },
    { key: 'confirmed', label: 'Done' },
  ];
  const current = steps.findIndex((s) => s.key === step);
  return (
    <div className="flex items-center mb-8 overflow-x-auto pb-1 -mx-1 px-1">
      {steps.map((s, idx) => (
        <React.Fragment key={s.key}>
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                idx < current ? 'bg-teal-600 text-white' : idx === current ? 'bg-teal-600 text-white ring-4 ring-teal-100' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {idx < current ? <Check size={16} strokeWidth={3} /> : idx + 1}
            </div>
            <span className={`text-[10px] sm:text-xs font-semibold whitespace-nowrap ${idx <= current ? 'text-teal-700' : 'text-slate-400'}`}>{s.label}</span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`flex-1 min-w-[24px] sm:min-w-[40px] h-0.5 mx-2 sm:mx-3 mb-5 rounded-full transition-all duration-500 ${idx < current ? 'bg-teal-500' : 'bg-slate-200'}`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Time Slot Group ─────────────────────────────────────────────────────────
function SlotGroup({
  title,
  slots,
  selected,
  bookedSlots = [],
  onSelect,
}: {
  title: string;
  slots: TimeSlot[];
  selected: string | null;
  bookedSlots?: string[];
  onSelect: (t: string) => void;
}) {
  if (!slots.length) return null;
  return (
    <div className="mb-5">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-2">
        <span className="w-4 h-px bg-slate-200 inline-block" />
        {title}
        <span className="flex-1 h-px bg-slate-200 inline-block" />
      </p>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
        {slots.map((slot, i) => {
          const isBooked = bookedSlots.includes(slot.time);
          return (
            <button
              key={i}
              disabled={isBooked}
              onClick={() => onSelect(slot.time)}
              className={`py-2.5 text-xs font-bold rounded-xl border-2 transition-all relative ${
                isBooked
                  ? 'bg-slate-100 border-slate-200 text-slate-400 line-through cursor-not-allowed opacity-60'
                  : selected === slot.time
                    ? 'bg-teal-600 border-teal-600 text-white shadow-md scale-105'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50'
              }`}
            >
              {slot.time}
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
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function GetAppointmentPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const doctorId = params.doctor as string;
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  // Doctor info from query params (passed by findDoctors page)
  const doctorName = searchParams.get('name') || 'Doctor';
  const doctorSpecialty = searchParams.get('specialty') || 'Specialist';
  const consultationFee = Number(searchParams.get('fee') || 120);
  const doctorImage = searchParams.get('image') || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorName)}&background=0D9488&color=fff`;

  // Booking state
  const [step, setStep] = useState<BookingStep>('datetime');
  const [bookingType, setBookingType] = useState<BookingType>('Clinic');
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [videoConsultationMethod, setVideoConsultationMethod] = useState<'platform' | 'whatsapp'>('platform');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'easypaisa' | 'jazzcash' | 'bank_transfer'>('card');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [mobileWalletNumber, setMobileWalletNumber] = useState('');
  const [patientDetails, setPatientDetails] = useState({
    patientName: '',
    patientAge: '',
    patientPhone: '',
    patientGender: '',
  });

  const [bankReceiptFile, setBankReceiptFile] = useState<File | null>(null);
  const [bankReceiptPreview, setBankReceiptPreview] = useState<string | null>(null);

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [walletStage, setWalletStage] = useState<'idle' | 'sending' | 'authorizing'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [bookedAppointments, setBookedAppointments] = useState<any[]>([]);

  useEffect(() => {
    if (doctorProfile?.isVideoEnabled === false) {
      setBookingType('Clinic');
    }
    if (doctorProfile && doctorProfile.allowWhatsAppVideoConsultation !== true) {
      setVideoConsultationMethod('platform');
    }
  }, [doctorProfile]);

  useEffect(() => {
    async function fetchPatientProfile() {
      try {
        const token = await getToken();
        if (!token) return;
        const response = await axios.get(`${serverUrl}/patient/my-profile`, {
          headers: { Authorization: `Bearer ${token.replace(/"/g, '').trim()}` },
        });
        const profile = response.data || {};
        let age = '';
        if (profile.dateOfBirth) {
          const birthDate = new Date(profile.dateOfBirth);
          const today = new Date();
          let calculatedAge = today.getFullYear() - birthDate.getFullYear();
          if (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())) calculatedAge -= 1;
          age = String(calculatedAge);
        }
        setPatientDetails({
          patientName: profile.fullName || '',
          patientAge: age,
          patientPhone: profile.phoneNumber || '',
          patientGender: profile.gender || '',
        });
      } catch (error) {
        console.error(error);
      }
    }
    fetchPatientProfile();
  }, [serverUrl]);

  useEffect(() => {
    async function fetchBookedAppointments() {
      try {
        const token = await getToken();
        if (!token) return;
        const cleanToken = token.replace(/"/g, '').trim();
        const res = await axios.get(`${serverUrl}/patient/doctor-appointments/${doctorId}`, {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        });
        setBookedAppointments(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchBookedAppointments();
  }, [doctorId, serverUrl]);

  useEffect(() => {
    const eventSource = new EventSource(`${serverUrl}/realtime/stream`);
    eventSource.onmessage = (event) => {
      try {
        const sseData = JSON.parse(event.data);
        if (sseData.type === 'appointment_booked' && sseData.data.doctorId === doctorId) {
          setBookedAppointments((prev) => {
            const exists = prev.some((app) => new Date(app.startTime).getTime() === new Date(sseData.data.startTime).getTime());
            if (exists) return prev;
            return [...prev, sseData.data];
          });
        } else if (sseData.type === 'appointment_updated' && sseData.data.doctorId === doctorId) {
          setBookedAppointments((prev) => {
            if (sseData.data.status === 'cancelled') {
              return prev.filter((app) => new Date(app.startTime).getTime() !== new Date(sseData.data.startTime).getTime());
            } else {
              const index = prev.findIndex((app) => new Date(app.startTime).getTime() === new Date(sseData.data.startTime).getTime());
              if (index === -1) {
                return [...prev, sseData.data];
              }
              const next = [...prev];
              next[index] = { ...next[index], status: sseData.data.status };
              return next;
            }
          });
        } else if (sseData.type === 'availability_updated' && sseData.data.doctorId === doctorId) {
          setDoctorProfile((prev: any) => {
            if (!prev) return prev;
            return {
              ...prev,
              availability: sseData.data.availability,
              isVideoEnabled: sseData.data.isVideoEnabled,
              allowWhatsAppVideoConsultation: sseData.data.allowWhatsAppVideoConsultation,
            };
          });
        }
      } catch (err) {
        console.error('SSE error:', err);
      }
    };
    return () => {
      eventSource.close();
    };
  }, [doctorId, serverUrl]);

  useEffect(() => {
    async function fetchDoctorDetails() {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await axios.get(`${serverUrl}/patient/allDoctors`, {
          headers: {
            Authorization: `Bearer ${token.replace(/"/g, '').trim()}`,
          },
        });
        const doc = res.data.find((d: any) => d._id === doctorId);
        if (doc) {
          setDoctorProfile(doc);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchDoctorDetails();
  }, [doctorId]);

  const days = useMemo(() => getNextSevenDays(), []);
  const clinicConsultationFee = Number(doctorProfile?.consultationFee ?? consultationFee);
  const videoConsultationFee = Number(doctorProfile?.videoConsultationFee ?? 0);
  const fee = bookingType === 'Clinic' ? clinicConsultationFee : videoConsultationFee;

  const isDayAvailableForDoctor = (date: Date) => {
    if (!doctorProfile) return true;
    const dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = dayNamesFull[date.getDay()];
    const slotsForDay = doctorProfile.availability?.filter((slot: any) => slot.day === currentDayName && slot.isAvailable) || [];
    return slotsForDay.length > 0;
  };

  const getFilteredTimeSlots = (date: Date) => {
    if (!doctorProfile) return [];
    const dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = dayNamesFull[date.getDay()];
    const slotsForDay = doctorProfile.availability?.filter((slot: any) => slot.day === currentDayName && slot.isAvailable) || [];
    if (slotsForDay.length === 0) {
      return [];
    }
    const parseTime = (str: string) => {
      const [timePart, period] = str.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours + minutes / 60;
    };
    const parseHHMM = (str: string) => {
      const [hours, minutes] = str.split(':').map(Number);
      return hours + minutes / 60;
    };
    return TIME_SLOTS.filter((slot) => {
      const slotTime = parseTime(slot.time);
      return slotsForDay.some((avail: any) => {
        const start = parseHHMM(avail.startTime);
        const end = parseHHMM(avail.endTime);
        const now = new Date();
        const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        if (isToday) {
          const slotDateTime = parseSlotToDateTime(date, slot.time);
          if (slotDateTime <= now) return false;
        }
        return slotTime >= start && slotTime <= end;
      });
    });
  };

  const filteredSlots = useMemo(() => {
    return getFilteredTimeSlots(days[selectedDayIdx].date);
  }, [doctorProfile, selectedDayIdx, days]);

  const morning = filteredSlots.filter((s) => s.period === 'Morning');
  const afternoon = filteredSlots.filter((s) => s.period === 'Afternoon');
  const evening = filteredSlots.filter((s) => s.period === 'Evening');

  const bookedTimesForSelectedDay = useMemo(() => {
    if (!days[selectedDayIdx]) return [];
    const selectedDate = days[selectedDayIdx].date;
    return bookedAppointments
      .filter((app) => {
        const appDate = new Date(app.startTime);
        return (
          appDate.getDate() === selectedDate.getDate() &&
          appDate.getMonth() === selectedDate.getMonth() &&
          appDate.getFullYear() === selectedDate.getFullYear() &&
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
  }, [bookedAppointments, selectedDayIdx, days]);

  const cardValid = cardName.trim().length > 2 && cardNumber.length >= 19 && cardExpiry.length === 5 && cardCVV.length === 3;
  const patientDetailsValid =
    patientDetails.patientName.trim().length > 1 &&
    Number(patientDetails.patientAge) > 0 &&
    /^\d{11}$/.test(patientDetails.patientPhone) &&
    patientDetails.patientGender.trim().length > 0;
  const walletValid = mobileWalletNumber.replace(/\D/g, '').length >= 10;
  const bankTransferValid = bankReceiptFile !== null;
  const canPay =
    patientDetailsValid &&
    (paymentMethod === 'cash' ||
      (paymentMethod === 'card' && cardValid) ||
      ((paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash') && walletValid) ||
      (paymentMethod === 'bank_transfer' && bankTransferValid));

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const token = await getToken();
      if (!token) {
        setErrorMessage('Please log in to book an appointment.');
        setIsSubmitting(false);
        return;
      }

      const startDateTime = parseSlotToDateTime(days[selectedDayIdx].date, selectedTime!);
      const endDateTime = new Date(startDateTime.getTime() + 30 * 60000);

      // Mobile wallet simulation animation
      if (paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash') {
        setWalletStage('sending');
        await new Promise((r) => setTimeout(r, 2000));
        setWalletStage('authorizing');
        await new Promise((r) => setTimeout(r, 2500));
      }

      // --- STEP 1: INITIALIZE INTEGRATED GATEWAYS (Stripe, JazzCash, EasyPaisa) ---
      if (paymentMethod === 'card' || paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash') {
        const endpoint = paymentMethod === 'card' ? 'create-checkout-session' : `${paymentMethod}/initiate`;

        const initResponse = await axios.post(
          `${serverUrl}/payment/${endpoint}`,
          {
            doctorId,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            appointmentType: bookingType,
            consultationFee: fee,
            videoConsultationMethod: bookingType === 'Video' ? videoConsultationMethod : undefined,
            ...patientDetails,
          },
          {
            headers: {
              Authorization: `Bearer ${token.replace(/"/g, '').trim()}`,
            },
            withCredentials: true,
          },
        );

        if (initResponse.data.url) {
          if (initResponse.data.fields) {
            // Real Hosted Form post redirect
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = initResponse.data.url;
            Object.keys(initResponse.data.fields).forEach((key) => {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = key;
              input.value = initResponse.data.fields[key];
              form.appendChild(input);
            });
            document.body.appendChild(form);
            form.submit();
          } else {
            // Mock or Direct redirect fallback url
            window.location.href = initResponse.data.url;
          }
          return;
        }
      } else if (paymentMethod === 'bank_transfer') {
        // --- BANK TRANSFER: upload screenshot then book ---
        if (!bankReceiptFile) {
          setErrorMessage('Please upload your bank transfer receipt screenshot.');
          setIsSubmitting(false);
          return;
        }

        // Upload receipt to Cloudinary via backend
        const receiptForm = new FormData();
        receiptForm.append('file', bankReceiptFile);
        const uploadRes = await axios.post(`${serverUrl}/doctor/uploadReceipt`, receiptForm, {
          headers: {
            Authorization: `Bearer ${token.replace(/"/g, '').trim()}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        const bankTransferReceiptUrl = uploadRes.data.url;

        await axios.post(
          `${serverUrl}/doctor/addPatient`,
          {
            doctorId,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            appointmentType: bookingType,
            paymentMethod: 'bank_transfer',
            videoConsultationMethod: bookingType === 'Video' ? videoConsultationMethod : undefined,
            bankTransferReceiptUrl,
            ...patientDetails,
          },
          {
            headers: {
              Authorization: `Bearer ${token.replace(/"/g, '').trim()}`,
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          },
        );
      } else {
        // --- STEP 2: DIRECT BOOKING (Cash On Visit) ---
        await axios.post(
          `${serverUrl}/doctor/addPatient`,
          {
            doctorId,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            appointmentType: bookingType,
            paymentMethod,
            videoConsultationMethod: bookingType === 'Video' ? videoConsultationMethod : undefined,
            mobileWalletNumber,
            ...patientDetails,
          },
          {
            headers: {
              Authorization: `Bearer ${token.replace(/"/g, '').trim()}`,
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          },
        );
      }

      setStep('confirmed');
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMessage(err.response?.data?.error || err.response?.data?.message || 'Failed to process your request. Please try again.');
    } finally {
      setIsSubmitting(false);
      setWalletStage('idle');
    }
  };

  const handleReset = () => {
    setStep('datetime');
    setSelectedTime(null);
    setSelectedDayIdx(0);
    setCardName('');
    setCardNumber('');
    setCardExpiry('');
    setCardCVV('');
    setMobileWalletNumber('');
    setBankReceiptFile(null);
    setBankReceiptPreview(null);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 font-sans text-slate-900 pb-16">
      {/* ── Top nav ── */}
      <nav className="bg-white/80 backdrop-blur border-b border-slate-200 px-4 py-3 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link href="/patient/findDoctors" className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-800">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/patient/findDoctors" className="hover:text-teal-600">
              Find Doctors
            </Link>
            <ChevronRight size={14} />
            <span className="text-slate-800 font-semibold">Book Appointment</span>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 pt-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ── LEFT: Doctor summary card (sticky) ── */}
        <aside className="lg:col-span-2">
          <div className="sticky top-20 space-y-4">
            {/* Doctor card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <img src={doctorImage} alt={doctorName} className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100 shadow" />
                  <span className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h2 className="text-lg font-extrabold text-slate-900 leading-tight">{doctorName}</h2>
                    <ShieldCheck size={16} className="text-teal-500 shrink-0" />
                  </div>
                  <p className="text-teal-600 font-medium text-sm">{doctorSpecialty}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
                    ))}
                    <span className="text-xs text-slate-400 ml-1">4.9 (128)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-2 border-t border-slate-50">
                  <span className="text-slate-500">In-Clinic Fee</span>
                  <span className="font-bold text-slate-800">PKR {clinicConsultationFee}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-slate-50">
                  <span className="text-slate-500">Video Fee</span>
                  <span className="font-bold text-slate-800">PKR {videoConsultationFee}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-slate-50">
                  <span className="text-slate-500">Duration</span>
                  <span className="font-bold text-slate-800">30 mins</span>
                </div>
              </div>
            </div>

            {/* Info pills */}
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 space-y-2 text-sm text-teal-800">
              <p className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-teal-600 shrink-0" /> Free cancellation within 24 hrs
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-teal-600 shrink-0" /> Instant booking confirmation
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-teal-600 shrink-0" /> No hidden charges
              </p>
            </div>
          </div>
        </aside>

        {/* ── RIGHT: Booking flow ── */}
        <main className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Panel header */}
            <div className={`px-6 py-5 border-b border-slate-100 transition-colors ${step === 'confirmed' ? 'bg-teal-600' : 'bg-white'}`}>
              <h1 className={`text-xl font-extrabold ${step === 'confirmed' ? 'text-white' : 'text-slate-900'}`}>
                {step === 'datetime' && '🗓 Select Date & Time'}
                {step === 'payment' && '💳 Complete Payment'}
                {step === 'confirmed' && '✅ Appointment Confirmed!'}
              </h1>
              {step !== 'confirmed' && (
                <p className="text-slate-500 text-sm mt-0.5">{step === 'datetime' ? 'Pick your preferred slot for the next 7 days' : 'Review and finalize your booking'}</p>
              )}
            </div>

            <div className="p-6">
              <StepIndicator step={step} />

              {/* ── STEP 1: Date & Time ── */}
              {step === 'datetime' && (
                <div>
                  {/* Consultation type */}
                  {doctorProfile?.isVideoEnabled !== false && (
                    <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                      {(['Clinic', 'Video'] as BookingType[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => setBookingType(type)}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${
                            bookingType === type ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {type === 'Clinic' ? <MapPin size={16} /> : <Video size={16} />}
                          <span>{type === 'Clinic' ? 'In-Clinic' : 'Video Call'}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${bookingType === type ? 'bg-teal-50 text-teal-600' : 'bg-slate-200 text-slate-500'}`}>
                            PKR {type === 'Clinic' ? clinicConsultationFee : videoConsultationFee}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {bookingType === 'Video' && (
                    <div className="mb-6 rounded-2xl border border-teal-100 bg-teal-50/40 p-4">
                      <p className="mb-3 text-sm font-bold text-slate-800">Choose video consultation method</p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {[
                          { value: 'platform', label: 'Video on this platform', description: 'Receive an incoming call here with camera and microphone.' },
                          ...(doctorProfile?.allowWhatsAppVideoConsultation === true
                            ? [{ value: 'whatsapp', label: 'WhatsApp video call', description: 'The doctor will contact your entered 11-digit number.' }]
                            : []),
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setVideoConsultationMethod(option.value as 'platform' | 'whatsapp')}
                            className={`rounded-xl border-2 p-4 text-left transition ${videoConsultationMethod === option.value ? 'border-teal-500 bg-white' : 'border-slate-200 bg-white/60'}`}
                          >
                            <span className="block text-sm font-bold text-slate-800">{option.label}</span>
                            <span className="mt-1 block text-xs text-slate-500">{option.description}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Date picker */}
                  <div className="mb-6">
                    <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                      <Calendar size={15} className="text-teal-600" /> Select Date
                      <span className="ml-auto text-xs text-slate-400 font-normal">Next 7 days</span>
                    </h3>
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide sm:grid sm:grid-cols-7 sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0">
                      {days.map((d, i) => {
                        const isAvailable = isDayAvailableForDoctor(d.date);
                        return (
                          <button
                            key={i}
                            disabled={!isAvailable}
                            onClick={() => {
                              setSelectedDayIdx(i);
                              setSelectedTime(null);
                            }}
                            className={`flex flex-col items-center py-3 px-2 sm:px-0 min-w-[3.25rem] sm:min-w-0 shrink-0 sm:shrink rounded-xl border-2 transition-all ${
                              selectedDayIdx === i
                                ? 'bg-teal-600 border-teal-600 text-white shadow-md'
                                : !isAvailable
                                  ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-50'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-teal-50/50'
                            }`}
                          >
                            <span className="text-[9px] font-bold uppercase opacity-70">{d.label.slice(0, 3)}</span>
                            <span className="text-lg font-extrabold leading-tight">{d.display}</span>
                            <span className="text-[9px] opacity-60">{d.month}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time slots */}
                  <div className="mb-6">
                    <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                      <Clock size={15} className="text-teal-600" /> Available Time Slots
                    </h3>
                    <SlotGroup title="Morning" slots={morning} selected={selectedTime} bookedSlots={bookedTimesForSelectedDay} onSelect={setSelectedTime} />
                    <SlotGroup title="Afternoon" slots={afternoon} selected={selectedTime} bookedSlots={bookedTimesForSelectedDay} onSelect={setSelectedTime} />
                    <SlotGroup title="Evening" slots={evening} selected={selectedTime} bookedSlots={bookedTimesForSelectedDay} onSelect={setSelectedTime} />
                  </div>

                  {/* Selection summary */}
                  {selectedTime ? (
                    <div className="mb-5 p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-teal-600 shrink-0" />
                      <div>
                        <p className="font-bold text-teal-800 text-sm">
                          {days[selectedDayIdx].display} {days[selectedDayIdx].month} · {selectedTime}
                        </p>
                        <p className="text-teal-600 text-xs">
                          {bookingType} consultation · 30 min · PKR {fee}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-5 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 text-slate-400">
                      <Info size={18} className="shrink-0" />
                      <p className="text-sm">Select a time slot above to proceed</p>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setErrorMessage('');
                      setStep('payment');
                    }}
                    disabled={!selectedTime}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow ${
                      selectedTime ? 'bg-teal-600 text-white hover:bg-teal-700 hover:shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {selectedTime ? 'Proceed to Payment →' : 'Select a Slot to Continue'}
                  </button>
                </div>
              )}

              {/* ── STEP 2: Payment ── */}
              {step === 'payment' && (
                <div>
                  {/* Order summary */}
                  <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-5 mb-6 text-white">
                    <p className="text-teal-100 text-xs font-bold uppercase tracking-widest mb-3">Booking Summary</p>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <span className="text-teal-100">Doctor</span>
                      <span className="font-bold text-right">{doctorName}</span>
                      <span className="text-teal-100">Date</span>
                      <span className="font-bold text-right">
                        {days[selectedDayIdx].display} {days[selectedDayIdx].month} ({days[selectedDayIdx].label})
                      </span>
                      <span className="text-teal-100">Time</span>
                      <span className="font-bold text-right">{selectedTime}</span>
                      <span className="text-teal-100">Type</span>
                      <span className="font-bold text-right">{bookingType}</span>
                      <span className="text-teal-100 border-t border-teal-500/50 pt-2 mt-1 font-bold text-base">Total</span>
                      <span className="font-extrabold text-right text-xl border-t border-teal-500/50 pt-2 mt-1">PKR {fee}</span>
                    </div>
                  </div>

                  {/* Wallet Processing Overlay */}
                  <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                      <User size={16} className="text-teal-600" /> Patient Details
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {[
                        { key: 'patientName', label: 'Full Name', type: 'text' },
                        { key: 'patientAge', label: 'Age', type: 'number' },
                        { key: 'patientPhone', label: 'Phone Number', type: 'tel' },
                      ].map((field) => (
                        <label key={field.key} className="block">
                          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">{field.label}</span>
                          <input
                            required
                            type={field.type}
                            min={field.type === 'number' ? 1 : undefined}
                            value={patientDetails[field.key as keyof typeof patientDetails]}
                            maxLength={field.key === 'patientPhone' ? 11 : undefined}
                            onChange={(event) => {
                              const value = field.key === 'patientPhone' ? event.target.value.replace(/\D/g, '').slice(0, 11) : event.target.value;
                              setPatientDetails((current) => ({ ...current, [field.key]: value }));
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                          />
                        </label>
                      ))}
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Gender</span>
                        <select
                          required
                          value={patientDetails.patientGender}
                          onChange={(event) => setPatientDetails((current) => ({ ...current, patientGender: event.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  {walletStage !== 'idle' && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                      <div className="relative w-24 h-24 mb-6">
                        <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-teal-600 animate-spin"></div>
                        <div className="absolute inset-2 bg-slate-50 rounded-full flex items-center justify-center text-3xl">{paymentMethod === 'easypaisa' ? '📱' : '📲'}</div>
                      </div>
                      <h3 className="font-extrabold text-xl text-slate-800 mb-2">{walletStage === 'sending' ? 'Initiating Wallet Transaction' : 'Awaiting Authorization'}</h3>
                      <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                        {walletStage === 'sending'
                          ? `Sending transaction request to mobile account ${mobileWalletNumber}...`
                          : `Please check your phone screen. Enter your secret PIN to authorize the transaction of PKR ${fee}.`}
                      </p>
                      <div className="mt-8 flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-ping"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse delay-75"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse delay-150"></span>
                      </div>
                    </div>
                  )}

                  {/* Payment method */}
                  <h3 className="font-bold text-slate-800 text-sm mb-3">Payment Method</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                    {[
                      { id: 'card', name: 'Pay by Card', icon: <CreditCard size={20} /> },
                      { id: 'cash', name: 'Pay at Clinic', icon: <span className="text-xl">💵</span> },
                      { id: 'easypaisa', name: 'EasyPaisa', icon: <span className="text-lg font-extrabold text-emerald-600">EP</span> },
                      { id: 'jazzcash', name: 'JazzCash', icon: <span className="text-lg font-extrabold text-amber-600">JC</span> },
                      { id: 'bank_transfer', name: 'Direct Bank', icon: <Building2 size={20} className="text-blue-600" /> },
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(method.id as any);
                          setErrorMessage('');
                        }}
                        className={`flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-xl border-2 text-xs font-bold transition-all ${
                          paymentMethod === method.id ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {method.icon}
                        <span>{method.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Card form */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-4 mb-5 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Cardholder Name</label>
                        <input
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="John Smith"
                          className="w-full px-4 py-3 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Card Number</label>
                        <input
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCard(e.target.value))}
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-3 border border-slate-200 bg-white rounded-xl text-sm font-mono tracking-widest focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Expiry</label>
                          <input
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                            placeholder="MM/YY"
                            className="w-full px-4 py-3 border border-slate-200 bg-white rounded-xl text-sm font-mono focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">CVV</label>
                          <input
                            value={cardCVV}
                            onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, '').slice(0, 3))}
                            placeholder="•••"
                            type="password"
                            className="w-full px-4 py-3 border border-slate-200 bg-white rounded-xl text-sm font-mono focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Wallet form */}
                  {(paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash') && (
                    <div
                      className={`space-y-4 mb-5 p-5 rounded-2xl border transition-all ${
                        paymentMethod === 'easypaisa' ? 'bg-emerald-50/50 border-emerald-200' : 'bg-amber-50/50 border-amber-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-sm ${
                            paymentMethod === 'easypaisa' ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        >
                          {paymentMethod === 'easypaisa' ? 'EP' : 'JC'}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{paymentMethod === 'easypaisa' ? 'EasyPaisa Account' : 'JazzCash Account'}</h4>
                          <p className="text-xs text-slate-400">Pay directly from your mobile wallet account</p>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Mobile Account Number</label>
                        <input
                          value={mobileWalletNumber}
                          onChange={(e) => setMobileWalletNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                          placeholder="e.g. 03001234567"
                          className="w-full px-4 py-3 border border-slate-200 bg-white rounded-xl text-sm font-mono tracking-widest focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all"
                        />
                        <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                          * Please ensure your phone is unlocked. You will receive a direct prompt on your mobile to enter your PIN and approve the payment of PKR {fee}.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Cash info */}
                  {paymentMethod === 'cash' && (
                    <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                      <p className="font-bold text-sm mb-1">Pay at the Clinic</p>
                      <p className="text-xs">
                        Please bring <strong>PKR {fee}</strong> in cash and arrive 10 minutes before your appointment time.
                      </p>
                    </div>
                  )}

                  {/* Bank Transfer */}
                  {paymentMethod === 'bank_transfer' && (
                    <div className="space-y-4 mb-5 p-5 bg-blue-50 rounded-2xl border border-blue-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Building2 size={18} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">Direct Bank Transfer</h4>
                          <p className="text-xs text-slate-500">Transfer fee to doctor's bank account, then upload receipt</p>
                        </div>
                      </div>

                      {/* Doctor's bank details */}
                      {doctorProfile?.bankName || doctorProfile?.accountNumber ? (
                        <div className="bg-white rounded-xl border border-blue-100 p-4 space-y-2">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Doctor's Bank Details</p>
                          {doctorProfile.bankName && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Bank Name</span>
                              <span className="font-bold text-slate-800">{doctorProfile.bankName}</span>
                            </div>
                          )}
                          {doctorProfile.accountHolderName && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Account Holder</span>
                              <span className="font-bold text-slate-800">{doctorProfile.accountHolderName}</span>
                            </div>
                          )}
                          {doctorProfile.accountNumber && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Account / IBAN</span>
                              <span className="font-bold text-slate-800 font-mono">{doctorProfile.accountNumber}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm border-t border-blue-50 pt-2 mt-2">
                            <span className="text-slate-500 font-bold">Amount to Transfer</span>
                            <span className="font-extrabold text-blue-700">PKR {fee}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white rounded-xl border border-amber-100 p-4">
                          <p className="text-sm text-amber-700 font-medium">ℹ️ Doctor hasn't added bank details yet. Please contact the clinic directly.</p>
                        </div>
                      )}

                      {/* Receipt upload */}
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Upload Transfer Receipt *</label>
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer bg-white hover:bg-blue-50/50 hover:border-blue-400 transition-all">
                          {bankReceiptPreview ? (
                            <img src={bankReceiptPreview} alt="Receipt preview" className="w-full h-full object-contain rounded-xl" />
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-2">
                              <UploadCloud size={24} className="text-blue-400" />
                              <p className="text-sm text-slate-500">Click to upload screenshot</p>
                              <p className="text-xs text-slate-400">PNG, JPG up to 5MB</p>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setBankReceiptFile(file);
                              if (file) setBankReceiptPreview(URL.createObjectURL(file));
                              else setBankReceiptPreview(null);
                            }}
                          />
                        </label>
                        {bankReceiptFile && (
                          <p className="text-xs text-green-700 mt-1.5 flex items-center gap-1">
                            <FileImage size={12} /> {bankReceiptFile.name}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-1.5">
                          Transfer the exact amount to the above account, take a screenshot of the successful transfer, and upload it here.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {errorMessage && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      {errorMessage}
                    </div>
                  )}

                  <button
                    onClick={handleConfirm}
                    disabled={isSubmitting || !canPay}
                    className="w-full py-4 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow flex items-center justify-center gap-2 text-base"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={20} className="animate-spin" /> Processing…
                      </>
                    ) : (
                      `Confirm & Pay PKR ${fee}`
                    )}
                  </button>

                  <button
                    onClick={() => setStep('datetime')}
                    className="w-full mt-3 py-3 rounded-xl font-semibold text-slate-500 hover:bg-slate-100 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <ArrowLeft size={15} /> Back to Slot Selection
                  </button>
                </div>
              )}

              {/* ── STEP 3: Confirmed ── */}
              {step === 'confirmed' && (
                <div className="text-center py-4">
                  {/* Success icon */}
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="w-24 h-24 rounded-full bg-teal-50 border-4 border-teal-100 flex items-center justify-center">
                      <Check size={44} className="text-teal-600" strokeWidth={3} />
                    </div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-lg">🎉</div>
                  </div>

                  <h2 className="text-2xl font-extrabold text-slate-900 mb-1">You're All Set!</h2>
                  <p className="text-slate-500 mb-8">Your appointment has been successfully booked.</p>

                  {/* Booking details card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left mb-6 space-y-3">
                    {[
                      { icon: <User size={16} className="text-teal-600" />, label: 'Doctor', value: doctorName },
                      { icon: <Calendar size={16} className="text-teal-600" />, label: 'Date', value: `${days[selectedDayIdx].display} ${days[selectedDayIdx].month}` },
                      { icon: <Clock size={16} className="text-teal-600" />, label: 'Time', value: selectedTime! },
                      {
                        icon: bookingType === 'Clinic' ? <MapPin size={16} className="text-teal-600" /> : <Video size={16} className="text-teal-600" />,
                        label: 'Type',
                        value: bookingType === 'Clinic' ? 'In-Clinic Visit' : 'Video Consultation',
                      },
                      {
                        icon: <CreditCard size={16} className="text-teal-600" />,
                        label: 'Payment',
                        value: `PKR ${fee} · ${paymentMethod === 'card' ? 'Card' : 'Pay at Clinic'}`,
                      },
                    ].map(({ icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">{icon}</div>
                        <span className="text-slate-500 w-20 shrink-0">{label}</span>
                        <span className="font-semibold text-slate-800">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleReset}
                      className="flex-1 py-3 rounded-xl font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-all text-sm"
                    >
                      Book Another Slot
                    </button>
                    <Link
                      href="/patient/appointments"
                      className="flex-1 py-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition-all text-sm flex items-center justify-center"
                    >
                      View My Appointments
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function GetAppointmentPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        </div>
      }
    >
      <GetAppointmentPageContent />
    </React.Suspense>
  );
}
