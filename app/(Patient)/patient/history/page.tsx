'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Search,
  Calendar,
  FileText,
  ClipboardList,
  Settings,
  Menu,
  Bell,
  Download,
  Share2,
  Filter,
  Activity,
  Pill,
  FileBarChart,
  Stethoscope,
  ChevronDown,
  ShieldAlert,
  X,
  Heart,
  Star,
  ArrowRight,
  Video
} from 'lucide-react';
import Link from 'next/link';
import DashboardShell from '@/components/layouts/DashboardShell';

// --- Types ---
type RecordType = 'In-Clinic' | 'Video' | 'Lab Test';

interface MedicalRecord {
  id: string;
  date: string;
  doctorName: string;
  specialty: string;
  hospital: string;
  diagnosis: string;
  type: RecordType;
  notes: string;
  documents?: { name: string; size: string; type: 'pdf' | 'jpg' }[];
  prescription?: { medications: string[]; date: string };
}

// --- Mock Data ---
const medicalRecords: MedicalRecord[] = [
  {
    id: '1',
    date: 'Oct 24, 2024',
    doctorName: 'Dr. Sarah Wilson',
    specialty: 'Cardiologist',
    hospital: 'Heart & Vascular Institute',
    diagnosis: 'Mild Hypertension',
    type: 'In-Clinic',
    notes: 'Patient reported occasional dizziness. BP 140/90. Recommended lifestyle changes and started low-dose medication.',
    documents: [
      { name: 'ECG_Report_Oct24.pdf', size: '2.4 MB', type: 'pdf' },
      { name: 'Blood_Work_Oct24.pdf', size: '1.1 MB', type: 'pdf' }
    ],
    prescription: {
      date: 'Oct 24, 2024',
      medications: ['Lisinopril 10mg', 'Baby Aspirin 81mg']
    }
  },
  {
    id: '2',
    date: 'Sep 12, 2024',
    doctorName: 'Dr. James Lee',
    specialty: 'Dermatologist',
    hospital: 'City Skin Clinic',
    diagnosis: 'Allergic Dermatitis',
    type: 'Video',
    notes: 'Visible rash on forearm. Prescribed topical cream.',
    prescription: {
      date: 'Sep 12, 2024',
      medications: ['Hydrocortisone Cream 2.5%', 'Cetirizine 10mg']
    }
  },
  {
    id: '3',
    date: 'Aug 05, 2024',
    doctorName: 'Lab Services',
    specialty: 'Pathology',
    hospital: 'MediBook Labs',
    diagnosis: 'Annual Health Checkup',
    type: 'Lab Test',
    notes: 'Routine blood panel. Cholesterol slightly elevated.',
    documents: [
      { name: 'Complete_Blood_Count.pdf', size: '3.5 MB', type: 'pdf' },
      { name: 'Lipid_Profile.pdf', size: '1.2 MB', type: 'pdf' }
    ]
  }
];

