import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Temporarily disabled middleware - enable once database is connected
export async function middleware(req: NextRequest) {
  // Just pass through for now - no auth checks until database is working
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*', '/auth/:path*'],
};
