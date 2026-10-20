import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generarToken, guardarToken } from '@/lib/tokens';
import { sendEmail, emailVerificacionCuenta } from '@/lib/email';
import { validar, solicitudEmailSchema } from '@/lib/validation';
import { limitarPeticion, QUINCE_MINUTOS } from '@/lib/rate-limit';

// La respuesta es la misma exista o no la cuenta, para no revelar qué correos están registrados
const RESPUESTA_GENERICA = {
  message: 'Si existe una cuenta pendiente de verificación con ese correo, recibirás un nuevo enlace.',
  success: true,
};

export async function POST(request) {
  try {
    const limitadoPorIp = limitarPeticion(request, 'resend', {
      porIp: { limite: 10, ventanaMs: QUINCE_MINUTOS },
    });
    if (limitadoPorIp) return limitadoPorIp;

    const { data, error } = validar(solicitudEmailSchema, await request.json());
    if (error) return error;
    const { email } = data;

    const limitadoPorCorreo = limitarPeticion(request, 'resend', {
      porClave: { limite: 3, ventanaMs: QUINCE_MINUTOS },
      clave: email,
    });
    if (limitadoPorCorreo) return limitadoPorCorreo;

    const usuario = await prisma.usuarios.findUnique({
      where: { email },
    });

    // Sin cuenta, o cuenta ya verificada: no se envía nada y la respuesta no cambia
    if (!usuario || usuario.activa) {
      return NextResponse.json(RESPUESTA_GENERICA, { status: 200 });
    }

    const nuevoToken = generarToken();
    await guardarToken(email, nuevoToken);

    const nombreCompleto = `${usuario.nombre} ${usuario.apellidoP} ${usuario.apellidoM}`;
    const { html, text } = emailVerificacionCuenta({ nombreCompleto, token: nuevoToken });

    const emailResult = await sendEmail({
      to: email,
      subject: 'Verifica tu correo electrónico - SIGCA',
      html,
      text,
    });

    if (!emailResult.success) {
      console.error('Error al enviar email de verificación:', emailResult.error);
    }

    return NextResponse.json(RESPUESTA_GENERICA, { status: 200 });

  } catch (error) {
    console.error('Error al reenviar verificación:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
