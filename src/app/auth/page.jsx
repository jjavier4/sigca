'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Building, AlertCircle, CheckCircle } from 'lucide-react';
import FormLabelInput from '@/components/ui/formLabel';
export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    nombre: '',
    apellidoP: '',
    apellidoM: '',
    email: '',
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

      if (result?.error) {
        setError('Credenciales incorrectas. Verifica tu email y contraseña.');
      } else {
        router.push('/dashboard');
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

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: registerData.nombre,
          apellido: registerData.apellido,
          email: registerData.email,
          institucion: registerData.institucion,
          password: registerData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar usuario');
      }

      setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');

      setRegisterData({
        nombre: '',
        apellido: '',
        email: '',
        institucion: '',
        password: '',
        confirmPassword: '',
      });

      setTimeout(() => {
        setIsLogin(true);
        setSuccess('');
      }, 2000);

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
                title={"Correo Electrónico"}
                children={<Mail className="absolute left-3 top-3 text-black" size={20} />}
                type={"email"} value={loginData.email}
                change={(e) => setLoginData({ ...loginData, email: e.target.value })}
                placeholder={"tu@email.com"}
                required={true}
              />

              <FormLabelInput
                title={"Contraseña"}
                children={<Lock className="absolute left-3 top-3 text-black" size={20} />}
                type={"password"} value={loginData.password}
                change={(e) => setLoginData({ ...loginData, password: e.target.value })}
                placeholder={"••••••••"}
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
                change={(e) => setLoginData({ ...registerData, password: e.target.value })}
                placeholder={"••••••••"}
                required={true}
              />

              <FormLabelInput
                title={"Confirmar Contraseña"}
                children={<Lock className="absolute left-3 top-3 text-black" size={20} />}
                type={"password"} value={registerData.confirmPassword}
                change={(e) => setLoginData({ ...registerData, confirmPassword: e.target.value })}
                placeholder={"••••••••"}
                required={true}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-all duration-300"
              >
                {isLoading ? 'Registrando...' : 'Registrarse'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}