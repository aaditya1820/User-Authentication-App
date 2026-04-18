import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Mail, Loader2, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

const ForgotPassword = () => {
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    const cleanData = { ...data, email: data.email.trim() };
    try {
      await api.post('/auth/forgot-password', cleanData);
      setIsSent(true);
      toast.success('Recovery link sent to your email');
    } catch (err) {
      toast.error('Failed to send recovery link');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-6">
            <div className="max-w-md w-full bg-white rounded-3xl p-10 border border-neutral-200 text-center">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-4 capitalize">link sent for password reset</h2>
                <p className="text-neutral-500 mb-8">We've sent a secure recovery link to your email. Please check your inbox and follow the instructions to reset your password.</p>
                <div className="space-y-4">
                    <Link to="/login" className="block w-full btn-primary text-center">Back to Login</Link>
                    <button onClick={() => setIsSent(false)} className="text-sm font-bold text-neutral-400 hover:text-neutral-600">Resend email</button>
                </div>
            </div>
        </div>
     )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-6">
      <AnimatePresence mode="wait">
        {isSent ? (
          <motion.div 
            key="sent"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-md w-full bg-white rounded-[2.5rem] p-12 border border-neutral-200 text-center shadow-2xl shadow-neutral-200/50"
          >
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-8 relative">
                <Mail size={32} />
                <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-4 border-white"
                ></motion.div>
            </div>
            <h2 className="text-3xl font-black text-neutral-900 mb-4 tracking-tight capitalize">link sent for password reset</h2>
            <p className="text-neutral-500 font-bold mb-10 leading-relaxed">We've dispatched a secure recovery link to your inbox. Please click it to choose a new password.</p>
            <div className="space-y-4">
                <Link to="/login" className="block w-full btn-primary py-4 text-lg font-black shadow-lg shadow-primary/20 transition-all active:scale-95">BACK TO LOGIN</Link>
                <button onClick={() => setIsSent(false)} className="text-sm font-black text-neutral-400 hover:text-neutral-600 uppercase tracking-widest transition-colors">Resend link</button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md w-full bg-white rounded-[2.5rem] p-12 border border-neutral-200 shadow-2xl shadow-neutral-200/50"
          >
            <Link to="/login" className="inline-flex items-center space-x-2 text-sm font-black text-neutral-400 hover:text-primary mb-10 transition-all group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="uppercase tracking-widest">Back to login</span>
            </Link>
            
            <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-indigo-50 rounded-lg text-primary">
                    <Sparkles size={20} />
                </div>
                <h2 className="text-3xl font-black text-neutral-900 tracking-tight">Recover</h2>
            </div>
            <p className="text-neutral-500 mb-10 font-bold leading-relaxed">Don't panic! It happens to the best of us. Just enter your email below.</p>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-neutral-400 tracking-widest ml-1">Email Address</label>
                <div className="relative">
                    <input
                    {...register('email')}
                    autoComplete="email"
                    className={`input-field py-4 text-lg overflow-hidden ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="john@example.com"
                    />
                </div>
                {errors.email && <p className="text-sm text-red-500 mt-2 font-bold">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-4 text-lg font-black shadow-xl shadow-primary/20 relative overflow-hidden active:scale-95 transition-all"
              >
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div 
                            key="loader"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center justify-center space-x-2"
                        >
                            <Loader2 className="animate-spin" size={20} />
                            <span>Requesting...</span>
                        </motion.div>
                    ) : (
                        <motion.span
                            key="text"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            SEND RECOVERY LINK
                        </motion.span>
                    )}
                </AnimatePresence>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ForgotPassword;
