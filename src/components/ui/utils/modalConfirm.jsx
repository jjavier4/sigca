'use client';
import React, { useEffect, useId, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ModalConfirm({
  abierto,
  titulo = 'Confirmar acción',
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  peligro = true,
  cargando = false,
  onConfirmar,
  onCancelar,
}) {
  const idTitulo = useId();
  const idMensaje = useId();
  const botonCancelar = useRef(null);
  const botonConfirmar = useRef(null);

  useEffect(() => {
    if (abierto) botonCancelar.current?.focus();
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return undefined;

    const alPresionar = (evento) => {
      if (evento.key === 'Escape') {
        if (!cargando) onCancelar();
        return;
      }
      if (evento.key !== 'Tab') return;

      const botones = [botonCancelar.current, botonConfirmar.current].filter(
        (boton) => boton && !boton.disabled
      );
      if (botones.length === 0) {
        evento.preventDefault();
        return;
      }
      const primero = botones[0];
      const ultimo = botones[botones.length - 1];
      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener('keydown', alPresionar);
    return () => document.removeEventListener('keydown', alPresionar);
  }, [abierto, cargando, onCancelar]);

  if (!abierto) return null;

  const colorConfirmar = peligro
    ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-300'
    : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={() => {
        if (!cargando) onCancelar();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        aria-describedby={idMensaje}
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className={`rounded-full p-2 ${peligro ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <h3 id={idTitulo} className="text-lg font-bold text-gray-900">
              {titulo}
            </h3>
            <p id={idMensaje} className="mt-2 text-sm text-gray-600">
              {mensaje}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={botonCancelar}
            type="button"
            disabled={cargando}
            onClick={onCancelar}
            className="rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-800 transition-colors hover:bg-gray-300 disabled:opacity-50"
          >
            {textoCancelar}
          </button>
          <button
            ref={botonConfirmar}
            type="button"
            disabled={cargando}
            onClick={onConfirmar}
            className={`rounded-lg px-4 py-2 font-semibold text-white transition-colors ${colorConfirmar}`}
          >
            {cargando ? 'Procesando...' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
