'use client';
import { useState, useEffect } from 'react';
import { Report, Employee, Service } from '@/lib/types';
import { getReports, getEmployees, getServices, deleteReport } from '@/lib/storage';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export default function InformesPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);

  async function reload() {
    setLoading(true);
    const [reps, emps, svcs] = await Promise.all([getReports(), getEmployees(), getServices()]);
    setReports(reps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setEmployees(emps);
    setServices(svcs);
    setLoading(false);
  }

  useEffect(() => { reload(); }, []);

  function getEmployee(id: string) { return employees.find(e => e.id === id); }

  function filtered() {
    return reports.filter(r => {
      const emp = getEmployee(r.employeeId);
      const empName = emp ? `${emp.nombre} ${emp.apellidos}` : '';
      const matchSearch = !search || empName.toLowerCase().includes(search.toLowerCase()) || emp?.codigo?.includes(search);
      const matchYear = !filterYear || r.year === Number(filterYear);
      const matchMonth = !filterMonth || r.month === Number(filterMonth);
      return matchSearch && matchYear && matchMonth;
    });
  }

  async function downloadInforme(report: Report) {
    setDownloading(report.id + '-informe');
    try {
      const emp = getEmployee(report.employeeId);
      if (!emp) { alert('Empleado no encontrado'); return; }
      const { generateInformeDiario } = await import('@/lib/pdf-informe');
      const blob = await generateInformeDiario(emp, services, report.serviceBlocks, report.month, report.year);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Informe_Diario_${emp.apellidos}_${MONTHS[report.month - 1]}_${report.year}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally { setDownloading(null); }
  }

  async function downloadKilometraje(report: Report) {
    setDownloading(report.id + '-km');
    try {
      const emp = getEmployee(report.employeeId);
      if (!emp) { alert('Empleado no encontrado'); return; }
      const { generateKilometraje } = await import('@/lib/pdf-kilometraje');
      const blob = await generateKilometraje(emp, services, report.serviceBlocks, report.month, report.year);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Kilometraje_${emp.apellidos}_${MONTHS[report.month - 1]}_${report.year}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally { setDownloading(null); }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este informe?')) return;
    await deleteReport(id);
    await reload();
  }

  const years = [...new Set(reports.map(r => r.year))].sort((a, b) => b - a);
  const displayReports = filtered();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Informes</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <input type="text" placeholder="Buscar por nombre o código..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Todos los años</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Todos los meses</option>
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Cargando...</div>
      ) : displayReports.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          {reports.length === 0 ? 'No hay informes generados aún' : 'Sin resultados para los filtros aplicados'}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Empleado</th>
                <th className="px-4 py-3 text-left">Período</th>
                <th className="px-4 py-3 text-left">Generado</th>
                <th className="px-4 py-3 text-center">Informe Diario</th>
                <th className="px-4 py-3 text-center">Kilometraje</th>
                <th className="px-4 py-3 text-center">Borrar</th>
              </tr>
            </thead>
            <tbody>
              {displayReports.map((report, i) => {
                const emp = getEmployee(report.employeeId);
                const createdDate = new Date(report.createdAt);
                return (
                  <tr key={report.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{emp ? `${emp.nombre} ${emp.apellidos}` : 'Empleado eliminado'}</div>
                      {emp && <div className="text-xs text-gray-400 font-mono">{emp.codigo}</div>}
                    </td>
                    <td className="px-4 py-3">{MONTHS[report.month - 1]} {report.year}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {createdDate.toLocaleDateString('es-ES')} {createdDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => downloadInforme(report)} disabled={!!downloading}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1.5 rounded font-semibold text-xs transition-colors disabled:opacity-50">
                        {downloading === report.id + '-informe' ? '⏳' : '⬇'} Informe Diario
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => downloadKilometraje(report)} disabled={!!downloading}
                        className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1.5 rounded font-semibold text-xs transition-colors disabled:opacity-50">
                        {downloading === report.id + '-km' ? '⏳' : '⬇'} Kilometraje
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleDelete(report.id)}
                        className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded font-semibold transition-colors">
                        Borrar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
