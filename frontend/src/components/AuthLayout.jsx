import { motion } from 'framer-motion';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="flex min-h-screen bg-white">
      {}
      <div className="hidden lg:flex w-1/2 bg-primary relative overflow-hidden items-center justify-center p-20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        
        <div className="relative z-10 text-white max-w-md">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-extrabold mb-6 leading-tight">
              Master your <br /> authentication.
            </h1>
            <p className="text-xl text-indigo-100 font-medium leading-relaxed">
              Experience the next generation of security with our modular, scalable, and beautiful auth engine.
            </p>
          </motion.div>

          <div className="mt-12 space-y-6">
            <BenefitItem text="Multi-factor authentication (TOTP)" />
            <BenefitItem text="Secure session management" />
            <BenefitItem text="Real-time audit tracking" />
          </div>
        </div>
      </div>

      {}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-neutral-900 mb-2">{title}</h2>
            <p className="text-neutral-500 font-medium">{subtitle}</p>
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  );
};

const BenefitItem = ({ text }) => (
  <div className="flex items-center space-x-4">
    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-white"></div>
    </div>
    <span className="text-lg text-indigo-50 font-semibold">{text}</span>
  </div>
);

export default AuthLayout;
