'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  Activity,
  Star,
  Settings,
  Search,
  Bell,
  Filter,
  MoreVertical,
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
  ChevronDown
} from 'lucide-react';

// --- Types ---
type DoctorStatus = 'Active' | 'Pending' | 'Blocked';

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
  documents: string[]; // Mock list of doc names
}

// --- Mock Data ---
const doctorsData: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Emily Chen',
    email: 'emily.chen@medibook.com',
    phone: '+1 (555) 012-3456',
    specialty: 'Cardiology',
    hospital: 'Heart & Vascular Institute',
    experience: '12 Years',
    rating: 4.9,
    reviews: 124,
    status: 'Active',
    joinedDate: 'Jan 15, 2023',
    avatar: 'https://i.pravatar.cc/150?u=doc1',
    documents: ['Medical_License.pdf', 'Board_Cert.pdf']
  },
  {
    id: '2',
    name: 'Dr. Michael Ross',
    email: 'm.ross@medibook.com',
    phone: '+1 (555) 098-7654',
    specialty: 'Neurology',
    hospital: 'City General Hospital',
    experience: '8 Years',
    rating: 4.7,
    reviews: 85,
    status: 'Active',
    joinedDate: 'Mar 10, 2023',
    avatar: 'https://i.pravatar.cc/150?u=doc2',
    documents: ['License_Renewal.pdf']
  },
  {
    id: '3',
    name: 'Dr. Sarah Miller',
    email: 's.miller@gmail.com',
    phone: '+1 (555) 111-2222',
    specialty: 'Pediatrics',
    hospital: 'Children\'s Care Center',
    experience: '5 Years',
    rating: 0,
    reviews: 0,
    status: 'Pending',
    joinedDate: 'Oct 24, 2024',
    avatar: 'https://i.pravatar.cc/150?u=doc3',
    documents: ['Degree_Cert.pdf', 'ID_Proof.jpg']
  },
  {
    id: '4',
    name: 'Dr. James Wilson',
    email: 'j.wilson@medibook.com',
    phone: '+1 (555) 333-4444',
    specialty: 'Dermatology',
    hospital: 'Skin & Glow Clinic',
    experience: '15 Years',
    rating: 3.5,
    reviews: 42,
    status: 'Blocked',
    joinedDate: 'Dec 01, 2022',
    avatar: 'https://i.pravatar.cc/150?u=doc4',
    documents: []
  },
  {
    id: '5',
    name: 'Dr. Linda Kim',
    email: 'linda.k@medibook.com',
    phone: '+1 (555) 555-6666',
    specialty: 'Orthopedics',
    hospital: 'Ortho Plus',
    experience: '10 Years',
    rating: 4.8,
    reviews: 210,
    status: 'Active',
    joinedDate: 'Feb 20, 2023',
    avatar: 'https://i.pravatar.cc/150?u=doc5',
    documents: ['Fellowship_Cert.pdf']
  }
];

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active = false, count }: { icon: any, label: string, active?: boolean, count?: number }) => (
  <div className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all ${
    active 
      ? 'bg-teal-50 text-teal-700 font-semibold' 
      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
  }`}>
    <div className="flex items-center gap-3">
      <Icon size={20} className={active ? 'text-teal-600' : ''} />
      <span>{label}</span>
    </div>
    {count !== undefined && (
      <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
        {count}
      </span>
    )}
  </div>
);

const StatusBadge = ({ status }: { status: DoctorStatus }) => {
  const styles = {
    Active: 'bg-green-50 text-green-700 border-green-200',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Blocked: 'bg-red-50 text-red-700 border-red-200',
  };

  const icons = {
    Active: CheckCircle,
    Pending: Activity,
    Blocked: ShieldAlert,
  };

  const Icon = icons[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      <Icon size={12} />
      {status}
    </span>
  );
};

export default function AdminDoctors() {
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Pending' | 'Blocked'>('All');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtering Logic
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
    blocked: doctorsData.filter(d => d.status === 'Blocked').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      
      {/* --- Sidebar --- */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="h-8 w-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <Activity className="text-white h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">MediBook</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem icon={Stethoscope} label="Doctors" active count={stats.total} />
          <SidebarItem icon={Users} label="Patients" />
          <SidebarItem icon={Calendar} label="Appointments" />
          <SidebarItem icon={Star} label="Reviews" />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <SidebarItem icon={Settings} label="Settings" />
          <div className="mt-4 flex items-center gap-3 px-4 py-2">
            <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" className="h-9 w-9 rounded-full border border-slate-200" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-700">Admin User</span>
              <span className="text-xs text-slate-500">Super Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 lg:ml-64 relative">
        
        {/* Navbar */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Doctors Management</h1>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-slate-100 rounded-lg px-4 py-2 w-64 border border-transparent focus-within:border-teal-500 transition-all">
              <Search className="text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search doctors..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-sm ml-2 w-full text-slate-600 placeholder:text-slate-400"
              />
            </div>
            <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
          
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
                <p className="text-sm font-medium text-slate-500">Blocked</p>
                <h3 className="text-2xl font-bold text-red-500 mt-1">{stats.blocked}</h3>
              </div>
              <div className="p-3 bg-red-50 rounded-lg text-red-600"><ShieldAlert size={20} /></div>
            </div>
          </section>

          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
             {/* Tabs */}
             <div className="bg-slate-100 p-1 rounded-lg flex self-start">
               {(['All', 'Active', 'Pending', 'Blocked'] as const).map(tab => (
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
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                  <Download size={16} /> Export
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 shadow-sm transition-colors">
                  <Plus size={16} /> Add Doctor
                </button>
             </div>
          </div>

          {/* Doctors Table */}
          <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">
                      <input type="checkbox" className="rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                    </th>
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
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        No doctors found matching your criteria.
                      </td>
                    </tr>
                  ) : filteredDoctors.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <input type="checkbox" className="rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                      </td>
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
                           {doc.status === 'Pending' ? (
                             <>
                               <button className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors" title="Approve">
                                 <CheckCircle size={18} />
                               </button>
                               <button className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Reject">
                                 <XCircle size={18} />
                               </button>
                             </>
                           ) : (
                             <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                               <MoreVertical size={18} />
                             </button>
                           )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      {/* --- Quick View Modal --- */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
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
            
            {/* Modal Body (Scrollable) */}
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
                         <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                           <FileText size={16} />
                         </div>
                         <span className="text-sm font-medium text-slate-700">{doc}</span>
                       </div>
                       <button className="text-teal-600 hover:text-teal-700 text-xs font-bold">View</button>
                     </div>
                   )) : (
                     <p className="text-sm text-slate-500 italic">No documents uploaded.</p>
                   )}
                 </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
               <button onClick={() => setSelectedDoctor(null)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-100">
                 Close
               </button>
               {selectedDoctor.status === 'Pending' ? (
                 <>
                   <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold shadow-sm">
                     Reject Application
                   </button>
                   <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold shadow-sm">
                     Approve Doctor
                   </button>
                 </>
               ) : (
                 <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-bold shadow-sm">
                    Edit Details
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}