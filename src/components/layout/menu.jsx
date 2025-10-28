import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Home, UserPlus, Settings, Users,LucideFileUp,UserCog } from 'lucide-react';
import Link from 'next/link';
import { href } from '@/utils/route';
export default function MenuComponent({ isSidebarOpen, toggleSidebar }) {
  const { data: session, status } = useSession();

  const menuitems = (role) => {
    let baseUrl = href(role);
    let items = [];
    if (role === 'COMITE' || role === 'ADMIN') {
      items.push(        
          { id: 'overview', icon: Home, label: 'Inicio', page: `${baseUrl}` },
          { id: 'add-user', icon: UserPlus, label: 'Agregar Usuario', page: `${baseUrl}/addUser` },
          { id: 'manage-users', icon: Users, label: 'Gestionar Usuarios', page: `${baseUrl}/manageusers` },
          { id: 'addcalls', icon: LucideFileUp, label: 'Agregar Convocatoria', page: `${baseUrl}/addconvocatorie` },
          { id: 'manage-convocatories', icon: UserCog, label: 'Gestionar Convocatorias', page: `${baseUrl}/manageconvocatorie` },
          
        )
    }
    return items.push({ id: 'settings', icon: Settings, label: 'Configuración', page: `${baseUrl}/settings` }) && items;
  };

  useEffect(() => {
    if (session?.user?.rol) {
      console.log('User role:', session.user.rol);
    }
  }, [status]);


  return (
    <>
      <aside
        className={`fixed top-20 left-0 h-full bg-white shadow-lg z-20 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } w-64`}
      >
        <nav className="p-4">
          <ul className="space-y-2">
            {menuitems(session?.user?.rol || '').map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <Link
                  onClick={toggleSidebar}
                    href={item.page}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors bg-blue-50 text-blue-600 font-semibold"
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}
