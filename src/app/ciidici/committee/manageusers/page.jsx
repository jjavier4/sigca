'use client'
import React, { useEffect, useState } from 'react'
import RowUser from '@/components/ui/utils/rowUser'
import Alert from '@/components/ui/utils/alert'
import FormLabelInput from '@/components/ui/form/FormLabelInput'
import { Mail,ListChecks} from 'lucide-react'
import { useSession } from 'next-auth/react';
import Loading from '@/components/ui/utils/loading';
import LoadingError from '@/components/ui/utils/loadingError';
export default function ManageUsers() {
    const { data: session } = useSession();

    const [loading, setLoading] = useState(false) // Estado de carga inicial
    const [errorLoading, setErrorLoading] = useState(false) // Estado de error de carga inicial
    const [isLoading, setIsLoading] = useState(false) // Estado de carga para las operaciones de actualización
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [onEdit, setOnEdit] = useState(false);
    const [selectedUserEdit, setSelectedUserEdit] = useState(null);

    const deleteUser = async (userEmail) => {
        try {
            const response = await fetch(`/api/user/deleteone?email=${userEmail}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess(data.message);
            } else {
                setError(data.error);
            }
            setTimeout(() => {
                setSuccess('');
                setError('');
            }, 3000);

        } catch (error) {
            console.error('Error al eliminar usuario:', error);
        }
    }

    const findUserforRole = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/user/findforroles?roles=REVISOR,AUTOR`, {
                method: 'GET',
            });
            const data = await response.json();
            if (response.ok) {
                console.log(data.usuarios);
                setUsers(data.usuarios);
            } else {
                setError(data.error);
            }
            setTimeout(() => {
                setSuccess('');
                setError('');
            }, 3000);

        } catch (error) {
            console.error('Error al traer usuarios:', error);
            setErrorLoading(true);
        } finally {
            setLoading(false);
        }
    }

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
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(data.message);
            } else {
                setError(data.error);
            }

            setSelectedUserEdit({
                id: '',
                nombre: '',
                rol: '',
            });

            setTimeout(() => {
                setSuccess('');
                setError('');
                setOnEdit(false);
                setSelectedUserEdit({
                    id: '',
                    nombre: '',
                    rol: '',
                });
            }, 3000);

        } catch (err) {
            setError('Error al registrar usuario');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        findUserforRole();
    }, [error, success]);
    if (loading) {
        return (
            <Loading />
        )
    }
    if (errorLoading) {
        return (
            <LoadingError error="Error al cargar los usuarios." />
        )
    }

    return (
        <div>
            <Alert
                type={error ? 'error' : 'success'}
                message={error || success}
                isVisible={error || success}
            />
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Gestionar Usuarios COMITE</h2>
            {
                onEdit ?
                    (
                        <>
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Actualizar Usuario {selectedUserEdit?.nombre}</h2>
                            <form onSubmit={updateUser} className="space-y-4">

                                <FormLabelInput
                                    title={"Email"}
                                    children={<Mail className="absolute left-3 top-3 text-black" size={20} />}
                                    type={"email"} value={selectedUserEdit.email}
                                    change={(e) => setSelectedUserEdit({ ...selectedUserEdit, email: e.target.value })}
                                    placeholder={"tu@email.com"}
                                    required={true}
                                />

                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                                    >
                                        {isLoading
                                            ? 'Actualizando...'
                                            : success
                                                ? 'Actualizado !!!'
                                                : 'Actualizar'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setOnEdit(false)
                                            setSelectedUserEdit(null)
                                        }}
                                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                                    >
                                        Cancelar
                                    </button>
                                </div>


                            </form>
                        </>
                    ) : (
                        users.length === 0 ? (
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
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {
                                                users?.map((user) => (
                                                    <RowUser
                                                        key={user.id}
                                                        name={user.nombre}
                                                        email={user.email}
                                                        role={user.rol}
                                                        onEdit={() => { setOnEdit(true); setSelectedUserEdit(user) }}
                                                        onDelete={() => deleteUser(user.email)}
                                                    />
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div >
                        )
                    )
            }

        </div >
    )
}
