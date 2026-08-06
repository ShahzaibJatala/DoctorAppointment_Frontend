import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from "jwt-decode"; // Ensure you installed this: npm install jwt-decode

// Define the shape of your Token
interface CustomJwtPayload {
  role: string;
  exp: number;
}

// 1. Define Protected Routes and their allowed Roles
const rolePaths = {
  admin:   /^\/admin/,   // Paths starting with /admin
  doctor:  /^\/doctor/,  // Paths starting with /doctor
  patient: /^\/patient/, // Paths starting with /patient
};

// 👇 IMPORTANT: The function MUST be named 'middleware' and exported
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 2. Ignore public files (images, standard nextjs files)
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname === '/auth/google/callback' ||
    pathname.startsWith('/static') || 
    pathname === '/login' || 
    pathname === '/register' ||
    pathname === '/' || 
    pathname === '/favicon.ico' ||
    pathname.startsWith('/patient/findDoctors') ||
    pathname.startsWith('/patient/selected-doctor')
  ) {
    return NextResponse.next();
  }

  // 3. Get Token
  const token = request.cookies.get('accessToken')?.value;

  // 4. No Token? -> Redirect to Login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // 5. Decode Token
    const cleanToken = token.replace(/"/g, '').trim();
    const decoded = jwtDecode<CustomJwtPayload>(cleanToken);
    const userRole = decoded.role?.toLowerCase();
    const currentTime = Date.now() / 1000;

    // 6. Check Token Expiry
    if (decoded.exp < currentTime) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('accessToken');
      return response;
    }

    // ==============================================================
    // 🔒 STRICT ROLE CHECKING
    // ==============================================================
    
    const isPublicPatientRoute = pathname.startsWith('/patient/findDoctors') || pathname.startsWith('/patient/selected-doctor');

    // A. ADMIN blocking
    if (userRole === 'admin') {
      if (!isPublicPatientRoute && (rolePaths.patient.test(pathname) || rolePaths.doctor.test(pathname))) {
         return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    }

    // B. PATIENT blocking
    if (userRole === 'patient') {
      if (rolePaths.admin.test(pathname) || rolePaths.doctor.test(pathname)) {
         return NextResponse.redirect(new URL('/patient/dashboard', request.url));
      }
    }

    // C. DOCTOR blocking
    if (userRole === 'doctor') {
      if (!isPublicPatientRoute && (rolePaths.admin.test(pathname) || rolePaths.patient.test(pathname))) {
         return NextResponse.redirect(new URL('/doctor/profile', request.url));
      }
    }

    return NextResponse.next();

  } catch (error) {
    console.error("Middleware Decode Error:", error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Configure paths
// export const config = {
//   matcher: [
//     '/admin/:path*',
//     '/doctor/:path*',
//     '/patient/:path*',
//     '/user/:path*',
//   ],
// };