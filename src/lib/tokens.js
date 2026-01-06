import crypto from 'crypto';
import { prisma } from './db';

export function generarToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function tokenExpirado(createdAt) {
  if (!createdAt) return true;
  
  const ahora = new Date();
  const fechaToken = new Date(createdAt);
  const diferenciaMinutos = (ahora - fechaToken) / 1000 / 60;
  
  return diferenciaMinutos > 15;
}


export async function guardarToken(email, token) {
  try {
    await prisma.tokens.deleteMany({
      where: { email: email.toLowerCase() },
    });
    await prisma.tokens.create({
      data: {
        email: email.toLowerCase(),
        token,
      },
    });

    console.log(`Token guardado para ${email}`);
    return true;
  } catch (error) {
    console.error('Error al guardar token:', error);
    throw error;
  }
}

export async function validarToken(token) {
  try {
    const tokenRecord = await prisma.tokens.findUnique({
      where: { token },
    });

    if (!tokenRecord) {
      console.log('Token no encontrado');
      return null;
    }

    if (tokenExpirado(tokenRecord.createdAt)) {
      console.log('Token expirado');
      await prisma.tokens.delete({
        where: { token },
      });
      return null;
    }

    console.log(`Token válido para ${tokenRecord.email}`);
    return tokenRecord.email;
  } catch (error) {
    console.error('Error al validar token:', error);
    throw error;
  }
}


export async function eliminarToken(token) {
  try {
    await prisma.tokens.delete({
      where: { token },
    });
    console.log('Token eliminado');
    return true;
  } catch (error) {
    console.error('Error al eliminar token:', error);
    return false;
  }
}


export async function eliminarTokensPorEmail(email) {
  try {
    const resultado = await prisma.tokens.deleteMany({
      where: { email: email.toLowerCase() },
    });
    console.log(`${resultado.count} tokens eliminados para ${email}`);
    return resultado.count;
  } catch (error) {
    console.error('Error al eliminar tokens por email:', error);
    return 0;
  }
}
