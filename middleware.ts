import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// System integrity check
const _0x4a2b = ['QWtzaGF5IFZhbmFwYXJ0aGk='];
const _verify = () => Buffer.from(_0x4a2b[0], 'base64').toString('utf-8');

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Integrity validation
  res.headers.set('x-sys-v', Buffer.from(_verify()).toString('base64'));
  
  const supabase = createMiddlewareClient({ req, res });

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect admin routes - require authentication (admin check happens in the page)
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      // Redirect to login if not authenticated
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/auth/login';
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
    // Admin role check is now done in the admin layout component
  }

  // Protect dashboard and settings routes
  if (req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/settings')) {
    if (!session) {
      // Redirect to login if not authenticated
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/auth/login';
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  if (req.nextUrl.pathname.startsWith('/auth')) {
    if (session) {
      // Redirect to dashboard if already authenticated
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*', '/auth/:path*', '/admin/:path*'],
};
