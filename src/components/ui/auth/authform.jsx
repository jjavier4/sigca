'use client';

import { useState } from 'react';
import LoginForm from '@/components/ui/auth/loginform';
import RegisterForm from '@/components/ui/auth/registerform';

const TABS = [
  { id: 'login', label: 'Iniciar Sesión' },
  { id: 'register', label: 'Registrarse' },
];

export default function AuthForm() {
  const [tab, setTab] = useState('login');

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all duration-300 ${
              tab === id ? 'bg-white text-blue-900 shadow-md' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'login' ? <LoginForm /> : <RegisterForm />}
    </div>
  );
}