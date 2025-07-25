import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader } from '../ui/card';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';

interface ResetFormData {
  email: string;
}

interface ResetPasswordFormProps {
  onToggleMode: (mode: 'login' | 'register' | 'reset') => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onToggleMode }) => {
  const { resetPassword } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>();

  const onSubmit = async (data: ResetFormData) => {
    const success = await resetPassword(data.email);
    if (success) {
      toast.success('Password reset email sent.');
    } else {
      toast.error('Failed to send reset email.');
    }
  };

  const inputClass = (error?: boolean) =>
    `w-full pl-11 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition ${
      error
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
          <h2 className="text-2xl font-semibold text-[#1ea5b9]">Reset Password</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">We'll send you instructions by email</p>
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

            <Button
              type="submit"
              className="w-full bg-[#1ea5b9] hover:bg-[#1a8fa0] text-white font-semibold py-2 rounded-lg"
            >
              Send Reset Email
            </Button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-600 dark:text-gray-400">
            Remembered your password?{' '}
            <button
              onClick={() => onToggleMode('login')}
              className="text-[#1ea5b9] hover:underline font-medium"
            >
              Back to login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
