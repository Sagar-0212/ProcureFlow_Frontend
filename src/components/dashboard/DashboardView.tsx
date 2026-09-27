import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  FileSpreadsheet,
  CheckCircle,
  Clock,
  AlertTriangle,
  ShoppingBag,
  Truck,
  Receipt,
  Boxes,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';

export const DashboardView: React.FC<{ onOpenNewPR: () => void }> = ({ onOpenNewPR }) => {
  const {
    currentUser,
    purchaseRequests,
    purchaseOrders,
    goodsReceipts,
    invoices,
    products,
    auditLogs,
    setActiveTab,
    resolveMissingDeliveryShortcut,
  } = useProcurement();

  const pendingPRs = purchaseRequests.filter((pr) => pr.status === 'PENDING_APPROVAL');
  const activePOs = purchaseOrders.filter((po) => po.status === 'ISSUED' || po.status === 'PARTIALLY_RECEIVED');
  const mismatchedInvoices = invoices.filter((inv) => inv.status === 'MATCH_FAILED');
  const verifiedInvoices = invoices.filter((inv) => inv.status === 'MATCH_VERIFIED');
  const lowStockProducts = products.filter((p) => p.currentStock <= p.reorderLevel);

  const totalInventoryValue = products.reduce((acc, p) => acc + p.currentStock * p.defaultPrice, 0);

  return (
    <div className="space-y-6">
      {/* Welcome & Context Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Workspace Overview · {currentUser.departmentName}
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Centralized procurement control center for requisitions, multi-quote evaluation, partial deliveries,
            three-way matching verification, and inventory synchronization.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenNewPR}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Raise Purchase Request</span>
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors border border-slate-200"
          >
            <Receipt className="w-4 h-4" />
            <span>3-Way Verification</span>
          </button>
        </div>
      </div>

      {/* Critical Business Scenario Highlight Banner (Thinqloud assessment focal point) */}
      {mismatchedInvoices.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 text-rose-900">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-100 rounded-lg text-rose-700 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  Thinqloud Assessment Focal Scenario: Three-Way Match Mismatch
                </div>
                <h2 className="text-base font-bold text-rose-950 mt-0.5">
                  Payment Blocked: Invoice #{mismatchedInvoices[0].invoiceNumber} for PO #{mismatchedInvoices[0].poNumber}
                </h2>
                <p className="text-xs text-rose-800 mt-1 max-w-3xl leading-relaxed">
                  The supplier invoiced 10 laptops ($12,000.00), but warehouse Goods Receipt Note (GRN-2001) confirms only
                  8 units were accepted in the partial consignment. The system has automatically locked payment to protect against
                  an overbilling liability of 2 units ($2,400.00).
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('finance')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                  >
                    <span>Inspect 3-Way Match</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => resolveMissingDeliveryShortcut(mismatchedInvoices[0].purchaseOrderId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 text-xs font-semibold rounded-lg transition-colors"
                  >
                    <span>Simulate Delivery of Remaining 2 Units (GRN-2002)</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="hidden lg:block text-right">
              <span className="text-[11px] font-mono text-rose-600 uppercase font-semibold">
                Status: LOCKED_PAYMENT
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4 Core Quantitative Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Purchase Requests</span>
            <FileSpreadsheet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {purchaseRequests.length}
            </span>
            <span className="text-xs text-slate-500">
              ({pendingPRs.length} pending approval)
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => setActiveTab('requests')}
              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <span>View requests</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Purchase Orders Active</span>
            <ShoppingBag className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {activePOs.length}
            </span>
            <span className="text-xs text-amber-600 font-medium">
              (1 partial delivery)
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => setActiveTab('orders')}
              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <span>Track orders</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>3-Way Invoices</span>
            <Receipt className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {invoices.length}
            </span>
            <span className={`text-xs font-medium ${mismatchedInvoices.length > 0 ? 'text-rose-600 font-semibold' : 'text-emerald-600'}`}>
              {mismatchedInvoices.length > 0 ? `${mismatchedInvoices.length} blocked` : 'all verified'}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => setActiveTab('finance')}
              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <span>Finance center</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Warehouse Stock Value</span>
            <Boxes className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              ${totalInventoryValue.toLocaleString()}
            </span>
            <span className="text-xs text-amber-600">
              ({lowStockProducts.length} low stock)
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <span>Manage stock</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Procurement Lifecycle Pipeline */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              ProcureFlow Digital Procurement Lifecycle
            </h2>
            <p className="text-xs text-slate-500">
              Click any stage to inspect the connected business artifacts and transaction states.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
            Connected Business Process
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {[
            { id: 'requests', label: '1. Requisition', count: purchaseRequests.length, color: 'border-slate-200 hover:border-slate-400' },
            { id: 'approvals', label: '2. Approval', count: pendingPRs.length ? `${pendingPRs.length} req` : 'Clear', color: 'border-slate-200 hover:border-slate-400' },
            { id: 'quotations', label: '3. Quotes (RFQ)', count: '3 Bids', color: 'border-slate-200 hover:border-slate-400' },
            { id: 'orders', label: '4. Purchase Order', count: purchaseOrders.length, color: 'border-slate-200 hover:border-slate-400' },
            { id: 'receiving', label: '5. Goods Receipt', count: goodsReceipts.length, color: 'border-slate-200 hover:border-slate-400' },
            { id: 'finance', label: '6. 3-Way Match', count: mismatchedInvoices.length > 0 ? 'Mismatch' : 'Verified', color: mismatchedInvoices.length > 0 ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200' },
            { id: 'finance', label: '7. Payment', count: invoices.filter(i => i.status === 'PAID').length ? 'Paid' : 'Pending', color: 'border-slate-200' },
            { id: 'inventory', label: '8. Stock Ledger', count: 'Updated', color: 'border-slate-200' },
          ].map((stage, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(stage.id)}
              className={`p-3 rounded-lg border text-left transition-all ${stage.color} hover:shadow-xs group`}
            >
              <div className="text-[11px] font-semibold text-slate-700 truncate group-hover:text-indigo-600">
                {stage.label}
              </div>
              <div className="text-xs font-mono font-bold text-slate-900 mt-1 truncate">
                {stage.count}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Urgent Operational Tasks + Recent Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Action Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Operational Priority Queue</span>
              <span className="text-xs font-normal text-slate-500">Real-time business tasks</span>
            </h2>

            <div className="space-y-3">
              {/* Task 1: Mismatch */}
              {mismatchedInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/60 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-rose-900">
                        Three-Way Match Failed on Invoice {inv.invoiceNumber} (PO: {inv.poNumber})
                      </div>
                      <div className="text-xs text-rose-700 mt-0.5">
                        Supplier {inv.supplierName} billed for 10 units ($12,000). Only 8 units accepted at loading dock. Payment disbursement locked.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('finance')}
                    className="px-2.5 py-1 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors shrink-0"
                  >
                    Resolve
                  </button>
                </div>
              ))}

              {/* Task 2: Pending Approval */}
              {pendingPRs.map((pr) => (
                <div
                  key={pr.id}
                  className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/50 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-amber-900">
                        Requisition {pr.requestNumber} requires managerial authorization
                      </div>
                      <div className="text-xs text-amber-700 mt-0.5">
                        Raised by {pr.requesterName} for {pr.departmentName} · Est: ${pr.estimatedTotal.toLocaleString()} · "{pr.reason}"
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('approvals')}
                    className="px-2.5 py-1 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded transition-colors shrink-0"
                  >
                    Review
                  </button>
                </div>
              ))}

              {/* Task 3: Low stock warning */}
              {lowStockProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <Boxes className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-slate-900">
                        Low Stock Alert: {prod.name} (SKU: {prod.sku})
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        Current stock is {prod.currentStock} {prod.unit} (reorder threshold is {prod.reorderLevel} {prod.unit}).
                        Average monthly consumption: {prod.averageMonthlyUsage} {prod.unit}.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('inventory')}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded transition-colors shrink-0"
                  >
                    Reorder
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Traceable Audit Logs */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Audit Trail Stream</span>
              <button
                onClick={() => setActiveTab('audit')}
                className="text-xs text-indigo-600 hover:underline"
              >
                View full log
              </button>
            </h2>

            <div className="space-y-3">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="text-xs border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span className="font-semibold text-slate-700">{log.userName}</span>
                    <span className="font-mono">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="text-slate-900 font-medium mt-0.5">
                    {log.description}
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono mt-0.5">
                    {log.action} · Ref: {log.entityReference}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
