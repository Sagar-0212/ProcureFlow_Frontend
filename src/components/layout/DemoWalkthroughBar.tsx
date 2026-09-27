import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  FileText,
  UserCheck,
  Scale,
  ShoppingBag,
  Truck,
  Receipt,
  CreditCard,
  Package,
} from 'lucide-react';

export const DemoWalkthroughBar: React.FC = () => {
  const { currentDemoStep, loadDemoStep, invoices } = useProcurement();

  const steps = [
    {
      step: 1,
      name: '1. Raise PR-1001',
      desc: 'Employee requests 10 laptops',
      role: 'EMPLOYEE',
      icon: FileText,
    },
    {
      step: 2,
      name: '2. Manager Approval',
      desc: 'Sarah reviews & approves',
      role: 'MANAGER',
      icon: UserCheck,
    },
    {
      step: 3,
      name: '3. Compare Quotes',
      desc: 'Evaluate 3 supplier bids',
      role: 'PROCUREMENT',
      icon: Scale,
    },
    {
      step: 4,
      name: '4. Issue PO-3001',
      desc: 'Award TechSupply Pro',
      role: 'PROCUREMENT',
      icon: ShoppingBag,
    },
    {
      step: 5,
      name: '5. Partial Receipt (8/10)',
      desc: 'GRN-2001: 8 laptops arrive',
      role: 'PROCUREMENT',
      icon: Truck,
    },
    {
      step: 6,
      name: '6. 3-Way Mismatch!',
      desc: 'Billed 10 vs Received 8 (BLOCKED)',
      role: 'FINANCE',
      icon: AlertTriangle,
      isHighlight: true,
    },
    {
      step: 7,
      name: '7. Resolve Remainder',
      desc: '2 remaining delivered -> MATCHED',
      role: 'FINANCE',
      icon: CheckCircle2,
    },
    {
      step: 8,
      name: '8. Payment & Stock',
      desc: 'Disburse & view ledger',
      role: 'ADMIN',
      icon: CreditCard,
    },
  ];

  return (
    <div className="bg-slate-900 text-white px-6 py-2.5 border-b border-slate-800 shadow-inner">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Title & Legend */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/20 text-amber-300 rounded text-xs font-semibold tracking-wide uppercase">
            <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Thinqloud Assessment Scenario</span>
          </div>
          <span className="text-xs text-slate-400 hidden xl:inline">
            Interactive end-to-end procurement test story (Page 13 of PDF)
          </span>
        </div>

        {/* Horizontal Steps Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs scrollbar-none">
          {steps.map((st) => {
            const Icon = st.icon;
            const isActive = currentDemoStep === st.step;
            const isMismatchHighlight = st.isHighlight;

            return (
              <button
                key={st.step}
                onClick={() => loadDemoStep(st.step)}
                title={st.desc}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md whitespace-nowrap transition-all text-xs font-medium ${
                  isActive
                    ? isMismatchHighlight
                      ? 'bg-rose-600 text-white font-semibold ring-2 ring-rose-400/50 shadow-sm'
                      : 'bg-indigo-600 text-white font-semibold ring-2 ring-indigo-400/50 shadow-sm'
                    : isMismatchHighlight
                    ? 'bg-rose-950/60 text-rose-300 hover:bg-rose-900/60 border border-rose-800/60'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : isMismatchHighlight ? 'text-rose-400' : 'text-slate-400'}`} />
                <span>{st.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
