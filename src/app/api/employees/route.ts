import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import { Employee } from '@/lib/types';

const KEY = 'km:employees';

export async function GET() {
  const data = await kv.get<Employee[]>(KEY);
  return NextResponse.json(data ?? []);
}

export async function PUT(req: Request) {
  const emp: Employee = await req.json();
  const list: Employee[] = (await kv.get<Employee[]>(KEY)) ?? [];
  const idx = list.findIndex(e => e.id === emp.id);
  if (idx >= 0) list[idx] = emp;
  else list.push(emp);
  await kv.set(KEY, list);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get('id');
  const list: Employee[] = (await kv.get<Employee[]>(KEY)) ?? [];
  await kv.set(KEY, list.filter(e => e.id !== id));
  return NextResponse.json({ ok: true });
}
