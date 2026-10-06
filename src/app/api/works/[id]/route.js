import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { openFileStream } from '@/lib/storage';
import { getCurrentUser, canReadDocument } from '@/lib/auth';
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
  try {
    const { id } = await params; // en Next 15, params es una Promise
    const doc = await prisma.trabajos.findUnique({
      where: { id },
      select: {
        titulo: true,
        archivo_url: true,
      }
    });

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