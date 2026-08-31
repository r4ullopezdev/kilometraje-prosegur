import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const runtime = 'edge';

export async function GET() {
  const [employees, services, reports] = await Promise.all([
    kv.get('km:employees'),
    kv.get('km:services'),
    kv.get('km:reports'),
  ]);
  return NextResponse.json({ employees, services, reports });
}
