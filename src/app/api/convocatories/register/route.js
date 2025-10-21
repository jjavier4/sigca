import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request) {

  try {
    const body = await request.json();
    console.log(' Datos recibidos:', body);

    const { titulo, descripcion, fecha_inicio, fecha_cierre, areas_tematicas, requisitos } = body;

    if (!titulo || !descripcion || !fecha_inicio || !fecha_cierre || !areas_tematicas || !requisitos) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Convertir fechas a DateTime completo
    const fechaInicio = new Date(fecha_inicio + 'T00:00:00.000Z');
    const fechaCierre = new Date(fecha_cierre + 'T23:59:59.999Z');

    // Convertir áreas temáticas de string a array
    const areas_tematicas_array = areas_tematicas
      .split('\n')
      .map(area => area.trim())
      .filter(area => area.length > 0);

    // Crear convocatoria
    const convocatoria = await prisma.convocatorias.create({
      data: {
        titulo,
        descripcion,
        fecha_inicio:fechaInicio,    
        fecha_cierre:fechaCierre,    
        areas_tematicas: areas_tematicas_array,  
        requisitos,
        
      },
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
      {
        error: 'Error al registrar convocatoria',
        details: error.message
      },
      { status: 500 }
    );
  }
}