import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request) {
  try {
    // Obtener datos del cuerpo de la petición
    const body = await request.json();
    const { nombre, apellido, email, institucion, password } = body;

    // Validar que todos los campos estén presentes
    if (!nombre || !email || !password) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 409 }
      );
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear el nuevo usuario
    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        apellido: apellido || '',
        email,
        institucion: institucion || '',
        password: hashedPassword,
        rol: 'AUTOR', // Rol por defecto
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Usuario registrado exitosamente',
        usuario,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}