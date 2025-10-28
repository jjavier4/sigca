'use client'
import React, { useEffect, useState } from 'react'
import RowConvocatorie from '@/components/ui/rowConvocatorie'
import Alert from '@/components/ui/alert'
import { href } from '@/utils/route'
import FormLabelInput from '@/components/ui/FormLabelInput'
import { Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react'
import { useSession } from 'next-auth/react';
export default function ManageUsers() {
    const { data: session } = useSession();

    const [isLoading, setIsLoading] = useState(false);
    const [convocatories, setConvocatories] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [onEdit, setOnEdit] = useState(false);
    const [selectedConvocatorieEdit, setSelectedConvocatorieEdit] = useState(null);


    const findConvocatories = async () => {
        try {
            const response = await fetch('/api/convocatories/findall', {
                method: 'GET',
            });
            const data = await response.json();
            if (response.ok) {
                console.log(data.convocatorias);
                setConvocatories(data.convocatorias);
            } else {
                setError(data.error);
            }
            setTimeout(() => {
                setSuccess('');
                setError('');
            }, 3000);

        } catch (error) {
            console.error('Error al traer convocatories:', error);
        }
    }

    const deleteConvocatorie = async (id) => {
        try {
            const response = await fetch(`/api/convocatories/deleteone?id=${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess(data.message);
                findConvocatories();
            } else {
                setError(data.error);
            }
            setTimeout(() => {
                setSuccess('');
                setError('');
            }, 3000);
        } catch (error) {
            setError('Error al eliminar convocatoria');
        }
    }
    /**
        const updateUser = async (e) => {
            e.preventDefault();
            setIsLoading(true);
            setError('');
            setSuccess('');
    
            try {
                const response = await fetch('/api/user/updateone', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: selectedUserEdit.id,
                        email: selectedUserEdit.email,
                        rol:selectedUserEdit.rol,
                    }),
                });
    
                const data = await response.json();
    
                if (response.ok) {
                    setSuccess(data.message);
                }else {
                    setError(data.error);
                }            
    
                setSelectedUserEdit({
                    id:'',
                    nombre: '',
                    institucion: '',
                    rol: '',
                });
    
                setTimeout(() => {
                    setSuccess('');
                    setError('');
                    setOnEdit(false);
                }, 3000);
    
            } catch (err) {
                setError( 'Error al registrar usuario');
            } finally {
                setIsLoading(false);
            }
        }
     */
    useEffect(() => {
        findConvocatories();
    }, [error, success]);
    return (
        <div>
            <Alert
                type={error ? 'error' : 'success'}
                message={error || success}
                isVisible={error || success}
                onClose={() => {
                    setTimeout(() => { setShowAlert(!showAlert); }, 3000)
                }}
            />
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Gestionar Convocatorias</h2>
            <input type="file" accept=".pdf" multiple />
            {
                onEdit ?
                    (
                        <>

                        </>
                    ) : (
                        <div className="bg-white text-gray-600 rounded-lg shadow-md overflow-hidden">
                            <div className="p-4 border-b">
                                <input
                                    type="text"
                                    placeholder="Buscar usuario por nombre o email..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Inicio</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Fin</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {
                                            convocatories?.map((convocatorie) => (
                                                <RowConvocatorie
                                                    key={convocatorie.id}
                                                    titulo={convocatorie.titulo}
                                                    fecha_inicio={convocatorie.fecha_inicio}
                                                    fecha_cierre={convocatorie.fecha_cierre}
                                                    onEdit={() => { setOnEdit(true); setSelectedConvocatorieEdit(convocatorie) }}
                                                    onDelete={() => deleteConvocatorie(convocatorie.id)}
                                                />
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                            
                        </div >
                    )
            }

        </div >
    )
}
