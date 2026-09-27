import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  RotateCcw,
  ShieldCheck,
  HelpCircle,
  LogOut,
  User as UserIcon,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    resetToInitialDemoState,
    activeTab,
    setActiveTab,
  } = useProcurement();

  const { logout, user, role } = useAuth();

  const roleLabels: Record<UserRole, { badge: string; color: string }> = {
    EMPLOYEE: { badge: 'Employee (Requester)', color: 'text-sky-700 bg-sky-50 border-sky-200' },
    MANAGER: { badge: 'Department Manager', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
    PROCUREMENT_OFFICER: { badge: 'Procurement Officer', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    FINANCE_OFFICER: { badge: 'Finance Officer', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    ADMIN: { badge: 'System Admin', color: 'text-purple-700 bg-purple-50 border-purple-200' },
    PROCUREMENT: { badge: 'Procurement Officer', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    FINANCE: { badge: 'Finance Officer', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  };

  const currentRole = role || currentUser.role || 'EMPLOYEE';
  const roleInfo = roleLabels[currentRole] || roleLabels.EMPLOYEE;
  const activeUser = user || currentUser;

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
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Thinqloud Project #9
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-normal leading-none">
              Intelligent Purchase &amp; Procurement Management
            </div>
          </div>
        </button>
      </div>

      {/* Zone 2: Middle quick action / context indicators */}
      <div className="hidden lg:flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Active Role:</span>
          <span className={`font-semibold px-2 py-0.5 rounded border ${roleInfo.color}`}>
            {roleInfo.badge}
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">{activeUser.departmentName}</span>
        </div>

        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            activeTab === 'guide'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Interview QA &amp; Architecture</span>
        </button>
      </div>

      {/* Zone 3: Authenticated User Profile & Logout */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-100/70 border border-slate-200/80 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
            {activeUser.name ? activeUser.name.charAt(0) : <UserIcon className="w-3.5 h-3.5" />}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-slate-900 leading-tight">
              {activeUser.name}
            </div>
            <div className="text-[10px] text-slate-500 leading-none">
              {activeUser.email}
            </div>
          </div>
        </div>

        {/* Demo Reset button */}
        <button
          onClick={resetToInitialDemoState}
          title="Reset demonstration state back to Thinqloud PDF initial case"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset State</span>
        </button>

        {/* Real Auth Logout button */}
        <button
          onClick={logout}
          title="Sign out of ProcureFlow"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-lg transition-all shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
