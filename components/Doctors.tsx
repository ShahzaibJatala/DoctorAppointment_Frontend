"use client"

import { useState } from "react";
import DoctorCard from "@/components/shared/DoctorCard";
import { Input } from "@/components/UI/input";
import { Button } from "@/components/UI/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { Search, Filter, SlidersHorizontal, Sparkles } from "lucide-react";
import { doctors, specialties } from "@/data/mockData";

const DoctorsComponent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === "All Specialties" ||
      doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#f0fafb] to-[#e8f7f9] py-14 lg:py-20">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -right-32 -top-32 h-[400px] w-[400px] rounded-full bg-[#16BCC8]/[0.03] blur-[80px]" />
          <div className="absolute -bottom-32 -left-32 h-[300px] w-[300px] rounded-full bg-[#16BCC8]/[0.02] blur-[80px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(22,188,200,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(22,188,200,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#16BCC8]/8 px-4 py-1.5 text-xs font-semibold text-[#16BCC8] uppercase tracking-wider mb-4 border border-[#16BCC8]/10">
              <Sparkles className="h-3.5 w-3.5" />
              Browse Professionals
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight lg:text-4xl">
              Find Your Perfect Doctor
            </h1>
            <p className="mt-3 text-slate-500 leading-relaxed">
              Browse our network of qualified healthcare professionals and book your appointment
            </p>
          </div>

          {/* Search Bar */}
          <div className="mx-auto mt-8 max-w-3xl animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white/90 backdrop-blur-sm p-4 shadow-elevated sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                <Input
                  placeholder="Search by name or specialty..."
                  className="border-0 bg-slate-50/80 pl-11 h-12 rounded-xl focus:bg-white transition-all duration-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger className="border-slate-200 rounded-xl h-12 w-auto min-w-[160px] cursor-pointer hover:border-[#16BCC8]/30 transition-colors duration-200">
                    <Filter className="mr-2 h-4 w-4 text-slate-400" />
                    <SelectValue placeholder="Specialty" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-elevated">
                    {specialties.map((specialty) => (
                      <SelectItem
                        key={specialty}
                        value={specialty}
                        className="cursor-pointer rounded-lg transition-colors hover:bg-[#16BCC8]/5 hover:text-[#16BCC8]"
                      >
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="hero"
                  className="rounded-xl h-12 px-6 text-white shadow-[0_2px_12px_rgba(22,188,200,0.3)] hover:shadow-[0_4px_20px_rgba(22,188,200,0.4)] transition-all duration-300"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {filteredDoctors.length} Doctors Found
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                {selectedSpecialty === "All Specialties"
                  ? "Showing all specialties"
                  : `Filtered by ${selectedSpecialty}`}
              </p>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl border-slate-200 hover:border-[#16BCC8]/30 hover:bg-[#16BCC8]/5 transition-all duration-200">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>

          {filteredDoctors.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredDoctors.map((doctor, index) => (
                <div key={doctor.id} className={`animate-fade-up stagger-${Math.min(index + 1, 6)}`}>
                  <DoctorCard doctor={doctor} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
                <Search className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                No doctors found
              </h3>
              <p className="mt-2 max-w-sm text-slate-400">
                Try adjusting your search criteria or browse all specialties
              </p>
              <Button
                variant="outline"
                className="mt-6 rounded-xl border-slate-200 hover:border-[#16BCC8]/30 hover:bg-[#16BCC8]/5 transition-all duration-200"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSpecialty("All Specialties");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default DoctorsComponent;
