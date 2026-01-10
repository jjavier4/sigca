import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

export async function GET(request) {
    try {
        const session = await getServerSession();
        
        if (!session) {
            return NextResponse.json(
                { error: 'No autorizado. Debes iniciar sesión' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'ID de usuario requerido' },
                { status: 400 }
            );
        }

        const trabajos = await prisma.trabajos.findMany({
            where: {
                usuarioId: userId
            },
            include: {
                convocatoria: {
                    select: {
                        id: true,
                        titulo: true,
                        descripcion: true,
                        fecha_inicio: true,
                        fecha_cierre: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        /* Verificar estado de pago para trabajos aceptados
        const trabajosConEstadoPago = await Promise.all(
            trabajos.map(async (trabajo) => {
                let estadoPago = null;

                // Solo verificar pago si el trabajo está aceptado y tiene referencia de pago
                if (trabajo.estado === 'ACEPTADO' && trabajo.referencia_pago) {
                    try {
                        // Petición al servicio web externo de pagos
                        const response = await fetch('https://serviciopagos.example.com/api/verificarPago', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                referencia: trabajo.referencia_pago
                            })
                        });

                        if (response.ok) {
                            const data = await response.json();
                            estadoPago = data.pagado || false;
                        } else {
                            console.error(`Error al verificar pago para trabajo ${trabajo.id}:`, response.statusText);
                            estadoPago = false;
                        }
                    } catch (error) {
                        console.error(`Error en petición de pago para trabajo ${trabajo.id}:`, error);
                        estadoPago = false;
                    }
                }

                // Retornar trabajo con campo adicional de estado de pago
                return {
                    ...trabajo,
                    estado_pago: estadoPago
                };
            })
        );
        */
        const trabajosConEstadoPago = trabajos.map(trabajo => ({
            ...trabajo,
            estado_pago: trabajo.estado === 'ACEPTADO' ? (trabajo.referencia_pago ? true : false) : null
        }));
        return NextResponse.json(
            { 
                trabajos: trabajosConEstadoPago,
                total: trabajosConEstadoPago.length
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error al obtener trabajos:', error);
        return NextResponse.json(
            { error: 'Error al obtener los trabajos' },
            { status: 500 }
        );
    }
}