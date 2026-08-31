import { NextResponse } from 'next/server';
import { Employee } from '@/lib/types';
import { kvGet, kvSet } from '@/lib/db';

const KEY = 'km:employees';

export async function GET() {
  return NextResponse.json(kvGet<Employee[]>(KEY) ?? []);
}

export async function PUT(req: Request) {
  const emp: Employee = await req.json();
  const list: Employee[] = kvGet<Employee[]>(KEY) ?? [];
  const idx = list.findIndex(e => e.id === emp.id);
  if (idx >= 0) list[idx] = emp; else list.push(emp);
  kvSet(KEY, list);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get('id');
  const list: Employee[] = kvGet<Employee[]>(KEY) ?? [];
  kvSet(KEY, list.filter(e => e.id !== id));
  return NextResponse.json({ ok: true });
}
