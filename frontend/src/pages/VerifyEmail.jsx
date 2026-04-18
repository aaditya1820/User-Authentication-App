import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); 
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        return;
      }
      try {
        await api.get(`/auth/verify-email/${token}`);
        setStatus('success');
      } catch (err) {
        setStatus('error');
      }
    };
    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] p-12 border border-neutral-200 text-center shadow-xl shadow-neutral-200/50"
      >
        <AnimatePresence mode="wait">
            {status === 'loading' && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="relative mx-auto w-20 h-20">
                    <Loader2 className="w-full h-full text-primary animate-spin" />
                    <Mail className="absolute inset-0 m-auto text-primary/50" size={24} />
                </div>
                <h2 className="text-3xl font-black text-neutral-900 tracking-tight">Verifying...</h2>
                <p className="text-neutral-500 font-bold">Please wait while we establish a secure connection to confirm your account.</p>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="w-20 h-20 bg-green-50 rounded-[2rem] flex items-center justify-center mx-auto text-green-500">
                    <CheckCircle size={40} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-neutral-900 tracking-tight">Verified!</h2>
                    <p className="text-neutral-500 font-bold mt-2 leading-relaxed">Your identity has been confirmed. Welcome to the platform.</p>
                </div>
                <Link to="/login" className="block w-full btn-primary py-4 text-lg font-black shadow-lg shadow-primary/20">CONTINUE TO LOGIN</Link>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto text-red-500">
                    <XCircle size={40} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-neutral-900 tracking-tight">Failed</h2>
                    <p className="text-neutral-500 font-bold mt-2 leading-relaxed">This link is invalid or has already been used. Please request a new one.</p>
                </div>
                <Link to="/login" className="block w-full py-4 bg-neutral-900 text-white rounded-2xl text-lg font-black hover:bg-neutral-800 transition-all shadow-lg active:scale-95 uppercase tracking-widest">Back to Login</Link>
              </motion.div>
            )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
