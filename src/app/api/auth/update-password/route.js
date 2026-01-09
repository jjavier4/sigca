import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validarToken, eliminarToken } from '@/lib/tokens';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, password, confirmPassword } = body;

    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Las contraseñas no coinciden' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    const email = await validarToken(token);

    if (!email) {
      return NextResponse.json(
        { 
          error: 'El enlace de restablecimiento es inválido o ha expirado',
          expired: true 
        },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const usuario = await prisma.usuarios.findUnique({
      where: { email },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.usuarios.update({
      where: { email },
      data: { password: hashedPassword },
    });

    await eliminarToken(token);

    return NextResponse.json(
      { 
        message: '¡Contraseña actualizada exitosamente! Ya puedes iniciar sesión.',
        success: true 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la contraseña' },
      { status: 500 }
    );
  }
}