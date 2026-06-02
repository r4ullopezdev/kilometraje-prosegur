import { Employee, Service, Report } from './types';

const KEYS = {
  employees: 'km_employees',
  services: 'km_services',
  reports: 'km_reports',
};

function load<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Employees
export function getEmployees(): Employee[] {
  return load<Employee>(KEYS.employees);
}

export function saveEmployee(emp: Employee): void {
  const list = getEmployees();
  const idx = list.findIndex(e => e.id === emp.id);
  if (idx >= 0) list[idx] = emp;
  else list.push(emp);
  save(KEYS.employees, list);
}

export function deleteEmployee(id: string): void {
  save(KEYS.employees, getEmployees().filter(e => e.id !== id));
}

// Services
export function getServices(): Service[] {
  return load<Service>(KEYS.services);
}

export function saveService(svc: Service): void {
  const list = getServices();
  const idx = list.findIndex(s => s.id === svc.id);
  if (idx >= 0) list[idx] = svc;
  else list.push(svc);
  save(KEYS.services, list);
}

export function deleteService(id: string): void {
  save(KEYS.services, getServices().filter(s => s.id !== id));
}

// Reports
export function getReports(): Report[] {
  return load<Report>(KEYS.reports);
}

export function saveReport(report: Report): void {
  const list = getReports();
  const idx = list.findIndex(r => r.id === report.id);
  if (idx >= 0) list[idx] = report;
  else list.push(report);
  save(KEYS.reports, list);
}

export function deleteReport(id: string): void {
  save(KEYS.reports, getReports().filter(r => r.id !== id));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
