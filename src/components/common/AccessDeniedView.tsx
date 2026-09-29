import React from 'react';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { BackendRole } from '../../types/backend';

interface AccessDeniedViewProps {
  attemptedTab: string;
  currentRole: BackendRole | string;
  allowedRoles: (BackendRole | string)[];
  onReturnHome: () => void;
}

const TAB_LABELS: Record<string, string> = {
  dashboard: 'Executive Dashboard',
  requests: 'Purchase Requisitions',
  approvals: 'Manager Approval Center',
  quotations: 'Quotation Comparison & RFPs',
  orders: 'Purchase Orders',
  receiving: 'Goods Receipt Station (GRN)',
  finance: '3-Way Match & Invoices',
  inventory: 'Inventory & Stock Management',
  reports: 'Analytics & Reports',
  masterData: 'Master Data & Governance',
  audit: 'System Audit Logs',
};

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  attemptedTab,
  currentRole,
  allowedRoles,
  onReturnHome,
}) => {
  const workspaceTitle = TAB_LABELS[attemptedTab] || attemptedTab;

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-lg w-full text-center shadow-sm space-y-5">
        <div className="w-14 h-14 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center text-rose-600 mx-auto shadow-inner">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-md text-[11px] font-bold uppercase tracking-wider">
            <Lock className="w-3 h-3" />
            <span>HTTP 403 Forbidden · Access Restricted</span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Unauthorized Workspace Access
          </h2>

          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            Your current authenticated session with role{' '}
            <span className="font-semibold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
              {currentRole}
            </span>{' '}
            is not authorized to access the{' '}
            <strong className="text-slate-900">{workspaceTitle}</strong> module.
          </p>
        </div>

        {/* Governance explanation card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-left space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            ProcureFlow Role-Based Access Policy:
          </div>
          <div className="text-slate-700">
            <span>Authorized Roles for this area: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {allowedRoles.map((r) => (
                <span
                  key={r}
                  className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={onReturnHome}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
