import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // 1. Unauthenticated users trying to access portal/admin redirect to login
  if (!user && (pathname.startsWith('/admin') || pathname.startsWith('/dashboard'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  let role: string | undefined;

  if (user) {
    // Fetch profile role from database
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    role = profile?.role;

    // 2. Prevent non-admins from entering /admin
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 3. Logged-in users hitting /login go to their respective dashboard
    if (pathname === '/login') {
      const redirectUrl = role === 'admin' ? '/admin' : '/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  // Forward the identity this middleware already verified via request
  // headers, so layouts/pages can trust it instead of re-calling
  // auth.getUser() and re-querying `profiles` for the same request — that
  // redundant round-trip was happening on every single navigation.
  //
  // Always strip these first: `requestHeaders` starts as a clone of the
  // *incoming* request, which could carry an attacker-supplied
  // `x-user-role: admin` header. If we only `.set()` on truthy values, a
  // failed/empty role lookup would let that spoofed header survive
  // untouched. Clearing unconditionally means downstream code only ever
  // sees a role we ourselves just verified — or nothing, which the
  // layouts already treat as "not authorized".
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete('x-user-id');
  requestHeaders.delete('x-user-role');
  if (user) {
    requestHeaders.set('x-user-id', user.id);
    if (role) requestHeaders.set('x-user-role', role);
  }
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  // Carry forward any cookies Supabase rotated during updateSession (the
  // refreshed session token), since `response` is a fresh NextResponse.
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie);
  });
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
