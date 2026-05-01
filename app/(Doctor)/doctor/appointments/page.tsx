
import { redirect } from 'next/navigation';
import AppointmentsClient from './AppointmentsClient';
import axios from 'axios';
import { getToken } from '@/app/actions/token';
 

async function getDoctorProfile() {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  const token = await getToken(); 

  if (!token) {
    redirect('/login');
  }

  try {
    const response = await axios.get(`${serverUrl}/doctor/getProfile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      // Note: withCredentials is often ignored in Server-to-Server requests, 
      // but harmless to leave here if your backend strictly demands it.
      withCredentials: true, 
    });

    // 2. FIXED: Return response.data, not the raw Axios response object
    return response.data; 
    
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    return null;
  }
}

export default async function AppointmentsPage() {
  const profileData = await getDoctorProfile();

  // Because we returned response.data above, this will now work perfectly!
  const specialization: string = profileData?.specialization;

  return <AppointmentsClient specialization={specialization} />;
}