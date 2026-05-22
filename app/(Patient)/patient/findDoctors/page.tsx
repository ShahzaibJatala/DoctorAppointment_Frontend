'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  Star, 
  Filter, 
  Calendar, 
  Stethoscope, 
  DollarSign,
  ChevronRight,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { getToken } from '@/app/actions/token';

// --- Types ---
type Doctor = {
  _id: string;            
  fullName?: string;      
  name?: string;
  specialization: string;
  profilePictureUrl?: string; 
  imageUrl?: string;
  rating?: number;
  reviewsCount?: number;
  clinicAddress?: string;
  city?: string;          
  consultationFee?: number;
  nextAvailable?: string;
  languages?: string[];
};




const specialties = ['All', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'Psychiatry'];

export default function FindDoctorPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [mockDoctors, setMockDoctors] = useState<Doctor[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  async function getAllDoctors(): Promise<Doctor[]> {
    const token = await getToken();
    try {
      const response = await fetch(`${serverUrl}/patient/allDoctors`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        cache: 'no-store'
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch doctors: ${response.status}`);
      }
  
      const data = await response.json();
      setMockDoctors(data)
      return data;
    } catch (error) {
      console.error("Error fetching all doctors:", error);
      return [];
    }
  }
 
  useEffect(() => {
    getAllDoctors();
  }, []);

  // --- Filtering Logic ---
  const filteredDoctors = mockDoctors.filter((doc: Doctor) => {
    const docName = doc.name || doc.fullName || '';
    const docSpecialization = doc.specialization || '';
    const docLocation = doc.clinicAddress || doc.city || '';

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      docName.toLowerCase().includes(searchLower) || 
      docSpecialization.toLowerCase().includes(searchLower) ||
      docLocation.toLowerCase().includes(searchLower);
    
    const matchesSpecialty = selectedSpecialty === 'All' || docSpecialization === selectedSpecialty;    

    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-white">
      
      {/* --- Hero / Search Section --- */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#16BCC8] via-[#14b0bc] to-[#0ea5a9] pt-16 pb-28 px-6">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-20 h-[400px] w-[400px] rounded-full bg-white/[0.06] blur-[60px]" />
          <div className="absolute -bottom-32 -right-20 h-[300px] w-[300px] rounded-full bg-white/[0.04] blur-[60px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white/90 border border-white/10 mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Browse Verified Professionals</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
            Find and book the <span className="text-white/80">right doctor</span> for you.
          </h1>
          <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">Search by name, specialty, or location to find your perfect match</p>
          
          {/* Main Search Bar */}
          <div className="max-w-3xl mx-auto bg-white/95 backdrop-blur-sm p-2.5 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex items-center px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              <Search className="text-slate-300 w-5 h-5 mr-3 shrink-0" />
              <input 
                type="text" 
                placeholder="Search doctors, specialties, or symptoms..." 
                className="w-full bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-300 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="hidden md:block w-px bg-slate-100 my-2"></div>
            <div className="flex-1 flex items-center px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              <MapPin className="text-slate-300 w-5 h-5 mr-3 shrink-0" />
              <input 
                type="text" 
                placeholder="City, state, or zip code" 
                className="w-full bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-300 text-sm"
              />
            </div>
            <button className="bg-gradient-to-r from-[#16BCC8] to-[#0ea5a9] hover:from-[#14b0bc] hover:to-[#0d9a9e] text-white px-8 py-3 rounded-xl font-semibold transition-all w-full md:w-auto shadow-[0_4px_16px_rgba(22,188,200,0.35)] hover:shadow-[0_6px_24px_rgba(22,188,200,0.45)]">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12 relative z-20 flex flex-col lg:flex-row gap-8 pb-16">
        
        {/* Mobile filter overlay */}
        {filtersOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setFiltersOpen(false)}
            aria-hidden
          />
        )}

        {/* Sidebar Filters */}
        <aside className={`w-full lg:w-72 shrink-0 space-y-5 fixed lg:static inset-y-0 left-0 z-50 lg:z-auto max-w-[85vw] lg:max-w-none overflow-y-auto bg-white lg:bg-transparent p-4 lg:p-0 shadow-2xl lg:shadow-none transition-transform duration-300 lg:translate-x-0 ${filtersOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="bg-white p-6 rounded-2xl shadow-elevated border border-slate-100 animate-fade-up">
            <div className="flex items-center justify-between font-bold text-slate-800 mb-5 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#16BCC8]/10 text-[#16BCC8]">
                  <Filter size={16} />
                </div>
                <span>Filters</span>
              </div>
              <button
                type="button"
                className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
              {selectedSpecialty !== 'All' && (
                <button 
                  onClick={() => setSelectedSpecialty('All')}
                  className="text-xs text-[#16BCC8] font-medium hover:text-[#0ea5a9] transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Specialty</h3>
                <div className="space-y-1.5">
                  {specialties.map((spec) => (
                    <label key={spec} className={`flex items-center gap-3 cursor-pointer group px-3 py-2.5 rounded-xl transition-all duration-200 ${selectedSpecialty === spec ? 'bg-[#16BCC8]/8' : 'hover:bg-slate-50'}`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${selectedSpecialty === spec ? 'border-[#16BCC8] bg-[#16BCC8]' : 'border-slate-300 group-hover:border-slate-400'}`}>
                        {selectedSpecialty === spec && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <input 
                        type="radio" 
                        name="specialty" 
                        className="sr-only"
                        checked={selectedSpecialty === spec}
                        onChange={() => setSelectedSpecialty(spec)}
                      />
                      <span className={`text-sm transition-colors duration-200 ${selectedSpecialty === spec ? 'text-[#16BCC8] font-semibold' : 'text-slate-600 group-hover:text-slate-800'}`}>
                        {spec}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Doctor List */}
        <div className="flex-1">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-up" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-start justify-between gap-3 sm:block">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'} found
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  {selectedSpecialty === 'All' ? 'Showing all specialties' : `Filtered by ${selectedSpecialty}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 shrink-0"
              >
                <SlidersHorizontal size={16} />
                Filters
              </button>
            </div>
            <select className="w-full sm:w-auto bg-white border border-slate-200 text-slate-600 text-sm rounded-xl focus:ring-2 focus:ring-[#16BCC8]/20 focus:border-[#16BCC8] px-4 py-2.5 cursor-pointer transition-all duration-200 hover:border-slate-300">
              <option>Recommended</option>
              <option>Highest Rated</option>
              <option>Lowest Fee</option>
            </select>
          </div>

          <div className="space-y-4">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doc, index) => (
                <div 
                  key={doc._id} 
                  className={`group bg-white p-6 rounded-2xl border border-slate-100 shadow-card hover:shadow-elevated hover:border-[#16BCC8]/15 hover:-translate-y-0.5 transition-all duration-300 flex flex-col sm:flex-row gap-6 animate-fade-up stagger-${Math.min(index + 1, 6)}`}
                >
                  {/* Avatar */}
                  <div className="shrink-0 relative w-24 h-24 mx-auto sm:mx-0">
                    <img src={doc.profilePictureUrl} alt={doc.name} className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-50 shadow-sm transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 bg-[#20AC6B] border-2 border-white rounded-full shadow-sm"></div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-[#16BCC8] transition-colors duration-200">{doc.fullName}</h3>
                        <p className="text-[#16BCC8] font-medium flex items-center justify-center sm:justify-start gap-1.5 text-sm mt-1">
                          <Stethoscope size={14} /> {doc.specialization}
                        </p>
                        
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-slate-300" /> {doc.clinicAddress}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <DollarSign size={14} className="text-slate-300" /> ${doc.consultationFee} / visit
                          </span>
                        </div>
                      </div>

                      {/* Right side stats */}
                      <div className="flex flex-col items-center sm:items-end gap-2">
                        <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100/50">
                          <Star size={14} className="text-[#F59F0A] fill-[#F59F0A]" />
                          <span className="font-bold text-amber-700 text-sm">{doc?.rating}</span>
                          <span className="text-amber-600/60 text-xs">({doc?.reviewsCount})</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-5 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#16BCC8]/8 text-[#16BCC8]">
                          <Calendar size={14} />
                        </div>
                        Next available: <span className="font-semibold text-slate-700">{doc.nextAvailable}</span>
                      </div>
                      <div className="flex gap-3 w-full sm:w-auto">
                        <Link 
                          href={`/patient/selected-doctor/${doc._id}`}
                          className="flex-1 sm:flex-none px-6 py-2.5 text-[#16BCC8] bg-[#16BCC8]/8 hover:bg-[#16BCC8]/15 rounded-xl font-semibold text-sm transition-all duration-200 text-center border border-[#16BCC8]/10 hover:border-[#16BCC8]/20"
                        >
                          View Profile
                        </Link>
                        <Link
                          href={`/patient/get-appointment/${doc._id}?name=${encodeURIComponent(doc.fullName || '')}&specialty=${encodeURIComponent(doc.specialization || '')}&fee=${doc.consultationFee || 0}&image=${encodeURIComponent(doc.profilePictureUrl || '')}`}
                          className="flex-1 sm:flex-none px-6 py-2.5 text-white bg-gradient-to-r from-[#16BCC8] to-[#0ea5a9] hover:from-[#14b0bc] hover:to-[#0d9a9e] rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(22,188,200,0.3)] hover:shadow-[0_4px_16px_rgba(22,188,200,0.4)]"
                        >
                          Book Now
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-16 rounded-2xl border border-slate-100 text-center shadow-card animate-fade-up">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Search size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">No doctors found</h3>
                <p className="text-slate-400 max-w-sm mx-auto">We couldn't find any doctors matching your current filters. Try adjusting your search criteria.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedSpecialty('All'); }}
                  className="mt-6 text-[#16BCC8] font-semibold hover:text-[#0ea5a9] transition-colors duration-200"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}