import 'server-only';
import { prisma } from '@/lib/db';
import { generarDictamenPDF } from '@/lib/pdfGenerator';
import { sendEmail, emailTrabajoAceptado, emailTrabajoRechazado } from '@/lib/email';
import { formatearDiaInstitucion } from '@/utils/fechas';

const motivoPorEvaluacion =
  'El trabajo no cumplió con los estándares de calidad requeridos según la evaluación de los revisores';
const motivoPorUmbral =
  'El trabajo presenta niveles elevados de IA y/o plagio que impiden su evaluación';

export async function cargarTrabajoParaDictamen(trabajoId) {
  return prisma.trabajos.findFirst({
    where: { id: trabajoId, convocatoria: { activa: true } },
    select: {
      id: true,
      titulo: true,
      estado: true,
      nvl_ia: true,
      nvl_plagio: true,
      presencial: true,
      calificacion_final: true,
      usuario: { select: { nombre: true, apellidoP: true, apellidoM: true, email: true } },
      coautores: { select: { nombre: true } },
      asignaciones: {
        select: { activa: true, calificacion: true, comentario: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
}

function construirDictamen(trabajo, { estado, calificacion, presencial }) {
  const nombreCompleto = `${trabajo.usuario.nombre} ${trabajo.usuario.apellidoP} ${trabajo.usuario.apellidoM}`;
  const anio = new Date().getFullYear();
  const comunes = {
    nombreCompleto,
    titulo: trabajo.titulo,
    autores: trabajo.coautores.length > 0
      ? trabajo.coautores.map((coautor) => coautor.nombre).join(', ')
      : 'Sin coautores',
    fecha: formatearDiaInstitucion(new Date()),
    anio,
    comentarios: trabajo.asignaciones.map((asignacion, indice) => ({
      numero: indice + 1,
      texto: asignacion.comentario || 'Sin comentarios',
    })),
  };

  if (estado === 'ACEPTADO') {
    const modalidad = presencial ? 'Presencial' : 'Virtual';
    return {
      datosPdf: { ...comunes, modalidad, calificacion },
      correo: {
        ...emailTrabajoAceptado({ nombreCompleto, titulo: trabajo.titulo, modalidad, calificacion, anio }),
        subject: `CIIDiCI ${anio} - Trabajo Aceptado: ${trabajo.titulo}`,
        filename: `Dictamen_Aceptacion_${trabajo.id}.pdf`,
      },
    };
  }

  const porEvaluacion = trabajo.asignaciones.length > 0;
  const motivo = porEvaluacion ? motivoPorEvaluacion : motivoPorUmbral;
  const calificacionVisible = porEvaluacion ? calificacion : null;
  return {
    datosPdf: { ...comunes, motivo, calificacion: calificacionVisible },
    correo: {
      ...emailTrabajoRechazado({
        nombreCompleto,
        titulo: trabajo.titulo,
        motivo,
        calificacion: calificacionVisible,
        anio,
      }),
      subject: `CIIDiCI ${anio} - Resultado de Evaluación: ${trabajo.titulo}`,
      filename: `Dictamen_Rechazo_${trabajo.id}.pdf`,
    },
  };
}

export async function prepararDictamen(trabajo, opciones) {
  const { datosPdf, correo } = construirDictamen(trabajo, opciones);
  const pdf = await generarDictamenPDF(opciones.estado, datosPdf);
  return { pdf, correo };
}

export async function enviarDictamen(trabajo, { pdf, correo }) {
  try {
    const resultado = await sendEmail({
      to: trabajo.usuario.email,
      subject: correo.subject,
      html: correo.html,
      text: correo.text,
      attachments: [{ filename: correo.filename, content: pdf, contentType: 'application/pdf' }],
    });
    if (!resultado.success) console.error('Error al enviar dictamen:', resultado.error);
    return resultado.success;
  } catch (error) {
    console.error('Error al enviar dictamen:', error);
    return false;
  }
}