const stats = [
  { label: 'Total Visits', value: '14', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Conditions', value: '3', icon: Activity, color: 'text-rose-500', bg: 'bg-rose-50' },
  { label: 'Prescriptions', value: '8', icon: Pill, color: 'text-[#16BCC8]', bg: 'bg-[#16BCC8]/8' },
  { label: 'Reports', value: '12', icon: FileBarChart, color: 'text-amber-500', bg: 'bg-amber-50' },
];

// --- Components ---

const DocumentCard = ({ doc }: { doc: { name: string, size: string, type: string } }) => (
  <div className="flex items-center justify-between p-3.5 bg-slate-50/80 border border-slate-100 rounded-xl hover:border-[#16BCC8]/20 hover:bg-[#16BCC8]/[0.03] transition-all duration-200 group">
    <div className="flex items-center gap-3 overflow-hidden">
      <div className="p-2.5 bg-white rounded-xl border border-slate-100 text-red-500 shrink-0 shadow-sm">
        <FileText size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-700 truncate">{doc.name}</p>
        <p className="text-xs text-slate-400">{doc.size}</p>
      </div>
    </div>
    <button className="p-2 text-slate-300 hover:text-[#16BCC8] hover:bg-[#16BCC8]/8 rounded-lg transition-all duration-200">
      <Download size={16} />
    </button>
  </div>
);

export default function MedicalHistory() {
  const [activeTab, setActiveTab] = useState<'Timeline' | 'Documents' | 'Prescriptions'>('Timeline');
  const [showPrivacyBanner, setShowPrivacyBanner] = useState(true);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedRecord(expandedRecord === id ? null : id);
  };

  return (

    <div className="min-h-screen bg-slate-50/50 flex">
      
      {/* --- Sidebar --- */}
    

      {/* --- Main Content --- */}
      <main className="flex-1 lg:ml-72">
        
        {/* Navbar */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 lg:hidden">
            <Menu className="text-slate-500" />
            <span className="font-bold text-lg text-slate-800">MediBook</span>
          </div>

          <h1 className="text-xl font-bold text-slate-800 hidden lg:block">Medical History</h1>

    <DashboardShell role="patient" activeHref="/patient/history">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-lg sm:text-xl font-bold text-slate-800">Medical History</h1>


          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-slate-50 rounded-xl px-4 py-2.5 w-64 focus-within:ring-2 focus-within:ring-[#16BCC8]/20 focus-within:border-[#16BCC8] border border-transparent transition-all duration-200">
              <Search className="text-slate-300 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search records..." 
                className="bg-transparent border-none outline-none text-sm ml-2 w-full text-slate-700 placeholder:text-slate-300"
              />
            </div>
            <button className="relative p-2.5 rounded-xl hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-100">
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <img src="https://i.pravatar.cc/150?u=patient" alt="Profile" className="w-10 h-10 rounded-xl border-2 border-white shadow-sm" />
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">

          {/* Privacy Banner */}
          {showPrivacyBanner && (
            <div className="bg-gradient-to-r from-[#16BCC8]/8 to-[#0ea5a9]/5 border border-[#16BCC8]/10 rounded-2xl p-5 flex items-start gap-4 relative animate-fade-up">
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
              <div key={i} className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-card flex items-center gap-4 hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300 animate-fade-up stagger-${i + 1}`}>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            
            {/* Tabs */}
            <div className="bg-slate-100/80 p-1 rounded-xl inline-flex self-start">
              {(['Timeline', 'Documents', 'Prescriptions'] as const).map((tab) => (
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

            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                <Filter size={16} /> Filter
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#16BCC8] to-[#0ea5a9] text-white rounded-xl text-sm font-semibold shadow-[0_2px_8px_rgba(22,188,200,0.3)] hover:shadow-[0_4px_16px_rgba(22,188,200,0.4)] transition-all duration-300">
                <Download size={16} /> Export
              </button>
            </div>
          </div>

          {/* --- CONTENT VIEW: TIMELINE --- */}
          {activeTab === 'Timeline' && (
            <div className="relative space-y-6 pl-4 sm:pl-0">
              {/* Vertical Line */}
              <div className="absolute left-6 sm:left-[140px] top-4 bottom-4 w-px bg-slate-100 hidden sm:block"></div>

              {medicalRecords.map((record, index) => (
                <div key={record.id} className={`relative flex flex-col sm:flex-row gap-6 sm:gap-12 group animate-fade-up stagger-${Math.min(index + 1, 6)}`}>
                  
                  {/* Date Column (Desktop) */}
                  <div className="hidden sm:flex flex-col items-end w-[120px] shrink-0 pt-1">
                    <span className="font-bold text-slate-800">{record.date}</span>
                  </div>

                  {/* Timeline Dot */}
                  <div className="absolute left-6 sm:left-[135px] top-2 w-3 h-3 bg-white border-2 border-[#16BCC8] rounded-full z-10 hidden sm:block group-hover:scale-150 transition-transform duration-300"></div>

                  {/* Card Content */}
                  <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-6 shadow-card hover:shadow-elevated hover:border-[#16BCC8]/10 transition-all duration-300">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl shrink-0 ${
                          record.type === 'In-Clinic' ? 'bg-[#16BCC8]/8 text-[#16BCC8]' :
                          record.type === 'Video' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {record.type === 'In-Clinic' ? <Stethoscope size={20} /> : 
                           record.type === 'Video' ? <Video size={20} /> : <FileBarChart size={20} />}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg group-hover:text-[#16BCC8] transition-colors duration-200">{record.diagnosis}</h3>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400 mt-1">
                            <span className="font-medium text-slate-600">{record.doctorName}</span>
                            <span>•</span>
                            <span>{record.specialty}</span>
                          </div>
                          {/* Mobile Date */}
                          <div className="sm:hidden text-xs text-slate-400 mt-1">{record.date}</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="p-2 text-slate-300 hover:text-[#16BCC8] hover:bg-[#16BCC8]/8 rounded-xl transition-all duration-200" title="Share">
                          <Share2 size={18} />
                        </button>
                        <button 
                          onClick={() => toggleExpand(record.id)}
                          className={`p-2 rounded-xl transition-all duration-200 ${
                            expandedRecord === record.id ? 'bg-slate-100 text-slate-800' : 'text-slate-300 hover:bg-slate-50 hover:text-slate-500'
                          }`}
                        >
                          <ChevronDown size={18} className={`transition-transform duration-300 ${expandedRecord === record.id ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Compact badges */}
                    {expandedRecord !== record.id && (
                      <div className="mt-3 flex items-center gap-2">
                        {record.documents && (
                           <span className="text-xs font-semibold px-3 py-1 bg-slate-50 text-slate-500 rounded-lg border border-slate-100">
                             {record.documents.length} Documents
                           </span>
                        )}
                        {record.prescription && (
                           <span className="text-xs font-semibold px-3 py-1 bg-[#16BCC8]/8 text-[#16BCC8] rounded-lg border border-[#16BCC8]/10">
                             Prescription
                           </span>
                        )}
                      </div>
                    )}

                    {/* Expandable Details */}
                    {expandedRecord === record.id && (
                      <div className="pt-5 border-t border-slate-100 space-y-5 animate-fade-up">
                        
                        {/* Notes */}
                        <div>
                          <h4 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Doctor's Notes</h4>
                          <p className="text-sm text-slate-600 bg-slate-50/80 p-4 rounded-xl leading-relaxed border border-slate-100">
                            {record.notes}
                          </p>
                        </div>

                        {/* Attachments Section */}
                        <div className="grid md:grid-cols-2 gap-5">
                          {/* Documents */}
                          {record.documents && (
                            <div>
                               <h4 className="text-xs font-bold uppercase text-slate-400 mb-3 flex items-center gap-1.5 tracking-wider">
                                 <FileText size={12} /> Reports & Labs
                               </h4>
                               <div className="space-y-2">
                                 {record.documents.map((doc, i) => (
                                   <DocumentCard key={i} doc={doc} />
                                 ))}
                               </div>
                            </div>
                          )}
                          
                          {/* Prescription */}
                          {record.prescription && (
                             <div>
                               <h4 className="text-xs font-bold uppercase text-slate-400 mb-3 flex items-center gap-1.5 tracking-wider">
                                 <Pill size={12} /> Medications
                               </h4>
                               <div className="bg-[#16BCC8]/[0.04] border border-[#16BCC8]/10 rounded-xl p-4">
                                  <ul className="list-disc list-inside text-sm text-[#16BCC8] space-y-1.5 font-medium">
                                    {record.prescription.medications.map((med, k) => (
                                      <li key={k}>{med}</li>
                                    ))}
                                  </ul>
                                  <button className="mt-4 text-xs font-bold text-[#16BCC8] hover:text-[#0ea5a9] flex items-center gap-1.5 transition-colors duration-200">
                                    <Download size={12} /> Download Prescription
                                  </button>
                               </div>
                             </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* --- CONTENT VIEW: DOCUMENTS ONLY --- */}
          {activeTab === 'Documents' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {medicalRecords.flatMap(r => r.documents ? r.documents.map(d => ({ ...d, date: r.date, doctor: r.doctorName })) : []).map((doc, i) => (
                  <div key={i} className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-44 animate-fade-up stagger-${Math.min(i + 1, 6)}`}>
                    <div className="flex items-start justify-between">
                       <div className="p-3 bg-red-50 text-red-500 rounded-xl">
                         <FileText size={22} />
                       </div>
                       <span className="text-xs text-slate-400 font-medium">{doc.date}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm truncate" title={doc.name}>{doc.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">Ref: {doc.doctor}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                       <span className="text-xs text-slate-400">{doc.size}</span>
                       <button className="text-[#16BCC8] hover:text-[#0ea5a9] text-xs font-bold flex items-center gap-1.5 transition-colors duration-200">
                         Download <Download size={12} />
                       </button>
                    </div>
                  </div>
                ))}
             </div>
          )}

           {/* --- CONTENT VIEW: PRESCRIPTIONS ONLY --- */}
           {activeTab === 'Prescriptions' && (
             <div className="space-y-4">
               {medicalRecords.filter(r => r.prescription).map((r, i) => (
                 <div key={r.id} className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-elevated hover:border-[#16BCC8]/10 transition-all duration-300 animate-fade-up stagger-${Math.min(i + 1, 6)}`}>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-[#16BCC8]/8 text-[#16BCC8] rounded-xl">
                        <Pill size={22} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{r.doctorName}</h4>
                        <p className="text-sm text-slate-400">{r.specialty} • {r.date}</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 sm:px-8">
                       <div className="flex flex-wrap gap-2">
                         {r.prescription?.medications.map((med, m) => (
                           <span key={m} className="px-3 py-1.5 bg-slate-50 text-slate-600 text-xs rounded-lg border border-slate-100 font-medium">
                             {med}
                           </span>
                         ))}
                       </div>
                    </div>

                    <button className="px-5 py-2.5 bg-white border border-slate-200 hover:border-[#16BCC8]/30 text-slate-600 hover:text-[#16BCC8] rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 justify-center">
                      <Download size={16} /> PDF
                    </button>
                 </div>
               ))}
             </div>
          )}

        </div>
    </DashboardShell>
  );
}