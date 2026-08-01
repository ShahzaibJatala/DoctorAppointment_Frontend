'use client';

import { usePathname } from 'next/navigation';
import Footer from './footer';

const SIDEBAR_ROUTES = [
  '/patient/dashboard',
  '/patient/appointments',
  '/patient/history',
];

export default function PatientFooter() {
  const pathname = usePathname();
  const hasSidebar = SIDEBAR_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`));

  return <footer className={hasSidebar ? 'lg:pl-64' : ''}><Footer /></footer>;
}
