import { Employee, Service, Report } from './types';

async function apiFetch<T>(path: string): Promise<T[]> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`fetch ${path} → ${res.status}`);
  return res.json();
}

async function apiPut(path: string, body: unknown): Promise<void> {
  const res = await fetch(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${path} → ${res.status}`);
}

async function apiDelete(path: string, id: string): Promise<void> {
  const res = await fetch(`${path}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`DELETE ${path} → ${res.status}`);
}

// ── Employees ──────────────────────────────────────────────────────────────────
export function getEmployees(): Promise<Employee[]> {
  return apiFetch<Employee>('/api/employees');
}
export function saveEmployee(emp: Employee): Promise<void> {
  return apiPut('/api/employees', emp);
}
export function deleteEmployee(id: string): Promise<void> {
  return apiDelete('/api/employees', id);
}

// ── Services ───────────────────────────────────────────────────────────────────
export function getServices(): Promise<Service[]> {
  return apiFetch<Service>('/api/services');
}
export function saveService(svc: Service): Promise<void> {
  return apiPut('/api/services', svc);
}
export function deleteService(id: string): Promise<void> {
  return apiDelete('/api/services', id);
}

// ── Reports ────────────────────────────────────────────────────────────────────
export function getReports(): Promise<Report[]> {
  return apiFetch<Report>('/api/reports');
}
export function saveReport(report: Report): Promise<void> {
  return apiPut('/api/reports', report);
}
export function deleteReport(id: string): Promise<void> {
  return apiDelete('/api/reports', id);
}

// ── Utils ──────────────────────────────────────────────────────────────────────
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
