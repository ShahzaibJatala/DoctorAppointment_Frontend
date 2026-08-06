'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
type DayOption = { label: string; dayName: string; fullDayName: string; date: Date; display: string };


// ─── Helpers ──────────────────────────────────────────────────────────────────
function getNextSevenDays(): DayOption[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[d.getDay()],
      dayName: days[d.getDay()],
      fullDayName: dayNamesFull[d.getDay()],
      date: d,
      display: `${d.getDate()} ${months[d.getMonth()]}`,
    };
  });
}

// Generate 24/7 time slots every 30 minutes
function generate24HourSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const period = hour < 12 ? 'AM' : 'PM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const displayMin = min === 0 ? '00' : min;
      slots.push({
        time: `${displayHour}:${displayMin} ${period}`,
        period: hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening'
      });
    }
  }
  return slots;
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
    <div className="flex items-center justify-between mb-4 sm:mb-6 px-1">
      {steps.map((s, idx) => (
        <React.Fragment key={s.key}>
          <div className="flex flex-col items-center gap-1">
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              idx < current ? 'bg-teal-600 text-white' :
              idx === current ? 'bg-teal-600 text-white ring-3 sm:ring-4 ring-teal-100' :
              'bg-slate-100 text-slate-400'
            }`}>
              {idx < current ? <Check size={14} /> : idx + 1}
            </div>
            <span className={`text-[9px] sm:text-[10px] font-medium ${idx <= current ? 'text-teal-700' : 'text-slate-400'}`}>
              {s.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 sm:mx-2 mb-3 sm:mb-4 rounded transition-all ${idx < current ? 'bg-teal-500' : 'bg-slate-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const SlotGroup = ({
  title, slots, selected, onSelect, bookedTimes
}: {
  title: string; slots: TimeSlot[]; selected: string | null; onSelect: (t: string) => void; bookedTimes: string[];
}) => {
  if (slots.length === 0) return null;
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{title}</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {slots.map((slot, i) => {
          const isBooked = bookedTimes.includes(slot.time);
          return (
            <button
              key={i}
              type="button"
              disabled={isBooked}
              onClick={() => onSelect(slot.time)}
              className={`text-xs sm:text-sm font-semibold py-2.5 sm:py-3 rounded-lg border transition-all ${
                isBooked
                  ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60 line-through'
                  : selected === slot.time
                  ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-700'
              }`}
            >
              {slot.time}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DoctorProfile() {
  const params = useParams();
  const doctorId = params.doctorId as string;
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  // Real data state
  const [doctor, setDoctor] = useState<any>(null);
  const [bookedAppointments, setBookedAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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

  // Fetch doctor data and booked appointments
  useEffect(() => {
    async function fetchDoctorAndAppointments() {
      try {
        const token = await getToken();
        const headers: any = { 'Content-Type': 'application/json' };
        let cleanToken = '';
        if (token) {
          cleanToken = token.replace(/"/g, '').trim();
          headers['Authorization'] = `Bearer ${cleanToken}`;
        }

        // 1. Fetch specific doctor by ID
        const response = await axios.get(`${serverUrl}/patient/doctor/${doctorId}`, { headers });
        setDoctor(response.data);

        // 2. Fetch booked appointments if logged in
        if (cleanToken && response.data) {
          const bookedRes = await axios.get(`${serverUrl}/patient/doctor-appointments/${doctorId}`, {
            headers: { Authorization: `Bearer ${cleanToken}` }
          });
          setBookedAppointments(bookedRes.data);
        }
      } catch (error) {
        console.error('Error fetching doctor details:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDoctorAndAppointments();
  }, [doctorId, serverUrl]);

  // ── Dynamic dates (next 7 days) ──
  const days = useMemo(() => getNextSevenDays(), []);

  const fee = useMemo(() => {
    if (!doctor) return 100;
    const clinicFee = Number(doctor.consultationFee ?? 0);
    const videoFee = Number(doctor.videoConsultationFee ?? 0);
    return bookingType === 'Clinic' ? clinicFee : videoFee;
  }, [doctor, bookingType]);

  const services = doctor?.services?.length
    ? doctor.services
    : [doctor?.specialization || 'General Consultation'];

  // Retrieve already booked appointment slot strings for the selected date

  const reviews = (doctor?.reviews || []).map((review: any) => ({
    id: review._id,
    user: review.userName || 'Patient',
    rating: review.rating,
    date: review.createdAt ? new Date(review.createdAt).toLocaleDateString() : '',
    comment: review.comment,
  }));
  const bookedTimesForSelectedDay = useMemo(() => {
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

  // Use 24/7 time slots every 30 minutes
  const timeSlotsForSelectedDay = useMemo(() => {
    return generate24HourSlots();
  }, []);

  // ── Slot groups (show first 8 slots per period for better UX) ──
  const morning = useMemo(() => timeSlotsForSelectedDay.filter(s => s.period === 'Morning').slice(0, 8), [timeSlotsForSelectedDay]);
  const afternoon = useMemo(() => timeSlotsForSelectedDay.filter(s => s.period === 'Afternoon').slice(0, 8), [timeSlotsForSelectedDay]);
  const evening = useMemo(() => timeSlotsForSelectedDay.filter(s => s.period === 'Evening').slice(0, 8), [timeSlotsForSelectedDay]);

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
      <div className="p-3 sm:p-5">
        <StepIndicator step={step} />

        {/* Consultation type */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-4 sm:mb-5">
          {(['Clinic', 'Video'] as BookingType[]).map(type => (
            <button
              key={type}
              onClick={() => setBookingType(type)}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                bookingType === type ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {type === 'Clinic' ? <MapPin size={15} /> : <Video size={15} />}
              {type === 'Clinic' ? 'In-Clinic' : 'Video'}
            </button>
          ))}
        </div>

        {/* Fee */}
        <div className="flex justify-between items-center mb-4 sm:mb-5 pb-3 sm:pb-4 border-b border-slate-100">
          <span className="text-xs sm:text-sm text-slate-500 font-medium">Consultation Fee</span>
          <span className="text-lg sm:text-xl font-extrabold text-teal-700">PKR {fee}</span>
        </div>

        {/* Date selector */}
        <div className="mb-4 sm:mb-5">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
              <Calendar size={14} className="text-teal-600" /> Select Date
            </h4>
            <span className="text-[10px] sm:text-xs text-slate-400 font-medium">Next 7 days</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {days.map((d, i) => (
              <button
                key={i}
                onClick={() => { setSelectedDayIdx(i); setSelectedTime(null); }}
                className={`flex flex-col items-center justify-center min-w-[52px] sm:min-w-[62px] py-2 sm:py-2.5 px-1 rounded-xl border-2 transition-all flex-shrink-0 ${
                  selectedDayIdx === i
                    ? 'bg-teal-600 border-teal-600 text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300'
                }`}
              >
                <span className="text-[9px] sm:text-[10px] font-semibold opacity-75">{d.label}</span>
                <span className="text-sm sm:text-base font-extrabold leading-tight">{d.date.getDate()}</span>
                <span className="text-[8px] sm:text-[9px] opacity-70">{d.display.split(' ')[1]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Time slots */}
        <div className="mb-4 sm:mb-5">
          <h4 className="font-bold text-slate-800 text-xs sm:text-sm mb-2 sm:mb-3 flex items-center gap-1.5">
            <Clock size={14} className="text-teal-600" /> Available Slots
          </h4>
          {timeSlotsForSelectedDay.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-slate-400 text-xs sm:text-sm bg-slate-50 border border-slate-100/70 rounded-xl italic">
              Doctor has no availability shifts configured for this day.
            </div>
          ) : (
            <>
              <SlotGroup title="Morning" slots={morning} selected={selectedTime} onSelect={setSelectedTime} bookedTimes={bookedTimesForSelectedDay} />
              <SlotGroup title="Afternoon" slots={afternoon} selected={selectedTime} onSelect={setSelectedTime} bookedTimes={bookedTimesForSelectedDay} />
              <SlotGroup title="Evening" slots={evening} selected={selectedTime} onSelect={setSelectedTime} bookedTimes={bookedTimesForSelectedDay} />
            </>
          )}
        </div>

        {/* Selected summary */}
        {selectedTime && (
          <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-teal-50 border border-teal-100 rounded-xl text-xs sm:text-sm text-teal-800 flex items-center gap-2">
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
          className={`w-full py-3 sm:py-3.5 rounded-xl font-bold text-white transition-all shadow-md text-sm sm:text-base ${
            selectedTime
              ? 'bg-teal-600 hover:bg-teal-700 hover:shadow-lg'
              : 'bg-slate-300 cursor-not-allowed'
          }`}
        >
          {selectedTime ? 'Proceed to Payment →' : 'Select a Time Slot'}
        </button>

        <p className="text-center text-[10px] sm:text-xs text-slate-400 mt-2 sm:mt-3 flex items-center justify-center gap-1">
          <Info size={11} /> Usually responds within 1 hour
        </p>
      </div>
    );

    // ── STEP 2: Payment ──
    if (step === 'payment') return (
      <div className="p-3 sm:p-5">
        <StepIndicator step={step} />

        {/* Order summary */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-5">
          <p className="text-[10px] sm:text-xs font-bold text-teal-600 uppercase tracking-wider mb-2">Booking Summary</p>
          <div className="space-y-1.5 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Doctor</span>
              <span className="font-semibold text-slate-800 truncate ml-2">{doctor?.fullName}</span>
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
              <span className="font-extrabold text-teal-700 text-sm sm:text-base">PKR {fee}</span>
            </div>
          </div>
        </div>

        {/* Payment method tabs */}
        <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4">
          <button
            onClick={() => setPaymentMethod('card')}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-xl border-2 text-xs sm:text-sm font-bold transition-all ${
              paymentMethod === 'card'
                ? 'border-teal-500 bg-teal-50 text-teal-700'
                : 'border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            <CreditCard size={16} /> Card
          </button>
          <button
            onClick={() => setPaymentMethod('cash')}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-xl border-2 text-xs sm:text-sm font-bold transition-all ${
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
          <div className="space-y-3 mb-4 sm:mb-5">
            <div>
              <label className="text-[10px] sm:text-xs font-semibold text-slate-500 mb-1 block">Cardholder Name</label>
              <input
                value={cardName}
                onChange={e => setCardName(e.target.value)}
                placeholder="John Smith"
                className="w-full px-3 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] sm:text-xs font-semibold text-slate-500 mb-1 block">Card Number</label>
              <input
                value={cardNumber}
                onChange={e => setCardNumber(formatCard(e.target.value))}
                placeholder="1234 5678 9012 3456"
                className="w-full px-3 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div>
                <label className="text-[10px] sm:text-xs font-semibold text-slate-500 mb-1 block">Expiry</label>
                <input
                  value={cardExpiry}
                  onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  className="w-full px-3 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] sm:text-xs font-semibold text-slate-500 mb-1 block">CVV</label>
                <input
                  value={cardCVV}
                  onChange={e => setCardCVV(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="•••"
                  type="password"
                  className="w-full px-3 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'cash' && (
          <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs sm:text-sm text-amber-800">
            <p className="font-semibold mb-1">Pay at the clinic</p>
            <p className="text-amber-700 text-[10px] sm:text-xs">Please arrive 10 minutes early and bring <strong>PKR {fee}</strong> in cash.</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <button
          onClick={handleConfirmAppointment}
          disabled={isSubmitting || (paymentMethod === 'card' && (!cardName || cardNumber.length < 19 || cardExpiry.length < 5 || cardCVV.length < 3))}
          className="w-full py-3 sm:py-3.5 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Processing…</> : `Confirm & Pay PKR ${fee}`}
        </button>

        <button
          onClick={() => setStep('datetime')}
          className="w-full mt-2 py-2 sm:py-2.5 rounded-xl font-semibold text-slate-500 hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5 text-xs sm:text-sm"
        >
          <ArrowLeft size={14} /> Back
        </button>
      </div>
    );

    // ── STEP 3: Confirmed ──
    if (step === 'confirmed') return (
      <div className="p-4 sm:p-6 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border-4 border-teal-100">
          <Check size={36} className="text-teal-600" strokeWidth={3} />
        </div>
        <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 mb-1">You're Booked! 🎉</h3>
        <p className="text-slate-500 text-xs sm:text-sm mb-4 sm:mb-5">Your appointment has been confirmed.</p>

        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 text-left space-y-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <User size={15} className="text-teal-600 shrink-0" />
            <span className="text-slate-700"><span className="font-semibold">Doctor:</span> {doctor?.fullName}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Calendar size={15} className="text-teal-600 shrink-0" />
            <span className="text-slate-700">
              <span className="font-semibold">Date:</span> {days[selectedDayIdx].display} at {selectedTime}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {bookingType === 'Clinic' ? <MapPin size={15} className="text-teal-600 shrink-0" /> : <Video size={15} className="text-teal-600 shrink-0" />}
            <span className="text-slate-700">
              <span className="font-semibold">Type:</span> {bookingType === 'Clinic' ? 'In-Clinic Visit' : 'Video Consultation'}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <CreditCard size={15} className="text-teal-600 shrink-0" />
            <span className="text-slate-700">
              <span className="font-semibold">Payment:</span> PKR {fee} · {paymentMethod === 'card' ? 'Card' : 'Pay at Clinic'}
            </span>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="w-full py-2.5 sm:py-3 rounded-xl font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-all text-xs sm:text-sm"
        >
          Book Another Appointment
        </button>
      </div>
    );
  };

  const handleSubmitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!reviewComment.trim()) return;
    setIsSubmittingReview(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Please log in to submit a review.');
      const cleanToken = token.replace(/"/g, '').trim();
      const response = await axios.post(
        `${serverUrl}/patient/doctor-reviews/${doctorId}`,
        { rating: reviewRating, comment: reviewComment.trim() },
        { headers: { Authorization: `Bearer ${cleanToken}` } },
      );
      const updatedDoctor = response.data;
      const updatedReviews = updatedDoctor.reviews || [];
      const rating = updatedReviews.length
        ? Number((updatedReviews.reduce((sum: number, review: any) => sum + review.rating, 0) / updatedReviews.length).toFixed(1))
        : 0;
      setDoctor({ ...updatedDoctor, rating, reviewCount: updatedReviews.length });
      setReviewComment('');
    } catch (error: any) {
      alert(error.response?.data?.message || error.message || 'Could not submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };
  if (isLoading) {
    return (

      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-40">
        <Loader2 className="w-10 h-10 text-[#16BCC8] animate-spin mb-4" />
        <p className="text-slate-500 font-medium font-sans">Loading doctor profile...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-40">
        <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm text-center max-w-sm">
          <p className="text-slate-500 font-medium mb-4">Doctor profile details not found.</p>
          <a href="/patient/findDoctors" className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-sm transition-all">
            Return to Doctor List
          </a>
        </div>
      </div>
    );
  }

  // ─── Page Layout ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-16">

      {/* Breadcrumb */}
      <nav className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-sm text-slate-500">
          <a href="/patient/dashboard" className="hover:text-teal-600 cursor-pointer">Dashboard</a>
          <ChevronRight size={14} />
          <a href="/patient/findDoctors" className="hover:text-teal-600 cursor-pointer">Doctors</a>
          <ChevronRight size={14} />
          <span className="text-teal-600 font-semibold">{doctor.fullName}</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 pt-6 sm:pt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

        {/* ── LEFT: Doctor Info ── */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">

          {/* Header Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex gap-2">
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

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="relative self-start shrink-0 mx-auto sm:mx-0">
                <img
                  src={doctor.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.fullName)}&background=0D9488&color=fff`}
                  alt=""
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-slate-100 shadow"
                />
                <span className="absolute -bottom-2 -right-2 bg-white p-0.5 rounded-full">
                  <span className="block w-4 h-4 bg-green-500 rounded-full border-2 border-white" title="Online" />
                </span>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-0.5">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{doctor.fullName}</h1>
                  <ShieldCheck className="text-teal-500" size={20} />
                </div>
                <p className="text-slate-500 font-medium mb-2 sm:mb-3 text-sm sm:text-base">{doctor.specialization} · {doctor.clinicName || 'Clinic Desk'}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 bg-slate-50 px-2.5 sm:px-3 py-1.5 rounded-lg">
                    <Star size={15} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-bold">{doctor.rating ?? 0}</span>
                    <span className="text-slate-400">({doctor.reviewCount ?? 0})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 bg-slate-50 px-2.5 sm:px-3 py-1.5 rounded-lg">
                    <BriefcaseIcon className="text-teal-600" />
                    <span>{doctor.experienceYears || 1} Years Exp.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
            <SectionTitle title="About Doctor" />
            <p className="text-slate-600 leading-relaxed text-sm mb-4 sm:mb-6">{doctor.Bio || `Dr. ${doctor.fullName} is a dedicated ${doctor.specialization} specialist committed to providing exceptional, patient-centered healthcare. Specializes in custom treatment plans and advanced clinical care.`}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h3 className="font-semibold text-slate-800 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <GraduationCap size={18} className="text-teal-600" /> Professional Details
                </h3>
                <ul className="space-y-2">
                  <li className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                    License Number: {doctor.LicenseNumber || 'N/A'}
                  </li>
                  <li className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                    Medical Board: {doctor.medicalBoard || 'Provincial Medical Council'}
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <Languages size={18} className="text-teal-600" /> Languages Spoken
                </h3>
                <div className="flex flex-wrap gap-2">
                  {doctor.language && doctor.language.length > 0 ? (
                    doctor.language.map((lang: string, idx: number) => (
                      <span key={idx} className="px-2.5 sm:px-3 py-1 bg-slate-100 text-slate-600 text-xs sm:text-sm rounded-lg">{lang}</span>
                    ))
                  ) : (
                    <span className="px-2.5 sm:px-3 py-1 bg-slate-100 text-slate-600 text-xs sm:text-sm rounded-lg">English</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
            <SectionTitle title="Specializations & Services" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
              {services.map((service: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50/50 transition-colors group">
                  <div className="p-1.5 sm:p-2 bg-teal-50 text-teal-600 rounded-lg group-hover:bg-teal-100 transition-colors shrink-0">
                    <Stethoscope size={16} />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-slate-700">{service}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Clinic Info */}
          <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
            <SectionTitle title="Clinic Location" />
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex-1 space-y-3 sm:space-y-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <MapPin className="text-teal-600 mt-1 shrink-0" size={20} />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base">{doctor.clinicName || 'Clinic Desk'}</h4>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">{doctor.clinicAddress || 'Hospital Address'}{doctor.city ? `, ${doctor.city}` : ''}{doctor.province ? `, ${doctor.province}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <Clock className="text-teal-600 mt-1 shrink-0" size={20} />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base">Working Hours</h4>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">24/7 Available</p>
                  </div>
                </div>
              </div>
              <div className="w-full sm:w-80 md:w-96 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                {doctor.clinicLatitude != null && doctor.clinicLongitude != null ? (
                  <>
                    <iframe title={`${doctor.clinicName || 'Clinic'} location`} src={`https://www.google.com/maps?q=${doctor.clinicLatitude},${doctor.clinicLongitude}&z=16&output=embed`} className="h-36 sm:h-44 w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                    <a href={`https://www.google.com/maps/search/?api=1&query=${doctor.clinicLatitude},${doctor.clinicLongitude}`} target="_blank" rel="noreferrer" className="block bg-white px-3 py-2 text-center text-xs font-bold text-teal-700">Open in Google Maps</a>
                  </>
                ) : (
                  <div className="flex h-36 sm:h-40 items-center justify-center text-slate-400"><span className="flex items-center gap-2 text-xs sm:text-sm"><MapPin size={16} /> Location not added</span></div>
                )}
              </div>
            </div>
          </section>

          {/* Reviews */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <SectionTitle title="Patient Reviews" />
              <span className="text-sm font-medium text-slate-500">{reviews.length} reviews</span>
            </div>
            <form onSubmit={handleSubmitReview} className="mb-7 rounded-2xl border border-teal-100 bg-teal-50/40 p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-slate-700">Share your experience</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(value => (
                    <button key={value} type="button" onClick={() => setReviewRating(value)} aria-label={`${value} stars`}>
                      <Star size={18} className={value <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={reviewComment}
                onChange={event => setReviewComment(event.target.value)}
                required
                rows={3}
                placeholder="Write your review..."
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-teal-400 focus:outline-none"
              />
              <button disabled={isSubmittingReview} className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
            <div className="space-y-6">
              {reviews.length === 0 && <p className="text-sm text-slate-400">No reviews yet. Be the first to review this doctor.</p>}
              {reviews.map((review: { id: string; user: string; rating: number; date: string; comment: string }) => (
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
        <div className="lg:col-span-1 order-first lg:order-last">
          <div className="sticky top-4 sm:top-6 bg-white rounded-2xl shadow-xl border border-teal-100 overflow-hidden">
            {/* Panel header */}
            <div className={`p-3 sm:p-4 border-b border-teal-100 ${step === 'confirmed' ? 'bg-teal-600' : 'bg-teal-50'}`}>
              <h3 className={`font-extrabold text-base sm:text-lg ${step === 'confirmed' ? 'text-white' : 'text-teal-900'}`}>
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