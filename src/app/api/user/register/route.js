import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { validarTokenRevisor } from '@/lib/tokens';
import { validar, registroSchema } from '@/lib/validation';
import { limitarPeticion, UNA_HORA } from '@/lib/rate-limit';
import { ROLES_ASIGNABLES, registrarUsuario } from '@/lib/usuarios';

export async function POST(request) {
  try {
    // El registro es público: se limita por IP, salvo cuando lo hace el comité o el admin desde el panel
    const session = await getServerSession(authOptions);
    if (!ROLES_ASIGNABLES[session?.user?.rol]) {
      const limitado = limitarPeticion(request, 'register', {
        porIp: { limite: 5, ventanaMs: UNA_HORA },
      });
      if (limitado) return limitado;
    }

    const { data, error } = validar(registroSchema, await request.json());
    if (error) return error;

    const {
      email,
      rol, // solo lo respeta si lo pide un ADMIN o COMITE autenticado
      invitationToken // invitación de revisor
    } = data;

    // El registro público siempre crea un AUTOR. Otro rol solo con invitación válida
    // o si lo pide un ADMIN o COMITE autenticado.
    let rolAsignado = 'AUTOR';
    if (invitationToken) {
      // La invitación se consume sola: guardarToken() borra los tokens previos del correo
      const emailInvitado = await validarTokenRevisor(invitationToken);
      if (!emailInvitado || emailInvitado !== email.toLowerCase()) {
        return NextResponse.json(
          { error: 'La invitación no es válida o no corresponde a este correo' },
          { status: 400 }
        );
      }
      rolAsignado = 'REVISOR';
    } else if (rol && rol !== 'AUTOR') {
      const permitidos = ROLES_ASIGNABLES[session?.user?.rol] ?? [];
      if (!permitidos.includes(rol)) {
        return NextResponse.json(
          { error: 'No autorizado para asignar este rol' },
          { status: 403 }
        );
      }
      rolAsignado = rol;
    }

    const { usuario, error: errorRegistro } = await registrarUsuario(data, rolAsignado);
    if (errorRegistro) {
      return NextResponse.json({ error: errorRegistro }, { status: 400 });
    }

    return NextResponse.json(
      {
        message: 'Usuario registrado exitosamente. Por favor verifica tu correo electrónico.',
        user: usuario,
        requiresVerification: true,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error en registro:', error);

    return NextResponse.json(
      { error: 'Error al registrar usuario. Intenta nuevamente.' },
      { status: 500 }
    );
  }
}