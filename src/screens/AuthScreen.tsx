import React, { useState } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm'; 

type AuthMode = 'login' | 'register' | 'reset';

export const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1ea5b9] to-[#1ea5b9]/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {mode === 'login' && <LoginForm onToggleMode={setMode} />}
        {mode === 'register' && <RegisterForm onToggleMode={setMode} />}
        {mode === 'reset' && <ResetPasswordForm onToggleMode={setMode} />}
      </div>
    </div>
  );
};
