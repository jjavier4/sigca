import { requireSession } from '@/lib/auth-utils';
import { contarUsuariosPorRol } from '@/lib/data/usuarios';

const TARJETAS = [
  { clave: 'AUTOR', titulo: 'AUTORES', borde: 'border-blue-500' },
  { clave: 'REVISOR', titulo: 'REVISORES', borde: 'border-green-500' },
  { clave: 'COMITE', titulo: 'COMITÉ', borde: 'border-purple-500' },
  { clave: 'total', titulo: 'TOTAL USUARIOS', borde: 'border-orange-500' },
];

export default async function DashboardAdmin() {
  await requireSession(['ADMIN']);
  const conteos = await contarUsuariosPorRol();

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Panel de Administración</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {TARJETAS.map(({ clave, titulo, borde }) => (
          <div key={clave} className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${borde}`}>
            <h3 className="text-gray-600 text-sm font-semibold mb-2">{titulo}</h3>
            <p className="text-3xl font-bold text-gray-800">{conteos[clave] ?? 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
