// app/page.tsx
import {
  CalendarDays,
  Users,
  Wallet,
  Star,
  Bell,
  Search,
  CheckCircle,
  Video,
  MapPin,
  MoreHorizontal,
  ChevronRight,
  LogOut,
  Heart,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import DashboardShell from '@/components/layouts/DashboardShell';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { removeToken } from '@/app/actions/token';

// --- Types ---
type Appointment = {
  id: string;
  patientName: string;
  patientAvatar: string;
  time: string;
  type: 'Online' | 'In-Clinic';
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  symptom: string;
};

type Review = {
  id: string;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
};

const reviews: Review[] = [
  { id: '1', patientName: 'John D.', rating: 5, comment: 'Dr. Smith was incredibly patient and kind.', date: '2h ago' },
  { id: '2', patientName: 'Emily R.', rating: 4, comment: 'Great service, but the wait time was a bit long.', date: '1d ago' },
];

// --- Components ---
const AppointmentCard = ({ apt }: { apt: Appointment }) => (
  <div className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:shadow-elevated hover:border-[#16BCC8]/10 transition-all duration-300 group">
    <div className="flex items-center gap-4">
      <div className="relative">
        <img src={apt.patientAvatar} alt={apt.patientName} className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-50 shadow-sm" />
        <div className={`absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full border-2 border-white ${apt.type === 'Online' ? 'bg-blue-500' : 'bg-[#16BCC8]'}`}>
          {apt.type === 'Online' ? <Video size={8} className="text-white" /> : <MapPin size={8} className="text-white" />}
        </div>
      </div>
      <div>
        <h4 className="font-bold text-slate-800 group-hover:text-[#16BCC8] transition-colors duration-200">{apt.patientName}</h4>
        <p className="text-xs text-slate-400 flex items-center gap-1.5">
          {apt.type === 'Online' ? <Video size={12} className="text-blue-500" /> : <MapPin size={12} className="text-[#16BCC8]" />}
          {apt.type} • {apt.symptom}
        </p>
      </div>
    </div>
    
    <div className="flex items-center gap-6">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-bold text-slate-800">{apt.time}</p>
        <span className={`text-[10px] uppercase font-bold tracking-wider ${
          apt.status === 'Upcoming' ? 'text-blue-600' :
          apt.status === 'Completed' ? 'text-[#20AC6B]' : 'text-red-500'
        }`}>
          {apt.status}
        </span>
      </div>
      
      <div className="flex gap-2">
        {apt.status === 'Upcoming' && (
          <>
            <button className="p-2 text-slate-300 hover:text-[#16BCC8] hover:bg-[#16BCC8]/8 rounded-xl transition-all duration-200" title="View Details">
              <MoreHorizontal size={18} />
            </button>
            <Link href="/doctor/appointments" className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#16BCC8] to-[#0ea5a9] rounded-xl transition-all duration-300 shadow-[0_2px_8px_rgba(22,188,200,0.3)] hover:shadow-[0_4px_16px_rgba(22,188,200,0.4)]">
              Manage
            </Link>
          </>
        )}
        {apt.status === 'Completed' && (
           <button className="p-2 text-[#20AC6B] bg-[#20AC6B]/8 rounded-xl cursor-default">
             <CheckCircle size={18} />
           </button>
        )}
      </div>
    </div>
  </div>
);

// --- Server Data Fetching Functions ---
async function getProfileData() {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    const response = await fetch(`${serverUrl}/doctor/getProfile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store' 
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch profile');
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching profile on server:", error);
    return null;
  }
}

async function getPatientsData() {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) return [];

  try {
    const response = await fetch(`${serverUrl}/doctor/getPatients`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store' 
    });

    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Error fetching patients data on server:", error);
    return [];
  }
}

export default async function DoctorDashboard() {
  const profileData = await getProfileData();
  const patientsData = await getPatientsData();
  
  const doctorName = profileData?.fullName || 'Dr. Smith';
  const profilePhotoUrl = profileData?.profilePictureUrl || 'https://i.pravatar.cc/150?u=doctor';
  const specialization = profileData?.specialization || 'General Physician';
  const consultationFee = profileData?.consultationFee || 150;

  // Map backend appointments
  const specializedAppointments: Appointment[] = patientsData.map((item: any, idx: number) => {
    const statusLower = item.status?.toLowerCase();
    const normalizedStatus: Appointment['status'] = 
      statusLower === 'confirmed' || statusLower === 'upcoming' || statusLower === 'pending' || statusLower === 'checked-in' || statusLower === 'in-progress'
        ? 'Upcoming'
        : statusLower === 'completed'
        ? 'Completed'
        : 'Cancelled';

    const timeFormatted = item.startTime 
      ? new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      : '09:00 AM';

    return {
      id: item.appointmentId || item._id || idx.toString(),
      patientName: item.name || item.email.split('@')[0],
      patientAvatar: item.profilePictureUrl || `https://ui-avatars.com/api/?name=${item.name || 'P'}&background=0D8ABC&color=fff`,
      time: timeFormatted,
      type: item.appointmentType === 'Online' ? 'Online' : 'In-Clinic',
      status: normalizedStatus,
      symptom: item.reasonForVisit || `Consultation · ${specialization}`,
    };
  });

  // Calculate Metrics
  const todayCount = specializedAppointments.filter(a => a.status === 'Upcoming').length;
  const uniquePatientsCount = new Set(patientsData.map((p: any) => p._id)).size;
  const completedCount = patientsData.filter((p: any) => p.status?.toLowerCase() === 'completed').length;
  const earnings = completedCount * consultationFee;

  const stats = [
    { label: "Today's Appointments", value: todayCount.toString(), icon: CalendarDays, color: 'text-[#16BCC8]', bg: 'bg-[#16BCC8]/8' },
    { label: 'Total Patients', value: uniquePatientsCount.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Monthly Earnings', value: `PKR ${earnings.toLocaleString()}`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Average Rating', value: '4.9', icon: Star, color: 'text-[#F59F0A]', bg: 'bg-amber-50' },
  ];

  const handleLogout = async () => {
    'use server';
    await removeToken();
    redirect('/');
  }

  return (
    <DashboardShell role="doctor" activeHref="/doctor/dashboard" showHealthTip={false}>
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-800">Good Morning, {doctorName} 👋</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#16BCC8] inline-block"></span>
                {specialization} — Here is your daily activity summary.
              </span>
            </p>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center bg-slate-50 rounded-xl px-4 py-2.5 w-64 border border-transparent focus-within:border-[#16BCC8]/30 focus-within:ring-2 focus-within:ring-[#16BCC8]/10 transition-all duration-200">
              <Search className="text-slate-300 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search appointments..." 
                className="bg-transparent border-none outline-none text-sm ml-2 w-full text-slate-700 placeholder:text-slate-300"
              />
            </div>
            <div className="h-10 w-px bg-slate-100 hidden md:block"></div>
            <button className="relative p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-[#16BCC8] hover:border-[#16BCC8]/20 transition-all duration-200 shadow-sm">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8">
          
          {/* Stats Overview */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((stat, i) => (
              <div key={i} className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300 animate-fade-up`}>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold text-[#20AC6B] bg-[#20AC6B]/8 px-2.5 py-1 rounded-lg">
                    +4.5% <ChevronRight size={10} className="rotate-[-45deg]" />
                  </span>
                </div>
                <h3 className="text-3xl font-extrabold text-slate-800">{stat.value}</h3>
                <p className="text-slate-400 text-sm mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Appointments */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Today's Appointments</h2>
                <Link href="/doctor/appointments" className="text-sm font-semibold text-[#16BCC8] hover:text-[#0ea5a9] flex items-center gap-1 transition-colors duration-200">
                  View Calendar <ArrowRight size={14} />
                </Link>
              </div>
              
              <div className="space-y-4">
                {specializedAppointments.length === 0 ? (
                  <p className="text-sm text-slate-500 italic py-6 text-center">No appointments scheduled.</p>
                ) : specializedAppointments.map((apt) => (
                  <AppointmentCard key={apt.id} apt={apt} />
                ))}
              </div>
            </div>

            {/* Right Column: Schedule & Reviews */}
            <div className="space-y-8">
              
              {/* Availability Widget */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800">Availability</h3>
                  <Link href="/doctor/schedule" className="text-xs bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors duration-200 font-semibold text-slate-500 border border-slate-100">Edit</Link>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 text-center">
                      <span className="block text-xs font-bold text-slate-400">09:00</span>
                      <span className="block text-xs font-medium text-slate-300">AM</span>
                    </div>
                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-300 w-full rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 text-center">
                      <span className="block text-xs font-bold text-slate-400">10:00</span>
                      <span className="block text-xs font-medium text-slate-300">AM</span>
                    </div>
                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-[#16BCC8] w-1/2 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 text-center">
                      <span className="block text-xs font-bold text-slate-400">11:00</span>
                      <span className="block text-xs font-medium text-slate-300">AM</span>
                    </div>
                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-slate-300 w-full rounded-full"></div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#16BCC8]"></span> Available</span>
                    <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Booked</span>
                  </div>
                </div>
              </div>

              {/* Recent Reviews */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card">
                <h3 className="font-bold text-slate-800 mb-6">Recent Reviews</h3>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2.5">
                           <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                             {review.patientName.charAt(0)}
                           </div>
                           <span className="font-semibold text-sm text-slate-700">{review.patientName}</span>
                        </div>
                        <div className="flex text-[#F59F0A]">
                          {[...Array(5)].map((_, i) => (
                             <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-slate-200"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-500 text-sm italic leading-relaxed">"{review.comment}"</p>
                      <span className="text-xs text-slate-300 mt-2 block font-medium">{review.date}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="px-4 sm:px-8 pb-8 lg:hidden">
          <div className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Link href="/doctor/profile" className="relative shrink-0">
              <img src={profilePhotoUrl} alt={doctorName} className="w-11 h-11 rounded-xl object-cover border-2 border-white shadow-sm" />
            </Link>
            <Link href="/doctor/profile" className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-800 truncate">{doctorName}</h4>
              <p className="text-xs text-[#16BCC8] font-medium truncate">{specialization}</p>
            </Link>
            <form action={handleLogout}>
              <button type="submit" className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50" aria-label="Log out">
                <LogOut size={18} />
              </button>
            </form>
          </div>
        </div>
    </DashboardShell>
  );
}