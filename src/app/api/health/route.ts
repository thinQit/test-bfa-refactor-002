import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const check = request.nextUrl.searchParams.get('check');
    const response: { status: 'ok' | 'degraded' | 'down'; checks?: { db?: 'ok' | 'error' } } = {
      status: 'ok'
    };

    if (check === 'db') {
      try {
        await db.$queryRaw`SELECT 1`;
        response.checks = { db: 'ok' };
      } catch {
        response.status = 'degraded';
        response.checks = { db: 'error' };
      }
    }

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Health check failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
