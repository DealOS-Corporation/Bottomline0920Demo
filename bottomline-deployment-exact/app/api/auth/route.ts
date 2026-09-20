import { NextResponse } from 'next/server';
import { SHOWCASE_AUTH_COOKIE, SHOWCASE_AUTH_MAX_AGE, getConfiguredCredentials } from '@/lib/showcase-auth';

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const username = String(payload.username ?? '').trim();
  const password = String(payload.password ?? '');
  const { username: expectedUsername, password: expectedPassword } = getConfiguredCredentials();

  if (username !== expectedUsername || password !== expectedPassword) {
    return NextResponse.json({ ok: false, error: 'Invalid username or password.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SHOWCASE_AUTH_COOKIE, '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SHOWCASE_AUTH_MAX_AGE,
  });

  return response;
}
