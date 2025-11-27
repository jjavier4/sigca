import React from 'react'

export default function ModalComfirm({ txt, onConfirm, onCancel, isLoading }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full">
                <div className="bg-blue-500 p-6 rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-white">{txt}</h2>
                </div>

                <div className="p-6 space-y-4">
                    {/* Botones */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={onCancel}
                            disabled={isLoading}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors"
                        >
                            {isLoading ? 'Cargando...' : 'Confirmar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
