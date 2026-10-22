'use client';
import React, { useState } from 'react';
import { ListChecks } from 'lucide-react';
import RowUser from '@/components/ui/utils/rowUser';
import Alert from '@/components/ui/utils/alert';
import ModalConfirm from '@/components/ui/utils/modalConfirm';
import useAccion from '@/hooks/useAccion';
import { cambiarBloqueo } from '@/actions/usuarios';

function mensajeBloqueo(usuario) {
    if (!usuario) return '';
    const persona = `${usuario.nombre} (${usuario.email})`;
    return usuario.bloqueada
        ? `Se desbloqueará la cuenta de ${persona}. Podrá volver a iniciar sesión.`
        : `Se bloqueará la cuenta de ${persona}. No podrá volver a iniciar sesión mientras esté bloqueada.`;
}

export default function GestionUsuarios({ usuarios }) {
    const [usuarioACambiar, setUsuarioACambiar] = useState(null);
    const { ejecutar, pendiente, alerta } = useAccion();

    const confirmarCambio = async () => {
        await ejecutar(() =>
            cambiarBloqueo({ email: usuarioACambiar.email, bloqueada: !usuarioACambiar.bloqueada })
        );
        setUsuarioACambiar(null);
    };

    return (
        <div>
            <ModalConfirm
                abierto={usuarioACambiar !== null}
                titulo={usuarioACambiar?.bloqueada ? 'Desbloquear cuenta' : 'Bloquear cuenta'}
                mensaje={mensajeBloqueo(usuarioACambiar)}
                textoConfirmar={usuarioACambiar?.bloqueada ? 'Desbloquear' : 'Bloquear'}
                peligro={!usuarioACambiar?.bloqueada}
                cargando={pendiente}
                onConfirmar={confirmarCambio}
                onCancelar={() => setUsuarioACambiar(null)}
            />
            <Alert {...alerta} />
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Gestionar Usuarios COMITE</h2>
            {usuarios.length === 0 ? (
                <div className="bg-white text-gray-600 rounded-lg shadow-md overflow-hidden">
                    <div className="text-center py-12 px-6">
                        <ListChecks className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                        <p className="text-gray-500 text-lg">
                            No hay usuarios registrados.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-white text-gray-600 rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Identificador</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {usuarios.map((usuario) => (
                                    <RowUser
                                        key={usuario.id}
                                        id={usuario.id}
                                        name={usuario.nombre}
                                        email={usuario.email}
                                        role={usuario.rol}
                                        bloqueada={usuario.bloqueada}
                                        onDelete={() => setUsuarioACambiar(usuario)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
