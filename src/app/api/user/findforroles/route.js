import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authorize } from '@/lib/auth-utils';

export async function GET(request) {
  try {
    const { error } = await authorize(['COMITE', 'ADMIN']);
    if (error) return error;

    // Obtener roles del query string (ej: ?roles=REVISOR,COMITE)
    const { searchParams } = new URL(request.url);
    const rolesParam = searchParams.get('roles');

    if (!rolesParam) {
      return NextResponse.json(
        { error: 'Debe proporcionar al menos un rol.' },
        { status: 400 }
      );
    }

    // Convertir string a array y validar roles
    const rolesArray = rolesParam.split(',').map(r => r.trim().toUpperCase());
    const rolesValidos = ['AUTOR', 'REVISOR', 'COMITE', 'ADMIN'];
    
    const rolesInvalidos = rolesArray.filter(r => !rolesValidos.includes(r));
    if (rolesInvalidos.length > 0) {
      return NextResponse.json(
        { 
          error: 'Roles inválidos proporcionados',
          rolesInvalidos,
          rolesValidos
        },
        { status: 400 }
      );
    }

    // Consultar usuarios con los roles especificados
    const usuarios = await prisma.usuarios.findMany({
      where: {
        rol: {
          in: rolesArray
        }
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        bloqueada: true,
        activa: true,
      },
      orderBy: [
        { rol: 'asc' },
      ]
    });

    return NextResponse.json(
      { 
        success: true,
        roles: rolesArray,
        count: usuarios.length,
        usuarios 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al obtener usuarios por rol:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios por rol' },
      { status: 500 }
    );
  }
}