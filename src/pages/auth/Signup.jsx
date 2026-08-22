import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layers, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const schema = z.object({
  employee_id: z.string().min(3, 'Employee ID is required'),
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['Employee', 'HR/Admin']),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'Employee' },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await signUp(values);
      toast.success('Account created! Please check your email to verify.');
      navigate('/verify-email');
    } catch (err) {
      toast.error(err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="text-zinc-900 font-bold text-lg">Dayflow</span>
        </div>

        <div className="df-card p-7 space-y-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900">Create account</h2>
            <p className="text-zinc-500 text-sm mt-1">Join Dayflow HRMS</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="df-label">Employee ID</label>
                <input className="df-input" placeholder="EMP-001" {...register('employee_id')} />
                {errors.employee_id && <p className="text-xs text-red-500 mt-1">{errors.employee_id.message}</p>}
              </div>
              <div>
                <label className="df-label">Role</label>
                <select className="df-input" {...register('role')}>
                  <option value="Employee">Employee</option>
                  <option value="HR/Admin">HR/Admin</option>
                </select>
              </div>
            </div>

            <div>
              <label className="df-label">Full Name</label>
              <input className="df-input" placeholder="Aarav Sharma" {...register('full_name')} />
              {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="df-label">Email address</label>
              <input type="email" className="df-input" placeholder="you@dayflow.com" {...register('email')} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="df-label">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="df-input pr-10" placeholder="••••••••" {...register('password')} />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="df-label">Confirm Password</label>
              <input type="password" className="df-input" placeholder="••••••••" {...register('confirm_password')} />
              {errors.confirm_password && <p className="text-xs text-red-500 mt-1">{errors.confirm_password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-1">
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">Create account <ArrowRight className="w-4 h-4" /></span>
              )}
            </button>
          </form>

          <p className="text-sm text-zinc-500 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
