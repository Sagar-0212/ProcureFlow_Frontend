import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  LayoutDashboard,
  FileSpreadsheet,
  CheckSquare,
  Scale,
  ShoppingBag,
  Truck,
  Receipt,
  Boxes,
  Database,
  History,
  GraduationCap,
  AlertCircle,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    purchaseRequests,
    invoices,
    products,
  } = useProcurement();

  const pendingApprovalsCount = purchaseRequests.filter((pr) => pr.status === 'PENDING_APPROVAL').length;
  const mismatchInvoicesCount = invoices.filter((inv) => inv.status === 'MATCH_FAILED').length;
  const lowStockCount = products.filter((p) => p.currentStock <= p.reorderLevel).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'requests',
      label: 'Purchase Requests',
      icon: FileSpreadsheet,
      badge: null,
    },
    {
      id: 'approvals',
      label: 'Approval Center',
      icon: CheckSquare,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} pending` : null,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'quotations',
      label: 'Quotation Comparison',
      icon: Scale,
      badge: null,
    },
    {
      id: 'orders',
      label: 'Purchase Orders',
      icon: ShoppingBag,
      badge: null,
    },
    {
      id: 'receiving',
      label: 'Goods Receipt (GRN)',
      icon: Truck,
      badge: null,
    },
    {
      id: 'finance',
      label: '3-Way Match & Invoices',
      icon: Receipt,
      badge: mismatchInvoicesCount > 0 ? `${mismatchInvoicesCount} mismatch` : null,
      badgeColor: 'bg-rose-100 text-rose-800 font-semibold',
    },
    {
      id: 'inventory',
      label: 'Inventory & Smart Reorder',
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} low` : null,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'masterData',
      label: 'Master Data & Rules',
      icon: Database,
      badge: null,
    },
    {
      id: 'audit',
      label: 'System Audit Logs',
      icon: History,
      badge: null,
    },
    {
      id: 'guide',
      label: 'Thinqloud Assessment Guide',
      icon: GraduationCap,
      badge: 'Project #9',
      badgeColor: 'bg-indigo-100 text-indigo-800 font-semibold',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shrink-0 select-none">
      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Core Procurement Lifecycle
        </div>

        {navItems.slice(0, 7).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors group ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-medium rounded-md shrink-0 ${
                    item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Governance &amp; Intelligence
        </div>

        {navItems.slice(7).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors group ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-medium rounded-md shrink-0 ${
                    item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer System Status Banner */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-slate-300">ProcureFlow Core</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">
          Frontend Engine &amp; Business Rules Active
        </div>
      </div>
    </aside>
  );
};
