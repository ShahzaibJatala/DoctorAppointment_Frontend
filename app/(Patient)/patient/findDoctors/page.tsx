import { getToken } from '@/app/actions/token';
import FindDoctorsClient from './FindDoctorsClient';

// ISR configuration - revalidate every 5 minutes
export const revalidate = 300;

// Server component wrapper for ISR
async function getInitialDoctors(serverUrl: string) {
  try {
    const response = await fetch(`${serverUrl}/patient/allDoctors`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error('Error fetching initial doctors:', error);
    return [];
  }
}

export default async function FindDoctorPage() {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  const initialDoctors = await getInitialDoctors(serverUrl || '');
  
  return <FindDoctorsClient initialDoctors={initialDoctors} serverUrl={serverUrl || ''} />;
}