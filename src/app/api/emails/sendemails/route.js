// app/api/comite/invitar-revisores/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendEmail, emailInvitacionRevisor } from '@/lib/email';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificar que el usuario sea COMITE o ADMIN
    if (!session || !['COMITE', 'ADMIN'].includes(session.user.rol)) {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere rol de Comité o Admin' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { revisores } = body;

    // Validaciones
    if (!revisores || !Array.isArray(revisores) || revisores.length === 0) {
      return NextResponse.json(
        { error: 'Debe proporcionar al menos un revisor' },
        { status: 400 }
      );
    }

    // Validar formato de datos
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    for (const revisor of revisores) {
      if (!revisor.nombre || !revisor.correo) {
        return NextResponse.json(
          { error: 'Cada revisor debe tener nombre y correo' },
          { status: 400 }
        );
      }
      
      if (!emailRegex.test(revisor.correo)) {
        return NextResponse.json(
          { error: `Correo inválido: ${revisor.correo}` },
          { status: 400 }
        );
      }
    }

    // Normalizar correos y eliminar duplicados
    const revisoresMap = new Map();
    revisores.forEach(revisor => {
      const correoNormalizado = revisor.correo.toLowerCase().trim();
      if (!revisoresMap.has(correoNormalizado)) {
        revisoresMap.set(correoNormalizado, {
          nombre: revisor.nombre.trim(),
          correo: correoNormalizado
        });
      }
    });

    const revisoresUnicos = Array.from(revisoresMap.values());

    // Procesar cada revisor
    const resultados = [];
    
    for (const revisor of revisoresUnicos) {
      try {
        // Verificar si el correo ya existe como usuario registrado
        const usuarioExistente = await prisma.usuarios.findUnique({
          where: { email: revisor.correo }
        });

        // Si el usuario ya está registrado, no enviar correo de invitación
        if (usuarioExistente) {
          resultados.push({
            correo: revisor.correo,
            nombre: revisor.nombre,
            enviado: false,
            registrado: true,
            mensaje: 'Usuario ya registrado en el sistema'
          });
          continue;
        }

        // Enviar correo de invitación
        const { html, text } = emailInvitacionRevisor({
          nombreRevisor: revisor.nombre
        });

        const emailResult = await sendEmail({
          to: revisor.correo,
          subject: 'Invitación como Revisor - CIIDiCI',
          html,
          text,
        });

        resultados.push({
          correo: revisor.correo,
          nombre: revisor.nombre,
          enviado: emailResult.success,
          registrado: false,
          error: emailResult.error || null,
        });

      } catch (error) {
        console.error(`Error procesando revisor ${revisor.correo}:`, error);
        resultados.push({
          correo: revisor.correo,
          nombre: revisor.nombre,
          enviado: false,
          registrado: false,
          error: error.message
        });
      }
    }

    // Contar resultados
    const exitosos = resultados.filter(r => r.enviado || r.registrado).length;
    const fallidos = resultados.filter(r => !r.enviado && !r.registrado).length;
    const yaRegistrados = resultados.filter(r => r.registrado).length;

    return NextResponse.json({
      success: true,
      mensaje: `Proceso completado: ${exitosos} exitosos, ${fallidos} fallidos${yaRegistrados > 0 ? `, ${yaRegistrados} ya registrados` : ''}`,
      total: revisoresUnicos.length,
      exitosos,
      fallidos,
      yaRegistrados,
      duplicadosEliminados: revisores.length - revisoresUnicos.length,
      detalles: resultados,
    });

  } catch (error) {
    console.error('Error al enviar invitaciones:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud', details: error.message },
      { status: 500 }
    );
  }
}

// GET: Obtener lista de revisores invitados
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['COMITE', 'ADMIN'].includes(session.user.rol)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const registrado = searchParams.get('registrado');

    const whereClause = registrado !== null 
      ? { registrado: registrado === 'true' }
      : {};

    const revisoresInvitados = await prisma.revisorInvitado.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        nombre: true,
        correo: true,
        registrado: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      total: revisoresInvitados.length,
      revisores: revisoresInvitados
    });

  } catch (error) {
    console.error('Error al obtener revisores invitados:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos' },
      { status: 500 }
    );
  }
}