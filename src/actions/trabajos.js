'use server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { autorizarAccion, validarDatos, resultadoOk, resultadoError } from '@/lib/actions';
import { datosTrabajoSchema } from '@/lib/validation';
import { leerPdf } from '@/lib/archivos';
import { saveFile, deleteStoredFile } from '@/lib/storage';
import { emailPropuestaRecibida, sendEmail } from '@/lib/email';

function leerDatosTrabajo(formData) {
  let datos;
  try {
    datos = JSON.parse(formData.get('dataConvocatoria'));
  } catch {
    datos = {};
  }
  return validarDatos(datosTrabajoSchema, datos);
}

function convocatoriaAbierta(convocatoria) {
  const ahora = new Date();
  return ahora >= convocatoria.fecha_inicio && ahora <= convocatoria.fecha_cierre;
}

export async function subirTrabajo(formData) {
  const { session, error: errorAutorizacion } = await autorizarAccion(['AUTOR']);
  if (errorAutorizacion) return errorAutorizacion;

  if (!(formData instanceof FormData)) return resultadoError('Faltan datos de registro');

  const { data, error: errorDatos } = leerDatosTrabajo(formData);
  if (errorDatos) return errorDatos;

  const convocatoriaId = formData.get('convocatoriaId');
  if (typeof convocatoriaId !== 'string' || !convocatoriaId) {
    return resultadoError('Falta la convocatoria');
  }

  const { buffer, error: errorArchivo } = await leerPdf(formData.get('file'));
  if (errorArchivo) return resultadoError(errorArchivo);

  const userId = session.user.id;

  const convocatoria = await prisma.convocatorias.findUnique({
    where: { id: convocatoriaId },
  });

  if (!convocatoria || !convocatoria.activa) {
    return resultadoError('La convocatoria no existe');
  }

  if (!convocatoriaAbierta(convocatoria)) {
    return resultadoError('La convocatoria no está abierta para recibir propuestas');
  }

  const trabajoExistente = await prisma.trabajos.findFirst({
    where: { convocatoriaId, usuarioId: userId },
    select: { id: true },
  });

  if (trabajoExistente) {
    return resultadoError('Ya has enviado una propuesta para esta convocatoria');
  }

  const nombreArchivo = `${convocatoriaId}.pdf`;
  const rutaArchivo = `/uploads/users_files/${userId}/${nombreArchivo}`;

  await saveFile(userId, nombreArchivo, buffer);

  let trabajo;
  try {
    const [{ id }] = await prisma.$queryRaw`SELECT generar_trabajo_id() as id`;
    trabajo = await prisma.trabajos.create({
      data: {
        id,
        titulo: data.tituloPropuesta,
        tipo: data.tipo,
        convocatoriaId,
        usuarioId: userId,
        archivo_url: rutaArchivo,
        coautores: {
          create: data.coautores.map(({ nombre, email }) => ({ nombre, email })),
        },
      },
    });
  } catch (errorCreacion) {
    await deleteStoredFile(rutaArchivo).catch(() => {});
    throw errorCreacion;
  }

  try {
    const { html, text } = emailPropuestaRecibida({
      nombreAutor: session.user.name,
      tituloTrabajo: trabajo.titulo,
    });
    await sendEmail({
      to: session.user.email,
      subject: `Propuesta Recibida - ${trabajo.estado}`,
      html,
      text,
    });
  } catch (errorCorreo) {
    console.error('No se pudo enviar el correo de confirmación:', errorCorreo);
  }

  revalidatePath('/author');
  return resultadoOk('Propuesta enviada exitosamente');
}

