'use client'
import React, { useState } from 'react';
import { Save, Edit, X } from 'lucide-react';

export default function RowUpdateIA({ 
  trabajo, 
  handleActualizarIA, 
  loadingStates 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [nvl_ia, setNvlIA] = useState(trabajo.nvl_ia?.toString() || '');
  const [nvl_plagio, setNvlPlagio] = useState(trabajo.nvl_plagio?.toString() || '');

  const handleCancelar = () => {
    setIsEditing(false);
    setNvlIA(trabajo.nvl_ia?.toString() || '');
    setNvlPlagio(trabajo.nvl_plagio?.toString() || '');
  };

  const handleGuardar = () => {
    handleActualizarIA(trabajo.id, parseFloat(nvl_ia), parseFloat(nvl_plagio));
    setIsEditing(false);
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div>
          <p className="font-semibold text-gray-800 text-sm mb-1">
            {trabajo.titulo}
          </p>
          <p className="text-xs text-gray-600 mb-2">
            {trabajo.convocatoria.titulo}
          </p>
          <div className="flex gap-2 items-center">
            <span className={`text-xs px-2 py-1 rounded-full ${
              trabajo.tipo === 'DIFUSION'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-purple-100 text-purple-800'
            }`}>
              {trabajo.tipo}
            </span>
            <span className="text-xs text-gray-500">
              {trabajo.autor}
            </span>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 text-center">
        <input
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={nvl_ia}
          onChange={(e) => setNvlIA(e.target.value)}
          disabled={!isEditing}
          placeholder="0-100"
          className={`w-24 px-3 py-2 border rounded-lg text-center ${
            isEditing
              ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              : 'border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed'
          }`}
        />
      </td>

      <td className="px-6 py-4 text-center">
        <input
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={nvl_plagio}
          onChange={(e) => setNvlPlagio(e.target.value)}
          disabled={!isEditing}
          placeholder="0-100"
          className={`w-24 px-3 py-2 border rounded-lg text-center ${
            isEditing
              ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              : 'border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed'
          }`}
        />
      </td>

      <td className="px-6 py-4 text-center">
        <div className="flex gap-2 justify-center">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 inline-flex items-center gap-2"
            >
              <Edit size={16} />
              Actualizar
            </button>
          ) : (
            <>
              <button
                onClick={handleGuardar}
                disabled={loadingStates[trabajo.id]}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 inline-flex items-center gap-2"
              >
                {loadingStates[trabajo.id] ? (
                  'Guardando...'
                ) : (
                  <>
                    <Save size={16} />
                    Guardar
                  </>
                )}
              </button>
              <button
                onClick={handleCancelar}
                disabled={loadingStates[trabajo.id]}
                className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 inline-flex items-center gap-2"
              >
                <X size={16} />
                Cancelar
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}