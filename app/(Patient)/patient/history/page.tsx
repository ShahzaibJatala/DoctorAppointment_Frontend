'use client';

import React, { useEffect, useState } from 'react';
import {
  Search, Calendar, FileText, Bell, Download, Share2, Filter, Activity, Pill, FileBarChart, Stethoscope, ChevronDown, ShieldAlert, X, ArrowRight, Video, UploadCloud, Loader2
} from 'lucide-react';
import axios from 'axios';
import { getToken } from '@/app/actions/token';
import DashboardShell from '@/components/layouts/DashboardShell';

export default function MedicalHistory() {
  const [activeTab, setActiveTab] = useState<'Timeline' | 'Prescriptions'>('Timeline');
  const [showPrivacyBanner, setShowPrivacyBanner] = useState(true);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState<string | null>(null);

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  const fetchProfile = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const cleanToken = token.replace(/"/g, '').trim();
      const res = await fetch(`${serverUrl}/patient/my-profile`, {
        headers: { 'Authorization': `Bearer ${cleanToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, recordId: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(recordId);

    try {
      const token = await getToken();
      if (!token) return;
      const cleanToken = token.replace(/"/g, '').trim();

      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);

        await axios.post(`${serverUrl}/patient/upload-report/${recordId}`, formData, {
          headers: {
            'Authorization': `Bearer ${cleanToken}`,
            'Content-Type': 'multipart/form-data',
          }
        });
      }

      await fetchProfile(); // Refresh list to show newly uploaded PDFs
      alert('Reports uploaded successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to upload PDF reports.');
    } finally {
      setIsUploading(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedRecord(expandedRecord === id ? null : id);
  };

  const patientName = profile?.fullName || profile?.email?.split('@')[0] || 'Patient';
  const medicalRecords = profile?.medicalRecords || [];

  const stats = [
    { label: 'Total Visits', value: String(medicalRecords.length).padStart(2, '0'), icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Conditions', value: String(new Set(medicalRecords.map((r: any) => r.reasonForVisit)).size).padStart(2, '0'), icon: Activity, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'Prescriptions', value: String(medicalRecords.filter((r: any) => r.prescription).length).padStart(2, '0'), icon: Pill, color: 'text-[#16BCC8]', bg: 'bg-[#16BCC8]/8' },
    { 
      label: 'Reports File', 
      value: String(medicalRecords.reduce((acc: number, r: any) => acc + (r.reports?.length || 0), 0)).padStart(2, '0'), 
      icon: FileBarChart, 
      color: 'text-amber-500', 
      bg: 'bg-amber-50' 
    },
  ];

  return (
    <DashboardShell role="patient" activeHref="/patient/history">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-lg sm:text-xl font-bold text-slate-800">Medical History</h1>

        <div className="flex items-center gap-4">
          <button className="relative p-2.5 rounded-xl hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-100">
            <Bell className="w-5 h-5 text-slate-400" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(patientName)}&background=16BCC8&color=fff`} alt="Profile" className="w-10 h-10 rounded-xl border-2 border-white shadow-sm" />
        </div>
      </header>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-40">
          <Loader2 className="h-10 w-10 border-4 border-teal-600/30 border-t-teal-600 rounded-full animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Retrieving medical timeline...</p>
        </div>
      ) : (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-up">

          {/* Privacy Banner */}
          {showPrivacyBanner && (
            <div className="bg-gradient-to-r from-[#16BCC8]/8 to-[#0ea5a9]/5 border border-[#16BCC8]/10 rounded-2xl p-5 flex items-start gap-4 relative">
              <div className="p-2.5 bg-[#16BCC8]/10 text-[#16BCC8] rounded-xl shrink-0">
                <ShieldAlert size={20} />
              </div>
              <div className="pr-8">
                <h4 className="font-bold text-[#16BCC8] text-sm">Your Data is Secure</h4>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">Your medical history is encrypted and visible only to you and authorized doctors. You can download or share records manually.</p>
              </div>
              <button onClick={() => setShowPrivacyBanner(false)} className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 transition-colors duration-200">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card flex items-center gap-4 hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800">{stat.value}</h3>
                  <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Controls & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="bg-slate-100/80 p-1 rounded-xl inline-flex self-start">
              {(['Timeline', 'Prescriptions'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab 
                      ? 'bg-white text-[#16BCC8] shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* --- CONTENT VIEW: TIMELINE --- */}
          {activeTab === 'Timeline' && (
            <div className="relative space-y-6 pl-4 sm:pl-0">
              {/* Vertical Line */}
              <div className="absolute left-6 sm:left-[140px] top-4 bottom-4 w-px bg-slate-100 hidden sm:block"></div>

              {medicalRecords.length > 0 ? (
                [...medicalRecords].reverse().map((record: any, index) => {
                  const recordKey = record._id || String(index);
                  return (
                    <div key={recordKey} className="relative flex flex-col sm:flex-row gap-6 sm:gap-12 group">
                      
                      {/* Date Column (Desktop) */}
                      <div className="hidden sm:flex flex-col items-end w-[120px] shrink-0 pt-1">
                        <span className="font-bold text-slate-800">{new Date(record.appointmentDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>

                      {/* Timeline Dot */}
                      <div className="absolute left-6 sm:left-[135px] top-2 w-3 h-3 bg-white border-2 border-[#16BCC8] rounded-full z-10 hidden sm:block group-hover:scale-150 transition-transform duration-300"></div>

                      {/* Card Content */}
                      <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-6 shadow-card hover:shadow-elevated hover:border-[#16BCC8]/10 transition-all duration-300">
                        
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl shrink-0 bg-[#16BCC8]/8 text-[#16BCC8]">
                              <Stethoscope size={20} />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-800 text-lg group-hover:text-[#16BCC8] transition-colors duration-200">{record.reasonForVisit || 'General Visit'}</h3>
                              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400 mt-1">
                                <span className="font-medium text-slate-600">{record.doctorName}</span>
                                <span>•</span>
                                <span>Clinic Consult</span>
                              </div>
                              {/* Mobile Date */}
                              <div className="sm:hidden text-xs text-slate-400 mt-1">{new Date(record.appointmentDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button 
                              onClick={() => toggleExpand(recordKey)}
                              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all duration-200"
                            >
                              <ChevronDown size={18} className={`transition-transform duration-300 ${expandedRecord === recordKey ? 'rotate-180' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Expandable Details */}
                        {expandedRecord === recordKey && (
                          <div className="pt-5 border-t border-slate-100 space-y-5 animate-fade-up">
                            {/* Prescription details */}
                            <div className="bg-[#16BCC8]/[0.04] border border-[#16BCC8]/10 rounded-xl p-4">
                              <h4 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Prescribed Treatment / Notes</h4>
                              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                                {record.prescription || 'No notes provided by doctor.'}
                              </p>
                            </div>

                            {/* Reports list & Upload Vault */}
                            <div className="space-y-3 pt-3 border-t border-slate-100">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Patient Reports (PDFs)</h4>
                              
                              {record.reports && record.reports.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {record.reports.map((url: string, uIdx: number) => (
                                    <a 
                                      key={uIdx} 
                                      href={url} 
                                      download={`report-${uIdx + 1}.pdf`}
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-[#16BCC8]/5 hover:border-[#16BCC8]/25 transition-all group/link"
                                    >
                                      <div className="p-2 rounded-lg bg-rose-50 text-rose-500 shrink-0">
                                        <FileText size={16} />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-slate-700 truncate">Report #{uIdx + 1}.pdf</p>
                                        <p className="text-[10px] text-slate-400">Click to download PDF</p>
                                      </div>
                                      <Download size={14} className="text-slate-400 group-hover/link:text-rose-600 transition-colors" />
                                    </a>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 italic">No reports uploaded yet.</p>
                              )}

                              {/* Upload Vault Area */}
                              <div className="pt-2">
                                <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-[#16BCC8]/30 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-all">
                                  {isUploading === recordKey ? (
                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                      <Loader2 size={16} className="animate-spin text-[#16BCC8]" />
                                      <span>Uploading files to secure vault...</span>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center justify-center text-center">
                                      <UploadCloud size={20} className="text-[#16BCC8] mb-1.5" />
                                      <span className="text-xs font-bold text-slate-700">Upload PDF Reports</span>
                                      <span className="text-[10px] text-slate-400 mt-0.5">Select PDF documents to attach to this record</span>
                                    </div>
                                  )}
                                  <input 
                                    type="file" 
                                    accept="application/pdf" 
                                    multiple 
                                    disabled={isUploading === recordKey}
                                    onChange={(e) => handleUpload(e, recordKey)}
                                    className="hidden" 
                                  />
                                </label>
                              </div>
                            </div>

                          </div>
                        )}
                        
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center bg-white border border-slate-100 rounded-2xl text-slate-400 text-sm">
                  No medical visits registered yet.
                </div>
              )}
            </div>
          )}

          {/* --- CONTENT VIEW: PRESCRIPTIONS ONLY --- */}
          {activeTab === 'Prescriptions' && (
            <div className="space-y-4">
              {medicalRecords.filter((r: any) => r.prescription).length > 0 ? (
                [...medicalRecords].reverse().filter((r: any) => r.prescription).map((r: any, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-elevated hover:border-[#16BCC8]/10 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-[#16BCC8]/8 text-[#16BCC8] rounded-xl">
                        <Pill size={22} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{r.doctorName}</h4>
                        <p className="text-sm text-slate-400">{r.reasonForVisit || 'Consultation'} • {new Date(r.appointmentDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 sm:px-8">
                      <p className="text-sm text-slate-600 italic whitespace-pre-line">"{r.prescription}"</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center bg-white border border-slate-100 rounded-2xl text-slate-400 text-sm">
                  No active prescriptions found.
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </DashboardShell>
  );
}