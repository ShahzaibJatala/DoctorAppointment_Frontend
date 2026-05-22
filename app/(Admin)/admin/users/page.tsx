'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
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
  Trash2,
  Eye,
  Mail,
  CalendarDays,
  MoreHorizontal,
  FileText,
  Activity,
  X,
  ChevronLeft,
  ChevronRight,
  Lock
} from 'lucide-react';
import DashboardShell from '@/components/layouts/DashboardShell';

// --- Types ---
type UserStatus = 'Active' | 'Inactive' | 'Blocked';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Patient' | 'VIP Patient';
  joinedDate: string;
  status: UserStatus;
  totalAppointments: number;
  lastActive: string;
  avatar: string;
}

// --- Mock Data ---
const usersData: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 123-4567',
    role: 'Patient',
    joinedDate: 'Jan 15, 2023',
    status: 'Active',
    totalAppointments: 12,
    lastActive: '2 hours ago',
    avatar: 'https://i.pravatar.cc/150?u=sarah'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'm.chen@example.com',
    phone: '+1 (555) 987-6543',
    role: 'VIP Patient',
    joinedDate: 'Mar 10, 2023',
    status: 'Active',
    totalAppointments: 28,
    lastActive: '1 day ago',
    avatar: 'https://i.pravatar.cc/150?u=michael'
  },
  {
    id: '3',
    name: 'Emma Davis',
    email: 'emma.davis@example.com',
    phone: '+1 (555) 456-7890',
    role: 'Patient',
    joinedDate: 'Dec 05, 2023',
    status: 'Inactive',
    totalAppointments: 1,
    lastActive: '3 months ago',
    avatar: 'https://i.pravatar.cc/150?u=emma'
  },
  {
    id: '4',
    name: 'Robert Wilson',
    email: 'r.wilson@bad-actor.com',
    phone: '+1 (555) 000-1111',
    role: 'Patient',
    joinedDate: 'Oct 01, 2024',
    status: 'Blocked',
    totalAppointments: 0,
    lastActive: 'Never',
    avatar: 'https://i.pravatar.cc/150?u=robert'
  },
  {
    id: '5',
    name: 'Linda Martinez',
    email: 'linda.m@example.com',
    phone: '+1 (555) 222-3333',
    role: 'Patient',
    joinedDate: 'Feb 14, 2024',
    status: 'Active',
    totalAppointments: 5,
    lastActive: '5 mins ago',
    avatar: 'https://i.pravatar.cc/150?u=linda'
  }
];

// --- Components ---

const StatusBadge = ({ status }: { status: UserStatus }) => {
  const styles = {
    Active: 'bg-green-50 text-green-700 border-green-200',
    Inactive: 'bg-slate-100 text-slate-500 border-slate-200',
    Blocked: 'bg-red-50 text-red-700 border-red-200',
  };

  const icons = {
    Active: CheckCircle,
    Inactive: XCircle,
    Blocked: Lock,
  };

  const Icon = icons[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      <Icon size={12} />
      {status}
    </span>
  );
};

