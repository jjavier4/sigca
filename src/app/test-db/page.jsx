import { prisma } from '@/lib/db';

export default async function TestDB() {
  try {
    // Prueba simple de conexión
    const count = await prisma.Usuario.count();
    
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-green-600">
          ✅ Conexión exitosa a PostgreSQL
        </h1>
        <p>Usuarios en la base de datos: {count}</p>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">
          ❌ Error de conexión
        </h1>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }
}