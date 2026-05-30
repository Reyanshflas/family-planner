import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth')?.value;
  const { pathname } = request.nextUrl;

  const isAuthApi = pathname === '/api/auth';
  const isApiRoute = pathname.startsWith('/api/');
  const isDashboard = pathname.startsWith('/dashboard');

  if (!isAuthApi && (isApiRoute || isDashboard)) {
    if (authCookie !== 'true') {
      if (isApiRoute) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*'],
};
