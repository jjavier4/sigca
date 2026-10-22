import 'server-only';
import { prisma } from '@/lib/db';
import { filtroCargaActiva, anioActualPrefijo, calcularPromedio, asignacionesPendientes } from '@/lib/evaluacion';
import { umbralIaPlagio, maxAsignacionesRevisor } from '@/utils/evaluacion';

const estadosEditables = ['REGISTRADO', 'EN_REVISION'];

const etiquetasEstado = {
  REGISTRADO: 'Registrado',
  EN_REVISION: 'En Revisión',
  ACEPTADO: 'Aceptado',
  RECHAZADO: 'Rechazado',
};

function filtroTrabajosDelAnio() {
  return { id: { startsWith: anioActualPrefijo() }, convocatoria: { activa: true } };
}

function nombreCompleto(persona) {
  return `${persona.nombre} ${persona.apellidoP} ${persona.apellidoM}`;
}

export async function getTrabajosParaAnalisis() {
  const trabajos = await prisma.trabajos.findMany({
    where: filtroTrabajosDelAnio(),
    select: {
      id: true,
      titulo: true,
      tipo: true,
      estado: true,
      nvl_ia: true,
      nvl_plagio: true,
      usuarioId: true,
      convocatoria: { select: { titulo: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const formateados = trabajos.map((trabajo) => ({
    id: trabajo.id,
    titulo: trabajo.titulo,
    tipo: trabajo.tipo,
    nvl_ia: trabajo.nvl_ia,
    nvl_plagio: trabajo.nvl_plagio,
    editable: estadosEditables.includes(trabajo.estado),
    autor: { id: trabajo.usuarioId },
    convocatoria: { titulo: trabajo.convocatoria.titulo },
  }));

  const sinAnalisis = (trabajo) => trabajo.nvl_ia === null || trabajo.nvl_plagio === null;

  return {
    pendientes: formateados.filter((trabajo) => sinAnalisis(trabajo) && trabajo.editable),
    evaluados: formateados.filter((trabajo) => !sinAnalisis(trabajo)),
  };
}

export async function getRevisoresConCarga() {
  const revisores = await prisma.usuarios.findMany({
    where: { rol: 'REVISOR', activa: true, bloqueada: false },
    select: {
      id: true,
      nombre: true,
      apellidoP: true,
      apellidoM: true,
      email: true,
      _count: { select: { asignacionesComoRevisor: { where: filtroCargaActiva } } },
    },
    orderBy: { nombre: 'asc' },
  });

  return revisores.map((revisor) => {
    const trabajosActivos = revisor._count.asignacionesComoRevisor;
    return {
      id: revisor.id,
      nombre: nombreCompleto(revisor),
      email: revisor.email,
      trabajosActivos,
      estado: trabajosActivos >= maxAsignacionesRevisor ? 'INDISPUESTO' : 'DISPONIBLE',
    };
  });
}

export async function getTrabajosSinAsignar() {
  return prisma.trabajos.findMany({
    where: {
      ...filtroTrabajosDelAnio(),
      estado: 'EN_REVISION',
      nvl_ia: { lt: umbralIaPlagio },
      nvl_plagio: { lt: umbralIaPlagio },
      asignaciones: { none: {} },
    },
    select: {
      id: true,
      titulo: true,
      convocatoria: { select: { titulo: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getTrabajosConAsignaciones() {
  return prisma.trabajos.findMany({
    where: { ...filtroTrabajosDelAnio(), asignaciones: { some: {} },estado:'EN_REVISION' },
    select: {
      id: true,
      titulo: true,
      convocatoria: { select: { titulo: true } },
      asignaciones: {
        select: {
          id: true,
          activa: true,
          createdAt: true,
          revisor: { select: { nombre: true, apellidoP: true, apellidoM: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTrabajosCalificados() {
  const trabajos = await prisma.trabajos.findMany({
    where: filtroTrabajosDelAnio(),
    select: {
      id: true,
      titulo: true,
      tipo: true,
      estado: true,
      nvl_ia: true,
      nvl_plagio: true,
      presencial: true,
      calificacion_final: true,
      convocatoria: { select: { titulo: true } },
      asignaciones: {
        select: { activa: true, calificacion: true, comentario: true },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return trabajos.map((trabajo) => {
    const totalAsignaciones = trabajo.asignaciones.length;
    const pendientes = asignacionesPendientes(trabajo.asignaciones).length;
    const promedioCalificacion =
      totalAsignaciones > 0 && pendientes === 0 ? calcularPromedio(trabajo.asignaciones) : null;

    return {
      id: trabajo.id,
      titulo: trabajo.titulo,
      tipo: trabajo.tipo,
      estado: trabajo.estado,
      nvl_ia: trabajo.nvl_ia,
      nvl_plagio: trabajo.nvl_plagio,
      presencial: trabajo.presencial ?? false,
      convocatoria: trabajo.convocatoria.titulo,
      calificaciones: trabajo.asignaciones.map((asignacion) => ({
        calificacion: asignacion.calificacion,
        comentario: asignacion.comentario,
      })),
      totalAsignaciones,
      asignacionesCalificadas: totalAsignaciones - pendientes,
      promedioCalificacion,
      calificacionFinal: trabajo.calificacion_final,
    };
  });
}

export async function getKpis() {
  const anioActual = new Date().getFullYear();

  const [usuariosPorRol, convocatorias] = await Promise.all([
    prisma.usuarios.groupBy({
      where: { rol: { not: 'ADMIN' } },
      by: ['rol', 'activa'],
      _count: { id: true },
    }),
    prisma.convocatorias.findMany({
      where: { id: { startsWith: `${anioActual}-` }, activa: true },
      select: { id: true, titulo: true, _count: { select: { trabajos: true } } },
      orderBy: { id: 'asc' },
    }),
  ]);

  const filtroTrabajos = { convocatoriaId: { in: convocatorias.map((convocatoria) => convocatoria.id) } };
  const [porModalidad, porEstado, porTipo] = await Promise.all([
    prisma.trabajos.groupBy({ where: filtroTrabajos, by: ['presencial'], _count: { id: true } }),
    prisma.trabajos.groupBy({ where: filtroTrabajos, by: ['estado'], _count: { id: true } }),
    prisma.trabajos.groupBy({ where: filtroTrabajos, by: ['tipo'], _count: { id: true } }),
  ]);

  const roles = {};
  for (const grupo of usuariosPorRol) {
    roles[grupo.rol] ??= { rol: grupo.rol, activos: 0, inactivos: 0 };
    roles[grupo.rol][grupo.activa ? 'activos' : 'inactivos'] = grupo._count.id;
  }

  const nombreModalidad = (presencial) =>
    presencial === true ? 'Presencial' : presencial === false ? 'En línea' : 'Sin asignar';

  return {
    usuariosPorRol: Object.values(roles),
    trabajosPorConvocatoria: convocatorias.map((convocatoria) => ({
      convocatoria: convocatoria.titulo,
      trabajos: convocatoria._count.trabajos,
    })),
    trabajosPorModalidad: porModalidad.map((grupo) => ({
      modalidad: nombreModalidad(grupo.presencial),
      cantidad: grupo._count.id,
    })),
    trabajosPorEstado: porEstado.map((grupo) => ({
      estado: etiquetasEstado[grupo.estado] ?? grupo.estado,
      cantidad: grupo._count.id,
    })),
    trabajosPorTipo: porTipo.map((grupo) => ({ tipo: grupo.tipo, cantidad: grupo._count.id })),
    anoActual: anioActual,
  };
}
