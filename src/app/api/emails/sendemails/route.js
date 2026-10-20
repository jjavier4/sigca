import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-utils';
import { validar, invitacionesSchema } from '@/lib/validation';
import { prisma } from '@/lib/db';
import { generarToken, guardarToken } from '@/lib/tokens';
import { sendEmail, emailInvitacionRevisor } from '@/lib/email';

export async function POST(request) {
  try {
    // Solo COMITE o ADMIN pueden invitar revisores
    const { error } = await authorize(['COMITE', 'ADMIN']);
    if (error) return error;

    const { data, error: errorValidacion } = validar(invitacionesSchema, await request.json());
    if (errorValidacion) return errorValidacion;
    const { revisores } = data;

    // Eliminar duplicados (el correo ya viene normalizado por el esquema)
    const revisoresMap = new Map();
    revisores.forEach(revisor => {
      if (!revisoresMap.has(revisor.correo)) {
        revisoresMap.set(revisor.correo, revisor);
      }
    });

    const revisoresUnicos = Array.from(revisoresMap.values());

    // Procesar cada revisor
    const resultados = [];

    for (const revisor of revisoresUnicos) {
      try {
        // Verificar si el correo ya existe como usuario registrado
        const usuarioExistente = await prisma.usuarios.findUnique({
          where: {
            email: revisor.correo,
            rol: {
              in: ['COMITE', 'AUTOR']
            }
          }
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
        const token = generarToken();

        await guardarToken(revisor.correo, token);

        const { html, text } = emailInvitacionRevisor({
          nombreRevisor: revisor.nombre,
          token: token,
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
          enviado: true,
          registrado: false,
          tokenGenerado: emailResult.success,
          error: emailResult.success ? null : 'No se pudo enviar el correo',
        });

      } catch (error) {
        console.error(`Error procesando revisor ${revisor.correo}:`, error);
        resultados.push({
          correo: revisor.correo,
          nombre: revisor.nombre,
          enviado: false,
          registrado: false,
          tokenGenerado: false,
          error: 'No se pudo procesar la invitación'
        });
      }
    }

    // Contar resultados
    const exitosos = resultados.filter(r => r.enviado).length;
    const fallidos = resultados.filter(r => !r.enviado && !r.registrado).length;
    const yaRegistrados = resultados.filter(r => r.registrado).length;

    return NextResponse.json({
      success: true,
      mensaje: `Proceso completado: ${exitosos} exitosos, ${fallidos} fallidos, ${yaRegistrados} ya registrados`,
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
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}