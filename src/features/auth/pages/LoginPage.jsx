import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useLogin } from '../hooks/useLogin';
import { ENDPOINTS } from '@/api/endpoints';
import GoogleIcon from '@/components/ui/GoogleIcon';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const startGoogleOAuth = () => { window.location.href = `${API_BASE}${ENDPOINTS.AUTH.GOOGLE}`; };

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { mutate: login, isPending } = useLogin();

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <h1 className="font-black text-3xl tracking-tight text-white">Welcome back</h1>
        <p className="text-[#9f9fa9] text-sm">Sign in to your Hintro workspace</p>
      </div>

      <form onSubmit={handleSubmit(login)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#9f9fa9] uppercase tracking-wider">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#9f9fa9]" />
            <input
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              className={`w-full bg-white/5 border ${errors.email ? 'border-red-500/60' : 'border-white/10 focus:border-primary/60'} rounded-xl px-4 pl-10 py-3 text-sm text-white placeholder:text-[#9f9fa9]/50 focus:outline-none focus:bg-white/8 transition-all`}
              {...register('email', { required: 'Email is required' })}
            />
          </div>
          {errors.email && <p className="text-xs text-red-400 mt-0.5">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#9f9fa9] uppercase tracking-wider">Password</label>
            <a className="text-xs text-primary hover:text-primary/80 cursor-pointer transition-colors">Forgot password?</a>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#9f9fa9]" />
            <input
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className={`w-full bg-white/5 border ${errors.password ? 'border-red-500/60' : 'border-white/10 focus:border-primary/60'} rounded-xl px-4 pl-10 py-3 text-sm text-white placeholder:text-[#9f9fa9]/50 focus:outline-none focus:bg-white/8 transition-all`}
              {...register('password', { required: 'Password is required' })}
            />
          </div>
          {errors.password && <p className="text-xs text-red-400 mt-0.5">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-1 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400/80 to-orange-600/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-full shadow-[0_0_12px_oklch(0.646_0.222_41.116/0.3)] hover:shadow-[0_0_16px_oklch(0.646_0.222_41.116/0.4)] transition-all active:scale-95 text-sm"
        >
          {isPending
            ? <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><span>Sign in</span><ArrowRight className="size-4" /></>
          }
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/[0.07]" />
        <span className="text-[#9f9fa9] text-xs">or continue with</span>
        <div className="flex-1 h-px bg-white/[0.07]" />
      </div>

      <button
        type="button"
        onClick={startGoogleOAuth}
        className="flex items-center justify-center gap-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl py-2.5 text-sm font-medium text-[#9f9fa9] hover:text-white transition-all"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <p className="text-center text-sm text-[#9f9fa9]">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary font-semibold hover:text-primary/80 transition-colors">Create one free</Link>
      </p>
    </div>
  );
}
