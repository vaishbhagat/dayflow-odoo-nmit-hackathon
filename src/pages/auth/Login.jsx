import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layers, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const { signIn, profile } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('Welcome back!');
      // Profile is loaded async after signIn, navigate based on email hint
      setTimeout(() => {
        const isAdmin = email === 'admin@dayflow.com';
        navigate(isAdmin ? '/admin/dashboard' : '/employee/dashboard');
      }, 800);
    } catch (err) {
      toast.error(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT — Dark brand panel */}
      <div className="hidden lg:flex w-[45%] bg-zinc-950 relative overflow-hidden flex-col justify-between p-12">
        {/* Ambient glow */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-900/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img src="/logo.png" alt="DayFlow Logo" className="w-12 h-12 object-contain" />
          <div>
            <span className="text-white font-bold text-xl tracking-tight">Dayflow</span>
            <span className="block text-zinc-600 text-[10px] tracking-widest uppercase">HRMS Platform</span>
          </div>
        </div>

        {/* Center copy */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <p className="text-zinc-500 text-xs tracking-widest uppercase font-medium">Your Workspace</p>
            <h1 className="text-white text-4xl font-bold tracking-tight leading-tight">
              Every workday,<br />
              <span className="text-indigo-400">perfectly aligned.</span>
            </h1>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
            Manage your team, attendance, payroll, and leave — all from a single, beautifully designed dashboard.
          </p>

          {/* Feature list */}
          <div className="space-y-3 pt-2">
            {[
              'Real-time attendance tracking',
              'Automated payroll management',
              'Instant leave approvals',
              'Role-based access control',
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                <span className="text-zinc-400 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>


      </div>

      {/* RIGHT — Login card */}
      <div className="flex-1 flex items-center justify-center px-6 bg-zinc-50">
        <div className="w-full max-w-[380px] space-y-7">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-2">
            <img src="/logo.png" alt="DayFlow Logo" className="w-8 h-8 object-contain" />
            <span className="text-zinc-900 font-bold text-lg">Dayflow</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Sign in</h2>
            <p className="text-zinc-500 text-sm mt-1">Welcome back. Enter your credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="df-label">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@dayflow.com"
                className="df-input"
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="df-label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="df-input pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <p className="text-sm text-zinc-500 text-center">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
