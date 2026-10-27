import 'server-only';
import path from 'node:path';
import { mkdir, writeFile, rename, unlink, stat, rmdir } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { Readable } from 'node:stream';
import { existsSync } from 'fs';
export const UPLOAD_DIR = path.resolve(
    process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')
);


/**
 * Resuelve la ruta absoluta y garantiza que no se salga de UPLOAD_DIR.
 * Hay dos defensas: whitelist del formato del nombre y verificación del prefijo resuelto.
 */
function safePath(userDirectoryPath , storedFilename) {

    const full = path.resolve(userDirectoryPath, storedFilename);
    if (!full.startsWith(userDirectoryPath + path.sep)) {
        throw new Error('Path traversal detectado');
    }
    return full;
}

const SEGMENTO_VALIDO = /^[A-Za-z0-9._-]+$/;

/** El userId y el nombre de archivo son un solo segmento de ruta, sin separadores ni "..". */
function assertSegmento(valor) {
    if (typeof valor !== 'string' || !SEGMENTO_VALIDO.test(valor) || valor.includes('..')) {
        throw new Error('Segmento de ruta inválido');
    }
}

/** Un PDF real empieza con la firma %PDF- (la extensión del nombre no basta). */
export function esPdf(buffer) {
    return buffer.length > 4 && buffer.subarray(0, 5).toString('latin1') === '%PDF-';
}

/** Escritura atómica: primero a un .tmp y luego rename, así nunca queda un PDF a medias. */
export async function saveFile(userId, storedFilename, buffer) {
    assertSegmento(userId);
    assertSegmento(storedFilename);
    const userDirectoryPath = path.join(UPLOAD_DIR, 'users_files', userId);
    if (!existsSync(UPLOAD_DIR)) {
        await mkdir(UPLOAD_DIR, { recursive: true });
    }
    if (!existsSync(userDirectoryPath)) {
        await mkdir(userDirectoryPath, { recursive: true });
    }
    const finalPath = safePath(userDirectoryPath, storedFilename);
    const tmpPath = `${finalPath}.${process.pid}.tmp`;
    await writeFile(tmpPath, buffer, { flag: 'wx', mode: 0o640 });
    await rename(tmpPath, finalPath);
}

/**
 * archivo_url se guarda como /uploads/users_files/<userId>/<archivo>;
 * se resuelve dentro de UPLOAD_DIR y nunca fuera de él.
 */
function resolveStored(storedFile) {
    const relative = String(storedFile).replace(/^\/?uploads\//, '');
    const full = path.resolve(UPLOAD_DIR, relative);
    if (!full.startsWith(UPLOAD_DIR + path.sep)) {
        throw new Error('Path traversal detectado');
    }
    return full;
}

/** Borra el archivo que apunta archivo_url (y la carpeta del usuario si queda vacía). Si no existe, no hace nada. */
export async function deleteStoredFile(storedFile) {
    const full = resolveStored(storedFile);
    try {
        await unlink(full);
    } catch (err) {
        if (err.code !== 'ENOENT') throw err;
    }
    try {
        await rmdir(path.dirname(full));
    } catch (err) {
        // ENOTEMPTY: aún hay otros archivos del usuario; ENOENT: ya no existe
        if (err.code !== 'ENOTEMPTY' && err.code !== 'ENOENT') throw err;
    }
}

/** Devuelve { stream, size } o null si el archivo no existe. */
export async function openFileStream(storedFile) {
    const full = resolveStored(storedFile);
    try {
        const info = await stat(full);
        if (!info.isFile()) return null;
        const nodeStream = createReadStream(full);
        return { stream: Readable.toWeb(nodeStream), size: info.size };
    } catch (err) {
        if (err.code === 'ENOENT') return null;
        throw err;
    }
}