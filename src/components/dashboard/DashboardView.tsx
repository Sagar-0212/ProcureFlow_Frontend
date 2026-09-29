import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { isTabAccessible } from '../../utils/rbac';
import {
  FileSpreadsheet,
  CheckCircle,
  CheckCircle2,
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
  Scale,
  CreditCard,
  FileText,
} from 'lucide-react';

export const DashboardView: React.FC<{ onOpenNewPR: () => void }> = ({ onOpenNewPR }) => {
  const {
    currentUser,
    purchaseRequests,
    purchaseOrders,
    goodsReceipts,
    quotations,
    invoices,
    products,
    auditLogs,
    dashboardSummary,
    setActiveTab,
    apiError,
    moduleErrors,
    refreshAllData,
  } = useProcurement();

  const pendingPRs = purchaseRequests.filter((pr) => pr.status === 'PENDING_APPROVAL');
  const approvedPRs = purchaseRequests.filter((pr) => pr.status === 'APPROVED');
  const activePOs = purchaseOrders.filter(
    (po) =>
      po.status === 'SENT_TO_SUPPLIER' ||
      po.status === 'PARTIALLY_RECEIVED' ||
      po.status === 'APPROVED'
  );
  const mismatchedInvoices = invoices.filter(
    (inv) => inv.status === 'MISMATCH'
  );
  const verifiedInvoices = invoices.filter(
    (inv) => inv.status === 'MATCHED' || inv.status === 'APPROVED'
  );
  const paidInvoices = invoices.filter((inv) => inv.status === 'PAID');
  const lowStockProducts = products.filter((p) => p.currentStock <= p.reorderLevel);

  const totalInventoryValue = dashboardSummary?.totalInventoryValuation ??
    products.reduce((acc, p) => acc + p.currentStock * p.defaultPrice, 0);

  const totalPRValuation = purchaseRequests.reduce((acc, pr) => acc + pr.estimatedTotal, 0);

  const prCountDisplay = dashboardSummary?.totalPurchaseRequests ?? purchaseRequests.length;
  const pendingApprovalsDisplay = dashboardSummary?.pendingApprovals ?? pendingPRs.length;
  const activePOsDisplay = dashboardSummary?.activePurchaseOrders ?? activePOs.length;
  const invoiceCountDisplay = dashboardSummary?.totalInvoices ?? invoices.length;
  const mismatchInvoiceCountDisplay = dashboardSummary?.mismatchedInvoices ?? mismatchedInvoices.length;
  const lowStockDisplay = dashboardSummary?.lowStockItemsCount ?? lowStockProducts.length;

  const role = currentUser.role;

  return (
    <div className="space-y-6">
      {apiError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-rose-900">Backend Connection Notice</div>
            <div className="text-xs text-rose-700 mt-0.5">{apiError}</div>
          </div>
          <button
            onClick={() => refreshAllData()}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shrink-0"
          >
            Retry Connection
          </button>
        </div>
      )}

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
            {role === 'EMPLOYEE' &&
              'Submit and track departmental requisitions, view approval progress, and monitor request history.'}
            {role === 'MANAGER' &&
              'Review departmental purchase requests, verify budget thresholds, and manage authorization decisions.'}
            {role === 'PROCUREMENT_OFFICER' &&
              'Evaluate vendor quotations, award purchase orders, monitor shipments, and manage warehouse inventory.'}
            {role === 'FINANCE_OFFICER' &&
              'Verify three-way matching reconciliation across PO, warehouse GRN, and supplier invoices before payment release.'}
            {role === 'ADMIN' &&
              'Centralized procurement control center for requisitions, multi-quote evaluation, partial deliveries, three-way matching verification, and inventory synchronization.'}
          </p>
        </div>

        {/* Action Controls strictly filtered by role */}
        <div className="flex items-center gap-3 shrink-0">
          {role !== 'FINANCE_OFFICER' && (
            <button
              onClick={onOpenNewPR}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Raise Purchase Request</span>
            </button>
          )}

          {role === 'MANAGER' && pendingPRs.length > 0 && (
            <button
              onClick={() => setActiveTab('approvals')}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
            >
              <Clock className="w-4 h-4" />
              <span>Review Approvals ({pendingPRs.length})</span>
            </button>
          )}

          {role === 'PROCUREMENT_OFFICER' && (
            <button
              onClick={() => setActiveTab('quotations')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
            >
              <Scale className="w-4 h-4" />
              <span>Compare Quotations</span>
            </button>
          )}

          {isTabAccessible('finance', role) && (
            <button
              onClick={() => setActiveTab('finance')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors border border-slate-200"
            >
              <Receipt className="w-4 h-4" />
              <span>3-Way Verification</span>
            </button>
          )}
        </div>
      </div>

      {/* Critical Business Scenario Highlight Banner: Three-Way Match (Finance & Admin Only) */}
      {isTabAccessible('finance', role) && mismatchedInvoices.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 text-rose-900">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-100 rounded-lg text-rose-700 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  Critical Reconciliation Alert: Three-Way Match Discrepancy
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
                  {isTabAccessible('receiving', role) && (
                    <button
                      onClick={() => setActiveTab('receiving')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 text-xs font-semibold rounded-lg transition-colors"
                    >
                      <span>Review Goods Receipts</span>
                    </button>
                  )}
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

      {/* 4 Quantitative Metric Cards - Role Specific */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* EMPLOYEE METRIC CARDS */}
        {role === 'EMPLOYEE' && (
          <>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>My Purchase Requests</span>
                <FileSpreadsheet className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {purchaseRequests.length}
                </span>
                <span className="text-xs text-slate-500">
                  ({pendingPRs.length} pending review)
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setActiveTab('requests')}
                  className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  <span>View my requests</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Approved Requisitions</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {approvedPRs.length}
                </span>
                <span className="text-xs text-emerald-600 font-medium">
                  ready for procurement
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setActiveTab('requests')}
                  className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  <span>Track approvals</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Under Review</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {pendingPRs.length}
                </span>
                <span className="text-xs text-amber-600 font-medium">
                  awaiting manager
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setActiveTab('requests')}
                  className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  <span>View status</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Requested Value</span>
                <Boxes className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  ${totalPRValuation.toLocaleString()}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Total Requisition Budget</span>
              </div>
            </div>
          </>
        )}

        {/* MANAGER METRIC CARDS */}
        {role === 'MANAGER' && (
          <>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Department Requisitions</span>
                <FileSpreadsheet className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {purchaseRequests.length}
                </span>
                <span className="text-xs text-slate-500">
                  ({pendingPRs.length} need approval)
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setActiveTab('requests')}
                  className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  <span>View requisitions</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Pending Authorization</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {pendingPRs.length}
                </span>
                <span className="text-xs text-amber-600 font-semibold">
                  action required
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setActiveTab('approvals')}
                  className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  <span>Review approvals</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Approved Requests</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {approvedPRs.length}
                </span>
                <span className="text-xs text-emerald-600 font-medium">
                  authorized
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setActiveTab('requests')}
                  className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  <span>View history</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Committed Budget</span>
                <Boxes className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  ${totalPRValuation.toLocaleString()}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Department Requisition Total</span>
              </div>
            </div>
          </>
        )}

        {/* PROCUREMENT OFFICER METRIC CARDS */}
        {role === 'PROCUREMENT_OFFICER' && (
          <>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Purchase Requests</span>
                <FileSpreadsheet className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {prCountDisplay}
                </span>
                <span className="text-xs text-slate-500">
                  ({approvedPRs.length} approved for RFQ)
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

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Purchase Orders Active</span>
                <ShoppingBag className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {activePOsDisplay}
                </span>
                <span className="text-xs text-amber-600 font-medium">
                  in fulfillment
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

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Vendor Quotations</span>
                <Scale className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {quotations.length}
                </span>
                <span className="text-xs text-indigo-600 font-medium">
                  bids recorded
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setActiveTab('quotations')}
                  className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  <span>Compare quotes</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>

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
                  ({lowStockDisplay} low)
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
          </>
        )}

        {/* FINANCE OFFICER METRIC CARDS */}
        {role === 'FINANCE_OFFICER' && (
          <>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>3-Way Invoices</span>
                <Receipt className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {invoiceCountDisplay}
                </span>
                <span className="text-xs text-slate-500">
                  total billed
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

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>3-Way Match Mismatches</span>
                <ShieldAlert className="w-4 h-4 text-rose-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {mismatchInvoiceCountDisplay}
                </span>
                <span className={`text-xs font-semibold ${mismatchInvoiceCountDisplay > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {mismatchInvoiceCountDisplay > 0 ? 'payment locked' : 'all clear'}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setActiveTab('finance')}
                  className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  <span>Inspect mismatches</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Verified &amp; Cleared</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {verifiedInvoices.length}
                </span>
                <span className="text-xs text-emerald-600 font-medium">
                  approved for payment
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setActiveTab('finance')}
                  className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  <span>View cleared</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Disbursed Payments</span>
                <CreditCard className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {paidInvoices.length}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  settled
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setActiveTab('finance')}
                  className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  <span>Payment records</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* ADMIN METRIC CARDS */}
        {role === 'ADMIN' && (
          <>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Purchase Requests</span>
                <FileSpreadsheet className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {prCountDisplay}
                </span>
                <span className="text-xs text-slate-500">
                  ({pendingApprovalsDisplay} pending approval)
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

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Purchase Orders Active</span>
                <ShoppingBag className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {activePOsDisplay}
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

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>3-Way Invoices</span>
                <Receipt className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {invoiceCountDisplay}
                </span>
                <span className={`text-xs font-medium ${mismatchInvoiceCountDisplay > 0 ? 'text-rose-600 font-semibold' : 'text-emerald-600'}`}>
                  {mismatchInvoiceCountDisplay > 0 ? `${mismatchInvoiceCountDisplay} blocked` : 'all verified'}
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
                  ({lowStockDisplay} low stock)
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
          </>
        )}
      </div>

      {/* Interactive Procurement Lifecycle Pipeline - Hidden for Employee, Role-Filtered for Others */}
      {role !== 'EMPLOYEE' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                ProcureFlow Digital Procurement Lifecycle
              </h2>
              <p className="text-xs text-slate-500">
                Authorized workflow stages for your role. Click any stage to inspect the connected business artifacts.
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
              { id: 'quotations', label: '3. Quotes (RFQ)', count: `${quotations.length} Bids`, color: 'border-slate-200 hover:border-slate-400' },
              { id: 'orders', label: '4. Purchase Order', count: purchaseOrders.length, color: 'border-slate-200 hover:border-slate-400' },
              { id: 'receiving', label: '5. Goods Receipt', count: goodsReceipts.length, color: 'border-slate-200 hover:border-slate-400' },
              { id: 'finance', label: '6. 3-Way Match', count: mismatchedInvoices.length > 0 ? 'Mismatch' : 'Verified', color: mismatchedInvoices.length > 0 ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200' },
              { id: 'finance', label: '7. Payment', count: paidInvoices.length ? `${paidInvoices.length} Paid` : 'Pending', color: 'border-slate-200' },
              { id: 'inventory', label: '8. Stock Ledger', count: `${products.length} Items`, color: 'border-slate-200' },
            ]
              .filter((stage) => isTabAccessible(stage.id, role))
              .map((stage, idx) => (
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
      )}

      {/* Two Column Layout: Urgent Operational Tasks + Recent Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Role-Appropriate Priority Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Operational Priority Queue</span>
              <span className="text-xs font-normal text-slate-500">Role-specific actions</span>
            </h2>

            <div className="space-y-3">
              {/* EMPLOYEE QUEUE: Personal/Department PR Status */}
              {role === 'EMPLOYEE' && (
                <>
                  {purchaseRequests.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg">
                      No requisitions submitted yet. Click "Raise Purchase Request" to create your first order.
                    </div>
                  ) : (
                    purchaseRequests.slice(0, 3).map((pr) => (
                      <div
                        key={pr.id}
                        className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <FileSpreadsheet className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs font-semibold text-slate-900">
                              Requisition {pr.requestNumber} · Status: {pr.status.replace('_', ' ')}
                            </div>
                            <div className="text-xs text-slate-600 mt-0.5">
                              Est: ${pr.estimatedTotal.toLocaleString()} · "{pr.reason}"
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('requests')}
                          className="px-2.5 py-1 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded transition-colors shrink-0"
                        >
                          Track PR
                        </button>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* MANAGER QUEUE: Pending Approvals */}
              {role === 'MANAGER' && (
                <>
                  {pendingPRs.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg">
                      All departmental requisitions have been approved or processed.
                    </div>
                  ) : (
                    pendingPRs.map((pr) => (
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
                    ))
                  )}
                </>
              )}

              {/* PROCUREMENT OFFICER QUEUE: Low stock replenishment & RFQ awards */}
              {role === 'PROCUREMENT_OFFICER' && (
                <>
                  {lowStockProducts.length === 0 && approvedPRs.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg">
                      No inventory alerts or RFQ assignments pending.
                    </div>
                  ) : (
                    <>
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

                      {approvedPRs.slice(0, 2).map((pr) => (
                        <div
                          key={pr.id}
                          className="p-3.5 rounded-lg border border-indigo-200 bg-indigo-50/40 flex items-start justify-between gap-3"
                        >
                          <div className="flex items-start gap-3">
                            <Scale className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs font-semibold text-indigo-950">
                                Requisition {pr.requestNumber} Ready for Quotation Comparison
                              </div>
                              <div className="text-xs text-indigo-700 mt-0.5">
                                Approved for {pr.departmentName} · Est: ${pr.estimatedTotal.toLocaleString()} · Multi-vendor RFQ active.
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveTab('quotations')}
                            className="px-2.5 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors shrink-0"
                          >
                            Compare
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}

              {/* FINANCE OFFICER QUEUE: Mismatches */}
              {role === 'FINANCE_OFFICER' && (
                <>
                  {mismatchedInvoices.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg">
                      All supplier invoices are verified against PO contracts and warehouse goods receipts.
                    </div>
                  ) : (
                    mismatchedInvoices.map((inv) => (
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
                    ))
                  )}
                </>
              )}

              {/* ADMIN QUEUE: System-wide alerts */}
              {role === 'ADMIN' && (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Traceable Activity Stream */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Audit Trail Stream</span>
              {role === 'ADMIN' && (
                <button
                  onClick={() => setActiveTab('audit')}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  View full log
                </button>
              )}
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
