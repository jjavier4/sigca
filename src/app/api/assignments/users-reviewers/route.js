import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

export async function GET(request) {
    try {
        const session = await getServerSession();
       

        // Obtener todos los usuarios con rol REVISOR
        const revisores = await prisma.usuarios.findMany({
            where: {
                rol: 'REVISOR'
            },
            select: {
                id: true,
                nombre: true,
                apellidoP: true,
                apellidoM: true,
                email: true,
                asignacionesComoRevisor: {
                    where: {
                        activa: true
                    },
                    select: {
                        id: true
                    }
                }
            },
            orderBy: {
                nombre: 'asc'
            }
        });

        // Agregar contador de trabajos asignados activos
        const revisoresConEstadisticas = revisores.map(revisor => ({
            id: revisor.id,
            nombre: revisor.nombre,
            apellidoP: revisor.apellidoP,
            apellidoM: revisor.apellidoM,
            email: revisor.email,
            trabajosActivos: revisor.asignacionesComoRevisor.length
        }));

        return NextResponse.json(
            { 
                revisores: revisoresConEstadisticas,
                total: revisoresConEstadisticas.length
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error al obtener revisores:', error);
        return NextResponse.json(
            { error: 'Error al obtener los revisores' },
            { status: 500 }
        );
    }
}