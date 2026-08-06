import { Star, MapPin, Clock, ArrowRight, MessageSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface LiveDoctor {
  _id: string;
  fullName?: string;
  name?: string;
  specialization?: string;
  profilePictureUrl?: string;
  rating?: number;
  reviewCount?: number;
  reviewsCount?: number;
  reviews?: { rating: number }[];
  clinicAddress?: string;
  city?: string;
  province?: string;
  experienceYears?: number;
  consultationFee?: number;
  availability?: { day: string }[];
  isVideoEnabled?: boolean;
}

const DAY_SHORT: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

const LiveDoctorCard = ({ doctor }: { doctor: LiveDoctor }) => {
  const name = doctor.fullName || doctor.name || "Doctor";
  const specialty = doctor.specialization || "General Practice";
  const location = doctor.city || doctor.clinicAddress || "";
  const experience = doctor.experienceYears ?? 0;
  const fee = doctor.consultationFee;
  const reviews = doctor.reviews || [];
  const rating =
    doctor.rating && doctor.rating > 0
      ? doctor.rating
      : reviews.length > 0
        ? parseFloat(
            (
              reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
            ).toFixed(1),
          )
        : null;
  const reviewCount =
    doctor.reviewCount || doctor.reviewsCount || reviews.length || 0;
  // const days = (doctor.availability || []).map((a) => DAY_SHORT[a.day] || a.day).slice(0, 4);
  const avatar =
    doctor.profilePictureUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=16BCC8&color=fff&size=200`;

  return (
    <div className="group relative rounded-2xl border border-slate-100 bg-white p-5 shadow-card transition-all duration-300 hover:shadow-elevated hover:border-[#16BCC8]/20 hover:-translate-y-1 flex flex-col justify-between">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#16BCC8]/0 to-transparent transition-all duration-500 group-hover:via-[#16BCC8]/60 rounded-t-2xl" />
      <div>
        <div className="flex gap-4">
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl">
            <Image
              src={avatar}
              alt={name}
              width={56}
              height={56}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <div className="min-w-0">
                <h3 className="font-bold text-slate-800 text-[16px] truncate group-hover:text-[#16BCC8] transition-colors">
                  {name}
                </h3>
                <p className="text-[13px] text-[#16BCC8] font-semibold mt-0.5">
                  {specialty}
                </p>
              </div>
              {rating !== null ? (
                <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 border border-amber-100 flex-shrink-0">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-amber-700">
                    {rating}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 border border-slate-100 flex-shrink-0">
                  <Star className="h-3 w-3 text-slate-300" />
                  <span className="text-xs font-semibold text-slate-500">
                    New
                  </span>
                </div>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600 font-semibold">
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-[#16BCC8]" />
                  <span className="truncate max-w-[110px]">{location}</span>
                </span>
              )}
              {experience > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-[#16BCC8]" />
                  {experience} yrs exp.
                </span>
              )}
            </div>
          </div>
        </div>
        {reviewCount > 0 && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
            <MessageSquare className="h-3 w-3 text-slate-400" />
            <span>
              {reviewCount} patient {reviewCount === 1 ? "review" : "reviews"}
            </span>
          </div>
        )}
        {fee && fee > 0 && (
          <div className="mt-2.5 text-xs text-slate-600 font-semibold">
            Consultation:{" "}
            <span className="font-bold text-slate-800">
              Rs. {fee.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4">
        {/* Availability days */}
        {/* <div className="flex flex-wrap gap-1">
          {days.length > 0 ? (
            days.map((day) => (
              <span key={day} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 border border-slate-200">
                {day}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-slate-500 font-medium italic">Availability TBD</span>
          )}
        </div> */}

        {/* Buttons: View Profile & Book Now */}
        <div className="flex gap-2">
          <Link
            href={`/patient/selected-doctor/${doctor._id}`}
            className="flex-1"
          >
            <button className="w-full text-center py-2 text-[#16BCC8] bg-[#16BCC8]/8 hover:bg-[#16BCC8]/15 rounded-xl font-bold text-xs transition-all duration-200 border border-[#16BCC8]/10 hover:border-[#16BCC8]/20 cursor-pointer">
              View Profile
            </button>
          </Link>
          <Link
            href={`/patient/get-appointment/${doctor._id}?name=${encodeURIComponent(name)}&specialty=${encodeURIComponent(specialty)}&fee=${fee || 0}&image=${encodeURIComponent(avatar)}`}
            className="flex-1"
          >
            <button className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#16BCC8] to-[#0ea5a9] text-white text-xs font-bold rounded-xl py-2 shadow-[0_2px_8px_rgba(22,188,200,0.25)] hover:shadow-[0_4px_16px_rgba(22,188,200,0.4)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
              Book Now <ArrowRight className="h-3 w-3" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LiveDoctorCard;
