'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { Mail, Lock,Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FormLabelInput from '@/components/ui/form/FormLabelInput';
import Alert from '@/components/ui/utils/alert';

export default function Loginform() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resetPasswordModal, setResetPasswordModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Se ha enviado un enlace de restablecimiento a tu correo electrónico. Por favor revisa tu bandeja de entrada.');
            } else {
                setError(data.error);

            }
        } catch (err) {
            console.error('Error al solicitar restablecimiento de contraseña:', err);
            setError('Ocurrió un error al solicitar el restablecimiento de contraseña. Intenta nuevamente.');
        } finally {
            setResetEmail('');
            setTimeout(() => {
                setResetPasswordModal(false);
            }, 5000);
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
                        const resendResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/resend-verification`, {
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
                } else if (result.error === 'CUENTA_BLOQUEADA') {
                    setError('Tu cuenta está bloqueada. Contacta al administrador.');
                } else if (result.error === 'RATE_LIMIT') {
                    setError('Demasiados intentos fallidos. Espera unos minutos antes de volver a intentarlo.');
                } else {
                    setError('Credenciales incorrectas. Verifica tu email y contraseña.');
                }
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (err) {
            setError('Ocurrió un error. Intenta nuevamente.');
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
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-all duration-300 items-center justify-center flex gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={20} className=" text-white  animate-spin" />
                                    Iniciando sesión
                                </>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setResetPasswordModal(true)}
                            className="w-full text-blue-600 hover:text-blue-800 font-medium"
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </form>


                </div>
    );
}
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