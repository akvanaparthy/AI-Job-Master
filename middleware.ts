import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Security: Limit request body size for API routes to prevent memory exhaustion
  if (pathname.startsWith('/api/')) {
    const contentLength = req.headers.get('content-length');
    const maxSize = 5 * 1024 * 1024; // 5MB limit for API routes

    if (contentLength && parseInt(contentLength) > maxSize) {
      return NextResponse.json(
        { error: 'Request payload too large' },
        { status: 413 }
      );
    }
    // Don't check session for API routes - they handle their own auth
    return NextResponse.next();
  }

  // Determine if we actually need a session check
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/settings') || pathname.startsWith('/admin');
  const isAuthRoute = pathname.startsWith('/auth');

  // Skip Supabase session check for routes that don't need it
  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect admin, dashboard, settings routes
  if (isProtectedRoute && !session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/auth/login';
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*', '/auth/:path*', '/admin/:path*', '/api/:path*'],
};
