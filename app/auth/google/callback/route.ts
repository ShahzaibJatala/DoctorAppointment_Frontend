import { NextRequest, NextResponse } from 'next/server';

export function GET(request: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  if (!backendUrl) {
    return NextResponse.redirect(new URL('/login?error=oauth_config', request.url));
  }

  // Google is configured to return to the frontend. Forward its authorization
  // response to Passport on the NestJS backend so it can exchange the code.
  const callbackUrl = new URL('/auth/google/callback', backendUrl);
  request.nextUrl.searchParams.forEach((value, key) => {
    callbackUrl.searchParams.append(key, value);
  });

  return NextResponse.redirect(callbackUrl);
}
