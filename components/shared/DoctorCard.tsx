
import { Button } from "@/components/UI/button";
import { Star, MapPin, Clock, ArrowRight } from "lucide-react";
import type { Doctor } from "@/data/mockData";
import Link from "next/link";

interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard = ({ doctor }: DoctorCardProps) => {
  return (
    <div className="group relative rounded-2xl border border-slate-100 bg-white p-5 shadow-card transition-all duration-400 hover:shadow-elevated hover:border-[#16BCC8]/15 hover:-translate-y-1">
      {/* Subtle gradient accent on hover */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#16BCC8]/0 to-transparent transition-all duration-500 group-hover:via-[#16BCC8]/40 rounded-t-2xl" />

      <div className="flex gap-4">
        {/* Doctor Image */}
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl">
          <img
            src={doctor.image}
            alt={doctor.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Online indicator */}
          <div className="absolute bottom-1.5 right-1.5 h-3 w-3 rounded-full bg-[#20AC6B] border-2 border-white shadow-sm" />
        </div>

        {/* Doctor Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-800 truncate group-hover:text-[#16BCC8] transition-colors duration-200">
                {doctor.name}
              </h3>
              <p className="text-sm text-[#16BCC8] font-medium mt-0.5">{doctor.specialty}</p>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 border border-amber-100/50">
              <Star className="h-3.5 w-3.5 fill-[#F59F0A] text-[#F59F0A]" />
              <span className="text-sm font-semibold text-amber-700">{doctor.rating}</span>
            </div>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-slate-300" />
              {doctor.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-slate-300" />
              {doctor.experience} yrs exp.
            </span>
          </div>
        </div>
      </div>

      {/* Availability & Actions */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
        <div className="flex flex-wrap gap-1.5">
          {doctor.availability.slice(0, 4).map((day) => (
            <span
              key={day}
              className="rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500 border border-slate-100/50 transition-colors duration-200 hover:bg-[#16BCC8]/5 hover:text-[#16BCC8] hover:border-[#16BCC8]/20"
            >
              {day}
            </span>
          ))}
        </div>
        <Link href={`/doctors/${doctor.id}`}>
          <Button
            size="sm"
            className="bg-gradient-to-r from-[#16BCC8] to-[#0ea5a9] text-white cursor-pointer rounded-xl px-5 shadow-[0_2px_8px_rgba(22,188,200,0.25)] hover:shadow-[0_4px_16px_rgba(22,188,200,0.35)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            Book Now
            <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default DoctorCard;
