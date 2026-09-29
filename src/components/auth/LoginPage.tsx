import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BackendRole } from '../../types/backend';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('alex.rivera@thinqloud.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleUsers: { role: BackendRole; label: string; email: string }[] = [
    { role: 'EMPLOYEE', label: 'Employee (Alex)', email: 'alex.rivera@thinqloud.com' },
    { role: 'MANAGER', label: 'Manager (Sarah)', email: 'sarah.jenkins@thinqloud.com' },
    { role: 'PROCUREMENT_OFFICER', label: 'Procurement (Marcus)', email: 'marcus.chen@thinqloud.com' },
    { role: 'FINANCE_OFFICER', label: 'Finance (Elena)', email: 'elena.rostova@thinqloud.com' },
    { role: 'ADMIN', label: 'Admin (David)', email: 'david.kim@thinqloud.com' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please verify credentials or backend availability.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (selectedEmail: string) => {
    setEmail(selectedEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header matching existing ProcureFlow styling */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-xl shadow-md mb-3">
            PF
          </div>
          <div className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>ProcureFlow</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Intelligent Purchase &amp; Procurement Management Platform
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-1">
            Sign in to your account
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Enter your email and password to authenticate with the Spring Boot server
          </p>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Backend User Quick Fill */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Standard Backend Accounts (Prefill):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sampleUsers.map((p) => (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => handleSelectUser(p.email)}
                  className={`text-left p-2 rounded-lg border text-xs transition-colors ${
                    email === p.email
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-medium'
                      : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-semibold text-slate-900 truncate">{p.label}</div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">{p.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center text-xs text-slate-400">
          Enterprise Procurement Platform · JWT Authentication Active
        </div>
      </div>
    </div>
  );
};
