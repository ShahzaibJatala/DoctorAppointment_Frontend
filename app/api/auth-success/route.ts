import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const role = searchParams.get('role');

  if (token && role) {
    // 1. Await the cookie store (required in newer Next.js versions)
    const cookieStore = await cookies();
    
    // 2. Set the cookie natively
    cookieStore.set('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
    });

    // 3. Force the redirect
    redirect(`/${role}/dashboard`);
  }

  redirect('/login');
}