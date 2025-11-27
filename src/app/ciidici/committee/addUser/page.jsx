"use client"
import React, { useState } from 'react'
import { signIn } from 'next-auth/react';
import { Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FormLabelInput from '@/components/ui/form/FormLabelInput';

export default function AddUser() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
 
    const [registerData, setRegisterData] = useState({
        nombre: '',
        apellidoP: '',
        apellidoM: '',
        email: '',
        institucion: '',
        password: '',
        confirmPassword: '',
        rol: 'AUTOR',
    });

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        if (registerData.password !== registerData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            setIsLoading(false);
            return;
        }

        if (registerData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/user/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: registerData.nombre,
                    apellidoP: registerData.apellidoP,
                    apellidoM: registerData.apellidoM,
                    email: registerData.email,
                    institucion: registerData.institucion,
                    password: registerData.password,
                    rol:registerData.rol,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al registrar usuario');
            }

            setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');

            setRegisterData({
                nombre: '',
                apellidoP: '',
                apellidoM: '',
                email: '',
                institucion: '',
                password: '',
                confirmPassword: '',
                rol: 'AUTOR',
            });

            setTimeout(() => {
                setSuccess('');
            }, 5000);

        } catch (err) {
            setError(err.message || 'Error al registrar usuario');
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className='flex flex-col items-center w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md'>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Agregar Nuevo Usuario</h2>
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-red-800 text-sm">{error}</p>
                </div>
            )}

            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-green-800 text-sm">{success}</p>
                </div>
            )}
            <form onSubmit={handleRegister} className="space-y-4">

                {/* Registration Form */}
                <FormLabelInput
                    title={"Nombre"}
                    children={<User className="absolute left-3 top-3 text-black" size={20} />}
                    type={"text"} value={registerData.nombre}
                    change={(e) => setRegisterData({ ...registerData, nombre: e.target.value })}
                    placeholder={"Juan"}
                    required={true}
                />
                <FormLabelInput
                    title={"Apellido Paterno"}
                    children={<User className="absolute left-3 top-3 text-black" size={20} />}
                    type={"text"} value={registerData.apellidoP}
                    change={(e) => setRegisterData({ ...registerData, apellidoP: e.target.value })}
                    placeholder={"Perez"}
                    required={true}
                />

                <FormLabelInput
                    title={"Apellido Materno"}
                    children={<User className="absolute left-3 top-3 text-black" size={20} />}
                    type={"text"} value={registerData.apellidoM}
                    change={(e) => setRegisterData({ ...registerData, apellidoM: e.target.value })}
                    placeholder={"Perez"}
                    required={true}
                />

                <FormLabelInput
                    title={"Email"}
                    children={<Mail className="absolute left-3 top-3 text-black" size={20} />}
                    type={"email"} value={registerData.email}
                    change={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder={"tu@email.com"}
                    required={true}
                />

                <FormLabelInput
                    title={"Institucion"}
                    children={<User className="absolute left-3 top-3 text-black" size={20} />}
                    type={"text"} value={registerData.institucion}
                    change={(e) => setRegisterData({ ...registerData, institucion: e.target.value })}
                    placeholder={"Intituto Tecnologico de Toluca"}
                    required={true}
                />

                <FormLabelInput
                    title={"Contraseña"}
                    children={<Lock className="absolute left-3 top-3 text-black" size={20} />}
                    type={"password"} value={registerData.password}
                    change={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder={"••••••••"}
                    required={true}
                />

                <FormLabelInput
                    title={"Confirmar Contraseña"}
                    children={<Lock className="absolute left-3 top-3 text-black" size={20} />}
                    type={"password"} value={registerData.confirmPassword}
                    change={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    placeholder={"••••••••"}
                    required={true}
                />
                <div>
                    <label className="block text-sm font-medium text-black mb-2" >
                        Rol del Usuario
                    </label>

                    <select
                        value={registerData.rol}
                        onChange={(e) => setRegisterData({ ...registerData, rol: e.target.value })}
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
                    {isLoading ? 'Registrando...' : success ? 'Registrado !!!' : 'Registrarse'}
                </button>
            </form>



        </div>
    )
}
