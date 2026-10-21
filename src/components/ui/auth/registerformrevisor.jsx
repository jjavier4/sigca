'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, FileText, CreditCard, Loader2, CheckCircle } from 'lucide-react';
import FormLabelInput from '@/components/ui/form/FormLabelInput';
import Alert from '@/components/ui/utils/alert';

const LOGIN_PATH = '/login';
const RFC_REGEX = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
const CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;

const INITIAL_STATE = {
  nombre: '',
  apellidoP: '',
  apellidoM: '',
  rfc: '',
  curp: '',
  password: '',
  confirmPassword: '',
};

const userIcon = <User className="absolute left-3 top-3 text-black" size={20} />;
const mailIcon = <Mail className="absolute left-3 top-3 text-black" size={20} />;
const lockIcon = <Lock className="absolute left-3 top-3 text-black" size={20} />;
const fileIcon = <FileText className="absolute left-3 top-3 text-black" size={20} />;
const cardIcon = <CreditCard className="absolute left-3 top-3 text-black" size={20} />;

function validar(form, tipoIdentificacion) {
  if (form.password !== form.confirmPassword) return 'Las contraseñas no coinciden';
  if (form.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
  if (tipoIdentificacion === 'rfc' && !RFC_REGEX.test(form.rfc)) {
    return 'El RFC no tiene un formato válido. Ejemplo: PAJA850101XXX (12-13 caracteres)';
  }
  if (tipoIdentificacion === 'curp' && !CURP_REGEX.test(form.curp)) {
    return 'El CURP no tiene un formato válido. Debe tener 18 caracteres. Ejemplo: PAJA850101HMCLRV09';
  }
  return null;
}

export default function RegisterRevisorForm({ token, email }) {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL_STATE);
  const [tipoIdentificacion, setTipoIdentificacion] = useState('rfc');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(''), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => router.replace(LOGIN_PATH), 6000);
    return () => clearTimeout(timer);
  }, [success, router]);

  const update = (field, transform = (v) => v) => (e) =>
    setForm({ ...form, [field]: transform(e.target.value) });

  const toUpper = (v) => v.toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errorValidacion = validar(form, tipoIdentificacion);
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          apellidoP: form.apellidoP.trim(),
          apellidoM: form.apellidoM.trim(),
          email,
          tipoIdentificacion,
          rfc: tipoIdentificacion === 'rfc' ? form.rfc : null,
          curp: tipoIdentificacion === 'curp' ? form.curp : null,
          password: form.password,
          invitationToken: token,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || 'Error al registrar revisor');
        return;
      }

      setForm(INITIAL_STATE);
      setSuccess(
        '¡Registro exitoso! Hemos enviado un correo de verificación a tu email. Por favor verifica tu cuenta para poder iniciar sesión.'
      );
    } catch {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Alert type={error ? 'error' : 'success'} message={error || success} isVisible={!!(error || success)} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormLabelInput title="Nombre" children={userIcon} type="text" value={form.nombre} change={update('nombre')} placeholder="Juan" required />
        <FormLabelInput title="Apellido Paterno" children={userIcon} type="text" value={form.apellidoP} change={update('apellidoP')} placeholder="Pérez" required />
        <FormLabelInput title="Apellido Materno" children={userIcon} type="text" value={form.apellidoM} change={update('apellidoM')} placeholder="García" required />
        <FormLabelInput title="Email" children={mailIcon} type="email" value={email} change={() => {}} disabled />

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Identificación</label>
          <div className="flex gap-4 mb-3">
            {['rfc', 'curp'].map((tipo) => (
              <label key={tipo} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value={tipo}
                  checked={tipoIdentificacion === tipo}
                  onChange={(e) => setTipoIdentificacion(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">{tipo.toUpperCase()}</span>
              </label>
            ))}
          </div>
        </div>

        {tipoIdentificacion === 'rfc' ? (
          <FormLabelInput title="RFC" children={fileIcon} type="text" value={form.rfc} change={update('rfc', toUpper)} placeholder="PAJA850101XXX" required maxLength="13" />
        ) : (
          <FormLabelInput title="CURP" children={cardIcon} type="text" value={form.curp} change={update('curp', toUpper)} placeholder="PAJA850101HMCLRV09" required maxLength="18" />
        )}

        <FormLabelInput title="Contraseña" children={lockIcon} type="password" value={form.password} change={update('password')} placeholder="••••••••" required />
        <FormLabelInput title="Confirmar Contraseña" children={lockIcon} type="password" value={form.confirmPassword} change={update('confirmPassword')} placeholder="••••••••" required />

        <button
          type="submit"
          disabled={isLoading || !!success}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Registrando...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Registrarse como Revisor
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link href={LOGIN_PATH} className="text-blue-600 hover:text-blue-700 font-semibold">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </>
  );
}