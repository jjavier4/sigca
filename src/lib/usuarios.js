import 'server-only';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { generarToken, guardarToken } from '@/lib/tokens';
import { sendEmail, emailVerificacionCuenta } from '@/lib/email';

export const ROLES_ASIGNABLES = {
  ADMIN: ['COMITE', 'REVISOR'],
  COMITE: ['REVISOR', 'AUTOR'],
};

export function puedeAdministrar(rolActor, rolObjetivo) {
  return (ROLES_ASIGNABLES[rolActor] ?? []).includes(rolObjetivo);
}

async function buscarDuplicado({ email, tipoIdentificacion, rfc, curp, numero_control }) {
  if (numero_control) {
    const porNumeroControl = await prisma.usuarios.findUnique({ where: { numero_control } });
    if (porNumeroControl) return 'El número de control ya está registrado';
  }

  const porEmail = await prisma.usuarios.findUnique({ where: { email } });
  if (porEmail) return 'El correo electrónico ya está registrado';

  if (tipoIdentificacion === 'rfc') {
    const porRfc = await prisma.usuarios.findUnique({ where: { rfc } });
    if (porRfc) return 'El RFC ya está registrado';
  } else {
    const porCurp = await prisma.usuarios.findUnique({ where: { curp } });
    if (porCurp) return 'El CURP ya está registrado';
  }

  return null;
}

export async function registrarUsuario(datos, rolAsignado) {
  const email = datos.email.toLowerCase();
  const esRfc = datos.tipoIdentificacion === 'rfc';
  const rfc = esRfc ? datos.rfc.toUpperCase() : null;
  const curp = esRfc ? null : datos.curp.toUpperCase();

  const duplicado = await buscarDuplicado({
    email,
    tipoIdentificacion: datos.tipoIdentificacion,
    rfc,
    curp,
    numero_control: datos.numero_control,
  });
  if (duplicado) return { error: duplicado };

  const [{ id }] = await prisma.$queryRaw`SELECT generar_usuario_id(${esRfc ? rfc : curp}) as id`;
  const password = await bcrypt.hash(datos.password, 10);

  try {
    await prisma.usuarios.create({
      data: {
        id,
        nombre: datos.nombre,
        apellidoP: datos.apellidoP,
        apellidoM: datos.apellidoM,
        email,
        password,
        rol: rolAsignado,
        activa: false,
        numero_control: datos.numero_control,
        rfc,
        curp,
      },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return { error: 'Ya existe un usuario con estos datos. Por favor, intenta nuevamente.' };
    }
    throw error;
  }

  const token = generarToken();
  await guardarToken(email, token);

  const nombreCompleto = `${datos.nombre} ${datos.apellidoP} ${datos.apellidoM}`;
  const { html, text } = emailVerificacionCuenta({ nombreCompleto, token });

  try {
    const resultado = await sendEmail({
      to: email,
      subject: 'Verifica tu correo electrónico - SIGCA',
      html,
      text,
    });
    if (!resultado.success) {
      console.error('Error al enviar email de verificación:', resultado.error);
    }
  } catch (error) {
    console.error('Error al enviar email de verificación:', error);
  }

  return { usuario: { id, email, nombre: nombreCompleto } };
}
