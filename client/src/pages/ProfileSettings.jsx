import { useState, useRef } from 'react';
import useAuthStore from '../store/useAuthStore';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Camera, Lock, Mail, User, Shield, ArrowLeft, Loader2, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ProfileSettings = () => {
  const { user, fetchMe } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const fileInputRef = useRef();

  const handleAvatarClick = () => fileInputRef.current.click();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setIsUploading(true);
    try {
      await api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchMe();
      toast.success('Avatar updated!');
    } catch (err) {
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const setup2FA = async () => {
    try {
      const { data } = await api.post('/users/me/2fa/enable');
      setQrCode(data.qrCodeUrl);
      setShow2FA(true);
    } catch (err) {
      toast.error('Failed to initiate 2FA setup');
    }
  };

  const verify2FA = async () => {
    try {
      await api.post('/users/me/2fa/verify', { token: twoFACode });
      toast.success('2FA enabled successfully!');
      setShow2FA(false);
      await fetchMe();
    } catch (err) {
      toast.error('Invalid token');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <nav className="bg-white/80 backdrop-blur-md border-b border-neutral-200 px-8 py-4 flex items-center space-x-4 sticky top-0 z-20">
        <Link to="/dashboard" className="p-2 hover:bg-neutral-100 rounded-full transition-all text-neutral-500 active:scale-90">
           <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-black text-neutral-800 tracking-tight">Profile Settings</h1>
      </nav>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto mt-12 px-6"
      >
        <div className="bg-white rounded-[2.5rem] border border-neutral-200 overflow-hidden shadow-xl shadow-neutral-200/50">
          {}
          <div className="h-48 bg-gradient-to-br from-indigo-600 via-primary to-purple-600 relative">
             <div className="absolute -bottom-16 left-12 group cursor-pointer" onClick={handleAvatarClick}>
                <div className="relative">
                    <div className="w-32 h-32 rounded-[2rem] border-[6px] border-white overflow-hidden shadow-2xl transition-transform group-hover:scale-105">
                        <img 
                            src={user?.avatar ? user.avatar : `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`} 
                            className={`w-full h-full object-cover transition-all ${isUploading ? 'brightness-50 blur-sm' : 'group-hover:brightness-75'}`} 
                            alt="" 
                        />
                        <AnimatePresence>
                            {isUploading && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <Loader2 className="text-white animate-spin" size={32} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="absolute bottom-2 right-2 p-2 bg-white rounded-xl shadow-lg border border-neutral-100 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                        <Camera size={18} className="text-primary" />
                    </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
             </div>
          </div>

          <div className="pt-24 pb-12 px-12">
             <div className="flex justify-between items-start mb-12">
                <div>
                   <h2 className="text-4xl font-black text-neutral-900 tracking-tight">{user?.name}</h2>
                   <p className="text-neutral-500 font-bold text-lg">{user?.email}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase lg:tracking-widest ${user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                   {user?.role} Account
                </div>
             </div>

             <div className="space-y-12">
                <section className="space-y-6">
                   <div className="flex items-center space-x-3 mb-2">
                       <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                           <User size={18} className="text-neutral-500" />
                       </div>
                       <h3 className="text-xl font-black text-neutral-800">Basic Information</h3>
                   </div>
                   
                   <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-xs font-black uppercase text-neutral-400 tracking-widest ml-1">Full Name</label>
                         <input defaultValue={user?.name} className="input-field py-4 text-lg" placeholder="John Doe" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black uppercase text-neutral-400 tracking-widest ml-1">Email Address</label>
                         <input defaultValue={user?.email} className="input-field py-4 text-lg" placeholder="john@example.com" />
                      </div>
                   </div>
                   <button 
                    onClick={() => {
                        setIsSaving(true);
                        setTimeout(() => {
                            setIsSaving(false);
                            toast.success('Information updated!');
                        }, 1000);
                    }}
                    className="btn-primary px-10 py-4 text-lg font-black shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all"
                   >
                       {isSaving ? (
                           <div className="flex items-center space-x-2">
                               <Loader2 className="animate-spin" size={20} />
                               <span>Saving...</span>
                           </div>
                       ) : 'Save changes'}
                   </button>
                </section>

                <div className="h-px bg-neutral-100"></div>

                <section className="space-y-6">
                   <div className="flex items-center space-x-3 mb-2">
                       <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                           <Shield size={18} className="text-neutral-500" />
                       </div>
                       <h3 className="text-xl font-black text-neutral-800">Security & Privacy</h3>
                   </div>

                   <div className="bg-neutral-50/50 p-8 rounded-[2rem] border border-neutral-100 group hover:border-primary/20 transition-all">
                      <div className="flex items-center justify-between">
                         <div className="space-y-1">
                            <p className="font-black text-neutral-900 text-lg">Two-Factor Authentication</p>
                            <p className="text-sm text-neutral-500 font-medium">Add an ultra-secure layer of protection to your account.</p>
                         </div>
                         {user?.twoFactorEnabled ? (
                            <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-black">
                                <Check size={16} />
                                <span>ENABLED</span>
                            </div>
                         ) : (
                            <button 
                                onClick={setup2FA} 
                                className="px-6 py-3 bg-white border-2 border-neutral-200 rounded-[1.25rem] text-sm font-black hover:border-primary hover:text-primary transition-all active:scale-95 shadow-sm"
                            >
                               ENABLE 2FA
                            </button>
                         )}
                      </div>

                      <AnimatePresence>
                        {show2FA && (
                             <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                             >
                                <div className="mt-8 p-8 bg-white border border-neutral-200 rounded-[2rem] text-center space-y-6 shadow-sm">
                                   <p className="text-neutral-600 font-medium leading-relaxed">Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
                                   <div className="relative group mx-auto w-fit">
                                       <img src={qrCode} className="mx-auto w-52 h-52 border-4 border-neutral-50 p-2 rounded-[2rem] shadow-inner" alt="QR" />
                                   </div>
                                   <div className="max-w-xs mx-auto space-y-4">
                                      <input 
                                        value={twoFACode}
                                        onChange={(e) => setTwoFACode(e.target.value)}
                                        placeholder="0 0 0  0 0 0" 
                                        className="input-field text-center tracking-[0.5em] text-2xl font-black py-4 border-2 focus:border-primary" 
                                        maxLength={6}
                                      />
                                      <button onClick={verify2FA} className="w-full btn-primary py-4 text-lg font-black shadow-lg shadow-primary/20">Verify & Link</button>
                                      <button onClick={() => setShow2FA(false)} className="text-sm text-neutral-400 font-black hover:text-neutral-600 uppercase tracking-widest">Cancel Setup</button>
                                   </div>
                                </div>
                             </motion.div>
                          )}
                      </AnimatePresence>
                   </div>
                </section>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileSettings;
