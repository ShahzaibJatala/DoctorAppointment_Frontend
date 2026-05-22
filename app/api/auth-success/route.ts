import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const role = searchParams.get('role');

  if (token && role) {
    // 1. Create the redirect destination FIRST
    const response = NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));

    // 2. Attach the cookie DIRECTLY to the outgoing redirect response
    response.cookies.set('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      sameSite: 'lax', 
    });

    // 3. Send it to the browser
    return response;
  }

  // If there is no token in the URL, send them back to login
  return NextResponse.redirect(new URL('/login', request.url));
}