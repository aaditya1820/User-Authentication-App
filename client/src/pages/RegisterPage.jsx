import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import zxcvbn from 'zxcvbn';
import AuthLayout from '../components/AuthLayout';
import api from '../api/axios';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');

  useEffect(() => {
    if (password) {
      setPasswordScore(zxcvbn(password).score);
    } else {
      setPasswordScore(0);
    }
  }, [password]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await api.post('/auth/register', data);
      toast.success('Registration successful! Please verify your email.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = () => {
    switch (passwordScore) {
      case 0: return 'bg-neutral-200';
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-green-500';
      default: return 'bg-neutral-200';
    }
  };

  return (
    <AuthLayout title="Get Started" subtitle="Create your secure account in seconds">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-neutral-700 ml-1">Full Name</label>
          <input
            {...register('name')}
            autoComplete="name"
            className={`input-field ${errors.name ? 'border-red-500' : ''}`}
            placeholder="Your Name"
          />
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-neutral-700 ml-1">Email Address</label>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            className={`input-field ${errors.email ? 'border-red-500' : ''}`}
            placeholder="Enter Email"
          />
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-1 relative">
          <label className="text-sm font-semibold text-neutral-700 ml-1">Password</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={`input-field pr-12 ${errors.password ? 'border-red-500' : ''}`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {}
          <div className="h-1.5 w-full bg-neutral-100 rounded-full mt-2 overflow-hidden flex space-x-0.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`h-full flex-1 transition-colors ${i < passwordScore ? getStrengthColor() : 'bg-neutral-200'}`}></div>
            ))}
          </div>
          {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-neutral-700 ml-1">Confirm Password</label>
          <input
            {...register('confirmPassword')}
            type="password"
            autoComplete="new-password"
            className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`}
            placeholder="••••••••"
          />
          {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <div className="flex items-start space-x-3 py-2">
            <input type="checkbox" required className="mt-1 w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary" />
            <span className="text-sm text-neutral-600">
                I agree to the <Link to="/terms" className="text-primary font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary font-bold hover:underline">Privacy Policy</Link>.
            </span>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary py-4 text-lg font-bold shadow-xl shadow-primary/20 relative overflow-hidden transition-all active:scale-[0.98] disabled:opacity-80"
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center space-x-2"
              >
                <Loader2 className="animate-spin" size={20} />
                <span>Securing your account...</span>
              </motion.div>
            ) : (
              <motion.span
                key="text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                Create Account
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <p className="text-center text-neutral-600 font-medium mt-8">
          Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Log in</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
