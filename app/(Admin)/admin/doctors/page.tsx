'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Stethoscope,
  Calendar,
  Activity,
  Star,
  Search,
  Bell,
  CheckCircle,
  XCircle,
  ShieldAlert,
  Download,
  Plus,
  Eye,
  FileText,
  MapPin,
  Mail,
  Phone,
  X,
  Loader2,
  Trash2,
  ShieldOff,
  AlertTriangle,
  UserPlus,
  KeyRound,
  EyeOff
} from 'lucide-react';
import DashboardShell from '@/components/layouts/DashboardShell';
import { getToken } from '@/app/actions/token';
import axios from 'axios';

// --- Types ---
type DoctorStatus = 'Active' | 'Pending' | 'Suspended' | 'Blocked';

interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  hospital: string;
  experience: string;
  rating: number;
  reviews: number;
  status: DoctorStatus;
  joinedDate: string;
  avatar: string;
  documents: string[];
}

// --- Components ---
const StatusBadge = ({ status }: { status: DoctorStatus }) => {
  const styles: Record<string, string> = {
    Active: 'bg-green-50 text-green-700 border-green-200',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Suspended: 'bg-orange-50 text-orange-700 border-orange-200',
    Blocked: 'bg-red-50 text-red-700 border-red-200',
  };
  const icons: Record<string, any> = {
    Active: CheckCircle,
    Pending: Activity,
    Suspended: ShieldOff,
    Blocked: ShieldAlert,
  };
  const Icon = icons[status] || CheckCircle;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.Active}`}>
      <Icon size={12} />
      {status}
    </span>
  );
};

export default function AdminDoctors() {
  const [doctorsData, setDoctorsData] = useState<Doctor[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Pending' | 'Suspended' | 'Blocked'>('All');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Doctor | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Add Doctor form
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', specialization: '', phoneNumber: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [showAddPwd, setShowAddPwd] = useState(false);

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  const getAuthHeader = async () => {
    const token = await getToken();
    if (!token) throw new Error('No token');
    const cleanToken = token.replace(/"/g, '').trim();
    return { Authorization: `Bearer ${cleanToken}` };
  };

  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      const headers = await getAuthHeader();
      const res = await fetch(`${serverUrl}/admin/doctors`, { headers });
      if (res.ok) {
        const data = await res.json();
        setDoctorsData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Filtering
  const filteredDoctors = doctorsData.filter(doc => {
    const matchesTab = activeTab === 'All' ? true : doc.status === activeTab;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const stats = {
    total: doctorsData.length,
    active: doctorsData.filter(d => d.status === 'Active').length,
    pending: doctorsData.filter(d => d.status === 'Pending').length,
    suspended: doctorsData.filter(d => d.status === 'Suspended').length,
  };

  const handleVerify = async (doc: Doctor) => {
    setActionLoading(doc.id + '-verify');
    try {
      const headers = await getAuthHeader();
      await axios.post(`${serverUrl}/admin/doctors/${doc.id}/verify`, {}, { headers });
      await fetchDoctors();
      setSelectedDoctor(null);
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const handleSuspend = async (doc: Doctor) => {
    setActionLoading(doc.id + '-suspend');
    try {
      const headers = await getAuthHeader();
      await axios.post(`${serverUrl}/admin/doctors/${doc.id}/suspend`, {}, { headers });
      await fetchDoctors();
      setSelectedDoctor(null);
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (doc: Doctor) => {
    setConfirmDelete(null);
    setActionLoading(doc.id + '-delete');
    try {
      const headers = await getAuthHeader();
      await axios.delete(`${serverUrl}/admin/doctors/${doc.id}`, { headers });
      await fetchDoctors();
      setSelectedDoctor(null);
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError('');
    try {
      const headers = await getAuthHeader();
      await axios.post(`${serverUrl}/admin/doctors/create`, addForm, { headers });
      setIsAddOpen(false);
      setAddForm({ name: '', email: '', password: '', specialization: '', phoneNumber: '' });
      await fetchDoctors();
    } catch (err: any) {
      setAddError(err.response?.data?.message || 'Failed to create doctor.');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <>
    <DashboardShell role="admin" activeHref="/admin/doctors" sidebarWidth="narrow" showHealthTip={false}>
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Doctors Management</h1>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex flex-1 md:flex-none items-center bg-slate-100 rounded-lg px-4 py-2 md:w-64 border border-transparent focus-within:border-teal-500 transition-all">
              <Search className="text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-sm ml-2 w-full text-slate-600 placeholder:text-slate-400"
              />
            </div>
          </div>
        </header>

        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[350px]">
              <Loader2 className="w-8 h-8 text-[#16BCC8] animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Loading doctors records...</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total Doctors</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</h3>
                  </div>
                  <div className="p-3 bg-slate-100 rounded-lg text-slate-600"><Users size={20} /></div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Active</p>
                    <h3 className="text-2xl font-bold text-green-600 mt-1">{stats.active}</h3>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-green-600"><CheckCircle size={20} /></div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Pending Approval</p>
                    <h3 className="text-2xl font-bold text-amber-500 mt-1">{stats.pending}</h3>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg text-amber-600"><Activity size={20} /></div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Suspended</p>
                    <h3 className="text-2xl font-bold text-orange-500 mt-1">{stats.suspended}</h3>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg text-orange-600"><ShieldOff size={20} /></div>
                </div>
              </section>

              {/* Controls Bar */}
              <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
                 {/* Tabs */}
                 <div className="bg-slate-100 p-1 rounded-lg flex self-start flex-wrap gap-1">
                   {(['All', 'Active', 'Pending', 'Suspended', 'Blocked'] as const).map(tab => (
                     <button
                       key={tab}
                       onClick={() => setActiveTab(tab)}
                       className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                         activeTab === tab ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                       }`}
                     >
                       {tab}
                     </button>
                   ))}
                 </div>

                 {/* Actions */}
                 <div className="flex gap-3 w-full md:w-auto">
                    <button
                      onClick={() => { setAddError(''); setIsAddOpen(true); }}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 shadow-sm transition-colors"
                    >
                      <Plus size={16} /> Add Doctor
                    </button>
                 </div>
              </div>

              {/* Doctors Table */}
              <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Doctor Name</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Specialty</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Contact</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredDoctors.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                            No doctors found matching your criteria.
                          </td>
                        </tr>
                      ) : filteredDoctors.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={doc.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                              <div>
                                <p className="font-bold text-slate-800 text-sm">{doc.name}</p>
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                  <Star size={10} className="text-yellow-400 fill-yellow-400" />
                                  {doc.rating > 0 ? doc.rating : 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-700">{doc.specialty}</span>
                              <span className="text-xs text-slate-500">{doc.hospital}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col text-sm text-slate-600">
                              <span className="flex items-center gap-1"><Mail size={12} className="text-slate-400" /> {doc.email}</span>
                              <span className="flex items-center gap-1"><Phone size={12} className="text-slate-400" /> {doc.phone}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={doc.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                               <button
                                 onClick={() => setSelectedDoctor(doc)}
                                 className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                 title="View Profile"
                               >
                                 <Eye size={18} />
                               </button>
                               {doc.status !== 'Active' && (
                                 <button
                                   onClick={() => handleVerify(doc)}
                                   disabled={actionLoading === doc.id + '-verify'}
                                   className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                   title="Verify / Activate"
                                 >
                                   {actionLoading === doc.id + '-verify'
                                     ? <Loader2 size={16} className="animate-spin" />
                                     : <CheckCircle size={16} />}
                                 </button>
                               )}
                               <button
                                 onClick={() => handleSuspend(doc)}
                                 disabled={actionLoading === doc.id + '-suspend'}
                                 className="p-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                                 title={doc.status === 'Suspended' ? 'Reactivate' : 'Suspend'}
                               >
                                 {actionLoading === doc.id + '-suspend'
                                   ? <Loader2 size={16} className="animate-spin" />
                                   : <ShieldOff size={16} />}
                               </button>
                               <button
                                 onClick={() => setConfirmDelete(doc)}
                                 disabled={actionLoading === doc.id + '-delete'}
                                 className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                 title="Delete Doctor"
                               >
                                 {actionLoading === doc.id + '-delete'
                                   ? <Loader2 size={16} className="animate-spin" />
                                   : <Trash2 size={16} />}
                               </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile card view */}
                <div className="md:hidden divide-y divide-slate-100">
                  {filteredDoctors.length === 0 ? (
                    <p className="p-8 text-center text-slate-500 text-sm">No doctors found matching your criteria.</p>
                  ) : filteredDoctors.map((doc) => (
                    <div key={doc.id} className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <img src={doc.avatar} alt="" className="w-12 h-12 rounded-full object-cover border border-slate-100" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 truncate">{doc.name}</p>
                          <p className="text-xs text-slate-500">{doc.specialty}</p>
                        </div>
                        <StatusBadge status={doc.status} />
                      </div>
                      <p className="text-xs text-slate-500 truncate">{doc.email}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedDoctor(doc)}
                          className="flex-1 py-2 bg-slate-50 text-slate-600 text-sm font-medium rounded-lg border border-slate-200"
                        >
                          View Details
                        </button>
                        {doc.status !== 'Active' && (
                          <button onClick={() => handleVerify(doc)} className="px-3 py-2 text-green-600 bg-green-50 rounded-lg">
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button onClick={() => setConfirmDelete(doc)} className="px-3 py-2 text-red-600 bg-red-50 rounded-lg">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

      {/* --- Doctor Detail Modal --- */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
               <div className="flex items-center gap-4">
                 <img src={selectedDoctor.avatar} alt="" className="w-16 h-16 rounded-full border-4 border-white shadow-sm" />
                 <div>
                   <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                     {selectedDoctor.name}
                     <StatusBadge status={selectedDoctor.status} />
                   </h3>
                   <p className="text-sm text-slate-500">{selectedDoctor.specialty} • {selectedDoctor.experience} Experience</p>
                 </div>
               </div>
               <button onClick={() => setSelectedDoctor(null)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full border border-slate-200 hover:border-slate-300">
                 <X size={20} />
               </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Hospital / Clinic</label>
                  <div className="flex items-center gap-2 mt-1 text-slate-700 font-medium">
                    <MapPin size={16} className="text-teal-600" /> {selectedDoctor.hospital}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Joined Date</label>
                  <div className="flex items-center gap-2 mt-1 text-slate-700 font-medium">
                    <Calendar size={16} className="text-teal-600" /> {selectedDoctor.joinedDate}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                  <div className="flex items-center gap-2 mt-1 text-slate-700 font-medium">
                    <Mail size={16} className="text-teal-600" /> {selectedDoctor.email}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Phone</label>
                  <div className="flex items-center gap-2 mt-1 text-slate-700 font-medium">
                    <Phone size={16} className="text-teal-600" /> {selectedDoctor.phone}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6">
                 <h4 className="font-bold text-slate-800 text-sm mb-3">Submitted Documents</h4>
                 <div className="space-y-2">
                   {selectedDoctor.documents.length > 0 ? selectedDoctor.documents.map((doc, idx) => (
                     <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                       <div className="flex items-center gap-3">
                         <div className="p-2 bg-red-50 text-red-500 rounded-lg shrink-0">
                           <FileText size={16} />
                         </div>
                         <a href={doc} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-teal-600 hover:text-teal-800 truncate flex-1">View License PDF Document</a>
                       </div>
                       <a href={doc} download={`license-${idx + 1}.pdf`} className="text-teal-600 hover:text-teal-800 text-xs font-bold">Download</a>
                     </div>
                   )) : (
                     <p className="text-sm text-slate-500 italic">No documents uploaded.</p>
                   )}
                 </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-wrap">
               <button onClick={() => setSelectedDoctor(null)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-100">
                 Close
               </button>
               {selectedDoctor.status !== 'Active' && (
                 <button
                   onClick={() => handleVerify(selectedDoctor)}
                   disabled={actionLoading === selectedDoctor.id + '-verify'}
                   className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold shadow-sm flex items-center gap-2"
                 >
                   {actionLoading === selectedDoctor.id + '-verify' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                   {selectedDoctor.status === 'Suspended' ? 'Reactivate Doctor' : 'Verify & Approve'}
                 </button>
               )}
               <button
                 onClick={() => handleSuspend(selectedDoctor)}
                 disabled={actionLoading === selectedDoctor.id + '-suspend'}
                 className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-bold shadow-sm flex items-center gap-2"
               >
                 {actionLoading === selectedDoctor.id + '-suspend' ? <Loader2 size={14} className="animate-spin" /> : <ShieldOff size={14} />}
                 {selectedDoctor.status === 'Suspended' ? 'Unsuspend' : 'Suspend'}
               </button>
               <button
                 onClick={() => { setSelectedDoctor(null); setConfirmDelete(selectedDoctor); }}
                 className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold shadow-sm flex items-center gap-2"
               >
                 <Trash2 size={14} /> Delete Doctor
               </button>
            </div>
          </div>
        </div>
      )}

    </DashboardShell>

    {/* --- Add Doctor Modal --- */}
    {isAddOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2"><UserPlus size={18} className="text-teal-600" /> Add New Doctor</h3>
            <button onClick={() => setIsAddOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleAddDoctor} className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
              <input required type="text" placeholder="Dr. Ahmed Ali" value={addForm.name}
                onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                className="px-4 py-3 w-full border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
              <input required type="email" placeholder="doctor@example.com" value={addForm.email}
                onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                className="px-4 py-3 w-full border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                <input required type={showAddPwd ? 'text' : 'password'} placeholder="••••••••" value={addForm.password}
                  onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))}
                  className="pl-11 pr-11 py-3 w-full border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all" />
                <button type="button" onClick={() => setShowAddPwd(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showAddPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Specialization</label>
              <input type="text" placeholder="e.g. Cardiology" value={addForm.specialization}
                onChange={e => setAddForm(f => ({ ...f, specialization: e.target.value }))}
                className="px-4 py-3 w-full border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Phone Number</label>
              <input type="tel" placeholder="03001234567" value={addForm.phoneNumber}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 11) setAddForm(f => ({ ...f, phoneNumber: val }));
                }}
                className="px-4 py-3 w-full border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all" />
            </div>
            {addError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">{addError}</div>
            )}
            <div className="pt-2 flex gap-3">
              <button type="button" onClick={() => setIsAddOpen(false)}
                className="flex-1 py-3 text-slate-500 hover:bg-slate-100 rounded-xl font-semibold text-sm transition-all">
                Cancel
              </button>
              <button type="submit" disabled={addLoading}
                className="flex-1 py-3 text-white bg-teal-600 hover:bg-teal-700 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-1.5">
                {addLoading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                Create Doctor
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* --- Delete Confirmation Modal --- */}
    {confirmDelete && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
          <div className="p-6 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">Delete Doctor?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to permanently delete <strong>{confirmDelete.name}</strong>? All associated data will be removed.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-all">
                Cancel
              </button>
              <button onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}