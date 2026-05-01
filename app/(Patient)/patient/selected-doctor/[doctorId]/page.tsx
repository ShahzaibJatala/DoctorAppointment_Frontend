'use client';

import React, { useState, useMemo } from 'react';
import {
  MapPin, Star, Clock, Video, ShieldCheck, Stethoscope,
  GraduationCap, Languages, Share2, Heart, ChevronRight,
  CheckCircle2, Loader2, Info, CreditCard, ArrowLeft,
  Calendar, User, Check, ChevronLeft, ChevronDown
} from 'lucide-react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { getToken } from '@/app/actions/token';


// ─── Types ────────────────────────────────────────────────────────────────────
type BookingStep = 'datetime' | 'payment' | 'confirmed';
type BookingType = 'Clinic' | 'Video';
type TimePeriod = 'Morning' | 'Afternoon' | 'Evening';

type TimeSlot = { time: string; period: TimePeriod };
type DayOption = { label: string; dayName: string; date: Date; display: string };

// ─── Static mock data (replace/extend with real API data as needed) ────────────
const doctor = {
  name: "Dr. Sarah Jenkins",
  specialty: "Senior Cardiologist",
  image: "https://i.pravatar.cc/300?u=doctor_sarah",
  hospital: "Heart & Vascular Institute",
  experience: "15+ Years",
  patients: "5,000+",
  rating: 4.9,
  reviewCount: 428,
  about: "Dr. Sarah Jenkins is a board-certified Cardiologist with over 15 years of experience in interventional cardiology. She specialises in preventing, diagnosing, and treating cardiovascular diseases.",
  education: ["MD - Harvard Medical School", "Residency - Johns Hopkins Hospital", "Fellowship - Mayo Clinic"],
  languages: ["English", "Spanish"],
  consultationFee: { Clinic: 120, Video: 80 },
};

const services = [
  "Echocardiography", "Cardiac Catheterization", "Angioplasty",
  "Hypertension Management", "Heart Failure Treatment", "Pacemaker Implantation"
];

const reviews = [
  { id: '1', user: 'Michael R.', rating: 5, date: '2 days ago', comment: 'Dr. Jenkins was incredibly thorough and kind. She took the time to explain everything clearly.' },
  { id: '2', user: 'Emily W.', rating: 5, date: '1 week ago', comment: 'Excellent experience. The clinic is modern and the staff is friendly. Highly recommended.' },
  { id: '3', user: 'David K.', rating: 4, date: '3 weeks ago', comment: 'Great doctor, but the wait time was a bit longer than expected.' },
];

