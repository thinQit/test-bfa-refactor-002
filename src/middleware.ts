import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

export const runtime = 'nodejs';

export function middleware(request: NextRequest) {
  const token = getTokenFromHeader(request.headers.get('authorization'));

  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    verifyToken(token);
    return NextResponse.next();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/todos/:path*', '/api/users/:path*', '/api/auth/me']
};
