import 'server-only';
import crypto from 'crypto';
import { prisma } from './db';

const minuto = 60 * 1000;

const vigenciaPorTipo = {
  VERIFICACION: 15 * minuto,
  RESTABLECIMIENTO: 15 * minuto,
  INVITACION: 7 * 24 * 60 * minuto,
};

function generarToken() {
  return crypto.randomBytes(32).toString('hex');
}

export async function crearToken(email, tipo) {
  const correo = email.toLowerCase();
  const token = generarToken();
  const ahora = new Date();

  await prisma.$transaction([
    prisma.tokens.deleteMany({
      where: { OR: [{ email: correo, tipo }, { expiresAt: { lte: ahora } }] },
    }),
    prisma.tokens.create({
      data: {
        token,
        email: correo,
        tipo,
        expiresAt: new Date(ahora.getTime() + vigenciaPorTipo[tipo]),
      },
    }),
  ]);

  return token;
}

export async function consultarToken(token, tipo) {
  if (typeof token !== 'string' || !token) return null;

  const registro = await prisma.tokens.findFirst({
    where: { token, tipo, expiresAt: { gt: new Date() } },
    select: { email: true },
  });

  return registro?.email ?? null;
}

export async function consumirToken(token, tipo) {
  const email = await consultarToken(token, tipo);
  if (!email) return null;

  const { count } = await prisma.tokens.deleteMany({
    where: { token, tipo, expiresAt: { gt: new Date() } },
  });

  return count === 1 ? email : null;
}
