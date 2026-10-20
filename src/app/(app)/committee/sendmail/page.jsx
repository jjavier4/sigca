"use client";
import React, { useState } from 'react';
import FormLabelInput from '@/components/ui/form/FormLabelInput';
import { User, Mail, PlusCircle, MinusCircleIcon, Send, Loader, UserX } from 'lucide-react';
import Alert from '@/components/ui/utils/alert';

export default function InvitarRevisoresPage() {
  const [revisores, setRevisores] = useState([
    { nombre: '', correo: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [loadingDesactivar, setLoadingDesactivar] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const addRevisor = () => {
    const lastRevisor = revisores[revisores.length - 1];

    if (!lastRevisor.nombre.trim()) {
      setError('Por favor complete el nombre del revisor antes de agregar otro');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!lastRevisor.correo.trim()) {
      setError('Por favor complete el correo del revisor antes de agregar otro');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!validateEmail(lastRevisor.correo)) {
      setError('El correo del último revisor tiene formato inválido');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setRevisores([...revisores, { nombre: '', correo: '' }]);
  };

  const removeRevisor = () => {
    if (revisores.length > 1) {
      setRevisores(revisores.slice(0, -1));
    }
  };

  const updateRevisor = (index, field, value) => {
    const newRevisores = [...revisores];
    newRevisores[index][field] = value;
    setRevisores(newRevisores);
  };

  const handleDesactivarTodos = async () => {
    setLoadingDesactivar(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/shutdown-revisores`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al desactivar revisores');
      }

      setSuccess(`¡${data.cantidad} revisor(es) desactivado(s) exitosamente!`);
      setTimeout(() => setSuccess(''), 5000);

    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoadingDesactivar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const revisoresValidos = [];

      for (let i = 0; i < revisores.length; i++) {
        const revisor = revisores[i];

        if (!revisor.nombre.trim() || !revisor.correo.trim()) {
          setError(`El revisor ${i + 1} tiene campos vacíos`);
          setLoading(false);
          setTimeout(() => setError(''), 3000);
          return;
        }

        if (!validateEmail(revisor.correo)) {
          setError(`El correo del revisor ${i + 1} tiene formato inválido`);
          setLoading(false);
          setTimeout(() => setError(''), 3000);
          return;
        }

        revisoresValidos.push({
          nombre: revisor.nombre.trim(),
          correo: revisor.correo.trim().toLowerCase()
        });
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/sendemails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ revisores: revisoresValidos }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar invitaciones');
      }

      setSuccess(`¡Proceso completado exitosamente! ${data.exitosos} enviados, ${data.fallidos} fallidos, ${data.yaRegistrados} ya registrados.`);

      if (data.fallidos === 0) {
        setRevisores([{ nombre: '', correo: '' }]);
      }

      setTimeout(() => setSuccess(''), 5000);

    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <Alert
        type={error ? 'error' : 'success'}
        message={error || success}
        isVisible={!!(error || success)}
        onClose={() => {
          setError('');
          setSuccess('');
        }}
      />

      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Gestión de Revisores
              </h1>
              <p className="text-gray-600 mt-1">
                Invite a académicos a participar como revisores en el CIIDiCI
              </p>
            </div>

            {/* Botón de desactivar todos */}
            <button
              type="button"
              onClick={() => handleDesactivarTodos()}
              disabled={loadingDesactivar}
              className="flex items-center cursor-pointer gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingDesactivar ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Desactivando...
                </>
              ) : (
                <>
                  <UserX className="w-5 h-5" />
                  Desactivar Todos los Revisores
                </>
              )}
            </button>
          </div>
        </div>

        {/* Formulario */}
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

            {/* Botones para agregar/quitar revisores */}
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

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer text-white py-4 px-6 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
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