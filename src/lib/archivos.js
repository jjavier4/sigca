import 'server-only';
import { esPdf } from '@/lib/storage';

export const TAMANO_MAXIMO_PDF = 10 * 1024 * 1024;

export async function leerPdf(archivo) {
  if (!(archivo instanceof File)) {
    return { error: 'No se proporcionó ningún archivo' };
  }

  if (!archivo.name.toLowerCase().endsWith('.pdf')) {
    return { error: 'Solo se permiten archivos PDF' };
  }

  if (archivo.size > TAMANO_MAXIMO_PDF) {
    return { error: 'El archivo excede el tamaño máximo permitido (10MB)' };
  }

  const buffer = Buffer.from(await archivo.arrayBuffer());

  if (!esPdf(buffer)) {
    return { error: 'El archivo no es un PDF válido' };
  }

  return { buffer };
}
