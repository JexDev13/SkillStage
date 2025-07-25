import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader } from '../ui/card';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock } from 'lucide-react';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onToggleMode: (mode: 'register' | 'reset') => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const success = await login(data.email, data.password);
      if (success) {
        toast.success('Welcome back!');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (error?: boolean) =>
    `w-full pl-11 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition ${error
      ? 'border-red-500 focus:ring-red-400'
      : 'border-gray-300 dark:border-gray-700 focus:ring-[#1ea5b9]'
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-2xl rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <CardHeader className="text-center space-y-2 pt-6">
          <img
            src="/img/SKILLSTAGE.svg"
            alt="SkillStage Logo"
            className="mx-auto h-10 w-auto dark:invert"
          />
          <h2 className="text-2xl font-semibold text-[#1ea5b9] dark:text-[#1ea5b9]">Welcome Back</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Sign in to continue learning</p>
        </CardHeader>

        <CardContent className="px-6 pb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="email"
                placeholder="Email"
                className={inputClass(!!errors.email)}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="password"
                placeholder="Password"
                className={inputClass(!!errors.password)}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1ea5b9] hover:bg-[#1a8fa0] transition text-white font-semibold py-2 rounded-lg"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={() => onToggleMode('reset')}
              className="text-sm text-[#1ea5b9] hover:underline font-medium"
            >
              Forgot your password?
            </button>
          </div>

          <div className="mt-5 text-center text-sm text-gray-600 dark:text-gray-400">
            Don’t have an account?{' '}
            <button
              onClick={() => onToggleMode('register')}
              className="text-[#1ea5b9] hover:underline font-medium"
            >
              Sign up
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
