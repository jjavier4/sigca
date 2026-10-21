'use client';
import React, { useState } from 'react';
import { IdCard } from 'lucide-react';
import FormLabelInput from '@/components/ui/form/FormLabelInput';
import Alert from '@/components/ui/utils/alert';
import useAccion from '@/hooks/useAccion';
import { actualizarPerfil } from '@/actions/perfil';

export default function FormPerfil({ numeroControlInicial }) {
  const [numeroControl, setNumeroControl] = useState(numeroControlInicial);
  const { ejecutar, pendiente, alerta } = useAccion();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (numeroControl && !/^\d{8}$/.test(numeroControl)) {
      await ejecutar(async () => ({ ok: false, error: 'El número de control debe tener 8 dígitos' }));
      return;
    }

    await ejecutar(() => actualizarPerfil({ numeroControl }));
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <Alert {...alerta} />

      <div className="max-w-2xl mx-auto px-4">
        <form onSubmit={handleSubmit} className=" p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Información Editable
          </h2>
          <p className="text-gray-600 mt-1">
            Actualiza tu información personal
          </p>

          <FormLabelInput
            title="Número de Control (opcional)"
            children={<IdCard className="absolute left-3 top-3 text-gray-500" size={20} />}
            type="text"
            value={numeroControl}
            change={(e) => setNumeroControl(e.target.value)}
            placeholder="12345678"
            required={false}
          />

          <div className="pt-4">
            <button
              type="submit"
              disabled={pendiente}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-all duration-300"
            >
              {pendiente ? 'Actualizando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
