'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV = [
  { href: '/dashboard/empleados', label: 'EMPLEADOS', icon: '👤' },
  { href: '/dashboard/servicios', label: 'SERVICIOS', icon: '🏢' },
  { href: '/dashboard/nuevo-informe', label: 'NUEVO INFORME', icon: '📝' },
  { href: '/dashboard/informes', label: 'INFORMES', icon: '📄' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (sessionStorage.getItem('km_auth') !== '1') {
      router.replace('/');
    }
  }, [router]);

  function logout() {
    sessionStorage.removeItem('km_auth');
    router.push('/');
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-blue-900 flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-blue-800">
          <div className="text-yellow-400 font-black text-xl tracking-tight">PROSEGUR</div>
          <div className="text-blue-300 text-xs mt-0.5">Kilometraje</div>
        </div>
        <nav className="flex-1 py-4">
          {NAV.map(n => {
            const active = pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-blue-700 text-white border-l-4 border-yellow-400'
                    : 'text-blue-200 hover:bg-blue-800 hover:text-white border-l-4 border-transparent'
                }`}
              >
                <span className="text-base">{n.icon}</span>
                {n.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={logout}
          className="m-4 text-xs text-blue-300 hover:text-white py-2 border border-blue-700 rounded-lg transition-colors"
        >
          Cerrar sesión
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
    </div>
  );
}
