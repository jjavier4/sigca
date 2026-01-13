import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Home, UserPlus, Settings, Users, LucideFileUp, FileCog,
  UserCog, Mail, FileDiff, ChevronDown, ChevronRight, Layers,FileCheck, AlignEndHorizontalIcon
} from 'lucide-react';
import Link from 'next/link';
import { href } from '@/utils/route';

export default function MenuComponent({ isSidebarOpen, toggleSidebar }) {
  const { data: session, status } = useSession();
  const [openGroups, setOpenGroups] = useState({});

  // Función para alternar el estado de los grupos
  const toggleGroup = (groupKey) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const menuitems = (role) => {
    let baseUrl = href(role);
    let items = [{ id: 'overview', icon: Home, label: 'Inicio', page: `${baseUrl}` }];
    if (role === 'COMITE' || role === 'ADMIN') {
      items.push(
        { id: 'add-user', group: 'user', icon: UserPlus, label: 'Agregar Usuario', page: `${baseUrl}/addUser` },
        { id: 'manage-users', group: 'user', icon: Users, label: 'Gestionar Usuarios', page: `${baseUrl}/manageusers` },
      )
    }
    if (role === 'COMITE') {
      items.push(
        { id: 'add-convocatorie', group: 'convocatorie', icon: LucideFileUp, label: 'Agregar Convocatoria', page: `${baseUrl}/addconvocatorie` },
        { id: 'manage-convocatories', group: 'convocatorie', icon: UserCog, label: 'Gestionar Convocatorias', page: `${baseUrl}/manageconvocatorie` },
        { id: 'assign-work', group: 'work', icon: LucideFileUp, label: 'Asignar Trabajo', page: `${baseUrl}/assignconvocatorie` },
        { id: 'rubric', icon: FileDiff, group: 'settings', label: 'Criterios Evaluacion', page: `${baseUrl}/rubric` },
        { id: 'send-mail', icon: Mail, group: 'settings', label: 'Invitar revisores', page: `${baseUrl}/sendmail` },
        { id: 'works-assessed', icon: FileCheck, group: 'work', label: 'Trabajos Calificados', page: `${baseUrl}/worksassessed` },
        { id: 'assessed-ia', icon: AlignEndHorizontalIcon, group: 'work', label: 'Niveles de IA y Plagio', page: `${baseUrl}/assessed-ia` },
        { id: 'manage-assessed', group: 'work', icon: FileCog, label: 'Gestionar Asignaciones', page: `${baseUrl}/manageassessed` },
      )
    }
    return items;
  };

  useEffect(() => {
    if (session?.user?.rol) {
      console.log('User role:', session.user.rol);
    }
  }, [status]);

  const groupConfig = {
    user: { label: 'Usuarios', icon: Users },
    convocatorie: { label: 'Convocatorias', icon: Layers },
    work: { label: 'Trabajos', icon: LucideFileUp },
    settings: { label: 'Ajustes', icon: Settings }
  };

  const getProcessedItems = () => {
    const rawItems = menuitems(session?.user?.rol || '');
    const processed = [];
    const groups = {};

    rawItems.forEach(item => {
      if (item.group) {
        if (!groups[item.group]) {
          const groupEntry = {
            id: `group-${item.group}`,
            isGroup: true,
            key: item.group,
            label: groupConfig[item.group]?.label || item.group.charAt(0).toUpperCase() + item.group.slice(1),
            icon: groupConfig[item.group]?.icon || Layers,
            children: []
          };
          groups[item.group] = groupEntry;
          processed.push(groupEntry);
        }
        groups[item.group].children.push(item);
      } else {
        processed.push(item);
      }
    });

    return processed;
  };

  return (
    <>
      <aside
        className={`fixed top-20 left-0 h-full bg-white shadow-lg z-20 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } w-64`}
      >
        <nav className="p-4 h-full overflow-y-auto">
          <ul className="space-y-2">
            {getProcessedItems().map((item) => {
              
              if (item.isGroup) {
                const GroupIcon = item.icon;
                const isOpen = openGroups[item.key];
                
                return (
                  <li key={item.id} className="flex flex-col">
                    <button
                      onClick={() => toggleGroup(item.key)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-semibold"
                    >
                      <div className="flex items-center gap-3">
                        <GroupIcon size={20} />
                        <span>{item.label}</span>
                      </div>
                      {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                      <ul className="space-y-1 pl-4 border-l-2 border-gray-100 ml-4">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          return (
                            <li key={child.id}>
                              <Link
                                onClick={toggleSidebar}
                                href={child.page}
                                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                              >
                                <ChildIcon size={18} />
                                <span>{child.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </li>
                );
              }

              // RENDERIZADO DE ITEM NORMAL (SIN GRUPO)
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <Link
                    onClick={toggleSidebar}
                    href={item.page}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100"
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