'use client';
import { useState, useEffect } from 'react';
import { Service } from '@/lib/types';
import { getServices, saveService, deleteService, generateId } from '@/lib/storage';

const EMPTY: Service = { id: '', nombre: '', localidad: '', kilometraje: 0 };

export default function ServiciosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<Service>(EMPTY);
  const [editing, setEditing] = useState(false);

  async function reload() {
    setLoading(true);
    setServices(await getServices());
    setLoading(false);
  }

  useEffect(() => { reload(); }, []);

  function openNew() { setForm({ ...EMPTY, id: generateId() }); setEditing(false); setModal(true); }
  function openEdit(s: Service) { setForm(s); setEditing(true); setModal(true); }

  async function handleSave() {
    if (!form.nombre || !form.localidad) { alert('Nombre y localidad son obligatorios'); return; }
    if (form.kilometraje <= 0) { alert('El kilometraje debe ser mayor que 0'); return; }
    setSaving(true);
    await saveService(form);
    await reload();
    setSaving(false);
    setModal(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este servicio?')) return;
    await deleteService(id);
    await reload();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Servicios</h1>
        <button onClick={openNew} className="bg-blue-800 hover:bg-blue-900 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors">
          + Nuevo Servicio
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Cargando...</div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No hay servicios registrados</div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Nombre del Servicio</th>
                <th className="px-4 py-3 text-left">Localidad</th>
                <th className="px-4 py-3 text-center">Kilometraje</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {services.map((svc, i) => (
                <tr key={svc.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 font-semibold">{svc.nombre}</td>
                  <td className="px-4 py-3">{svc.localidad}</td>
                  <td className="px-4 py-3 text-center font-mono">{svc.kilometraje} km</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => openEdit(svc)} className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1.5 rounded font-semibold transition-colors">Editar</button>
                      <button onClick={() => handleDelete(svc.id)} className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded font-semibold transition-colors">Borrar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-xl font-bold mb-6">{editing ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Nombre del Servicio</label>
                <input type="text" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Localidad del Servicio</label>
                <input type="text" value={form.localidad} onChange={e => setForm(f => ({ ...f, localidad: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Kilometraje</label>
                <input type="number" min={0} value={form.kilometraje} onChange={e => setForm(f => ({ ...f, kilometraje: Number(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} disabled={saving} className="flex-1 border border-gray-300 rounded-lg py-2.5 text-gray-600 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-800 hover:bg-blue-900 text-white rounded-lg py-2.5 font-bold transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
