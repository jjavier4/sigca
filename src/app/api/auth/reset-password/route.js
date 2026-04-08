import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generarToken, guardarToken } from '@/lib/tokens';
import { sendEmail, emailRestablecerPassword } from '@/lib/email';

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'El email proporcionado no es válido' },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuarios.findUnique({
      where: { email: email.toLowerCase() },
    });

 
    if (!usuario) {
      return NextResponse.json(
        { 
          message: 'Si existe una cuenta con ese correo, recibirás un enlace de restablecimiento.',
          success: true 
        },
        { status: 200 }
      );
    }

    if (!usuario.activa) {
      return NextResponse.json(
        { error: 'Esta cuenta no está verificada. Por favor verifica tu correo primero.' },
        { status: 400 }
      );
    }

    const token = generarToken();
    await guardarToken(email.toLowerCase(), token);

    const nombreCompleto = `${usuario.nombre} ${usuario.apellidoP} ${usuario.apellidoM}`;
    const { html, text } = emailRestablecerPassword({ nombreCompleto, token });

    const emailResult = await sendEmail({
      to: email.toLowerCase(),
      subject: 'Restablecer contraseña - SIGCA',
      html,
      text,
    });

    if (!emailResult.success) {
      console.error('Error al enviar email de restablecimiento:', emailResult.error);
      return NextResponse.json(
        { error: 'Error al enviar el correo de restablecimiento' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Se ha enviado un enlace de restablecimiento a tu correo electrónico',
        success: true 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al procesar solicitud de restablecimiento:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}