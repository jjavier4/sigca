import { NextResponse } from 'next/server';
import { validarToken } from '@/lib/tokens';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token no proporcionado' },
        { status: 400 }
      );
    }

    const email = await validarToken(token);

    if (!email) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'El enlace de invitación es inválido' 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        valid: true, 
        email,
        message: 'Token válido'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al validar token de invitación:', error);
    return NextResponse.json(
      { valid: false, error: 'Error al validar el token' },
      { status: 500 }
    );
  }
}
