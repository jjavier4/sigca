import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request) {
    try {
        const anioActual = new Date().getFullYear();
        const convocatorias = await prisma.convocatorias.findMany({
            where: {
                id: {
                    startsWith: `${anioActual}-`
                }
            },
            orderBy: {
                fecha_inicio: 'desc'
            }
        })

        return NextResponse.json({ convocatorias }, { status: 200 })
    } catch (error) {
        console.error('Error al obtener convocatorias:', error)
        return NextResponse.json(
            { error: 'Error al obtener convocatorias' },
            { status: 500 }
        )
    }
}