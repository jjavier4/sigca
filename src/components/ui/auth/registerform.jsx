'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { Mail, Lock, User, FileText, CreditCard, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FormLabelInput from '@/components/ui/form/FormLabelInput';
import Alert from '@/components/ui/utils/alert';

export default function Registerform() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [tipoIdentificacion, setTipoIdentificacion] = useState('rfc'); 
    const [isAlumno, setIsAlumno] = useState(false);
    const [registerData, setRegisterData] = useState({
        nombre: '',
        apellidoP: '',
        apellidoM: '',
        email: '',
        rfc: '',
        curp: '',
        numero_control: '',
        password: '',
        confirmPassword: '',
    });
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError('');
                setSuccess('');
            }, 5000);
            setIsLoading(false);
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

        if (isAlumno) {
            const regex = /^\d{8}$/;
            if (!regex.test(registerData.numero_control)) {
                setError('Debes proporcionar tu Número de Control como alumno');
                setIsLoading(false);
                return;
            }
        }
        function capitalizarPrimeraLetra(str) {
            if (!str) return ""; // Manejar cadenas vacías o nulas
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
        const dataRegister = {
            nombre: capitalizarPrimeraLetra(registerData.nombre.trim()),
            apellidoP: capitalizarPrimeraLetra(registerData.apellidoP.trim()),
            apellidoM: capitalizarPrimeraLetra(registerData.apellidoM.trim()),
            email: registerData.email,
            tipoIdentificacion: tipoIdentificacion,
            rfc: tipoIdentificacion === 'rfc' ? registerData.rfc.toUpperCase() : null,
            curp: tipoIdentificacion === 'curp' ? registerData.curp.toUpperCase() : null,
            password: registerData.password,
            numero_control: isAlumno ? registerData.numero_control : null
        }
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataRegister),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Error al registrar usuario');
                throw new Error(data.error || 'Error al registrar usuario');
            }

            setSuccess(`¡Registro exitoso! Hemos enviado un correo de verificación a ${registerData.email}. Por favor revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.`);

            setRegisterData({
                nombre: '',
                apellidoP: '',
                apellidoM: '',
                email: '',
                rfc: '',
                curp: '',
                password: '',
                confirmPassword: '',
                numero_control: '',
            });
            setIsAlumno(false);

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
        <div className="max-w-md w-full">
            <Alert
                type={error ? 'error' : 'success'}
                message={error || success}
                isVisible={error || success}
            />

            <form onSubmit={handleRegister} className="space-y-4">
                <FormLabelInput
                    title="Nombre"
                    children={<User className="absolute left-3 top-3 text-black" size={20} />}
                    type="text"
                    value={registerData.nombre}
                    change={(e) => setRegisterData({ ...registerData, nombre: e.target.value })}
                    placeholder="Juan"
                    required={true}
                />

                <FormLabelInput
                    title="Apellido Paterno"
                    children={<User className="absolute left-3 top-3 text-black" size={20} />}
                    type="text"
                    value={registerData.apellidoP}
                    change={(e) => setRegisterData({ ...registerData, apellidoP: e.target.value })}
                    placeholder="Pérez"
                    required={true}
                />

                <FormLabelInput
                    title="Apellido Materno"
                    children={<User className="absolute left-3 top-3 text-black" size={20} />}
                    type="text"
                    value={registerData.apellidoM}
                    change={(e) => setRegisterData({ ...registerData, apellidoM: e.target.value })}
                    placeholder="García"
                    required={true}
                />

                <FormLabelInput
                    title="Email"
                    children={<Mail className="absolute left-3 top-3 text-black" size={20} />}
                    type="email"
                    value={registerData.email}
                    change={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder="tu@email.com"
                    required={true}
                />

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

                <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        ¿Eres alumno?
                    </label>
                    <div className="flex gap-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                value="si"
                                checked={isAlumno}
                                onChange={() => setIsAlumno(!isAlumno)}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm text-gray-700">Sí</span>
                        </label>
                    </div>
                </div>

                {
                    isAlumno && (
                        <FormLabelInput
                            title="Número de Control"
                            children={<CreditCard className="absolute left-3 top-3 text-black" size={20} />}
                            type="text"
                            value={registerData.numero_control}
                            change={(e) => setRegisterData({ ...registerData, numero_control: e.target.value })}
                            placeholder="12345678"
                            required={true}
                        />
                    )
                }


                <FormLabelInput
                    title="Contraseña"
                    children={<Lock className="absolute left-3 top-3 text-black" size={20} />}
                    type="password"
                    value={registerData.password}
                    change={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="••••••••"
                    required={true}
                />

                <FormLabelInput
                    title="Confirmar Contraseña"
                    children={<Lock className="absolute left-3 top-3 text-black" size={20} />}
                    type="password"
                    value={registerData.confirmPassword}
                    change={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    required={true}
                />

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                >
                    {isLoading ? 'Registrando...' : success ? '¡Registrado!' : 'Registrarse'}
                </button>
            </form>
        </div>
    )
}
