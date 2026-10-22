'use server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { validarDatos, resultadoOk, resultadoError } from '@/lib/actions';
import { registroSchema, solicitudEmailSchema, actualizarPasswordSchema } from '@/lib/validation';
import { limitarAccion, QUINCE_MINUTOS, UNA_HORA } from '@/lib/rate-limit';
import { registrarUsuario } from '@/lib/usuarios';
import { crearToken, consultarToken, consumirToken } from '@/lib/tokens';
import { sendEmail, emailVerificacionCuenta, emailRestablecerPassword } from '@/lib/email';

const mensajeLimite = 'Demasiados intentos. Intenta de nuevo más tarde.';
const respuestaReenvio =
  'Si existe una cuenta pendiente de verificación con ese correo, recibirás un nuevo enlace.';
const respuestaRestablecimiento =
  'Si existe una cuenta con ese correo, recibirás un enlace de restablecimiento.';

function nombreCompleto(usuario) {
  return `${usuario.nombre} ${usuario.apellidoP} ${usuario.apellidoM}`;
}

async function enviarCorreo(datosCorreo) {
  try {
    const resultado = await sendEmail(datosCorreo);
    if (!resultado.success) console.error('Error al enviar correo:', resultado.error);
  } catch (error) {
    console.error('Error al enviar correo:', error);
  }
}

export async function registrarAutor(datos) {
  if (await limitarAccion('register', { porIp: { limite: 5, ventanaMs: UNA_HORA } })) {
    return resultadoError(mensajeLimite);
  }

  const { data, error: errorDatos } = validarDatos(registroSchema, datos);
  if (errorDatos) return errorDatos;

  const { usuario, error } = await registrarUsuario(data, 'AUTOR');
  if (error) return resultadoError(error);

  return resultadoOk(
    `¡Registro exitoso! Hemos enviado un correo de verificación a ${usuario.email}. Por favor revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.`
  );
}

export async function registrarRevisor(datos) {
  if (await limitarAccion('register-revisor', { porIp: { limite: 10, ventanaMs: UNA_HORA } })) {
    return resultadoError(mensajeLimite);
  }

  const { data, error: errorDatos } = validarDatos(registroSchema, datos);
  if (errorDatos) return errorDatos;

  const emailInvitado = await consultarToken(data.invitationToken, 'INVITACION');
  if (!emailInvitado || emailInvitado !== data.email) {
    return resultadoError('La invitación no es válida o no corresponde a este correo');
  }

  const { error } = await registrarUsuario(data, 'REVISOR', { verificado: true });
  if (error) return resultadoError(error);

  await consumirToken(data.invitationToken, 'INVITACION');
  return resultadoOk('¡Registro exitoso! Ya puedes iniciar sesión con tu correo y contraseña.');
}

export async function reenviarVerificacion(datos) {
  if (await limitarAccion('resend', { porIp: { limite: 10, ventanaMs: QUINCE_MINUTOS } })) {
    return resultadoError(mensajeLimite);
  }

  const { data, error: errorDatos } = validarDatos(solicitudEmailSchema, datos);
  if (errorDatos) return errorDatos;

  if (
    await limitarAccion('resend', {
      porClave: { limite: 3, ventanaMs: QUINCE_MINUTOS },
      clave: data.email,
    })
  ) {
    return resultadoError(mensajeLimite);
  }

  const usuario = await prisma.usuarios.findUnique({
    where: { email: data.email },
    select: { nombre: true, apellidoP: true, apellidoM: true, activa: true },
  });

  if (usuario && !usuario.activa) {
    const token = await crearToken(data.email, 'VERIFICACION');
    const { html, text } = emailVerificacionCuenta({ nombreCompleto: nombreCompleto(usuario), token });
    await enviarCorreo({ to: data.email, subject: 'Verifica tu correo electrónico - SIGCA', html, text });
  }

  return resultadoOk(respuestaReenvio);
}

export async function solicitarRestablecimiento(datos) {
  if (await limitarAccion('reset', { porIp: { limite: 10, ventanaMs: QUINCE_MINUTOS } })) {
    return resultadoError(mensajeLimite);
  }

  const { data, error: errorDatos } = validarDatos(solicitudEmailSchema, datos);
  if (errorDatos) return errorDatos;

  if (
    await limitarAccion('reset', {
      porClave: { limite: 3, ventanaMs: QUINCE_MINUTOS },
      clave: data.email,
    })
  ) {
    return resultadoError(mensajeLimite);
  }

  const usuario = await prisma.usuarios.findUnique({
    where: { email: data.email },
    select: { nombre: true, apellidoP: true, apellidoM: true, activa: true, bloqueada: true },
  });

  if (usuario?.activa && !usuario.bloqueada) {
    const token = await crearToken(data.email, 'RESTABLECIMIENTO');
    const { html, text } = emailRestablecerPassword({ nombreCompleto: nombreCompleto(usuario), token });
    await enviarCorreo({ to: data.email, subject: 'Restablecer contraseña - SIGCA', html, text });
  }

  return resultadoOk(respuestaRestablecimiento);
}

export async function actualizarPassword(datos) {
  if (await limitarAccion('update-password', { porIp: { limite: 10, ventanaMs: QUINCE_MINUTOS } })) {
    return resultadoError(mensajeLimite);
  }

  const { data, error: errorDatos } = validarDatos(actualizarPasswordSchema, datos);
  if (errorDatos) return errorDatos;

  const email = await consumirToken(data.token, 'RESTABLECIMIENTO');
  if (!email) return resultadoError('El enlace de restablecimiento es inválido o ha expirado');

  const password = await bcrypt.hash(data.password, 10);
  const { count } = await prisma.usuarios.updateMany({
    where: { email, activa: true, bloqueada: false },
    data: { password },
  });

  if (count === 0) return resultadoError('No se pudo restablecer la contraseña de esta cuenta');
  return resultadoOk('¡Contraseña restablecida exitosamente! Redirigiendo al inicio de sesión...');
}

export async function verificarCuenta(token) {
  if (await limitarAccion('verify', { porIp: { limite: 20, ventanaMs: QUINCE_MINUTOS } })) {
    return resultadoError(mensajeLimite);
  }

  const email = await consumirToken(token, 'VERIFICACION');
  if (!email) return resultadoError('El enlace de verificación es inválido o ha expirado');

  const { count } = await prisma.usuarios.updateMany({
    where: { email },
    data: { activa: true },
  });

  if (count === 0) return resultadoError('Usuario no encontrado');
  return resultadoOk('¡Cuenta verificada exitosamente! Ya puedes iniciar sesión.');
}
