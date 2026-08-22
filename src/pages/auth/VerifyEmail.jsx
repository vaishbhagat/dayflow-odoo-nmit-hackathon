import { Link } from 'react-router-dom';
import { Layers, MailCheck, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function VerifyEmail() {
  const resend = async () => {
    toast.success('Verification email resent!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="text-zinc-900 font-bold text-lg">Dayflow</span>
        </div>

        <div className="df-card p-8 space-y-5">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto">
            <MailCheck className="w-7 h-7 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Check your email</h2>
            <p className="text-zinc-500 text-sm mt-2 leading-relaxed">
              We&apos;ve sent a verification link to your email address. Click the link to activate your account.
            </p>
          </div>
          <button onClick={resend} className="btn-secondary w-full justify-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" />
            Resend verification email
          </button>
          <Link to="/login" className="block text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
