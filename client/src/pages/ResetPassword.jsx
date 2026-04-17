import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck, Lock, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  newPassword: z.string().min(8, 'Min 8 chars'),
});

const ResetPassword = () => {
  const [step, setStep] = useState(1); 
  const [resetToken, setResetToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const urlToken = searchParams.get('token');
  const urlEmail = searchParams.get('email');
  
  const defaultEmail = urlEmail || location.state?.email || '';

  const { register, handleSubmit, getValues, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: defaultEmail
    }
  });

  useEffect(() => {
    if (defaultEmail) {
      setValue('email', defaultEmail);
    }
  }, [defaultEmail, setValue]);

  useEffect(() => {
    const verifyAutoToken = async () => {
      if (urlToken && urlEmail) {
        setIsLoading(true);
        try {
          const { data: res } = await api.post('/auth/verify-reset-token', { 
            email: urlEmail.trim(), 
            token: urlToken.trim() 
          });
          setResetToken(res.resetToken);
          setStep(2);
        } catch (err) {
          toast.error('This reset link is invalid or has expired.');
        } finally {
          setIsLoading(false);
        }
      }
    };
    verifyAutoToken();
  }, [urlToken, urlEmail, setValue]);

  const onResetPassword = async (data) => {
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { 
        email: data.email.trim(), 
        newPassword: data.newPassword,
        resetToken 
      });
      toast.success('Password updated successfully');
      navigate('/login');
    } catch (err) {
      toast.error('Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] p-12 border border-neutral-200 shadow-2xl shadow-neutral-200/50"
      >
        <Link to="/forgot-password" onClick={() => setStep(1)} className="inline-flex items-center space-x-2 text-sm font-black text-neutral-400 hover:text-primary mb-10 transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="uppercase tracking-widest">Back</span>
        </Link>

        <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
                <KeyRound size={20} />
            </div>
            <h2 className="text-3xl font-black text-neutral-900 tracking-tight">{step === 1 ? 'Verify OTP' : 'New Identity'}</h2>
        </div>
        <p className="text-neutral-500 mb-10 font-bold leading-relaxed">
            {step === 1 ? "Enter the 6-digit code we sent to your email to continue." : "Great! Now create a strong, new password for your account."}
        </p>
        
        <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div 
            key="step1-wait"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10"
          >
             <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-neutral-400">
                <ShieldCheck size={32} />
             </div>
             <p className="text-neutral-500 font-bold mb-6">Waiting for a secure reset link action...</p>
             <Link to="/forgot-password" size="sm" className="text-primary font-black uppercase text-xs tracking-widest hover:underline">Request new link</Link>
          </motion.div>
        ) : (
          <motion.form 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleSubmit(onResetPassword)} 
            className="space-y-8"
          >
             <div className="space-y-2">
                <label className="text-xs font-black uppercase text-neutral-400 tracking-widest ml-1">New Secure Password</label>
                <div className="relative">
                    <input {...register('newPassword')} type="password" className="input-field py-4 text-lg pr-12" placeholder="••••••••" />
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                </div>
                {errors.newPassword && <p className="text-xs text-red-500 font-bold mt-2">{errors.newPassword.message}</p>}
             </div>
             <button disabled={isLoading} className="w-full btn-primary py-4 text-lg font-black shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center space-x-2">
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : null}
                <span>{isLoading ? 'UPDATING...' : 'UPDATE PASSWORD'}</span>
             </button>
          </motion.form>
        )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
