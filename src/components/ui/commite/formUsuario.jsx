'use client';
import React, { useState } from 'react';
import { Mail, Lock, User, FileText, CreditCard } from 'lucide-react';
import FormLabelInput from '@/components/ui/form/FormLabelInput';
import Alert from '@/components/ui/utils/alert';
import useAccion from '@/hooks/useAccion';
import { crearUsuario } from '@/actions/usuarios';

const RFC_REGEX = /^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/;
const CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;

const USUARIO_VACIO = {
    nombre: '',
    apellidoP: '',
    apellidoM: '',
    email: '',
    rfc: '',
    curp: '',
    password: '',
    confirmPassword: '',
    rol: 'REVISOR',
};

function errorDelFormulario(datos, tipoIdentificacion) {
    if (datos.password !== datos.confirmPassword) return 'Las contraseñas no coinciden';
    if (datos.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    if (tipoIdentificacion === 'rfc' && !RFC_REGEX.test(datos.rfc)) {
        return 'El RFC no tiene un formato válido. Debe tener 13 caracteres. Ejemplo: PAJA850101XXX';
    }
    if (tipoIdentificacion === 'curp' && !CURP_REGEX.test(datos.curp)) {
        return 'El CURP no tiene un formato válido. Debe tener 18 caracteres. Ejemplo: PAJA850101HMCLRV09';
    }
    return null;
}

export default function FormUsuario() {
    const [tipoIdentificacion, setTipoIdentificacion] = useState('rfc');
    const [datos, setDatos] = useState(USUARIO_VACIO);
    const { ejecutar, pendiente, alerta } = useAccion();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const error = errorDelFormulario(datos, tipoIdentificacion);
        if (error) {
            await ejecutar(async () => ({ ok: false, error }));
            return;
        }

        const resultado = await ejecutar(() =>
            crearUsuario({
                nombre: datos.nombre,
                apellidoP: datos.apellidoP,
                apellidoM: datos.apellidoM,
                email: datos.email,
                tipoIdentificacion,
                rfc: tipoIdentificacion === 'rfc' ? datos.rfc : null,
                curp: tipoIdentificacion === 'curp' ? datos.curp : null,
                password: datos.password,
                rol: datos.rol,
            })
        );

        if (resultado?.ok) setDatos(USUARIO_VACIO);
    };

    return (
        <div className='flex flex-col items-center w-full max-w-1/2 mx-auto p-6 bg-white rounded-lg shadow-md'>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Agregar Nuevo Usuario</h2>
            <Alert {...alerta} />
            <form onSubmit={handleSubmit} className="space-y-4 w-full" >
                <FormLabelInput
                    title={"Nombre"}
                    children={<User className="absolute left-3 top-3 text-black" size={20} />}
                    type={"text"} value={datos.nombre}
                    change={(e) => setDatos({ ...datos, nombre: e.target.value })}
                    placeholder={"Juan"}
                    required={true}
                />
                <FormLabelInput
                    title={"Apellido Paterno"}
                    children={<User className="absolute left-3 top-3 text-black" size={20} />}
                    type={"text"} value={datos.apellidoP}
                    change={(e) => setDatos({ ...datos, apellidoP: e.target.value })}
                    placeholder={"Perez"}
                    required={true}
                />

                <FormLabelInput
                    title={"Apellido Materno"}
                    children={<User className="absolute left-3 top-3 text-black" size={20} />}
                    type={"text"} value={datos.apellidoM}
                    change={(e) => setDatos({ ...datos, apellidoM: e.target.value })}
                    placeholder={"Perez"}
                    required={true}
                />

                <FormLabelInput
                    title={"Email"}
                    children={<Mail className="absolute left-3 top-3 text-black" size={20} />}
                    type={"email"} value={datos.email}
                    change={(e) => setDatos({ ...datos, email: e.target.value })}
                    placeholder={"tu@email.com"}
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
                        value={datos.rfc}
                        change={(e) => setDatos({ ...datos, rfc: e.target.value.toUpperCase() })}
                        placeholder="PAJA850101XXX"
                        required={true}
                        maxLength="13"
                    />
                ) : (
                    <FormLabelInput
                        title="CURP"
                        children={<CreditCard className="absolute left-3 top-3 text-black" size={20} />}
                        type="text"
                        value={datos.curp}
                        change={(e) => setDatos({ ...datos, curp: e.target.value.toUpperCase() })}
                        placeholder="PAJA850101HMCLRV09"
                        required={true}
                        maxLength="18"
                    />
                )}
                <FormLabelInput
                    title={"Contraseña"}
                    children={<Lock className="absolute left-3 top-3 text-black" size={20} />}
                    type={"password"} value={datos.password}
                    change={(e) => setDatos({ ...datos, password: e.target.value })}
                    placeholder={"••••••••"}
                    required={true}
                />

                <FormLabelInput
                    title={"Confirmar Contraseña"}
                    children={<Lock className="absolute left-3 top-3 text-black" size={20} />}
                    type={"password"} value={datos.confirmPassword}
                    change={(e) => setDatos({ ...datos, confirmPassword: e.target.value })}
                    placeholder={"••••••••"}
                    required={true}
                />
                <div>
                    <label className="block text-sm font-medium text-black mb-2" >
                        Rol del Usuario
                    </label>

                    <select
                        value={datos.rol}
                        onChange={(e) => setDatos({ ...datos, rol: e.target.value })}
                        className="w-full pl-2 pr-4 py-3 border text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    >
                        <option value="REVISOR">Revisor</option>
                        <option value="AUTOR">Autor</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={pendiente}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                >
                    {pendiente ? 'Registrando...' : 'Registrar Usuario'}
                </button>
            </form>
        </div>
    )
}
