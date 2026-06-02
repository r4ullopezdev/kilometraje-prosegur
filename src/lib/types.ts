export interface Employee {
  id: string;
  codigo: string;
  nombre: string;
  apellidos: string;
  servicioHabitual: string;
  direccion: string;
}

export interface Service {
  id: string;
  nombre: string;
  localidad: string;
  kilometraje: number;
}

export interface DayEntry {
  day: number;
  entrada: string;
  salida: string;
  kilometraje: number;
}

export interface ServiceBlock {
  serviceId: string;
  days: DayEntry[];
}

export interface Report {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  serviceBlocks: ServiceBlock[];
  createdAt: string;
}
