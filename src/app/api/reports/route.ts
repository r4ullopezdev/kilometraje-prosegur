import { NextResponse } from 'next/server';
import { Report } from '@/lib/types';
import { kvGet, kvSet } from '@/lib/db';

const KEY = 'km:reports';

export async function GET() {
  return NextResponse.json(kvGet<Report[]>(KEY) ?? []);
}

export async function PUT(req: Request) {
  const report: Report = await req.json();
  const list: Report[] = kvGet<Report[]>(KEY) ?? [];
  const idx = list.findIndex(r => r.id === report.id);
  if (idx >= 0) list[idx] = report; else list.push(report);
  kvSet(KEY, list);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get('id');
  const list: Report[] = kvGet<Report[]>(KEY) ?? [];
  kvSet(KEY, list.filter(r => r.id !== id));
  return NextResponse.json({ ok: true });
}
