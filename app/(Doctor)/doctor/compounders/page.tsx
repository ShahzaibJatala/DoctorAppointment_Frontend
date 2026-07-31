'use client';

import React, { useEffect, useState } from 'react';
import {
  Users, UserPlus, Search, Phone, Mail, KeyRound, Loader2, X, PlusCircle, UserCheck, ShieldCheck, Eye, EyeOff,
  ShieldOff, Trash2, AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { getToken } from '@/app/actions/token';
import DashboardShell from '@/components/layouts/DashboardShell';

interface CompounderItem {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  status?: string;
}

export default function DoctorCompounders() {
  const [compounders, setCompounders] = useState<CompounderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<CompounderItem | null>(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  const fetchCompounders = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const cleanToken = token.replace(/"/g, '').trim();
      const res = await axios.get(`${serverUrl}/compounder/list`, {
        headers: { Authorization: `Bearer ${cleanToken}` }
      });
      setCompounders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompounders();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !phoneNumber) {
      setErrorMsg('Please fill all fields.');
      return;
    }
    if (phoneNumber.length !== 11) {
      setErrorMsg('Phone number must be exactly 11 digits.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const token = await getToken();
      if (!token) return;
      const cleanToken = token.replace(/"/g, '').trim();

      await axios.post(`${serverUrl}/compounder/register`, {
        fullName,
        email,
        password,
        phoneNumber,
      }, {
        headers: { Authorization: `Bearer ${cleanToken}` }
      });

      // Reset form
      setFullName('');
      setEmail('');
      setPassword('');
      setPhoneNumber('');
      setIsModalOpen(false);
      
      // Refresh list
      await fetchCompounders();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to register compounder account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuspend = async (comp: CompounderItem) => {
    setActionLoading(comp._id + '-suspend');
    try {
      const token = await getToken();
      if (!token) return;
      const cleanToken = token.replace(/"/g, '').trim();
      await axios.post(`${serverUrl}/compounder/suspend/${comp._id}`, {}, {
        headers: { Authorization: `Bearer ${cleanToken}` }
      });
      await fetchCompounders();
    } catch (err) {
      console.error('Suspend failed', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (comp: CompounderItem) => {
    setConfirmDelete(null);
    setActionLoading(comp._id + '-delete');
    try {
      const token = await getToken();
      if (!token) return;
      const cleanToken = token.replace(/"/g, '').trim();
      await axios.delete(`${serverUrl}/compounder/${comp._id}`, {
        headers: { Authorization: `Bearer ${cleanToken}` }
      });
      await fetchCompounders();
    } catch (err) {
      console.error('Delete failed', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
    <DashboardShell role="doctor" activeHref="/doctor/compounders" showHealthTip={false}>
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 sm:px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Clinic Assistants Desk 👩‍⚕️</h1>
          <p className="text-sm text-slate-400">Manage compounders and desk operators associated with your clinic</p>
        </div>
        <button
          onClick={() => { setErrorMsg(''); setIsModalOpen(true); }}
          className="bg-gradient-to-r from-[#16BCC8] to-[#0ea5a9] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center gap-2"
        >
          <UserPlus size={16} />
          Add Assistant
        </button>
      </header>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-40">
          <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Retrieving staff members...</p>
        </div>
      ) : (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fade-up">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-card overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm">Active Compounders</h3>
            </div>

            {compounders.length === 0 ? (
              <div className="p-16 text-center text-slate-400">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Users size={28} />
                </div>
                <h4 className="font-bold text-slate-700">No assistants registered</h4>
                <p className="text-sm text-slate-400 max-w-xs mx-auto mt-1">Register compounders to help manage patient arrival queues, walk-in bookings, and schedules.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {compounders.map((comp) => (
                  <div key={comp._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center font-extrabold shadow-sm">
                        {comp.fullName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{comp.fullName}</h4>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1">
                          <span className="flex items-center gap-1"><Mail size={12} /> {comp.email}</span>
                          <span className="flex items-center gap-1"><Phone size={12} /> {comp.phoneNumber}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border ${
                        comp.status === 'Suspended'
                          ? 'bg-red-50 text-red-700 border-red-100'
                          : 'bg-green-50 text-green-700 border-green-100'
                      }`}>
                        <ShieldCheck size={12} />
                        {comp.status === 'Suspended' ? 'Suspended' : 'Active'}
                      </span>
                      <button
                        onClick={() => handleSuspend(comp)}
                        disabled={actionLoading === comp._id + '-suspend'}
                        title={comp.status === 'Suspended' ? 'Reactivate' : 'Suspend'}
                        className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                          comp.status === 'Suspended'
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`}
                      >
                        {actionLoading === comp._id + '-suspend'
                          ? <Loader2 size={14} className="animate-spin" />
                          : <ShieldOff size={14} />}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(comp)}
                        disabled={actionLoading === comp._id + '-delete'}
                        title="Delete compounder"
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                      >
                        {actionLoading === comp._id + '-delete'
                          ? <Loader2 size={14} className="animate-spin" />
                          : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Register modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in relative">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg">Add Clinic Assistant</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Asad Jamil"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="px-4 py-3 w-full border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="e.g. asad@medibook.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="px-4 py-3 w-full border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-11 pr-11 py-3 w-full border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Phone Number</label>
                <input
                  required
                  type="tel"
                  placeholder="e.g. 03211234567"
                  value={phoneNumber}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 11) {
                      setPhoneNumber(val);
                    }
                  }}
                  className="px-4 py-3 w-full border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all"
                />
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-slate-500 hover:bg-slate-100 rounded-xl font-semibold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 text-white bg-teal-600 hover:bg-teal-700 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">Delete Compounder?</h3>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to permanently delete <strong>{confirmDelete.fullName}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all"
                >
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
