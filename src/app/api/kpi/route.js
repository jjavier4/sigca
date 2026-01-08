// src/app/api/kpi/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function GET(request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Verificar que el usuario sea COMITE
    if (session.user.rol === "COMITE") {
      return NextResponse.json(
        { error: "No autorizado. Solo usuarios COMITE pueden acceder." },
        { status: 403 }
      );
    }

    // Obtener año actual
    const currentYear = new Date().getFullYear();

    // ==== GRÁFICA 1: Usuarios por Rol (Activos/Inactivos) ====
    const usuariosPorRol = await prisma.usuarios.groupBy({
      where: {rol:{not : 'ADMIN'}},
      by: ['rol', 'activa'],
      _count: {
        id: true
      }
    });

    // Transformar datos para gráfica de barras dobles
    const rolesMap = {};
    usuariosPorRol.forEach(item => {
      if (!rolesMap[item.rol]) {
        rolesMap[item.rol] = { rol: item.rol, activos: 0, inactivos: 0 };
      }
      if (item.activa) {
        rolesMap[item.rol].activos = item._count.id;
      } else {
        rolesMap[item.rol].inactivos = item._count.id;
      }
    });
    const usuariosData = Object.values(rolesMap);

    // ==== GRÁFICA 2: Trabajos por Convocatoria (Año Actual) ====
    // Primero obtenemos las convocatorias del año actual
    const convocatoriasActuales = await prisma.convocatorias.findMany({
      where: {
        id: {
          startsWith: `${currentYear}-`
        }
      },
      select: {
        id: true,
        titulo: true,
        _count: {
          select: {
            trabajos: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    const trabajosPorConvocatoria = convocatoriasActuales.map(conv => ({
      convocatoria: conv.titulo,
      trabajos: conv._count.trabajos
    }));

    // ==== GRÁFICA 3: Trabajos por Modalidad (Presencial/En línea/Sin asignar) ====
    // Obtener convocatorias del año actual para filtrar trabajos
    const idsConvocatoriasActuales = convocatoriasActuales.map(c => c.id);

    const trabajosModalidad = await prisma.trabajos.groupBy({
      where: {
        convocatoriaId: {
          in: idsConvocatoriasActuales
        }
      },
      by: ['presencial'],
      _count: {
        id: true
      }
    });

    const modalidadData = trabajosModalidad.map(item => {
      let modalidad = 'Sin asignar';
      if (item.presencial === true) modalidad = 'Presencial';
      if (item.presencial === false) modalidad = 'En línea';

      return {
        modalidad: modalidad,
        cantidad: item._count.id
      };
    });

    // ==== GRÁFICA 4: Trabajos por Estado ====
    const trabajosPorEstado = await prisma.trabajos.groupBy({
      where: {
        convocatoriaId: {
          in: idsConvocatoriasActuales
        }
      },
      by: ['estado'],
      _count: {
        id: true
      }
    });

    const estadosData = trabajosPorEstado.map(item => {
      // Convertir el estado a un formato más legible
      let estadoLegible = item.estado;
      if (item.estado === 'EN_REVISION') estadoLegible = 'En Revisión';
      if (item.estado === 'ACEPTADO') estadoLegible = 'Aceptado';
      if (item.estado === 'RECHAZADO') estadoLegible = 'Rechazado';

      return {
        estado: estadoLegible,
        cantidad: item._count.id
      };
    });

    // ==== GRÁFICA 5: Trabajos por Tipo (DIFUSION/DIVULGACION) ====
    const trabajosPorTipo = await prisma.trabajos.groupBy({
      where: {
        convocatoriaId: {
          in: idsConvocatoriasActuales
        }
      },
      by: ['tipo'],
      _count: {
        id: true
      }
    });

    const tiposData = trabajosPorTipo.map(item => ({
      tipo: item.tipo,
      cantidad: item._count.id
    }));
    // Preparar respuesta
    const kpiData = {
      usuariosPorRol: usuariosData,
      trabajosPorConvocatoria: trabajosPorConvocatoria,
      trabajosPorModalidad: modalidadData,
      trabajosPorEstado: estadosData,
      trabajosPorTipo: tiposData,
      anoActual: currentYear
    };

    return NextResponse.json({
      success: true,
      data: kpiData,
    });

  } catch (error) {
    console.error("Error al obtener KPIs:", error);
    return NextResponse.json(
      { error: "Error al obtener los datos de KPI" },
      { status: 500 }
    );
  }
}