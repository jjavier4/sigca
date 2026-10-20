import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authorize } from '@/lib/auth-utils';
import { validar, crearConvocatoriaSchema } from '@/lib/validation';

export async function POST(request) {

  try {
    const { error } = await authorize(['COMITE', 'ADMIN']);
    if (error) return error;

    const { data, error: errorValidacion } = validar(crearConvocatoriaSchema, await request.json());
    if (errorValidacion) return errorValidacion;
    const { titulo, descripcion, fecha_inicio, fecha_cierre } = data;

    // Convertir fechas a DateTime completo
    const fechaInicio = new Date(fecha_inicio + 'T00:00:00.000Z');
    const fechaCierre = new Date(fecha_cierre + 'T23:59:59.999Z');

    async function generarConvocatoriaId() {
      try {
        const result = await prisma.$queryRaw`
      SELECT generar_convocatoria_id() as id
    `;
        return result[0].id;
      } catch (error) {
        console.error('Error al generar ID:', error);
        throw new Error('No se pudo generar el ID la convocatoria');
      }
    }
    // Crear convocatoria
    const convocatoriaData = {
      id: await generarConvocatoriaId(),
      titulo,
      descripcion,
      fecha_inicio: fechaInicio,
      fecha_cierre: fechaCierre,
      archivo_url: '',

    }
    const convocatoria = await prisma.convocatorias.create({
      data: convocatoriaData
    });


    return NextResponse.json(
      {
        message: 'Convocatoria registrada exitosamente'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error(' Error en registro:', error);

    return NextResponse.json(
      { error: 'Error al registrar convocatoria' },
      { status: 500 }
    );
  }
}