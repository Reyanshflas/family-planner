import { NextResponse } from 'next/server';
import { verifyPasscode } from '@/lib/db';

export async function POST(request: Request) {
  const { code } = await request.json();
  if (verifyPasscode(code)) {
    const response = NextResponse.json({ success: true });
    response.cookies.set('auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    return response;
  }
  return NextResponse.json({ success: false, error: 'Invalid passcode' }, { status: 401 });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('auth', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}
