import { NextResponse } from 'next/server';
import { Service } from '@/lib/types';
import { kvGet, kvSet } from '@/lib/db';

const KEY = 'km:services';

export async function GET() {
  return NextResponse.json(kvGet<Service[]>(KEY) ?? []);
}

export async function PUT(req: Request) {
  const svc: Service = await req.json();
  const list: Service[] = kvGet<Service[]>(KEY) ?? [];
  const idx = list.findIndex(s => s.id === svc.id);
  if (idx >= 0) list[idx] = svc; else list.push(svc);
  kvSet(KEY, list);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get('id');
  const list: Service[] = kvGet<Service[]>(KEY) ?? [];
  kvSet(KEY, list.filter(s => s.id !== id));
  return NextResponse.json({ ok: true });
}
