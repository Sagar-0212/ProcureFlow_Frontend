import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { UserRole } from '../../types';
import {
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Building2,
  HelpCircle,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    switchRole,
    resetToInitialDemoState,
    activeTab,
    setActiveTab,
    currentDemoStep,
    setCurrentDemoStep,
  } = useProcurement();

  const roleLabels: Record<UserRole, { title: string; badge: string; color: string }> = {
    EMPLOYEE: { title: 'Alex Rivera', badge: 'Employee (Requester)', color: 'text-sky-700 bg-sky-50 border-sky-200' },
    MANAGER: { title: 'Sarah Jenkins', badge: 'Department Manager', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
    PROCUREMENT: { title: 'Marcus Chen', badge: 'Procurement Specialist', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    FINANCE: { title: 'Elena Rostova', badge: 'Finance & Controller', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    ADMIN: { title: 'David Kim', badge: 'VP Operations / Admin', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-20 shrink-0 sticky top-0">
      {/* Zone 1: Brand Wordmark (Single text element according to Frontend Design Constitution) */}
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
          <span className="font-semibold text-slate-900">{roleLabels[currentUser.role].badge}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">{currentUser.departmentName}</span>
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

      {/* Zone 3: Interactive Role Switcher & Reset Button */}
      <div className="flex items-center gap-3">
        {/* Role Switcher Selector */}
        <div className="flex items-center gap-1.5 text-xs">
          <label htmlFor="role-select" className="hidden sm:inline text-slate-500 font-medium">
            Switch Persona:
          </label>
          <select
            id="role-select"
            value={currentUser.role}
            onChange={(e) => switchRole(e.target.value as UserRole)}
            className="text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
          >
            <option value="EMPLOYEE">👤 Alex Rivera (Employee)</option>
            <option value="MANAGER">👔 Sarah Jenkins (Manager)</option>
            <option value="PROCUREMENT">📦 Marcus Chen (Procurement)</option>
            <option value="FINANCE">💳 Elena Rostova (Finance)</option>
            <option value="ADMIN">⚙️ David Kim (Admin / VP)</option>
          </select>
        </div>

        {/* Demo Reset button */}
        <button
          onClick={resetToInitialDemoState}
          title="Reset demonstration state back to Thinqloud PDF initial case"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Demo</span>
        </button>
      </div>
    </header>
  );
};
