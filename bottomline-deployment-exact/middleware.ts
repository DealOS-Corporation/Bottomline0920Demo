import { NextRequest, NextResponse } from 'next/server';

// Auth gate removed — the workspace is served directly, no login required.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
