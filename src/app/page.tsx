'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CREDENTIALS = { user: 'juanmanuelr', pass: 'Rivera64' };

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ user: '', pass: '' });
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.user === CREDENTIALS.user && form.pass === CREDENTIALS.pass) {
      sessionStorage.setItem('km_auth', '1');
      router.push('/dashboard/empleados');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl font-black text-yellow-400 tracking-tight">PROSEGUR</div>
          <div className="text-gray-500 text-sm mt-1">Sistema de Kilometraje</div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Usuario</label>
            <input
              type="text"
              value={form.user}
              onChange={e => setForm(f => ({ ...f, user: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Usuario"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Contraseña</label>
            <input
              type="password"
              value={form.pass}
              onChange={e => setForm(f => ({ ...f, pass: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contraseña"
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 rounded-lg transition-colors mt-2"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
