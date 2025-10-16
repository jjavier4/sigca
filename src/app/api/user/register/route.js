import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/db';

export async function POST(request) {
  
  try {
    const body = await request.json();
    console.log(' Datos recibidos:', body);

    const { email, nombre, apellidoP, apellidoM, password, rol } = body;

    if (!email || !nombre || !apellidoP || !apellidoM || !password) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: email, nombre, apellidoP, apellidoM y password' },
        { status: 400 }
      );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'El formato del email no es válido' },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }


    const existingUser = await prisma.usuarios.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(' Usuario ya existe:', email);
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 12);

    // Crear usuario
    const user = await prisma.usuarios.create({
      data: {
        email,
        nombre,
        apellidoP,
        apellidoM,
        password: hashedPassword,
        rol: rol || 'AUTOR',
      },
    });


    return NextResponse.json(
      { 
        user: user.id, 
        message: 'Usuario registrado exitosamente' 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error(' Error en registro:', error);
    
    // Error de Prisma por campo único duplicado
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Error al registrar usuario', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}