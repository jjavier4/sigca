import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PUNTAJES_RUBRICA } from './rubrica';

/**
 * Valida `data` contra un esquema zod.
 * Uso en route handlers y Server Actions:
 *   const { data, error } = validar(esquema, body);
 *   if (error) return error;
 * `error` es un NextResponse 400 con el primer mensaje de validación.
 */
export function validar(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      error: NextResponse.json(
        { error: result.error.issues[0]?.message ?? 'Datos inválidos' },
        { status: 400 }
      ),
    };
  }
  return { data: result.data };
}

// ── Primitivos ──────────────────────────────────────────────────────────────

const texto = (nombre, max = 100) =>
  z
    .string({ error: `Falta ${nombre.toLowerCase()}` })
    .trim()
    .min(1, `Falta ${nombre.toLowerCase()}`)
    .max(max, `${nombre} no puede superar ${max} caracteres`);

const email = z
  .string({ error: 'El correo electrónico es obligatorio' })
  .trim()
  .toLowerCase()
  .max(254, 'El correo electrónico es demasiado largo')
  .pipe(z.email({ error: 'El correo electrónico no es válido' }));

const fechaDia = (nombre) =>
  z
    .string({ error: `${nombre} es obligatoria` })
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${nombre} debe tener el formato AAAA-MM-DD`)
    .refine((v) => !Number.isNaN(Date.parse(v)), `${nombre} no es una fecha válida`);

const numeroControl = z
  .string()
  .trim()
  .nullish()
  .refine((v) => !v || /^\d{8}$/.test(v), 'El número de control debe tener 8 dígitos');

const porcentaje = (nombre) =>
  z
    .number({ error: `${nombre} debe ser un número` })
    .min(0, `${nombre} debe estar entre 0 y 100`)
    .max(100, `${nombre} debe estar entre 0 y 100`);

export const ROLES = ['AUTOR', 'REVISOR', 'COMITE', 'ADMIN'];
export const GRUPOS_RUBRICA = ['DIFUSION', 'DIVULGACION'];

const RFC_REGEX = /^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/;
const CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;

// ── Usuarios ────────────────────────────────────────────────────────────────

export const registroSchema = z
  .object({
    nombre: texto('El nombre'),
    apellidoP: texto('El apellido paterno'),
    apellidoM: texto('El apellido materno'),
    email,
    tipoIdentificacion: z.enum(['rfc', 'curp'], { error: 'Tipo de identificación no válido' }),
    rfc: z.string().trim().toUpperCase().nullish(),
    curp: z.string().trim().toUpperCase().nullish(),
    // bcrypt solo considera los primeros 72 bytes
    password: z
      .string({ error: 'La contraseña es obligatoria' })
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .max(72, 'La contraseña no puede superar 72 caracteres'),
    numero_control: numeroControl.transform((v) => v || null),
    rol: z.enum(ROLES, { error: 'Rol no válido' }).nullish(),
    invitationToken: z.string().max(200).nullish(),
  })
  .superRefine((d, ctx) => {
    if (d.tipoIdentificacion === 'rfc') {
      if (!d.rfc) {
        ctx.addIssue({ code: 'custom', message: 'Debes proporcionar tu RFC', path: ['rfc'] });
      } else if (!RFC_REGEX.test(d.rfc)) {
        ctx.addIssue({
          code: 'custom',
          message: 'El RFC proporcionado no tiene un formato válido. Debe tener 13 caracteres.',
          path: ['rfc'],
        });
      }
    } else if (d.tipoIdentificacion === 'curp') {
      if (!d.curp) {
        ctx.addIssue({ code: 'custom', message: 'Debes proporcionar tu CURP', path: ['curp'] });
      } else if (!CURP_REGEX.test(d.curp)) {
        ctx.addIssue({
          code: 'custom',
          message: 'El CURP proporcionado no tiene un formato válido. Debe tener 18 caracteres.',
          path: ['curp'],
        });
      }
    }
  });

// Solicitudes que solo reciben un correo (reset de contraseña, reenvío de verificación)
export const solicitudEmailSchema = z.object({ email });

export const actualizarPerfilSchema = z.object({
  numeroControl: numeroControl.transform((valor) => valor || null),
});

export const bloqueoUsuarioSchema = z.object({
  email,
  bloqueada: z.boolean({ error: 'El estado de bloqueo es obligatorio' }),
});

export const invitacionesSchema = z.object({
  revisores: z
    .array(
      z.object({
        nombre: texto('El nombre del revisor'),
        correo: email,
      }),
      { error: 'Debe proporcionar al menos un revisor' }
    )
    .min(1, 'Debe proporcionar al menos un revisor')
    .max(50, 'No se pueden invitar más de 50 revisores a la vez'),
});

// ── Convocatorias ───────────────────────────────────────────────────────────

const fechasCoherentes = (d, ctx) => {
  if (new Date(d.fecha_cierre) < new Date(d.fecha_inicio)) {
    ctx.addIssue({
      code: 'custom',
      message: 'La fecha de cierre no puede ser anterior a la fecha de inicio',
      path: ['fecha_cierre'],
    });
  }
};

export const crearConvocatoriaSchema = z
  .object({
    titulo: texto('El título', 200),
    descripcion: texto('La descripción', 5000),
    // el handler les concatena la hora, por eso solo se acepta AAAA-MM-DD
    fecha_inicio: fechaDia('La fecha de inicio'),
    fecha_cierre: fechaDia('La fecha de cierre'),
  })
  .superRefine(fechasCoherentes);

export const actualizarConvocatoriaSchema = z
  .object({
    id: texto('El ID de convocatoria', 50),
    titulo: texto('El título', 200),
    descripcion: texto('La descripción', 5000),
    fecha_inicio: fechaDia('La fecha de inicio'),
    fecha_cierre: fechaDia('La fecha de cierre'),
  })
  .superRefine(fechasCoherentes);

// ── Rúbricas ────────────────────────────────────────────────────────────────

export const crearCriterioSchema = z.object({
  nombre: texto('El nombre', 200),
  descripcion: texto('La descripción', 2000),
  grupo: z.enum(GRUPOS_RUBRICA, { error: 'Grupo inválido. Debe ser DIFUSION o DIVULGACION' }),
  descripcion_puntaje: z
    .array(texto('Las descripciones de puntaje', 1000), {
      error: 'descripcion_puntaje debe ser un array de 4 elementos (10, 8, 6, 0 puntos)',
    })
    .length(4, 'descripcion_puntaje debe ser un array de 4 elementos (10, 8, 6, 0 puntos)'),
});

// ── Trabajos ────────────────────────────────────────────────────────────────

const coautorSchema = z.object({
  id: z.string().max(100).optional(),
  nombre: texto('El nombre del coautor'),
  email,
});

export const datosTrabajoSchema = z.object({
  tituloPropuesta: texto('El título de la propuesta', 200),
  tipo: z.enum(GRUPOS_RUBRICA, { error: 'El tipo de propuesta no es válido' }),
  coautores: z.array(coautorSchema).max(10, 'No puede haber más de 10 coautores').default([]),
});

export const analisisIASchema = z.object({
  trabajoId: texto('El ID del trabajo', 50),
  nvl_ia: porcentaje('El nivel de IA'),
  nvl_plagio: porcentaje('El nivel de plagio'),
});

export const aceptarTrabajoSchema = z.object({
  trabajoId: texto('El ID del trabajo', 50),
  presencial: z.boolean({ error: 'La modalidad debe ser presencial o virtual' }),
});

// ── Asignaciones ────────────────────────────────────────────────────────────

export const crearAsignacionesSchema = z.object({
  trabajoId: texto('El trabajo', 50),
  revisoresIds: z
    .array(texto('El revisor', 50), { error: 'Debe proporcionar al menos un revisor' })
    .min(1, 'Debe proporcionar al menos un revisor')
    .max(10, 'No se pueden asignar tantos revisores a la vez')
    .refine((ids) => new Set(ids).size === ids.length, 'No se pueden asignar revisores duplicados'),
});

export const evaluarAsignacionSchema = z.object({
  id: texto('El ID de asignación', 50),
  comentarios: texto('Los comentarios', 5000),
  respuestas: z.record(
    z.string(),
    z
      .number({ error: 'Las respuestas deben ser números' })
      .refine((valor) => PUNTAJES_RUBRICA.includes(valor), 'Cada respuesta debe valer 10, 8, 6 o 0'),
    { error: 'Debes evaluar todos los criterios antes de enviar' }
  ),
});
