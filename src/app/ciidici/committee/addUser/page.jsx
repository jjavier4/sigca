"use client"
import React, { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react';
import { Mail, Lock, User, AlertCircle, CheckCircle, FileText, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FormLabelInput from '@/components/ui/form/FormLabelInput';
import Alert from '@/components/ui/utils/alert';
export default function AddUser() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [tipoIdentificacion, setTipoIdentificacion] = useState('rfc'); // 'rfc' o 'curp'
    const [registerData, setRegisterData] = useState({
        nombre: '',
        apellidoP: '',
        apellidoM: '',
        email: '',
        rfc: '',
        curp: '',
        password: '',
        confirmPassword: '',
        rol: 'AUTOR', // Rol por defecto
    });
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError('');
                setSuccess('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);
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

        // Validar según el tipo de identificación seleccionado
        if (tipoIdentificacion === 'rfc') {
            const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
            if (!rfcRegex.test(registerData.rfc.toUpperCase())) {
                setError('El RFC no tiene un formato válido. Ejemplo: PAJA850101XXX (12-13 caracteres)');
                setIsLoading(false);
                return;
            }
        } else {
            const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;
            if (!curpRegex.test(registerData.curp.toUpperCase())) {
                setError('El CURP no tiene un formato válido. Debe tener 18 caracteres. Ejemplo: PAJA850101HMCLRV09');
                setIsLoading(false);
                return;
            }
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
                    tipoIdentificacion: tipoIdentificacion,
                    rfc: tipoIdentificacion === 'rfc' ? registerData.rfc.toUpperCase() : null,
                    curp: tipoIdentificacion === 'curp' ? registerData.curp.toUpperCase() : null,
                    password: registerData.password,
                    rol:registerData.rol
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Error al registrar usuario');
                throw new Error(data.error || 'Error al registrar usuario');
            }

            setSuccess(`¡Registro exitoso! Tu ID de usuario es: ${data.user.id}. Ahora puedes iniciar sesión.`);

            setRegisterData({
                nombre: '',
                apellidoP: '',
                apellidoM: '',
                email: '',
                rfc: '',
                curp: '',
                password: '',
                confirmPassword: '',
                rol: 'AUTOR', // Rol por defecto
            });
        } catch (err) {
            setError(err.message || 'Error al registrar usuario');
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className='flex flex-col items-center w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md'>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Agregar Nuevo Usuario</h2>
            {/* Alertas */}
            <Alert
                type={error ? 'error' : 'success'}
                message={error || success}
                isVisible={error || success}
            />
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
                {/* Selector de tipo de identificación */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tipo de Identificación
                    </label>
                    <div className="flex gap-4 mb-3">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                value="rfc"
                                checked={tipoIdentificacion === 'rfc'}
                                onChange={(e) => setTipoIdentificacion(e.target.value)}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm text-gray-700">RFC</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                value="curp"
                                checked={tipoIdentificacion === 'curp'}
                                onChange={(e) => setTipoIdentificacion(e.target.value)}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm text-gray-700">CURP</span>
                        </label>
                    </div>
                </div>

                {/* Mostrar campo RFC o CURP según selección */}
                {tipoIdentificacion === 'rfc' ? (
                    <FormLabelInput
                        title="RFC"
                        children={<FileText className="absolute left-3 top-3 text-black" size={20} />}
                        type="text"
                        value={registerData.rfc}
                        change={(e) => setRegisterData({ ...registerData, rfc: e.target.value.toUpperCase() })}
                        placeholder="PAJA850101XXX"
                        required={true}
                        maxLength="13"
                    />
                ) : (
                    <FormLabelInput
                        title="CURP"
                        children={<CreditCard className="absolute left-3 top-3 text-black" size={20} />}
                        type="text"
                        value={registerData.curp}
                        change={(e) => setRegisterData({ ...registerData, curp: e.target.value.toUpperCase() })}
                        placeholder="PAJA850101HMCLRV09"
                        required={true}
                        maxLength="18"
                    />
                )}
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
                        <option value="COMITE">Comite</option>
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
