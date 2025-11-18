'use client'
import React, { useEffect, useState } from 'react'
import RowUser from '@/components/ui/rowUser'
import Alert from '@/components/ui/alert'
import { href } from '@/utils/route'
import FormLabelInput from '@/components/ui/FormLabelInput'
import { Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react'
import { useSession } from 'next-auth/react';
export default function ManageUsers() {
    const { data: session } = useSession();

    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showAlert, setShowAlert] = useState(false);
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
        try {
            const response = await fetch(`/api/user/findforroles?roles=REVISOR,AUTOR,COMITE`, {
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

    useEffect(() => {
        findUserforRole();
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

                                <FormLabelInput
                                    title={"Institucion"}
                                    children={<User className="absolute left-3 top-3 text-black" size={20} />}
                                    type={"text"} value={selectedUserEdit.institucion}
                                    change={(e) => setSelectedUserEdit({ ...selectedUserEdit, institucion: e.target.value })}
                                    placeholder={"Intituto Tecnologico de Toluca"}
                                    required={false}
                                />

                                <div>
                                    <label className="block text-sm font-medium text-black mb-2" >
                                        Rol del Usuario
                                    </label>

                                    <select
                                        value={selectedUserEdit.rol}
                                        onChange={(e) => setSelectedUserEdit({ ...selectedUserEdit, rol: e.target.value })}
                                        className="w-full pl-2 pr-4 py-3 border text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    >
                                        <option value="AUTOR">Autor</option>
                                        <option value="REVISOR">Revisor</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                                >
                                    {isLoading ? 'Actualizando...' : success ? 'Actualizado !!!' : 'Actualizar'}
                                </button>


                            </form>
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
            }

        </div >
    )
}
