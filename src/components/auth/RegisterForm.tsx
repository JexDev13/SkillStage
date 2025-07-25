import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader } from '../ui/card';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, User } from 'lucide-react';


interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormProps {
  onToggleMode: (mode: 'login' | 'register' | 'reset') => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleMode }) => {
  const { register: registerUser, signUpWithGoogle } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const onSubmit = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const success = await registerUser(data.email, data.password, data.name);
    if (success) {
      toast.success('Account created successfully!');
    } else {
      toast.error('Failed to create account');
    }
  };

  const inputClass = (error?: boolean) =>
    `w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition ${error
      ? 'border-red-500 focus:ring-red-400'
      : 'border-gray-300 dark:border-gray-700 focus:ring-[#1ea5b9]'
    }`;

  return (
    <div className="max-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-2xl rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <CardHeader className="text-center space-y-2 pt-6">
          <img src="/img/SKILLSTAGE.svg" alt="SkillStage Logo" className="mx-auto h-10 w-auto dark:invert" />
          <h2 className="text-2xl font-semibold text-[#1ea5b9]">Create Account</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Sign up to start learning</p>
        </CardHeader>

        <CardContent className="px-6 pb-6">
          <div className="flex items-center justify-center mb-4">
            <Button
              type="button"
              className="w-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium py-2 rounded-lg flex items-center justify-center gap-2"
              onClick={async () => {
                const success = await signUpWithGoogle();
                if (success) {
                  toast.success('Signed in with Google!');
                } else {
                  toast.error('Google sign-in failed');
                }
              }}
            >
              <img src="/img/google-icon.svg" alt="Google Icon" className="h-5 w-5" />
              Sign up with Google
            </Button>
          </div>

          <div className="flex items-center my-6">
            <hr className="flex-grow border-t border-gray-300 dark:border-gray-700" />
            <span className="px-4 text-sm text-gray-500 dark:text-gray-400 font-medium">OR</span>
            <hr className="flex-grow border-t border-gray-300 dark:border-gray-700" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Full Name"
                style={{ paddingLeft: '2.5rem' }}
                className={inputClass(!!errors.name)}
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                })}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="email"
                placeholder="Email"
                className={inputClass(!!errors.email)}
                style={{ paddingLeft: '2.5rem' }}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="password"
                placeholder="Password"
                className={inputClass(!!errors.password)}
                style={{ paddingLeft: '2.5rem' }}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Minimum 6 characters',
                  },
                })}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="password"
                placeholder="Confirm Password"
                className={inputClass(!!errors.confirmPassword)}
                style={{ paddingLeft: '2.5rem' }}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === watch('password') || 'Passwords do not match',
                })}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#1ea5b9] hover:bg-[#1a8fa0] text-white font-semibold py-2 rounded-lg"
            >
              Sing up
            </Button>
          </form>


          <div className="mt-5 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
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
