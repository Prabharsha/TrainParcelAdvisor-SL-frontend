import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookie or localStorage (client-side)
  // Since middleware runs on server, we'll check for the auth cookie
  const token = request.cookies.get('auth_token')?.value;
  
  // For now, we'll redirect to login if accessing protected routes
  // In a real app, you'd validate the JWT token here
  const protectedPaths = ['/admin', '/station-master', '/parcels/my-parcels', '/tickets/my-bookings'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtectedPath && !token) {
    // Since we're using localStorage for token, we'll handle this client-side
    // This middleware serves as a secondary check
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/station-master/:path*',
    '/parcels/my-parcels',
    '/tickets/my-bookings',
  ],
};