const StatsCard = ({ label, value, icon: Icon, trend, color }: { label: string, value: string, icon: any, trend?: string, color: string }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
      {trend && <p className="text-xs text-green-600 mt-1 font-medium">{trend}</p>}
    </div>
    <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
      <Icon size={20} className={color.replace('bg-', 'text-')} />
    </div>
  </div>
);

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Blocked'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter Logic
  const filteredUsers = usersData.filter(user => {
    const matchesTab = activeTab === 'All' ? true : user.status === activeTab;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Bulk Selection Logic
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredUsers.map(u => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const stats = {
    total: usersData.length,
    active: usersData.filter(u => u.status === 'Active').length,
    blocked: usersData.filter(u => u.status === 'Blocked').length,
    new: 12 // Mock
  };

  return (
    <DashboardShell role="admin" activeHref="/admin/users" sidebarWidth="narrow" showHealthTip={false}>
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">User Management</h1>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex flex-1 md:flex-none items-center bg-slate-100 rounded-lg px-4 py-2 md:w-72 border border-transparent focus-within:border-teal-500 transition-all">
              <Search className="text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search by name, email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-sm ml-2 w-full text-slate-600 placeholder:text-slate-400"
              />
            </div>
            <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </header>

        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
          
          {/* Stats Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard label="Total Users" value={stats.total.toString()} icon={Users} trend="+12% this month" color="bg-blue-600 text-blue-600" />
            <StatsCard label="Active Users" value={stats.active.toString()} icon={CheckCircle} color="bg-green-600 text-green-600" />
            <StatsCard label="Blocked Users" value={stats.blocked.toString()} icon={ShieldAlert} trend="-2% vs last month" color="bg-red-600 text-red-600" />
            <StatsCard label="New This Month" value={stats.new.toString()} icon={CalendarDays} color="bg-teal-600 text-teal-600" />
          </section>

          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row justify-between gap-4 items-center bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
             {/* Tabs */}
             <div className="flex bg-slate-100 p-1 rounded-lg self-start w-full md:w-auto">
               {(['All', 'Active', 'Blocked'] as const).map(tab => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`flex-1 md:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all ${
                     activeTab === tab ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                   }`}
                 >
                   {tab}
                 </button>
               ))}
             </div>

             {/* Bulk Actions & Export */}
             <div className="flex gap-2 w-full md:w-auto justify-end">
                {selectedIds.length > 0 && (
                  <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors animate-in fade-in">
                    <Trash2 size={16} /> Delete ({selectedIds.length})
                  </button>
                )}
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                  <Download size={16} /> Export CSV
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors md:hidden">
                  <Filter size={16} />
                </button>
             </div>
          </div>

          {/* Users Table */}
          <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
            
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 w-10">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer" 
                        onChange={handleSelectAll}
                        checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0}
                      />
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">User Info</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Joined</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Appts.</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center">
                           <Users className="w-12 h-12 text-slate-300 mb-2" />
                           <p>No users found matching your filters.</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.map((user) => (
                    <tr key={user.id} className={`hover:bg-slate-50/50 transition-colors group ${selectedIds.includes(user.id) ? 'bg-teal-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox" 
                          className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                          checked={selectedIds.includes(user.id)}
                          onChange={() => handleSelectOne(user.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${user.role === 'VIP Patient' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {user.joinedDate}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                          {user.totalAppointments}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                             onClick={() => setSelectedUser(user)}
                             className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                             title="View Activity"
                           >
                             <Eye size={18} />
                           </button>
                           {user.status !== 'Blocked' ? (
                             <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Block User">
                               <Lock size={18} />
                             </button>
                           ) : (
                             <button className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Unblock User">
                               <CheckCircle size={18} />
                             </button>
                           )}
                           <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete User">
                             <Trash2 size={18} />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredUsers.map(user => (
                <div key={user.id} className="p-4 bg-white space-y-4">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <img src={user.avatar} alt="" className="w-12 h-12 rounded-full border border-slate-100" />
                         <div>
                            <h4 className="font-bold text-slate-800">{user.name}</h4>
                            <p className="text-xs text-slate-500">{user.email}</p>
                         </div>
                      </div>
                      <button onClick={() => setSelectedUser(user)} className="p-2 text-slate-400">
                        <MoreHorizontal size={20} />
                      </button>
                   </div>
                   
                   <div className="flex items-center justify-between text-sm">
                      <StatusBadge status={user.status} />
                      <span className="text-slate-500 text-xs">Joined {user.joinedDate}</span>
                   </div>

                   <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => setSelectedUser(user)}
                        className="flex-1 py-2 bg-slate-50 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-100 border border-slate-200"
                      >
                        View Details
                      </button>
                      <button className="px-4 py-2 bg-white text-red-500 border border-red-200 rounded-lg hover:bg-red-50">
                        <Lock size={18} />
                      </button>
                   </div>
                </div>
              ))}
            </div>
            
            {/* Pagination Footer (Visual) */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
               <span className="text-xs text-slate-500">Showing 1-5 of {filteredUsers.length} users</span>
               <div className="flex gap-2">
                 <button className="p-1 rounded-md hover:bg-white border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-600 disabled:opacity-50" disabled>
                   <ChevronLeft size={16} />
                 </button>
                 <button className="p-1 rounded-md hover:bg-white border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-600">
                   <ChevronRight size={16} />
                 </button>
               </div>
            </div>

          </div>
        </div>

      {/* --- User Details / Activity Modal --- */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
             
             {/* Header */}
             <div className="relative bg-teal-600 h-24">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-md transition-colors"
                >
                  <X size={18} />
                </button>
             </div>
             
             <div className="px-6 pb-6 -mt-12">
                <div className="flex justify-between items-end mb-4">
                  <img src={selectedUser.avatar} alt="" className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white" />
                  <div className="flex gap-2 mb-1">
                    <button className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 hover:bg-red-100">
                      Block User
                    </button>
                    <button className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200">
                      Reset Password
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                   <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                     {selectedUser.name}
                     <StatusBadge status={selectedUser.status} />
                   </h2>
                   <p className="text-slate-500 text-sm">{selectedUser.email}</p>
                   <p className="text-slate-400 text-xs mt-1">{selectedUser.phone} • Joined {selectedUser.joinedDate}</p>
                </div>

                {/* Activity Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                   <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <p className="text-xs text-slate-400 uppercase font-bold">Appts</p>
                      <p className="text-lg font-bold text-slate-800">{selectedUser.totalAppointments}</p>
                   </div>
                   <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <p className="text-xs text-slate-400 uppercase font-bold">Reviews</p>
                      <p className="text-lg font-bold text-slate-800">4</p>
                   </div>
                   <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <p className="text-xs text-slate-400 uppercase font-bold">No-Shows</p>
                      <p className="text-lg font-bold text-red-500">0</p>
                   </div>
                </div>

                {/* Recent Activity Timeline */}
                <div>
                   <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                     <Activity size={16} className="text-teal-600" /> Recent Activity
                   </h4>
                   <div className="space-y-4 relative pl-4 border-l border-slate-200 ml-2">
                      <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 bg-teal-500 rounded-full border-2 border-white"></div>
                        <p className="text-sm font-medium text-slate-800">Booked appointment with Dr. Smith</p>
                        <p className="text-xs text-slate-400">2 hours ago</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 bg-slate-300 rounded-full border-2 border-white"></div>
                        <p className="text-sm font-medium text-slate-800">Updated profile information</p>
                        <p className="text-xs text-slate-400">Yesterday</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        <p className="text-sm font-medium text-slate-800">Completed video consultation</p>
                        <p className="text-xs text-slate-400">Oct 24, 2024</p>
                      </div>
                   </div>
                </div>
             </div>

          </div>
        </div>
      )}

    </DashboardShell>
  );
}