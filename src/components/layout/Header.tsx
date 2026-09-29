import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  LogOut,
  User as UserIcon,
} from 'lucide-react';

interface HeaderProps {
  onOpenLogin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLogin }) => {
  const {
    activeTab,
    setActiveTab,
  } = useProcurement();

  const { user: authUser, isAuthenticated, logout } = useAuth();

  const roleLabels: Record<string, { title: string; badge: string; color: string }> = {
    EMPLOYEE: { title: 'Employee', badge: 'EMPLOYEE', color: 'text-sky-700 bg-sky-50 border-sky-200' },
    MANAGER: { title: 'Manager', badge: 'MANAGER', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
    PROCUREMENT_OFFICER: { title: 'Procurement Officer', badge: 'PROCUREMENT_OFFICER', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    FINANCE_OFFICER: { title: 'Finance Officer', badge: 'FINANCE_OFFICER', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    ADMIN: { title: 'Administrator', badge: 'ADMIN', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  };

  const activeRole = authUser?.role || 'EMPLOYEE';
  const currentRoleConfig = roleLabels[activeRole] || roleLabels['EMPLOYEE'];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-20 shrink-0 sticky top-0">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:bg-slate-800 transition-colors">
            PF
          </div>
          <div>
            <div className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>ProcureFlow</span>
            </div>
            <div className="text-[11px] text-slate-500 font-normal leading-none">
              Intelligent Purchase &amp; Procurement Management
            </div>
          </div>
        </button>
      </div>

      {/* Zone 2: Context indicator */}
      <div className="hidden lg:flex items-center gap-2">
        {isAuthenticated && authUser && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Authenticated Role:</span>
            <span className="font-semibold text-slate-900">{currentRoleConfig.badge}</span>
            {authUser.departmentName && (
              <>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500">{authUser.departmentName}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Zone 3: Authenticated User Controls */}
      <div className="flex items-center gap-2.5">
        {isAuthenticated && authUser ? (
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-900 leading-tight">
                {authUser.name}
              </div>
              <div className="text-[11px] text-slate-500 font-mono leading-tight truncate max-w-[150px]">
                {authUser.email}
              </div>
            </div>

            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 text-xs font-bold">
              {authUser.name ? authUser.name.charAt(0).toUpperCase() : 'U'}
            </div>

            <button
              onClick={logout}
              title="Sign out from backend session"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          onOpenLogin && (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )
        )}
      </div>
    </header>
  );
};
