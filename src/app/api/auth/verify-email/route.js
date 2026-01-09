import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validarToken, eliminarToken } from '@/lib/tokens';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token de verificación no proporcionado' },
        { status: 400 }
      );
    }

    const email = await validarToken(token);

    if (!email) {
      return NextResponse.json(
        { 
          error: 'El enlace de verificación es inválido o ha expirado',
          expired: true 
        },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuarios.findUnique({
      where: { email },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (usuario.activa) {
      await eliminarToken(token);
      
      return NextResponse.json(
        { 
          message: 'Tu cuenta ya está verificada. Puedes iniciar sesión.',
          alreadyVerified: true 
        },
        { status: 200 }
      );
    }

    await prisma.usuarios.update({
      where: { email },
      data: { activa: true },
    });

    
    return NextResponse.json(
      { 
        message: '¡Cuenta verificada exitosamente! Ya puedes iniciar sesión.',
        success: true 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error en verificación de email:', error);
    return NextResponse.json(
      { error: 'Error al verificar el correo electrónico' },
      { status: 500 }
    );
  }
}