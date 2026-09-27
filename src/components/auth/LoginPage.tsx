import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, error, clearError, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setSubmitting(true);
    try {
      await login({ email, password });
    } catch {
      // Error is handled in AuthContext error state
    } finally {
      setSubmitting(false);
    }
  };

  const fillCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    clearError();
  };

  const sampleUsers = [
    { label: 'Admin', email: 'david.kim@thinqloud.com', pass: 'password123', role: 'ADMIN' },
    { label: 'Employee', email: 'alex.rivera@thinqloud.com', pass: 'password123', role: 'EMPLOYEE' },
    { label: 'Manager', email: 'sarah.jenkins@thinqloud.com', pass: 'password123', role: 'MANAGER' },
    { label: 'Procurement', email: 'marcus.chen@thinqloud.com', pass: 'password123', role: 'PROCUREMENT_OFFICER' },
    { label: 'Finance', email: 'elena.rostova@thinqloud.com', pass: 'password123', role: 'FINANCE_OFFICER' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo and Brand */}
        <div className="flex justify-center items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-emerald-500/20">
            PF
          </div>
        </div>
        <h2 className="text-center text-2xl font-extrabold text-white tracking-tight">
          ProcureFlow Enterprise
        </h2>
        <div className="mt-1 flex items-center justify-center gap-2 text-xs text-slate-400">
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-semibold text-emerald-400">
            Thinqloud Project #9
          </span>
          <span>•</span>
          <span>Phase 1 Authentication</span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800/80 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl border border-slate-700/60 sm:px-10">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-rose-200">Authentication Error</p>
                <p className="text-xs mt-1 text-rose-300">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Work Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) clearError();
                  }}
                  placeholder="name@thinqloud.com"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) clearError();
                  }}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting || isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Preset Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-700/60">
            <p className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Login Demo Accounts (Backend Database):</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {sampleUsers.map((su) => (
                <button
                  key={su.email}
                  type="button"
                  onClick={() => fillCredentials(su.email, su.pass)}
                  className="px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium text-left transition-colors truncate"
                  title={`${su.email} (${su.role})`}
                >
                  <span className="font-semibold text-emerald-400">{su.label}</span>
                  <span className="block text-[10px] text-slate-400 truncate">{su.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-slate-500">
          Backend Base URL: <code className="text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">http://localhost:8080</code>
        </div>
      </div>
    </div>
  );
};
