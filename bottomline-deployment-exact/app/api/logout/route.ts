import { NextResponse } from 'next/server';
import { SHOWCASE_AUTH_COOKIE } from '@/lib/showcase-auth';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SHOWCASE_AUTH_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });

  return response;
}
