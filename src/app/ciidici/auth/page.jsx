'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Mail, Lock, User, AlertCircle, CheckCircle, FileText, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FormLabelInput from '@/components/ui/FormLabelInput';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tipoIdentificacion, setTipoIdentificacion] = useState('rfc'); // 'rfc' o 'curp'
  
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
    institucion: '',
    password: '',
    confirmPassword: '',
  });

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
      
      console.log('Resultado de signIn:', result);
      
      if (result?.error) {
        setError('Credenciales incorrectas. Verifica tu email y contraseña.');
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

    // Validar según el tipo de identificación seleccionado
    if (tipoIdentificacion === 'rfc') {
      const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
      if (!rfcRegex.test(registerData.rfc.toUpperCase())) {
        setError('El RFC no tiene un formato válido. Ejemplo: PAJA850101XXX (12-13 caracteres)');
        setIsLoading(false);
        return;
      }
    } else {
      const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}\d{3}$/;
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
          institucion: registerData.institucion,
          password: registerData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
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
        institucion: '',
        password: '',
        confirmPassword: '',
      });

      setTimeout(() => {
        setIsLogin(true);
        setSuccess('');
      }, 6000);

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
                title="Institución"
                children={<User className="absolute left-3 top-3 text-black" size={20} />}
                type="text"
                value={registerData.institucion}
                change={(e) => setRegisterData({ ...registerData, institucion: e.target.value })}
                placeholder="Instituto Tecnológico de Toluca"
                required={true}
              />

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