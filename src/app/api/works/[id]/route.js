import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-utils';
import { openFileStream } from '@/lib/storage';
import { prisma } from '@/lib/db';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Content-Disposition con soporte para acentos y ñ (RFC 5987/6266) */
function contentDisposition(filename, type = 'inline') {
  const ascii = filename.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '');
  const encoded = encodeURIComponent(filename);
  return `${type}; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

export async function GET(request, { params }) {
  const { session, error } = await authorize();
  if (error) return error;

  try {
    const { id } = await params; // en Next 15, params es una Promise
    const doc = await prisma.trabajos.findUnique({
      where: { id },
      select: {
        titulo: true,
        archivo_url: true,
        usuarioId: true,
        convocatoria: { select: { activa: true } },
      }
    });

    if (!doc || !doc.convocatoria.activa) {
      return NextResponse.json({ error: 'Trabajo no encontrado' }, { status: 404 });
    }

    // Pueden verlo: el dueño, el comité/admin y los revisores con una asignación sobre el trabajo
    const { id: userId, rol } = session.user;
    let permitido = doc.usuarioId === userId || rol === 'COMITE' || rol === 'ADMIN';
    if (!permitido && rol === 'REVISOR') {
      const asignacion = await prisma.asignaciones.findFirst({
        where: { trabajoId: id, revisorId: userId },
        select: { id: true },
      });
      permitido = Boolean(asignacion);
    }
    if (!permitido) {
      // 404 y no 403 para no revelar qué trabajos existen
      return NextResponse.json({ error: 'Trabajo no encontrado' }, { status: 404 });
    }

    const file = await openFileStream(doc.archivo_url);
    if (!file) {
      // El registro existe pero falta el archivo: inconsistencia que conviene registrar
      console.error(`[documents/${id}] archivo faltante: ${doc.titulo}`);
      return NextResponse.json({ error: 'Archivo no disponible' }, { status: 404 });
    }

    const download = new URL(request.url).searchParams.get('download') === '1';

    return new Response(file.stream, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': String(file.size),
        'Content-Disposition': contentDisposition(`${doc.titulo}-${id}.pdf`, download ? 'attachment' : 'inline'),
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, max-age=0, must-revalidate', // no cachear en proxies compartidos
        'X-Frame-Options': 'SAMEORIGIN',                        // solo tu sitio puede embeberlo
      },
    });
  } catch (err) {
    console.error('[documents/[id]]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
