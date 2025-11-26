// components/InvitarRevisoresForm.jsx
'use client';

import { useState } from 'react';
import { Mail, Plus, X, Send, CheckCircle, XCircle, Loader } from 'lucide-react';

export default function InvitarRevisoresForm() {
  const [correos, setCorreos] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [nombreRevisor, setNombreRevisor] = useState('');
  const [areasTematicas, setAreasTematicas] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleAddEmail = () => {
    const email = emailInput.trim();
    
    if (!email) {
      setError('Por favor ingrese un correo');
      return;
    }

    if (!validateEmail(email)) {
      setError('Formato de correo inválido');
      return;
    }

    if (correos.includes(email)) {
      setError('Este correo ya está agregado');
      return;
    }

    setCorreos([...correos, email]);
    setEmailInput('');
    setError('');
  };

  const handleRemoveEmail = (emailToRemove) => {
    setCorreos(correos.filter(email => email !== emailToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (correos.length === 0) {
      setError('Debe agregar al menos un correo');
      return;
    }

    setLoading(true);
    setError('');
    setResultado(null);

    try {
      const response = await fetch('/api/comite/invitar-revisores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correos,
          nombreRevisor: nombreRevisor || null,
          areasTematicas: areasTematicas || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar invitaciones');
      }

      setResultado(data);
      
      // Limpiar formulario si todo fue exitoso
      if (data.fallidos === 0) {
        setCorreos([]);
        setNombreRevisor('');
        setAreasTematicas('');
      }

    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Invitar Revisores
        </h2>
        <p className="text-gray-600">
          Envíe invitaciones por correo electrónico a potenciales revisores
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campos opcionales */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Revisor (opcional)
            </label>
            <input
              type="text"
              value={nombreRevisor}
              onChange={(e) => setNombreRevisor(e.target.value)}
              placeholder="Dr. Juan Pérez"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Si lo deja vacío, se usará "Estimado/a Colega"
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Áreas Temáticas (opcional)
            </label>
            <textarea
              value={areasTematicas}
              onChange={(e) => setAreasTematicas(e.target.value)}
              placeholder="Inteligencia Artificial, Machine Learning, Redes Neuronales"
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Input de correos */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Correos Electrónicos *
          </label>
          
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setError('');
                }}
                onKeyPress={handleKeyPress}
                placeholder="revisor@universidad.edu"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              type="button"
              onClick={handleAddEmail}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
              <XCircle className="w-4 h-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Lista de correos */}
          {correos.length > 0 && (
            <div className="space-y-2 mt-4">
              <p className="text-sm font-medium text-gray-700">
                Revisores a invitar ({correos.length}):
              </p>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {correos.map((email, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-purple-50 px-4 py-2 rounded-lg border border-purple-200"
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-gray-700">{email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(email)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Resultado */}
        {resultado && (
          <div className={`p-4 rounded-lg ${
            resultado.fallidos === 0 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-start gap-3">
              {resultado.fallidos === 0 ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              )}
              <div>
                <p className="font-medium text-gray-800">{resultado.mensaje}</p>
                <div className="mt-2 space-y-1 text-sm">
                  <p className="text-gray-600">
                    ✓ Enviados exitosamente: {resultado.exitosos}
                  </p>
                  {resultado.fallidos > 0 && (
                    <p className="text-gray-600">
                      ✗ Fallidos: {resultado.fallidos}
                    </p>
                  )}
                </div>
                {resultado.detalles && resultado.detalles.some(d => !d.enviado) && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                      Ver detalles de errores
                    </summary>
                    <ul className="mt-2 space-y-1">
                      {resultado.detalles
                        .filter(d => !d.enviado)
                        .map((detalle, idx) => (
                          <li key={idx} className="text-sm text-red-600">
                            {detalle.correo}: {detalle.error}
                          </li>
                        ))}
                    </ul>
                  </details>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={loading || correos.length === 0}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Enviando invitaciones...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Enviar Invitaciones ({correos.length})
            </>
          )}
        </button>
      </form>
    </div>
  );
}