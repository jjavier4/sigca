import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generarToken, guardarToken } from '@/lib/tokens';
import { sendEmail, emailRestablecerPassword } from '@/lib/email';
import { validar, solicitudEmailSchema } from '@/lib/validation';
import { limitarPeticion, QUINCE_MINUTOS } from '@/lib/rate-limit';

// La respuesta es la misma exista o no la cuenta (o esté sin verificar o bloqueada),
// para no revelar qué correos están registrados ni su estado
const RESPUESTA_GENERICA = {
  message: 'Si existe una cuenta con ese correo, recibirás un enlace de restablecimiento.',
  success: true,
};

export async function POST(request) {
  try {
    const limitadoPorIp = limitarPeticion(request, 'reset', {
      porIp: { limite: 10, ventanaMs: QUINCE_MINUTOS },
    });
    if (limitadoPorIp) return limitadoPorIp;

    const { data, error } = validar(solicitudEmailSchema, await request.json());
    if (error) return error;
    const { email } = data;

    const limitadoPorCorreo = limitarPeticion(request, 'reset', {
      porClave: { limite: 3, ventanaMs: QUINCE_MINUTOS },
      clave: email,
    });
    if (limitadoPorCorreo) return limitadoPorCorreo;

    const usuario = await prisma.usuarios.findUnique({
      where: { email },
    });

    // Solo las cuentas verificadas y no bloqueadas pueden restablecer su contraseña
    if (!usuario || !usuario.activa || usuario.bloqueada) {
      return NextResponse.json(RESPUESTA_GENERICA, { status: 200 });
    }

    const token = generarToken();
    await guardarToken(email, token);

    const nombreCompleto = `${usuario.nombre} ${usuario.apellidoP} ${usuario.apellidoM}`;
    const { html, text } = emailRestablecerPassword({ nombreCompleto, token });

    const emailResult = await sendEmail({
      to: email,
      subject: 'Restablecer contraseña - SIGCA',
      html,
      text,
    });

    if (!emailResult.success) {
      console.error('Error al enviar email de restablecimiento:', emailResult.error);
    }

    return NextResponse.json(RESPUESTA_GENERICA, { status: 200 });

  } catch (error) {
    console.error('Error al procesar solicitud de restablecimiento:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
