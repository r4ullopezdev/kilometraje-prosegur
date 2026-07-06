import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import { Report } from '@/lib/types';

const KEY = 'km:reports';

export async function GET() {
  const data = await kv.get<Report[]>(KEY);
  return NextResponse.json(data ?? []);
}

export async function PUT(req: Request) {
  const report: Report = await req.json();
  const list: Report[] = (await kv.get<Report[]>(KEY)) ?? [];
  const idx = list.findIndex(r => r.id === report.id);
  if (idx >= 0) list[idx] = report;
  else list.push(report);
  await kv.set(KEY, list);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get('id');
  const list: Report[] = (await kv.get<Report[]>(KEY)) ?? [];
  await kv.set(KEY, list.filter(r => r.id !== id));
  return NextResponse.json({ ok: true });
}
