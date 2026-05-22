'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation'; 
import { jwtDecode } from "jwt-decode";

export async function registerAction(formData: FormData) {
  const email = formData.get('email')
  const password = formData.get('password')
  const role = formData.get('role')
  const name = formData.get('firstName')
  const age = formData.get('age')
  
  // 1. Call NestJS Backend
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, age : Number(age), email, password, role }),
  })

  const data = await res.json()


  if (!res.ok) {
    // Handle error (you might want to return state here)
    console.error('Register failed')
    return
  }

  // 3. Redirect user
  redirect('/login')
}


export async function loginAction(formData: FormData) {
    const email = formData?.get('email')
    const password = formData?.get('password')
  
    
    // 1. Call NestJS Backend

    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/login`, {

      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
  
    const data = await res.json()
    
  
  
    if (!res.ok) {
      // Handle error (you might want to return state here)
      throw new Error(data.message || "Login failed");
    }
  
    // 2. Set Cookie on the Next.js Server
    // cookies() is async in newer Next.js versions
    const cookieStore = await cookies()
    
    cookieStore.set('accessToken', data.access_token, {
      httpOnly: true, // Security: JS cannot read this
      // secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    })
    
    // 3. Redirect user
    let userRole = ""; // Default
    let userEmail = "";
    try {
        const decoded = jwtDecode<{role:string, email:string}>(data.access_token);
        userRole = decoded.role;
        userEmail = decoded.email;
    } catch (error) {
        console.error("Token decode failed on server");
    }

    // ✅ FIX: Return the data instead of redirecting
    return {
        success: true,
        role: userRole,
        access_token: data.access_token,
        email: userEmail
    };
    
  }


export async function googleAuth(googleData : {email:string}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email : googleData.email }),
  })

  const data = await res.json();

  if (!res.ok) {
    // Handle error (you might want to return state here)
    const errorData = await res.json().catch(() => ({})); // Try to get error body
  console.error('Google login failed:', res.status, errorData);
  return { error: errorData.message || 'Login failed' };
  }

  const cookieStore = await cookies()
    
  cookieStore.set('accessToken', data.access_token, {
    httpOnly: true, // Security: JS cannot read this
    // secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  })
  
  // 3. Redirect user
  redirect(`/user/dashboard`)
  
}
