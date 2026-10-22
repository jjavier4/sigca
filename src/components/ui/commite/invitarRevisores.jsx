'use client';
import React, { useState } from 'react';
import { User, Mail, PlusCircle, MinusCircleIcon, Send, Loader } from 'lucide-react';
import FormLabelInput from '@/components/ui/form/FormLabelInput';
import Alert from '@/components/ui/utils/alert';
import useAccion from '@/hooks/useAccion';
import { invitarRevisores } from '@/actions/usuarios';

const REVISOR_VACIO = { nombre: '', correo: '' };
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function errorDeRevisor(revisor, posicion) {
  if (!revisor.nombre.trim() || !revisor.correo.trim()) return `El revisor ${posicion} tiene campos vacíos`;
  if (!EMAIL_REGEX.test(revisor.correo.trim())) return `El correo del revisor ${posicion} tiene formato inválido`;
  return null;
}

export default function InvitarRevisores() {
  const [revisores, setRevisores] = useState([REVISOR_VACIO]);
  const { ejecutar, pendiente, alerta } = useAccion();

  const mostrarError = (error) => ejecutar(async () => ({ ok: false, error }));

  const addRevisor = () => {
    const error = errorDeRevisor(revisores[revisores.length - 1], revisores.length);
    if (error) {
      mostrarError(error);
      return;
    }
    setRevisores([...revisores, REVISOR_VACIO]);
  };

  const removeRevisor = () => {
    if (revisores.length > 1) setRevisores(revisores.slice(0, -1));
  };

  const updateRevisor = (index, campo, valor) => {
    setRevisores(revisores.map((revisor, i) => (i === index ? { ...revisor, [campo]: valor } : revisor)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = revisores.map((revisor, i) => errorDeRevisor(revisor, i + 1)).find(Boolean);
    if (error) {
      await mostrarError(error);
      return;
    }

    const resultado = await ejecutar(() =>
      invitarRevisores({
        revisores: revisores.map((revisor) => ({
          nombre: revisor.nombre.trim(),
          correo: revisor.correo.trim().toLowerCase(),
        })),
      })
    );

    if (resultado?.ok && resultado.fallidos === 0) setRevisores([REVISOR_VACIO]);
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <Alert {...alerta} />

      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Gestión de Revisores
          </h1>
          <p className="text-gray-600 mt-1">
            Invite a académicos a participar como revisores en el CIIDiCI
          </p>
        </div>

        <div className="min-h-screen py-8 px-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {revisores.map((revisor, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-lg border border-gray-200"
              >
                <h3 className="font-semibold text-gray-700 mb-4">
                  Revisor {index + 1}
                </h3>

                <div className="space-y-4">
                  <FormLabelInput
                    title="Nombre completo"
                    children={<User className="absolute left-3 top-3 text-gray-500" size={20} />}
                    type="text"
                    required={true}
                    value={revisor.nombre}
                    change={(e) => updateRevisor(index, 'nombre', e.target.value)}
                    placeholder="Dr. Juan Pérez González"
                  />

                  <FormLabelInput
                    title="Correo electrónico"
                    children={<Mail className="absolute left-3 top-3 text-gray-500" size={20} />}
                    type="email"
                    required={true}
                    value={revisor.correo}
                    change={(e) => updateRevisor(index, 'correo', e.target.value)}
                    placeholder="revisor@universidad.edu.mx"
                  />
                </div>
              </div>
            ))}

            <div className="flex gap-4">
              <button
                type="button"
                className="flex items-center cursor-pointer gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                onClick={addRevisor}
              >
                <PlusCircle size={20} />
                <span>Agregar Revisor</span>
              </button>

              {revisores.length > 1 && (
                <button
                  type="button"
                  className="flex items-center cursor-pointer gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
                  onClick={removeRevisor}
                >
                  <MinusCircleIcon size={20} />
                  <span>Quitar Último</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={pendiente}
              className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer text-white py-4 px-6 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {pendiente ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Enviando invitaciones...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Enviar Invitaciones a {revisores.length} revisor{revisores.length !== 1 ? 'es' : ''}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
