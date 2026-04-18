import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Code, Globe, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import AuthLayout from "../components/AuthLayout";
import useAuthStore from "../store/useAuthStore";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      await login(data);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  const socialLogin = (provider) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api/v1";
    window.location.href = `${baseUrl}/auth/${provider}`;
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Log in to your account to continue"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-neutral-700 ml-1">
            Email Address
          </label>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            className={`input-field ${errors.email ? "border-red-500" : ""}`}
            placeholder="Enter Email"
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1 relative">
          <div className="flex justify-between items-center px-1">
            <label className="text-sm font-semibold text-neutral-700">
              Password
            </label>
            <Link
              to="/forgot-password"
              size="sm"
              className="text-sm text-primary font-bold hover:underline"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className={`input-field pr-12 ${errors.password ? "border-red-500" : ""}`}
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
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <input
            {...register("rememberMe")}
            type="checkbox"
            id="remember"
            className="w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary"
          />
          <label
            htmlFor="remember"
            className="text-sm text-neutral-600 font-medium"
          >
            Remember me for 30 days
          </label>
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
                <span>Authenticating...</span>
              </motion.div>
            ) : (
              <motion.span
                key="text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                Sign In
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-neutral-200"></span>
          </div>
          <div className="relative flex justify-center text-sm uppercase">
            <span className="bg-white px-4 text-neutral-500 font-bold">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => socialLogin("google")}
            className="flex items-center justify-center space-x-2 py-3 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors font-semibold"
          >
            <Globe size={20} className="text-blue-500" />
            <span>Google</span>
          </button>
          <button
            type="button"
            onClick={() => socialLogin("github")}
            className="flex items-center justify-center space-x-2 py-3 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors font-semibold"
          >
            <Code size={20} />
            <span>GitHub</span>
          </button>
        </div>

        <p className="text-center text-neutral-600 font-medium mt-10">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-primary font-bold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
