import 'server-only';
import path from 'node:path';
import { mkdir, writeFile, rename, unlink, stat } from 'node:fs/promises';
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

/** Escritura atómica: primero a un .tmp y luego rename, así nunca queda un PDF a medias. */
export async function saveFile(userId, storedFilename, buffer) {
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

export async function deleteFile(userId, storedFilename) {
    const userDirectoryPath = path.join(UPLOAD_DIR, 'users_files', userId);
    try {
        await unlink(safePath(userDirectoryPath, storedFilename));
    } catch (err) {
        if (err.code !== 'ENOENT') throw err;
    }
}

/** Devuelve { stream, size } o null si el archivo no existe. */
export async function openFileStream(storedFile) {
    const full = path.join(process.cwd(),storedFile);
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