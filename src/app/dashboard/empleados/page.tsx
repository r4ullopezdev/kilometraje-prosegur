'use client';
import { useState, useEffect } from 'react';
import { Employee } from '@/lib/types';
import { getEmployees, saveEmployee, deleteEmployee, generateId } from '@/lib/storage';

const EMPTY: Employee = { id: '', codigo: '', nombre: '', apellidos: '', servicioHabitual: '', direccion: '' };

export default function EmpleadosPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<Employee>(EMPTY);
  const [editing, setEditing] = useState(false);

  useEffect(() => { setEmployees(getEmployees()); }, []);

  function openNew() { setForm({ ...EMPTY, id: generateId() }); setEditing(false); setModal(true); }
  function openEdit(e: Employee) { setForm(e); setEditing(true); setModal(true); }

  function handleSave() {
    if (!form.codigo || !form.nombre || !form.apellidos) return alert('Código, nombre y apellidos son obligatorios');
    saveEmployee(form);
    setEmployees(getEmployees());
    setModal(false);
  }

  function handleDelete(id: string) {
    if (!confirm('¿Eliminar este empleado?')) return;
    deleteEmployee(id);
    setEmployees(getEmployees());
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Empleados</h1>
        <button onClick={openNew} className="bg-blue-800 hover:bg-blue-900 text-white font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors">
          + Nuevo Empleado
        </button>
      </div>

      {employees.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No hay empleados registrados</div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Código</th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Apellidos</th>
                <th className="px-4 py-3 text-left">Servicio Habitual</th>
                <th className="px-4 py-3 text-left">Dirección / Localidad</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, i) => (
                <tr key={emp.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 font-mono font-semibold text-blue-800">{emp.codigo}</td>
                  <td className="px-4 py-3">{emp.nombre}</td>
                  <td className="px-4 py-3">{emp.apellidos}</td>
                  <td className="px-4 py-3">{emp.servicioHabitual}</td>
                  <td className="px-4 py-3">{emp.direccion}</td>
                  <td className="px-4 py-3 text-center flex gap-2 justify-center">
                    <button onClick={() => openEdit(emp)} className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1.5 rounded font-semibold transition-colors">Editar</button>
                    <button onClick={() => handleDelete(emp.id)} className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded font-semibold transition-colors">Borrar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
            <h2 className="text-xl font-bold mb-6">{editing ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
            <div className="space-y-4">
              {([
                ['codigo', 'Código Empleado'],
                ['nombre', 'Nombre'],
                ['apellidos', 'Apellidos'],
                ['servicioHabitual', 'Servicio Habitual'],
                ['direccion', 'Dirección / Localidad'],
              ] as [keyof Employee, string][]).map(([key, label]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">{label}</label>
                  <input
                    type="text"
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-300 rounded-lg py-2.5 text-gray-600 font-semibold hover:bg-gray-50 transition-colors">Cancelar</button>
              <button onClick={handleSave} className="flex-1 bg-blue-800 hover:bg-blue-900 text-white rounded-lg py-2.5 font-bold transition-colors">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
