import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generarToken, guardarToken } from '@/lib/tokens';
import { sendEmail, emailVerificacionCuenta } from '@/lib/email';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email no proporcionado' },
        { status: 400 }
      );
    }

    // Buscar usuario
    const usuario = await prisma.usuarios.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'No existe una cuenta con ese correo electrónico' },
        { status: 404 }
      );
    }

    // Si ya está activa, no enviar email
    if (usuario.activa) {
      return NextResponse.json(
        { error: 'Esta cuenta ya está verificada. Puedes iniciar sesión.' },
        { status: 400 }
      );
    }

    // Generar nuevo token y guardar en tabla Tokens
    // (guardarToken elimina automáticamente tokens previos del mismo email)
    const nuevoToken = generarToken();
    await guardarToken(email.toLowerCase(), nuevoToken);

    // Enviar email de verificación
    const nombreCompleto = `${usuario.nombre} ${usuario.apellidoP} ${usuario.apellidoM}`;
    const { html, text } = emailVerificacionCuenta({ nombreCompleto, token: nuevoToken });

    const emailResult = await sendEmail({
      to: email.toLowerCase(),
      subject: 'Verifica tu correo electrónico - SIGCA',
      html,
      text,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Error al enviar el correo de verificación' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Se ha enviado un nuevo enlace de verificación a tu correo electrónico',
        success: true 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al reenviar verificación:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}