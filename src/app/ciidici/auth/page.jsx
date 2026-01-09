'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { Mail, Lock, User, FileText, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FormLabelInput from '@/components/ui/form/FormLabelInput';
import Alert from '@/components/ui/utils/alert';

const ResetPasswordModalComponent = ({
  resetEmail,
  setResetEmail,
  resetPassword,
  isResetting,
  setResetPasswordModal,
  setError,
  setSuccess,
  error,
  success
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md text-black">
        <h2 className="text-2xl font-bold mb-2">Restablecer Contraseña</h2>
        <p className="text-gray-600 mb-4 text-sm">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        <Alert
          type={error ? 'error' : 'success'}
          message={error || success}
          isVisible={error || success}
        />

        <form onSubmit={resetPassword} className="space-y-4 mt-4">
          <FormLabelInput
            title="Correo Electrónico"
            children={<Mail className="absolute left-3 top-3 text-black" size={20} />}
            type="email"
            value={resetEmail}
            change={(e) => setResetEmail(e.target.value)}
            placeholder="tu@email.com"
            required={true}
          />

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={isResetting}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition-all duration-300"
            >
              {isResetting ? 'Enviando...' : 'Enviar Enlace'}
            </button>
            <button
              type="button"
              onClick={() => {
                setResetPasswordModal(false);
                setResetEmail('');
                setError('');
                setSuccess('');
              }}
              disabled={isResetting}
              className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 rounded-lg font-semibold transition-all duration-300"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tipoIdentificacion, setTipoIdentificacion] = useState('rfc'); // 'rfc' o 'curp'
  const [resetPasswordModal, setResetPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

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
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      setIsLoading(false);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const resetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsResetting(true);

    if (!resetEmail) {
      setError('Por favor ingresa tu correo electrónico');
      setIsResetting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      setError('Por favor ingresa un correo electrónico válido');
      setIsResetting(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Se ha enviado un enlace de restablecimiento a tu correo electrónico. Por favor revisa tu bandeja de entrada.');
        setResetEmail('');
        setTimeout(() => {
          setResetPasswordModal(false);
        }, 3000);
      } else {
        setError(data.error || 'Error al solicitar restablecimiento de contraseña');
      }
    } catch (err) {
      console.error('Error al solicitar restablecimiento de contraseña:', err);
      setError('Ocurrió un error al solicitar el restablecimiento de contraseña. Intenta nuevamente.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: loginData.email,
        password: loginData.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === 'CUENTA_NO_VERIFICADA') {
          setError('Tu cuenta no está verificada. Revisa tu correo electrónico.');

          try {
            const resendResponse = await fetch('/api/auth/resend-verification', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: loginData.email }),
            });

            const resendData = await resendResponse.json();

            if (resendResponse.ok) {
              setSuccess('Se ha enviado un nuevo enlace de verificación a tu correo.');
            } else {
              setError(`Tu cuenta no está verificada. ${resendData.error}`);
            }
          } catch (resendError) {
            console.error('Error al reenviar verificación:', resendError);
            setError('Tu cuenta no está verificada. No se pudo enviar el correo de verificación.');
          }
        } else {
          setError('Credenciales incorrectas. Verifica tu email y contraseña.');
        }
      } else {
        router.push('/ciidici');
        router.refresh();
      }
    } catch (err) {
      setError('Ocurrió un error. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

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
          rol: 'AUTOR', // Rol por defecto
        }),
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">SIGCA</h1>
          <p className="text-blue-200">Sistema de Gestión de Conferencias Académicas</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all duration-300 ${isLogin
                ? 'bg-white text-blue-900 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all duration-300 ${!isLogin
                ? 'bg-white text-blue-900 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Registrarse
            </button>
          </div>

          <Alert
            type={error ? 'error' : 'success'}
            message={error || success}
            isVisible={error || success}
          />

          {resetPasswordModal && (
            <ResetPasswordModalComponent
              resetEmail={resetEmail}
              setResetEmail={setResetEmail}
              resetPassword={resetPassword}
              isResetting={isResetting}
              setResetPasswordModal={setResetPasswordModal}
              setError={setError}
              setSuccess={setSuccess}
              error={error}
              success={success}
            />
          )}

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <FormLabelInput
                title="Correo Electrónico"
                children={<Mail className="absolute left-3 top-3 text-black" size={20} />}
                type="email"
                value={loginData.email}
                change={(e) => setLoginData({ ...loginData, email: e.target.value })}
                placeholder="tu@email.com"
                required={true}
              />

              <FormLabelInput
                title="Contraseña"
                children={<Lock className="absolute left-3 top-3 text-black" size={20} />}
                type="password"
                value={loginData.password}
                change={(e) => setLoginData({ ...loginData, password: e.target.value })}
                placeholder="••••••••"
                required={true}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-all duration-300"
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>

              <button
                type="button"
                onClick={() => setResetPasswordModal(true)}
                className="w-full text-blue-600 hover:text-blue-800 font-medium"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </form>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}