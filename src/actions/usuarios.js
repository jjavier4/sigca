'use server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { autorizarAccion, validarDatos, resultadoOk, resultadoError } from '@/lib/actions';
import { registroSchema, bloqueoUsuarioSchema, invitacionesSchema } from '@/lib/validation';
import { ROLES_ASIGNABLES, puedeAdministrar, registrarUsuario } from '@/lib/usuarios';
import { crearToken } from '@/lib/tokens';
import { sendEmail, emailInvitacionRevisor } from '@/lib/email';

function revalidarUsuarios() {
  revalidatePath('/admin');
  revalidatePath('/admin/manageusers');
  revalidatePath('/committee/manageusers');
}

export async function crearUsuario(datos) {
  const { session, error: errorAutorizacion } = await autorizarAccion(['ADMIN', 'COMITE']);
  if (errorAutorizacion) return errorAutorizacion;

  const { data, error: errorDatos } = validarDatos(registroSchema, datos);
  if (errorDatos) return errorDatos;

  if (!data.rol || !ROLES_ASIGNABLES[session.user.rol].includes(data.rol)) {
    return resultadoError('No autorizado para asignar este rol');
  }

  const { usuario, error } = await registrarUsuario(data, data.rol);
  if (error) return resultadoError(error);

  revalidarUsuarios();
  return resultadoOk(
    `Usuario ${usuario.id} creado. Se envió un correo de verificación a ${usuario.email}.`
  );
}

export async function cambiarBloqueo(datos) {
  const { session, error: errorAutorizacion } = await autorizarAccion(['ADMIN', 'COMITE']);
  if (errorAutorizacion) return errorAutorizacion;

  const { data, error: errorDatos } = validarDatos(bloqueoUsuarioSchema, datos);
  if (errorDatos) return errorDatos;

  const usuario = await prisma.usuarios.findUnique({
    where: { email: data.email },
    select: { id: true, rol: true },
  });

  if (!usuario) return resultadoError('Usuario no encontrado');
  if (usuario.id === session.user.id) return resultadoError('No puedes bloquear tu propia cuenta');
  if (!puedeAdministrar(session.user.rol, usuario.rol)) return resultadoError('No autorizado');

  await prisma.usuarios.update({
    where: { id: usuario.id },
    data: { bloqueada: data.bloqueada },
  });

  revalidarUsuarios();
  return resultadoOk(data.bloqueada ? 'Cuenta bloqueada correctamente' : 'Cuenta desbloqueada correctamente');
}

async function enviarInvitacion(revisor) {
  try {
    const token = await crearToken(revisor.correo, 'INVITACION');

    const { html, text } = emailInvitacionRevisor({ nombreRevisor: revisor.nombre, token });
    const resultado = await sendEmail({
      to: revisor.correo,
      subject: 'Invitación como Revisor - CIIDiCI',
      html,
      text,
    });

    return resultado.success;
  } catch (error) {
    console.error(`Error procesando revisor ${revisor.correo}:`, error);
    return false;
  }
}

export async function invitarRevisores(datos) {
  const { error: errorAutorizacion } = await autorizarAccion(['COMITE', 'ADMIN']);
  if (errorAutorizacion) return errorAutorizacion;

  const { data, error: errorDatos } = validarDatos(invitacionesSchema, datos);
  if (errorDatos) return errorDatos;

  const revisores = [...new Map(data.revisores.map((revisor) => [revisor.correo, revisor])).values()];

  const registrados = await prisma.usuarios.findMany({
    where: { email: { in: revisores.map((revisor) => revisor.correo) } },
    select: { email: true },
  });
  const correosRegistrados = new Set(registrados.map((usuario) => usuario.email));

  let enviados = 0;
  let fallidos = 0;
  for (const revisor of revisores) {
    if (correosRegistrados.has(revisor.correo)) continue;
    if (await enviarInvitacion(revisor)) enviados++;
    else fallidos++;
  }

  const partes = [`${enviados} enviada(s)`, `${fallidos} fallida(s)`, `${correosRegistrados.size} ya registrado(s)`];
  let mensaje = `Proceso completado: ${partes.join(', ')}.`;
  if (correosRegistrados.size > 0) {
    mensaje += ` Ya registrados: ${[...correosRegistrados].join(', ')}.`;
  }

  if (enviados === 0 && fallidos > 0) return resultadoError(mensaje);
  return resultadoOk(mensaje, { fallidos });
}