const timeSlots: TimeSlot[] = [
  { time: '09:00 AM', period: 'Morning' }, { time: '09:30 AM', period: 'Morning' },
  { time: '10:00 AM', period: 'Morning' }, { time: '10:30 AM', period: 'Morning' },
  { time: '11:00 AM', period: 'Morning' }, { time: '02:00 PM', period: 'Afternoon' },
  { time: '02:30 PM', period: 'Afternoon' }, { time: '03:00 PM', period: 'Afternoon' },
  { time: '04:00 PM', period: 'Afternoon' }, { time: '06:00 PM', period: 'Evening' },
  { time: '06:30 PM', period: 'Evening' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getNextSevenDays(): DayOption[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[d.getDay()],
      dayName: days[d.getDay()],
      date: d,
      display: `${d.getDate()} ${months[d.getMonth()]}`,
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

// ─── Sub-components ───────────────────────────────────────────────────────────
const SectionTitle = ({ title }: { title: string }) => (
  <h2 className="text-xl font-bold text-slate-800 mb-4">{title}</h2>
);

const StepIndicator = ({ step }: { step: BookingStep }) => {
  const steps = [
    { key: 'datetime', label: 'Date & Time' },
    { key: 'payment', label: 'Payment' },
    { key: 'confirmed', label: 'Confirmed' },
  ];
  const current = steps.findIndex(s => s.key === step);
  return (
    <div className="flex items-center justify-between mb-6 px-1">
      {steps.map((s, idx) => (
        <React.Fragment key={s.key}>
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              idx < current ? 'bg-teal-600 text-white' :
              idx === current ? 'bg-teal-600 text-white ring-4 ring-teal-100' :
              'bg-slate-100 text-slate-400'
            }`}>
              {idx < current ? <Check size={14} /> : idx + 1}
            </div>
            <span className={`text-[10px] font-medium ${idx <= current ? 'text-teal-700' : 'text-slate-400'}`}>
              {s.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-4 rounded transition-all ${idx < current ? 'bg-teal-500' : 'bg-slate-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const SlotGroup = ({
  title, slots, selected, onSelect
}: {
  title: string; slots: TimeSlot[]; selected: string | null; onSelect: (t: string) => void;
}) => {
  if (slots.length === 0) return null;
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{title}</p>
      <div className="grid grid-cols-3 gap-2">
        {slots.map((slot, i) => (
          <button
            key={i}
            onClick={() => onSelect(slot.time)}
            className={`text-xs font-semibold py-2 rounded-lg border transition-all ${
              selected === slot.time
                ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-700'
            }`}
          >
            {slot.time}
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DoctorProfile() {
  const params = useParams();
  const doctorId = params.doctorId as string;
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  // Booking flow state
  const [step, setStep] = useState<BookingStep>('datetime');
  const [bookingType, setBookingType] = useState<BookingType>('Clinic');
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Payment state
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Favourite (UI only)
  const [isFav, setIsFav] = useState(false);

  // ── Dynamic dates (next 7 days) ──
  const days = useMemo(() => getNextSevenDays(), []);
  const fee = doctor.consultationFee[bookingType];

  // ── Slot groups ──
  const morning = timeSlots.filter(s => s.period === 'Morning');
  const afternoon = timeSlots.filter(s => s.period === 'Afternoon');
  const evening = timeSlots.filter(s => s.period === 'Evening');

  // ── Handlers ──
  const handleProceedToPayment = () => {
    if (!selectedTime) return;
    setErrorMessage('');
    setStep('payment');
  };

  const handleConfirmAppointment = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const token = await getToken();
      if (!token) {
        setErrorMessage('Please log in to book an appointment.');
        setIsSubmitting(false);
        return;
      }
      const cleanToken = token.replace(/"/g, '').trim();

      const startDateTime = parseSlotToDateTime(days[selectedDayIdx].date, selectedTime!);
      const endDateTime = new Date(startDateTime.getTime() + 30 * 60000);

      const payload = {
        doctorId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        appointmentType: bookingType,
        paymentMethod,
      };

      await axios.post(`${serverUrl}/doctor/addPatient`, payload, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      setStep('confirmed');
    } catch (error: any) {
      console.error('Booking failed:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep('datetime');
    setSelectedTime(null);
    setSelectedDayIdx(0);
    setCardName(''); setCardNumber(''); setCardExpiry(''); setCardCVV('');
    setErrorMessage('');
  };

  // ── Format card number with spaces ──
  const formatCard = (val: string) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (val: string) =>
    val.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2');

  // ── Booking panel content ──
  const renderBookingPanel = () => {
    // ── STEP 1: Date & Time ──
    if (step === 'datetime') return (
      <div className="p-5">
        <StepIndicator step={step} />

        {/* Consultation type */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-5">
          {(['Clinic', 'Video'] as BookingType[]).map(type => (
            <button
              key={type}
              onClick={() => setBookingType(type)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
                bookingType === type ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {type === 'Clinic' ? <MapPin size={15} /> : <Video size={15} />}
              {type === 'Clinic' ? 'In-Clinic' : 'Video'}
            </button>
          ))}
        </div>

        {/* Fee */}
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100">
          <span className="text-sm text-slate-500 font-medium">Consultation Fee</span>
          <span className="text-xl font-extrabold text-teal-700">${fee}</span>
        </div>

        {/* Date selector */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Calendar size={14} className="text-teal-600" /> Select Date
            </h4>
            <span className="text-xs text-slate-400 font-medium">Next 7 days</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {days.map((d, i) => (
              <button
                key={i}
                onClick={() => { setSelectedDayIdx(i); setSelectedTime(null); }}
                className={`flex flex-col items-center justify-center min-w-[62px] py-2.5 px-1 rounded-xl border-2 transition-all flex-shrink-0 ${
                  selectedDayIdx === i
                    ? 'bg-teal-600 border-teal-600 text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300'
                }`}
              >
                <span className="text-[10px] font-semibold opacity-75">{d.label}</span>
                <span className="text-base font-extrabold leading-tight">{d.date.getDate()}</span>
                <span className="text-[9px] opacity-70">{d.display.split(' ')[1]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Time slots */}
        <div className="mb-5">
          <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
            <Clock size={14} className="text-teal-600" /> Available Slots
          </h4>
          <SlotGroup title="Morning" slots={morning} selected={selectedTime} onSelect={setSelectedTime} />
          <SlotGroup title="Afternoon" slots={afternoon} selected={selectedTime} onSelect={setSelectedTime} />
          <SlotGroup title="Evening" slots={evening} selected={selectedTime} onSelect={setSelectedTime} />
        </div>

        {/* Selected summary */}
        {selectedTime && (
          <div className="mb-4 p-3 bg-teal-50 border border-teal-100 rounded-xl text-sm text-teal-800 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-teal-600 shrink-0" />
            <span>
              <span className="font-bold">{days[selectedDayIdx].display}</span> at{' '}
              <span className="font-bold">{selectedTime}</span> · {bookingType}
            </span>
          </div>
        )}

        <button
          onClick={handleProceedToPayment}
          disabled={!selectedTime}
          className={`w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-md ${
            selectedTime
              ? 'bg-teal-600 hover:bg-teal-700 hover:shadow-lg'
              : 'bg-slate-300 cursor-not-allowed'
          }`}
        >
          {selectedTime ? 'Proceed to Payment →' : 'Select a Time Slot'}
        </button>

        <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
          <Info size={11} /> Usually responds within 1 hour
        </p>
      </div>
    );

    // ── STEP 2: Payment ──
    if (step === 'payment') return (
      <div className="p-5">
        <StepIndicator step={step} />

        {/* Order summary */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 rounded-2xl p-4 mb-5">
          <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-2">Booking Summary</p>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Doctor</span>
              <span className="font-semibold text-slate-800">{doctor.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date</span>
              <span className="font-semibold text-slate-800">{days[selectedDayIdx].display} ({days[selectedDayIdx].label})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Time</span>
              <span className="font-semibold text-slate-800">{selectedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Type</span>
              <span className="font-semibold text-slate-800">{bookingType}</span>
            </div>
            <div className="border-t border-teal-100 my-2 pt-2 flex justify-between">
              <span className="font-bold text-slate-700">Total</span>
              <span className="font-extrabold text-teal-700 text-base">${fee}</span>
            </div>
          </div>
        </div>

        {/* Payment method tabs */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setPaymentMethod('card')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
              paymentMethod === 'card'
                ? 'border-teal-500 bg-teal-50 text-teal-700'
                : 'border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            <CreditCard size={16} /> Card
          </button>
          <button
            onClick={() => setPaymentMethod('cash')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
              paymentMethod === 'cash'
                ? 'border-teal-500 bg-teal-50 text-teal-700'
                : 'border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            💵 Pay at Clinic
          </button>
        </div>

        {/* Card form */}
        {paymentMethod === 'card' && (
          <div className="space-y-3 mb-5">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Cardholder Name</label>
              <input
                value={cardName}
                onChange={e => setCardName(e.target.value)}
                placeholder="John Smith"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Card Number</label>
              <input
                value={cardNumber}
                onChange={e => setCardNumber(formatCard(e.target.value))}
                placeholder="1234 5678 9012 3456"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Expiry</label>
                <input
                  value={cardExpiry}
                  onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">CVV</label>
                <input
                  value={cardCVV}
                  onChange={e => setCardCVV(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="•••"
                  type="password"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'cash' && (
          <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <p className="font-semibold mb-1">Pay at the clinic</p>
            <p className="text-amber-700 text-xs">Please arrive 10 minutes early and bring <strong>${fee}</strong> in cash.</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <button
          onClick={handleConfirmAppointment}
          disabled={isSubmitting || (paymentMethod === 'card' && (!cardName || cardNumber.length < 19 || cardExpiry.length < 5 || cardCVV.length < 3))}
          className="w-full py-3.5 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2"
        >
          {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Processing…</> : `Confirm & Pay $${fee}`}
        </button>

        <button
          onClick={() => setStep('datetime')}
          className="w-full mt-2 py-2.5 rounded-xl font-semibold text-slate-500 hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5 text-sm"
        >
          <ArrowLeft size={14} /> Back
        </button>
      </div>
    );

    // ── STEP 3: Confirmed ──
    if (step === 'confirmed') return (
      <div className="p-6 text-center">
        <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-teal-100">
          <Check size={36} className="text-teal-600" strokeWidth={3} />
        </div>
        <h3 className="text-xl font-extrabold text-slate-800 mb-1">You're Booked! 🎉</h3>
        <p className="text-slate-500 text-sm mb-5">Your appointment has been confirmed.</p>

        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 mb-6 text-left space-y-2 text-sm">
          <div className="flex items-center gap-3">
            <User size={15} className="text-teal-600 shrink-0" />
            <span className="text-slate-700"><span className="font-semibold">Doctor:</span> {doctor.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar size={15} className="text-teal-600 shrink-0" />
            <span className="text-slate-700">
              <span className="font-semibold">Date:</span> {days[selectedDayIdx].display} at {selectedTime}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {bookingType === 'Clinic' ? <MapPin size={15} className="text-teal-600 shrink-0" /> : <Video size={15} className="text-teal-600 shrink-0" />}
            <span className="text-slate-700">
              <span className="font-semibold">Type:</span> {bookingType === 'Clinic' ? 'In-Clinic Visit' : 'Video Consultation'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <CreditCard size={15} className="text-teal-600 shrink-0" />
            <span className="text-slate-700">
              <span className="font-semibold">Payment:</span> ${fee} · {paymentMethod === 'card' ? 'Card' : 'Pay at Clinic'}
            </span>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="w-full py-3 rounded-xl font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-all text-sm"
        >
          Book Another Appointment
        </button>
      </div>
    );
  };

  // ─── Page Layout ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-16">

      {/* Breadcrumb */}
      <nav className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-sm text-slate-500">
          <span className="hover:text-teal-600 cursor-pointer">Home</span>
          <ChevronRight size={14} />
          <span className="hover:text-teal-600 cursor-pointer">Doctors</span>
          <ChevronRight size={14} />
          <span className="text-teal-600 font-semibold">{doctor.name}</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── LEFT: Doctor Info ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Header Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-4 right-4 flex gap-2">
              <button className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-colors">
                <Share2 size={18} />
              </button>
              <button
                onClick={() => setIsFav(f => !f)}
                className={`p-2 rounded-full transition-colors ${isFav ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
              >
                <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="relative self-start">
                <img src={doctor.image} alt={doctor.name} className="w-28 h-28 rounded-2xl object-cover border border-slate-100 shadow" />
                <span className="absolute -bottom-2 -right-2 bg-white p-0.5 rounded-full">
                  <span className="block w-4 h-4 bg-green-500 rounded-full border-2 border-white" title="Online" />
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h1 className="text-2xl font-extrabold text-slate-900">{doctor.name}</h1>
                  <ShieldCheck className="text-teal-500" size={20} />
                </div>
                <p className="text-slate-500 font-medium mb-3">{doctor.specialty} · {doctor.hospital}</p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                    <Star size={15} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-bold">{doctor.rating}</span>
                    <span className="text-slate-400">({doctor.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                    <BriefcaseIcon className="text-teal-600" />
                    <span>{doctor.experience} Exp.</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                    <User size={15} className="text-teal-600" />
                    <span>{doctor.patients} Patients</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <SectionTitle title="About Doctor" />
            <p className="text-slate-600 leading-relaxed text-sm mb-6">{doctor.about}</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <GraduationCap size={18} className="text-teal-600" /> Education
                </h3>
                <ul className="space-y-2">
                  {doctor.education.map((edu, idx) => (
                    <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                      {edu}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Languages size={18} className="text-teal-600" /> Languages Spoken
                </h3>
                <div className="flex flex-wrap gap-2">
                  {doctor.languages.map((lang, idx) => (
                    <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-lg">{lang}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <SectionTitle title="Specializations & Services" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {services.map((service, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50/50 transition-colors group">
                  <div className="p-2 bg-teal-50 text-teal-600 rounded-lg group-hover:bg-teal-100 transition-colors">
                    <Stethoscope size={16} />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{service}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Clinic Info */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <SectionTitle title="Clinic Location" />
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="text-teal-600 mt-1 shrink-0" size={20} />
                  <div>
                    <h4 className="font-bold text-slate-800">Heart & Vascular Institute</h4>
                    <p className="text-sm text-slate-500 mt-1">123 Medical Center Dr, Suite 400<br />San Francisco, CA 94117</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="text-teal-600 mt-1 shrink-0" size={20} />
                  <div>
                    <h4 className="font-bold text-slate-800">Clinic Timings</h4>
                    <p className="text-sm text-slate-500 mt-1">Mon – Fri: 09:00 AM – 06:00 PM</p>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-64 h-40 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200">
                <span className="flex items-center gap-2"><MapPin size={16} /> Map View</span>
              </div>
            </div>
          </section>

          {/* Reviews */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <SectionTitle title="Patient Reviews" />
              <button className="text-sm font-medium text-teal-600 hover:underline">View All</button>
            </div>
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                        {review.user.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{review.user}</h4>
                        <span className="text-xs text-slate-400">{review.date}</span>
                      </div>
                    </div>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? '' : 'text-slate-200'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── RIGHT: Booking Panel ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 bg-white rounded-2xl shadow-xl border border-teal-100 overflow-hidden">
            {/* Panel header */}
            <div className={`p-4 border-b border-teal-100 ${step === 'confirmed' ? 'bg-teal-600' : 'bg-teal-50'}`}>
              <h3 className={`font-extrabold text-lg ${step === 'confirmed' ? 'text-white' : 'text-teal-900'}`}>
                {step === 'datetime' && 'Book Appointment'}
                {step === 'payment' && 'Complete Payment'}
                {step === 'confirmed' && '✓ Appointment Confirmed'}
              </h3>
              {step === 'datetime' && (
                <p className="text-teal-700 text-xs mt-0.5 flex items-center gap-1">
                  <CheckCircle2 size={11} /> Free cancellation within 24hrs
                </p>
              )}
            </div>

            {renderBookingPanel()}
          </div>
        </div>

      </main>
    </div>
  );
}

// ── Local SVG icon ────────────────────────────────────────────────────────────
function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}