import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, KeyRound, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { User } from '../types';
import { signInWithGoogle } from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User, token: string) => void;
}

type TabType = 'login' | 'signup' | 'forgot' | 'reset';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [tab, setTab] = useState<TabType>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setError(null);
    setSuccessMsg(null);
    setSimulatedCode(null);
  };

  const handleTabChange = (newTab: TabType) => {
    setTab(newTab);
    resetForm();
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await signInWithGoogle();
      const fbUser = res.user;
      onAuthSuccess(
        {
          id: fbUser.uid,
          email: fbUser.email || '',
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Agent',
          createdAt: new Date().toISOString(),
        },
        res.accessToken || fbUser.refreshToken || 'firebase_token'
      );
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Google Sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (tab === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to sign in');

        onAuthSuccess(data.user, data.token);
        onClose();
      } else if (tab === 'signup') {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to register account');

        onAuthSuccess(data.user, data.token);
        onClose();
      } else if (tab === 'forgot') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to process request');

        if (data.resetCode) {
          setSimulatedCode(data.resetCode);
          setResetCode(data.resetCode);
        }
        setSuccessMsg(data.message || 'Verification code dispatched.');
        setTimeout(() => {
          setTab('reset');
        }, 1500);
      } else if (tab === 'reset') {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: resetCode, newPassword }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update password');

        setSuccessMsg(data.message || 'Password successfully updated.');
        setTimeout(() => {
          setTab('login');
          resetForm();
        }, 1200);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="authModalTitle"
    >
      <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-700/80 p-6 flex flex-col gap-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 id="authModalTitle" className="font-mono font-bold text-sm text-slate-100">
                {tab === 'login' && 'Account Sign In'}
                {tab === 'signup' && 'Create Mind Sync Account'}
                {tab === 'forgot' && 'Reset Password'}
                {tab === 'reset' && 'Confirm New Password'}
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Persistent sparring sessions & dossier history
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        {(tab === 'login' || tab === 'signup') && (
          <>
            <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => handleTabChange('login')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  tab === 'login'
                    ? 'bg-slate-800 text-cyan-300 shadow-sm border border-cyan-800/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('signup')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  tab === 'signup'
                    ? 'bg-slate-800 text-cyan-300 shadow-sm border border-cyan-800/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            {/* Google Firebase Auth */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-cyan-500 text-slate-100 font-mono text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google (Firebase Auth)</span>
            </button>

            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
              <div className="h-px bg-slate-800 flex-1" />
              <span>Or with email</span>
              <div className="h-px bg-slate-800 flex-1" />
            </div>
          </>
        )}

        {/* Status Alerts */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Simulated Code Banner */}
        {simulatedCode && (
          <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-800/80 text-xs font-mono text-cyan-200 flex flex-col gap-1">
            <span className="font-bold text-cyan-400">VERIFICATION CODE DISPATCHED:</span>
            <div className="flex items-center justify-between bg-slate-950/80 p-2 rounded border border-cyan-700/60">
              <span className="text-base tracking-widest font-bold text-white">{simulatedCode}</span>
              <span className="text-[10px] text-slate-400">Valid for 15 min</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-mono">
          {tab === 'signup' && (
            <div className="space-y-1">
              <label className="text-slate-300 block">Your Name / Call-Sign:</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 pl-9 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-slate-300 block">Email Address:</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 pl-9 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {(tab === 'login' || tab === 'signup') && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 block">Password:</label>
                {tab === 'login' && (
                  <button
                    type="button"
                    onClick={() => handleTabChange('forgot')}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 pl-9 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          {tab === 'reset' && (
            <>
              <div className="space-y-1">
                <label className="text-slate-300 block">6-Digit Verification Code:</label>
                <input
                  type="text"
                  required
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="e.g. 583921"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 tracking-wider"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 block">New Password:</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 pl-9 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>
                {tab === 'login' && 'Sign In to Spar'}
                {tab === 'signup' && 'Create Account'}
                {tab === 'forgot' && 'Send Reset Code'}
                {tab === 'reset' && 'Update Password'}
              </span>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          {tab === 'forgot' || tab === 'reset' ? (
            <button
              type="button"
              onClick={() => handleTabChange('login')}
              className="text-cyan-400 hover:underline"
            >
              ← Back to Sign In
            </button>
          ) : (
            <span>Secured via SHA-256 Scrypt Auth</span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="hover:text-white transition-colors"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};
