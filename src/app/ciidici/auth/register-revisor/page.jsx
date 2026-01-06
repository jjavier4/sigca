'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, Lock, User, FileText, CreditCard, Loader2, XCircle, CheckCircle } from 'lucide-react';
import FormLabelInput from '@/components/ui/form/FormLabelInput';
import Alert from '@/components/ui/utils/alert';

export default function RegistroRevisorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [emailFromToken, setEmailFromToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tipoIdentificacion, setTipoIdentificacion] = useState('rfc');

  const [registerData, setRegisterData] = useState({
    nombre: '',
    apellidoP: '',
    apellidoM: '',
    email: '',
    rfc: '',
    curp: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!token) {
      setIsValidatingToken(false);
      setTokenValid(false);
      setError('No se proporcionó un token de invitación válido');
      return;
    }

    validarTokenInvitacion();
  }, [token]);

  const validarTokenInvitacion = async () => {
    try {
      const response = await fetch(`/api/auth/validate-invitation-token?token=${token}`);
      const data = await response.json();

      if (response.ok && data.valid) {
        setTokenValid(true);
        setEmailFromToken(data.email);
        setRegisterData(prev => ({ ...prev, email: data.email }));
      } else {
        setTokenValid(false);
        setError(data.error || 'El enlace de invitación es inválido o ha expirado');
      }
    } catch (err) {
      setTokenValid(false);
      setError('Error al validar la invitación');
    } finally {
      setIsValidatingToken(false);
    }
  };

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

    if (registerData.email.toLowerCase() !== emailFromToken.toLowerCase()) {
      setError('El correo electrónico no coincide con la invitación');
      setIsLoading(false);
      return;
    }

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
          rol: 'REVISOR', 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al registrar revisor');
        throw new Error(data.error || 'Error al registrar revisor');
      }

      setSuccess('¡Registro exitoso! Hemos enviado un correo de verificación a tu email. Por favor verifica tu cuenta para poder iniciar sesión.');


      setRegisterData({
        nombre: '',
        apellidoP: '',
        apellidoM: '',
        email: emailFromToken, 
        rfc: '',
        curp: '',
        password: '',
        confirmPassword: '',
      });


      setTimeout(() => {
        router.push('/ciidici/auth');
      }, 6000);

    } catch (err) {
      setError(err.message || 'Error al registrar revisor');
    } finally {
      setIsLoading(false);
    }
  };

  
  if (isValidatingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <Loader2 color="blue" className="w-16 h-16  mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Validando invitación...
          </h2>
          <p className="text-gray-600">Por favor espera un momento</p>
        </div>
      </div>
    );
  }


  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <XCircle color='red' className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Invitación Inválida
          </h2>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              El enlace de invitación puede haber expirado o ser inválido. Por favor contacte al comité organizador para solicitar una nueva invitación.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Registro de Revisor</h1>
          <p className="text-pink-100">CIIDiCI - Instituto Tecnológico de Toluca</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6  border-l-4 border-blue-600 p-4 rounded">
            <p className="text-sm text-gray-700">
              <strong>Correo de invitación:</strong> {emailFromToken}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Complete el formulario para registrarse como revisor académico
            </p>
          </div>

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
              placeholder={emailFromToken}
              required={true}
              disabled={true}
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
                    className="w-4 h-4 "
                  />
                  <span className="text-sm text-gray-700">RFC</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="curp"
                    checked={tipoIdentificacion === 'curp'}
                    onChange={(e) => setTipoIdentificacion(e.target.value)}
                    className="w-4 h-4 "
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
              <button
                onClick={() => router.push('/ciidici/auth')}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}