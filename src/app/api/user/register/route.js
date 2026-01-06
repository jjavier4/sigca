import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { generarToken, guardarToken } from '@/lib/tokens';
import { sendEmail, emailVerificacionCuenta } from '@/lib/email';

// Función para generar el ID del usuario
async function generarUsuarioId(identificador) {
  try {
    const result = await prisma.$queryRaw`
      SELECT generar_usuario_id(${identificador}) as id
    `;
    return result[0].id;
  } catch (error) {
    console.error('Error al generar ID:', error);
    throw new Error('No se pudo generar el ID del usuario');
  }
}

// Función para validar RFC
function validarRFC(rfc) {
  const rfcRegex = /^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/;
  return rfcRegex.test(rfc.toUpperCase());
}

// Función para validar CURP
function validarCURP(curp) {
  const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;
  return curpRegex.test(curp.toUpperCase());
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      nombre, 
      apellidoP, 
      apellidoM, 
      email, 
      tipoIdentificacion, // 'rfc' o 'curp'
      rfc, 
      curp,
      password,
      rol
    } = body;

    // Validaciones básicas
    if (!nombre || !apellidoP || !apellidoM || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios deben ser completados' },
        { status: 400 }
      );
    }

    // Validar que se proporcione RFC o CURP según la selección
    if (tipoIdentificacion === 'rfc' && !rfc) {
      return NextResponse.json(
        { error: 'Debes proporcionar tu RFC' },
        { status: 400 }
      );
    }

    if (tipoIdentificacion === 'curp' && !curp) {
      return NextResponse.json(
        { error: 'Debes proporcionar tu CURP' },
        { status: 400 }
      );
    }

    // Validar formato según el tipo de identificación
    let identificador = '';
    
    if (tipoIdentificacion === 'rfc') {
      if (!validarRFC(rfc)) {
        return NextResponse.json(
          { error: 'El RFC proporcionado no tiene un formato válido. Debe tener 13 caracteres.' },
          { status: 400 }
        );
      }
      identificador = rfc.toUpperCase();
    } else if (tipoIdentificacion === 'curp') {
      if (!validarCURP(curp)) {
        return NextResponse.json(
          { error: 'El CURP proporcionado no tiene un formato válido. Debe tener 18 caracteres.' },
          { status: 400 }
        );
      }
      identificador = curp.toUpperCase();
    } else {
      return NextResponse.json(
        { error: 'Tipo de identificación no válido' },
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

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'El email proporcionado no es válido' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existingUserByEmail = await prisma.usuarios.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'El correo electrónico ya está registrado' },
        { status: 400 }
      );
    }

    // Verificar si el RFC ya existe (si se proporcionó)
    if (tipoIdentificacion === 'rfc') {
      const existingUserByRFC = await prisma.usuarios.findUnique({
        where: { rfc: rfc.toUpperCase() },
      });

      if (existingUserByRFC) {
        return NextResponse.json(
          { error: 'El RFC ya está registrado' },
          { status: 400 }
        );
      }
    }

    // Verificar si el CURP ya existe (si se proporcionó)
    if (tipoIdentificacion === 'curp') {
      const existingUserByCURP = await prisma.usuarios.findUnique({
        where: { curp: curp.toUpperCase() },
      });

      if (existingUserByCURP) {
        return NextResponse.json(
          { error: 'El CURP ya está registrado' },
          { status: 400 }
        );
      }
    }

    // Generar el ID personalizado usando la función de PostgreSQL
    const usuarioId = await generarUsuarioId(identificador);

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Preparar los datos del usuario
    const userData = {
      id: usuarioId,
      nombre,
      apellidoP,
      apellidoM,
      email: email.toLowerCase(),
      password: hashedPassword,
      rol: rol || 'AUTOR',
      activa: false, 
    };

    // Agregar RFC o CURP según corresponda
    if (tipoIdentificacion === 'rfc') {
      userData.rfc = rfc.toUpperCase();
      userData.curp = null;
    } else {
      userData.curp = curp.toUpperCase();
      userData.rfc = null;
    }

    // Crear el usuario
    const newUser = await prisma.usuarios.create({
      data: userData,
      select: {
        id: true,
        nombre: true,
        apellidoP: true,
        apellidoM: true,
        email: true,
        rfc: true,
        curp: true,
        rol: true,
        activa: true,
        createdAt: true,
      },
    });

    const token = generarToken();
    await guardarToken(email.toLowerCase(), token);

    const nombreCompleto = `${nombre} ${apellidoP} ${apellidoM}`;
    const { html, text } = emailVerificacionCuenta({ nombreCompleto, token });

    const emailResult = await sendEmail({
      to: email.toLowerCase(),
      subject: 'Verifica tu correo electrónico - SIGCA',
      html,
      text,
    });

    if (!emailResult.success) {
      console.error('Error al enviar email de verificación:', emailResult.error);
      // No fallar el registro si el email no se envía
    }

    return NextResponse.json(
      {
        message: 'Usuario registrado exitosamente. Por favor verifica tu correo electrónico.',
        user: {
          id: newUser.id,
          email: newUser.email,
          nombre: nombreCompleto,
        },
        requiresVerification: true,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error en registro:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un usuario con estos datos. Por favor, intenta nuevamente.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al registrar usuario. Intenta nuevamente.' },
      { status: 500 }
    );
  }
}