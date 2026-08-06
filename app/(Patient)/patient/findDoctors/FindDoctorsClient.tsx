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
  ChevronRight,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  X,
  Loader2
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

type SearchSuggestion = {
  label: string;
  type: 'Doctor' | 'Specialization' | 'Service' | 'City' | 'Province';
  value: string;
};

const specialties = ['All', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'Psychiatry', 'General Practice', 'Ophthalmology'];

export default function FindDoctorsClient({ initialDoctors, serverUrl }: { initialDoctors: Doctor[], serverUrl: string }) {
  const [locationQuery, setLocationQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [mockDoctors, setMockDoctors] = useState<Doctor[]>(initialDoctors);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState('All');
  const [sortBy, setSortBy] = useState('Recommended');

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
    } finally {
      setIsLoading(false);
    }
  }

  async function searchDoctors() {
    setIsLoading(true);
    setShowSuggestions(false);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (locationQuery.trim()) params.set('location', locationQuery.trim());
      if (selectedSpecialty !== 'All') params.set('specialty', selectedSpecialty);
      const response = await fetch(`${serverUrl}/patient/search-doctors?${params.toString()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Search failed: ${response.status}`);
      setMockDoctors(await response.json());
      setCurrentPage(1);
    } catch (error) {
      console.error('Doctor search failed:', error);
      setMockDoctors([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `${serverUrl}/patient/doctor-search-suggestions?q=${encodeURIComponent(query)}`,
          { signal: controller.signal, cache: 'no-store' },
        );
        if (response.ok) {
          setSuggestions(await response.json());
          setShowSuggestions(true);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') console.error('Autocomplete failed:', error);
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, serverUrl]);

  const selectSuggestion = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'City' || suggestion.type === 'Province') {
      setLocationQuery(suggestion.value);
    } else {
      setSearchQuery(suggestion.value);
    }
    setShowSuggestions(false);
  };
 
  useEffect(() => {
    const specialtyFromUrl = new URLSearchParams(window.location.search).get('specialty');
    if (specialtyFromUrl && specialties.includes(specialtyFromUrl)) setSelectedSpecialty(specialtyFromUrl);
  }, []);

  const filteredDoctors = mockDoctors
    .filter((doctor) => selectedSpecialty === 'All' || doctor.specialization?.toLowerCase() === selectedSpecialty.toLowerCase())
    .filter((doctor) => {
      const fee = Number(doctor.consultationFee ?? 0);
      if (priceRange === 'under-1500') return fee < 1500;
      if (priceRange === '1500-3000') return fee >= 1500 && fee <= 3000;
      if (priceRange === 'over-3000') return fee > 3000;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'Highest Rated') return (b.rating ?? 0) - (a.rating ?? 0);
      if (sortBy === 'Lowest Fee') return (a.consultationFee ?? 0) - (b.consultationFee ?? 0);
      return 0;
    });

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSpecialty]);

  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(filteredDoctors.length / PAGE_SIZE);
  const paginatedDoctors = filteredDoctors.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
          <form onSubmit={(event) => { event.preventDefault(); void searchDoctors(); }} className="max-w-3xl mx-auto bg-white/95 backdrop-blur-sm p-2.5 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] flex flex-col md:flex-row gap-2">
            <div className="relative flex-1 flex items-center px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              <Search className="text-slate-300 w-5 h-5 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Search doctors, specialties, or symptoms..."
                className="w-full bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-300 text-sm"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                autoComplete="off"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+12px)] z-50 overflow-hidden rounded-xl border border-slate-100 bg-white text-left shadow-xl">
                  {suggestions.map((suggestion) => (
                    <button
                      key={`${suggestion.label}-${suggestion.type}`}
                      type="button"
                      onClick={() => selectSuggestion(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0 flex items-center justify-between group"
                    >
                      <span className="text-sm text-slate-700 group-hover:text-teal-700">{suggestion.label}</span>
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{suggestion.type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative flex items-center px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              <MapPin className="text-slate-300 w-5 h-5 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="City or area"
                className="w-full bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-300 text-sm"
                value={locationQuery}
                onChange={(event) => setLocationQuery(event.target.value)}
              />
            </div>
            <button
              type="submit"
              className="bg-[#16BCC8] hover:bg-[#14b0bc] text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </form>
        </div>
      </div>

      {/* --- Filters Bar --- */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 transition-all text-sm font-medium text-slate-700 shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            
            {/* Specialty Filter */}
            <div className="relative">
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="appearance-none bg-white border border-slate-200 hover:border-teal-400 rounded-xl px-4 py-2 pr-8 text-sm font-medium text-slate-700 cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-teal-100"
              >
                {specialties.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
            </div>

            {/* Price Range Filter */}
            <div className="relative">
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="appearance-none bg-white border border-slate-200 hover:border-teal-400 rounded-xl px-4 py-2 pr-8 text-sm font-medium text-slate-700 cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-teal-100"
              >
                <option value="All">All Prices</option>
                <option value="under-1500">Under PKR 1,500</option>
                <option value="1500-3000">PKR 1,500 - 3,000</option>
                <option value="over-3000">Over PKR 3,000</option>
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-slate-200 hover:border-teal-400 rounded-xl px-4 py-2 pr-8 text-sm font-medium text-slate-700 cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-teal-100"
              >
                <option value="Recommended">Recommended</option>
                <option value="Highest Rated">Highest Rated</option>
                <option value="Lowest Fee">Lowest Fee</option>
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
            </div>

            <div className="flex-1" />
            
            <span className="text-sm text-slate-500 font-medium shrink-0">
              {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'} found
            </span>
          </div>

          {/* Expanded Filters Panel */}
          {filtersOpen && (
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">All Filters</h3>
                <button onClick={() => setFiltersOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Specialty</label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  >
                    {specialties.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Price Range</label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="All">All Prices</option>
                    <option value="under-1500">Under PKR 1,500</option>
                    <option value="1500-3000">PKR 1,500 - 3,000</option>
                    <option value="over-3000">Over PKR 3,000</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="Recommended">Recommended</option>
                    <option value="Highest Rated">Highest Rated</option>
                    <option value="Lowest Fee">Lowest Fee</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Doctor Cards Grid --- */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#16BCC8] animate-spin" />
          </div>
        ) : paginatedDoctors.length === 0 ? (
          <div className="text-center py-20">
            <Stethoscope className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No doctors found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your filters or search terms</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setLocationQuery('');
                setSelectedSpecialty('All');
                setPriceRange('All');
                setSortBy('Recommended');
                void getAllDoctors();
              }}
              className="px-6 py-2.5 bg-[#16BCC8] hover:bg-[#14b0bc] text-white rounded-xl font-semibold transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedDoctors.map((doctor) => (
                <Link
                  key={doctor._id}
                  href={`/patient/selected-doctor/${doctor._id}`}
                  className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative shrink-0">
                        <img
                          src={doctor.profilePictureUrl || doctor.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.fullName || doctor.name || 'D')}&background=0D9488&color=fff`}
                          alt={doctor.fullName || doctor.name || 'Doctor'}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 group-hover:border-teal-200 transition-colors"
                        />
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-lg leading-tight truncate">{doctor.fullName || doctor.name}</h3>
                        <p className="text-teal-600 font-medium text-sm mb-1">{doctor.specialization}</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-semibold text-slate-700">{doctor.rating?.toFixed(1) || '4.5'}</span>
                          <span className="text-xs text-slate-400">({doctor.reviewsCount || doctor.reviewsCount || 0})</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">{doctor.clinicAddress || doctor.city || 'Location not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{doctor.nextAvailable || 'Available today'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Consultation Fee</p>
                        <p className="text-lg font-bold text-slate-900">PKR {doctor.consultationFee || '500'}</p>
                      </div>
                      <div className="flex items-center gap-2 text-[#16BCC8] font-semibold group-hover:gap-3 transition-all">
                        <span>Book Now</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${
                      currentPage === page
                        ? 'bg-[#16BCC8] text-white'
                        : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}