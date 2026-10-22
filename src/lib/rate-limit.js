import 'server-only';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

/**
 * Limitador de peticiones en memoria (ventana fija).
 * Sirve para una sola instancia del servidor; con varias instancias hay que
 * moverlo a un almacén compartido (Redis).
 */

export const QUINCE_MINUTOS = 15 * 60 * 1000;
export const UNA_HORA = 60 * 60 * 1000;

const MAX_ENTRADAS = 10000;
// globalThis para sobrevivir a los reinicios de módulo de `next dev`
const store = (globalThis.__rateLimitStore ??= new Map());

function purgar(ahora) {
  if (store.size < MAX_ENTRADAS) return;
  for (const [clave, entrada] of store) {
    if (entrada.resetAt <= ahora) store.delete(clave);
  }
  // Si siguen todas vigentes se descartan las más antiguas (Map conserva el orden de inserción)
  for (const clave of store.keys()) {
    if (store.size < MAX_ENTRADAS) break;
    store.delete(clave);
  }
}

/** Cuenta un intento. Devuelve si sigue dentro del límite y cuántos segundos faltan para el reinicio. */
export function consumir(clave, limite, ventanaMs) {
  const ahora = Date.now();
  let entrada = store.get(clave);
  if (!entrada || entrada.resetAt <= ahora) {
    purgar(ahora);
    entrada = { count: 0, resetAt: ahora + ventanaMs };
    store.set(clave, entrada);
  }
  entrada.count += 1;
  return {
    permitido: entrada.count <= limite,
    reintentarEn: Math.ceil((entrada.resetAt - ahora) / 1000),
  };
}

/** Consulta si la clave ya alcanzó el límite, sin contar un intento nuevo. */
export function excedido(clave, limite) {
  const entrada = store.get(clave);
  return Boolean(entrada) && entrada.resetAt > Date.now() && entrada.count >= limite;
}

export function reiniciar(clave) {
  store.delete(clave);
}

/**
 * IP del cliente. Solo es fiable si un proxy inverso (nginx) sobrescribe
 * X-Forwarded-For; sin proxy el cliente puede falsearlo.
 */
export function ipDe(headers) {
  const leer = (nombre) =>
    typeof headers?.get === 'function' ? headers.get(nombre) : headers?.[nombre];
  const reenviada = leer('x-forwarded-for');
  return (reenviada ? reenviada.split(',')[0].trim() : leer('x-real-ip')) || 'desconocida';
}

/**
 * Para route handlers. Devuelve un NextResponse 429 si se superó algún límite, o null.
 *   porIp:    { limite, ventanaMs }               → se cuenta por IP
 *   porClave: { limite, ventanaMs } + clave       → se cuenta por clave (p. ej. el correo)
 */
export function limitarPeticion(request, nombre, { porIp, porClave, clave } = {}) {
  const espera = revisarLimites(ipDe(request.headers), nombre, { porIp, porClave, clave });

  if (!espera) return null;
  return NextResponse.json(
    { error: 'Demasiados intentos. Intenta de nuevo más tarde.' },
    { status: 429, headers: { 'Retry-After': String(espera) } }
  );
}

function revisarLimites(ip, nombre, { porIp, porClave, clave }) {
  const revisiones = [];
  if (porIp) revisiones.push([`${nombre}:ip:${ip}`, porIp]);
  if (porClave && clave) revisiones.push([`${nombre}:clave:${clave}`, porClave]);

  let espera = 0;
  for (const [claveRevision, { limite, ventanaMs }] of revisiones) {
    const resultado = consumir(claveRevision, limite, ventanaMs);
    if (!resultado.permitido) espera = Math.max(espera, resultado.reintentarEn);
  }
  return espera;
}

export async function limitarAccion(nombre, { porIp, porClave, clave } = {}) {
  const ip = ipDe(await headers());
  return revisarLimites(ip, nombre, { porIp, porClave, clave }) > 0;
}
