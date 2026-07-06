'use client';
import { useState, useEffect } from 'react';
import { Employee, Service, ServiceBlock, DayEntry, Report } from '@/lib/types';
import { getEmployees, getServices, saveReport, generateId } from '@/lib/storage';

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getDayName(year: number, month: number, day: number) {
  return ['D', 'L', 'M', 'X', 'J', 'V', 'S'][new Date(year, month - 1, day).getDay()];
}

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const NOW = new Date();

interface UIBlock {
  id: string;
  serviceId: string;
  days: DayEntry[];
  open: boolean;
}

export default function NuevoInformePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState('');
  const [month, setMonth] = useState(NOW.getMonth() + 1);
  const [year, setYear] = useState(NOW.getFullYear());
  const [blocks, setBlocks] = useState<UIBlock[]>([]);
  const [svcModal, setSvcModal] = useState(false);
  const [svcSearch, setSvcSearch] = useState('');
  const [generating, setGenerating] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  useEffect(() => {
    Promise.all([getEmployees(), getServices()]).then(([emps, svcs]) => {
      setEmployees(emps);
      setServices(svcs);
      setLoading(false);
    });
  }, []);

  const totalDays = getDaysInMonth(year, month);
  const usedServiceIds = blocks.map(b => b.serviceId);
  const availableServices = services.filter(s => !usedServiceIds.includes(s.id));

  function addServiceBlock(svcId: string) {
    const svc = services.find(s => s.id === svcId)!;
    const days: DayEntry[] = Array.from({ length: totalDays }, (_, i) => ({
      day: i + 1,
      entrada: '',
      salida: '',
      kilometraje: svc.kilometraje,
    }));
    setBlocks(b => [...b, { id: generateId(), serviceId: svcId, days, open: true }]);
    setSvcModal(false);
    setSvcSearch('');
  }

  function removeBlock(id: string) { setBlocks(b => b.filter(x => x.id !== id)); }
  function toggleBlock(id: string) { setBlocks(b => b.map(x => x.id === id ? { ...x, open: !x.open } : x)); }

  function updateDay(blockId: string, dayIdx: number, field: 'entrada' | 'salida' | 'kilometraje', val: string) {
    setBlocks(b => b.map(x => {
      if (x.id !== blockId) return x;
      const days = [...x.days];
      days[dayIdx] = { ...days[dayIdx], [field]: field === 'kilometraje' ? Number(val) : val };
      return { ...x, days };
    }));
  }

  function validate() {
    if (!employeeId) { alert('Selecciona un empleado'); return false; }
    if (blocks.length === 0) { alert('Añade al menos un servicio'); return false; }
    if (!blocks.some(b => b.days.some(d => d.entrada && d.salida))) {
      alert('Introduce al menos un día con hora de entrada y salida');
      return false;
    }
    for (const block of blocks) {
      for (const d of block.days) {
        if ((d.entrada && !d.salida) || (!d.entrada && d.salida)) {
          alert(`El día ${d.day} tiene solo una de las horas (entrada o salida), completa ambas`);
          return false;
        }
      }
    }
    return true;
  }

  async function handleGenerate() {
    if (!validate()) return;
    setGenerating(true);
    const report: Report = {
      id: generateId(),
      employeeId,
      month,
      year,
      serviceBlocks: blocks.map(b => ({ serviceId: b.serviceId, days: b.days })),
      createdAt: new Date().toISOString(),
    };
    await saveReport(report);
    setGenerating(false);
    setSuccessModal(true);
  }

  const YEARS = Array.from({ length: 5 }, (_, i) => NOW.getFullYear() - 2 + i);

  if (loading) {
    return <div className="p-8 text-center text-gray-400 py-16">Cargando...</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Nuevo Informe de Kilometraje</h1>

      {/* Employee + Period */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Empleado</label>
            <select value={employeeId} onChange={e => setEmployeeId(e.target.value)} disabled={blocks.length > 0}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60">
              <option value="">— Seleccionar —</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.nombre} {e.apellidos} ({e.codigo})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Mes</label>
            <select value={month} onChange={e => { setMonth(Number(e.target.value)); setBlocks([]); }} disabled={blocks.length > 0}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60">
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Año</label>
            <select value={year} onChange={e => { setYear(Number(e.target.value)); setBlocks([]); }} disabled={blocks.length > 0}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60">
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        {blocks.length > 0 && (
          <p className="text-xs text-amber-600 mt-2">El mes y año quedan fijados al añadir el primer servicio. Borra todos los servicios para cambiarlo.</p>
        )}
      </div>

      {/* Service Blocks */}
      {blocks.map(block => {
        const svc = services.find(s => s.id === block.serviceId);
        if (!svc) return null;
        return (
          <div key={block.id} className="bg-white rounded-xl shadow mb-4 overflow-hidden">
            <button onClick={() => toggleBlock(block.id)} className="w-full flex items-center justify-between px-6 py-4 bg-blue-800 text-white">
              <span className="font-bold text-base">{svc.nombre} — {svc.localidad}</span>
              <div className="flex items-center gap-4">
                <span className="text-xs bg-blue-600 px-2 py-1 rounded">{block.days.filter(d => d.entrada && d.salida).length} días</span>
                <span className="text-lg">{block.open ? '▲' : '▼'}</span>
              </div>
            </button>
            {block.open && (
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="text-xs border-collapse">
                    <thead>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1 bg-gray-100 font-bold text-center w-16">Campo</td>
                        {block.days.map(d => (
                          <td key={d.day} className="border border-gray-300 px-1 py-1 bg-gray-100 text-center min-w-[46px]">
                            <div className="font-bold">{d.day}</div>
                            <div className="text-gray-500">{getDayName(year, month, d.day)}</div>
                          </td>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1 bg-gray-50 font-semibold text-center">Entrada</td>
                        {block.days.map((d, i) => (
                          <td key={d.day} className="border border-gray-300 p-0">
                            <input type="time" value={d.entrada} onChange={e => updateDay(block.id, i, 'entrada', e.target.value)}
                              className="w-full text-center text-xs py-1 px-0.5 focus:outline-none focus:bg-blue-50 border-0" />
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1 bg-gray-50 font-semibold text-center">Salida</td>
                        {block.days.map((d, i) => (
                          <td key={d.day} className="border border-gray-300 p-0">
                            <input type="time" value={d.salida} onChange={e => updateDay(block.id, i, 'salida', e.target.value)}
                              className="w-full text-center text-xs py-1 px-0.5 focus:outline-none focus:bg-blue-50 border-0" />
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1 bg-gray-50 font-semibold text-center">Km</td>
                        {block.days.map((d, i) => (
                          <td key={d.day} className="border border-gray-300 p-0">
                            <input type="number" value={d.kilometraje} min={0} onChange={e => updateDay(block.id, i, 'kilometraje', e.target.value)}
                              className="w-full text-center text-xs py-1 px-0.5 focus:outline-none focus:bg-blue-50 border-0" />
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
                <button onClick={() => removeBlock(block.id)} className="mt-3 text-xs text-red-600 hover:text-red-800 font-semibold">
                  ✕ Eliminar este servicio
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Add Service Button */}
      {services.length > 0 ? (
        <button onClick={() => setSvcModal(true)}
          className="w-full border-2 border-dashed border-blue-300 hover:border-blue-500 text-blue-600 hover:text-blue-800 rounded-xl py-4 font-semibold transition-colors mb-6">
          + AÑADIR SERVICIO
        </button>
      ) : (
        <div className="text-center text-gray-400 py-4 mb-6">No hay servicios. Crea uno en la sección Servicios.</div>
      )}

      {/* Generate Button */}
      <button onClick={handleGenerate} disabled={generating}
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-black text-xl py-5 rounded-2xl shadow-lg transition-colors uppercase tracking-wide">
        {generating ? 'Generando informe...' : 'GENERAR EL INFORME'}
      </button>

      {/* Service Selection Modal */}
      {svcModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh]">
            <div className="p-6 pb-3 shrink-0">
              <h2 className="text-xl font-bold mb-3">Seleccionar Servicio</h2>
              <input type="text" placeholder="Buscar servicio..." value={svcSearch} onChange={e => setSvcSearch(e.target.value)} autoFocus
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {availableServices.length === 0 ? (
              <p className="text-gray-500 text-center py-6 px-6">Todos los servicios ya han sido añadidos</p>
            ) : (() => {
              const filtered = availableServices.filter(s =>
                s.nombre.toLowerCase().includes(svcSearch.toLowerCase()) ||
                s.localidad.toLowerCase().includes(svcSearch.toLowerCase())
              );
              return (
                <div className="overflow-y-auto flex-1 px-6 py-2">
                  {filtered.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">Sin resultados para &ldquo;{svcSearch}&rdquo;</p>
                  ) : (
                    <div className="space-y-2 pb-2">
                      {filtered.map(svc => (
                        <button key={svc.id} onClick={() => addServiceBlock(svc.id)}
                          className="w-full text-left border border-gray-200 hover:border-blue-500 hover:bg-blue-50 rounded-xl p-4 transition-colors">
                          <div className="font-bold">{svc.nombre}</div>
                          <div className="text-sm text-gray-500">{svc.localidad} — {svc.kilometraje} km</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
            <div className="p-6 pt-3 shrink-0">
              <button onClick={() => { setSvcModal(false); setSvcSearch(''); }}
                className="w-full border border-gray-300 rounded-lg py-2.5 text-gray-600 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generating Modal */}
      {generating && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-sm mx-4">
            <div className="text-5xl mb-4 animate-spin">⚙️</div>
            <h2 className="text-xl font-bold text-gray-800">Guardando informe</h2>
            <p className="text-gray-500 mt-2">Un momento...</p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-sm mx-4">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-black text-green-700 uppercase">KILOMETRAJE GENERADO</h2>
            <p className="text-gray-500 mt-3">Ve a la sección de <strong>INFORMES</strong> para descargar los PDFs.</p>
            <button onClick={() => { setSuccessModal(false); setBlocks([]); setEmployeeId(''); }}
              className="mt-6 w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 rounded-lg transition-colors">
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
