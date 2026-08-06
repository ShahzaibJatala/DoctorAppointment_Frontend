
import { Button } from "@/components/UI/button";
import { Star, MapPin, Clock, ArrowRight } from "lucide-react";
import type { Doctor } from "@/data/mockData";
import Link from "next/link";

interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard = ({ doctor }: DoctorCardProps) => {
  return (
    <div className="group relative rounded-2xl border border-slate-100 bg-white p-5 shadow-card transition-all duration-400 hover:shadow-elevated hover:border-[#16BCC8]/15 hover:-translate-y-1 flex flex-col justify-between">
      {/* Subtle gradient accent on hover */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#16BCC8]/0 to-transparent transition-all duration-500 group-hover:via-[#16BCC8]/40 rounded-t-2xl" />

      <div>
        <div className="flex gap-4">
          {/* Doctor Image */}
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl">
            <img
              src={doctor.image}
              alt={doctor.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Online indicator */}
            <div className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-[#20AC6B] border-2 border-white shadow-sm" />
          </div>

          {/* Doctor Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-800 text-[16px] truncate group-hover:text-[#16BCC8] transition-colors duration-200">
                  {doctor.name}
                </h3>
                <p className="text-[13px] text-[#16BCC8] font-semibold mt-0.5">{doctor.specialty}</p>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 border border-amber-100/50">
                <Star className="h-3.5 w-3.5 fill-[#F59F0A] text-[#F59F0A]" />
                <span className="text-sm font-semibold text-amber-700">{doctor.rating}</span>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600 font-semibold">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-[#16BCC8]" />
                {doctor.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-[#16BCC8]" />
                {doctor.experience} yrs exp.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Availability & Actions */}
      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4">
        <div className="flex flex-wrap gap-1">
          {doctor.availability.slice(0, 4).map((day) => (
            <span
              key={day}
              className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 border border-slate-200 transition-colors duration-200 hover:bg-[#16BCC8]/5 hover:text-[#16BCC8] hover:border-[#16BCC8]/20"
            >
              {day}
            </span>
          ))}
        </div>
        
        {/* Buttons: View Profile & Book Now */}
        <div className="flex gap-2">
          <Link href={`/patient/selected-doctor/${doctor.id}`} className="flex-1">
            <button className="w-full text-center py-2 text-[#16BCC8] bg-[#16BCC8]/8 hover:bg-[#16BCC8]/15 rounded-xl font-bold text-xs transition-all duration-200 border border-[#16BCC8]/10 hover:border-[#16BCC8]/20 cursor-pointer">
              View Profile
            </button>
          </Link>
          <Link href={`/patient/get-appointment/${doctor.id}?name=${encodeURIComponent(doctor.name)}&specialty=${encodeURIComponent(doctor.specialty)}&fee=1199&image=${encodeURIComponent(doctor.image)}`} className="flex-1">
            <button className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#16BCC8] to-[#0ea5a9] text-white text-xs font-bold rounded-xl py-2 shadow-[0_2px_8px_rgba(22,188,200,0.25)] hover:shadow-[0_4px_16px_rgba(22,188,200,0.35)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
              Book Now <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
