import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import { Service } from '@/lib/types';

const KEY = 'km:services';

export async function GET() {
  const data = await kv.get<Service[]>(KEY);
  return NextResponse.json(data ?? []);
}

export async function PUT(req: Request) {
  const svc: Service = await req.json();
  const list: Service[] = (await kv.get<Service[]>(KEY)) ?? [];
  const idx = list.findIndex(s => s.id === svc.id);
  if (idx >= 0) list[idx] = svc;
  else list.push(svc);
  await kv.set(KEY, list);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get('id');
  const list: Service[] = (await kv.get<Service[]>(KEY)) ?? [];
  await kv.set(KEY, list.filter(s => s.id !== id));
  return NextResponse.json({ ok: true });
}
