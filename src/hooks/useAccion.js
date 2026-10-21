'use client';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';

const DURACION_ALERTA = 3000;
const ALERTA_OCULTA = { type: 'success', message: '', isVisible: false };

export default function useAccion() {
  const [pendiente, iniciarTransicion] = useTransition();
  const [alerta, setAlerta] = useState(ALERTA_OCULTA);
  const temporizador = useRef(null);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  const mostrar = useCallback((type, message) => {
    clearTimeout(temporizador.current);
    setAlerta({ type, message, isVisible: true });
    temporizador.current = setTimeout(() => setAlerta(ALERTA_OCULTA), DURACION_ALERTA);
  }, []);

  const ejecutar = useCallback(
    (accion) =>
      new Promise((resolve) => {
        iniciarTransicion(async () => {
          let resultado;
          try {
            resultado = await accion();
          } catch {
            resultado = { ok: false, error: 'Ocurrió un error inesperado. Inténtalo de nuevo.' };
          }

          if (resultado?.ok) {
            mostrar('success', resultado.message ?? 'Operación realizada');
          } else {
            mostrar('error', resultado?.error ?? 'No se pudo completar la operación');
          }

          resolve(resultado);
        });
      }),
    [mostrar]
  );

  return { ejecutar, pendiente, alerta };
}