export async function actualizarTrabajo(formData) {
  const { session, error: errorAutorizacion } = await autorizarAccion(['AUTOR']);
  if (errorAutorizacion) return errorAutorizacion;

  if (!(formData instanceof FormData)) return resultadoError('Faltan datos de registro');

  const { data, error: errorDatos } = leerDatosTrabajo(formData);
  if (errorDatos) return errorDatos;

  const trabajoId = formData.get('trabajoId');
  if (typeof trabajoId !== 'string' || !trabajoId) {
    return resultadoError('Falta el trabajo a actualizar');
  }

  const userId = session.user.id;

  const trabajo = await prisma.trabajos.findFirst({
    where: { id: trabajoId, usuarioId: userId, convocatoria: { activa: true } },
    select: {
      id: true,
      estado: true,
      convocatoriaId: true,
      convocatoria: { select: { fecha_inicio: true, fecha_cierre: true } },
      coautores: { select: { id: true } },
    },
  });

  if (!trabajo) return resultadoError('Trabajo no encontrado');

  if (trabajo.estado !== 'REGISTRADO') {
    return resultadoError('Solo se pueden editar los trabajos en estado Registrado');
  }

  if (!convocatoriaAbierta(trabajo.convocatoria)) {
    return resultadoError('La convocatoria no está abierta para recibir actualizaciones');
  }

  const idsActuales = new Set(trabajo.coautores.map((coautor) => coautor.id));
  const conservados = data.coautores.filter((coautor) => coautor.id);
  const nuevos = data.coautores.filter((coautor) => !coautor.id);

  if (conservados.some((coautor) => !idsActuales.has(coautor.id))) {
    return resultadoError('Coautor no encontrado');
  }

  const idsConservados = new Set(conservados.map((coautor) => coautor.id));
  const idsEliminados = [...idsActuales].filter((id) => !idsConservados.has(id));

  const archivo = formData.get('file');
  if (archivo instanceof File && archivo.size > 0) {
    const { buffer, error: errorArchivo } = await leerPdf(archivo);
    if (errorArchivo) return resultadoError(errorArchivo);
    await saveFile(userId, `${trabajo.convocatoriaId}.pdf`, buffer);
  }

  await prisma.$transaction([
    prisma.coautores.deleteMany({ where: { idTrabajo: trabajo.id, id: { in: idsEliminados } } }),
    ...conservados.map((coautor) =>
      prisma.coautores.update({
        where: { id: coautor.id },
        data: { nombre: coautor.nombre, email: coautor.email },
      })
    ),
    prisma.coautores.createMany({
      data: nuevos.map(({ nombre, email }) => ({ idTrabajo: trabajo.id, nombre, email })),
    }),
    prisma.trabajos.update({
      where: { id: trabajo.id },
      data: { titulo: data.tituloPropuesta, tipo: data.tipo },
    }),
  ]);

  revalidatePath('/author');
  return resultadoOk('Propuesta actualizada exitosamente');
}

export async function eliminarTrabajo(trabajoId) {
  const { session, error: errorAutorizacion } = await autorizarAccion(['AUTOR']);
  if (errorAutorizacion) return errorAutorizacion;

  if (typeof trabajoId !== 'string' || !trabajoId) {
    return resultadoError('ID del trabajo es requerido');
  }

  const trabajo = await prisma.trabajos.findFirst({
    where: { id: trabajoId, usuarioId: session.user.id, convocatoria: { activa: true } },
    select: {
      estado: true,
      archivo_url: true,
      _count: { select: { asignaciones: true } },
    },
  });

  if (!trabajo) return resultadoError('Trabajo no encontrado');

  if (trabajo.estado !== 'REGISTRADO') {
    return resultadoError('Solo se pueden eliminar los trabajos en estado Registrado');
  }

  if (trabajo._count.asignaciones > 0) {
    return resultadoError(
      'No se puede eliminar el trabajo porque está en proceso de evaluación o ya fue evaluado'
    );
  }

  const { count } = await prisma.trabajos.deleteMany({
    where: {
      id: trabajoId,
      usuarioId: session.user.id,
      estado: 'REGISTRADO',
      asignaciones: { none: {} },
    },
  });

  if (count === 0) {
    return resultadoError(
      'No se puede eliminar el trabajo porque está en proceso de evaluación o ya fue evaluado'
    );
  }

  try {
    await deleteStoredFile(trabajo.archivo_url);
  } catch (errorArchivo) {
    console.error(`No se pudo borrar el archivo del trabajo ${trabajoId}:`, errorArchivo);
  }

  revalidatePath('/author');
  return resultadoOk('Trabajo eliminado exitosamente');
}
