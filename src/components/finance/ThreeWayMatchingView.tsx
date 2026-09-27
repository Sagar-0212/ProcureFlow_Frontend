import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Invoice } from '../../types';
import {
  Receipt,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  ShieldCheck,
  CreditCard,
  Plus,
  ArrowRight,
  Truck,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { NewInvoiceModal } from './NewInvoiceModal';
import { PaymentModal } from './PaymentModal';

export const ThreeWayMatchingView: React.FC = () => {
  const {
    invoices,
    purchaseOrders,
    goodsReceipts,
    payments,
    evaluateThreeWayMatch,
    resolveMissingDeliveryShortcut,
    setActiveTab,
  } = useProcurement();

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(invoices[0]?.id || '');
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const selectedInvoice = invoices.find((i) => i.id === selectedInvoiceId) || invoices[0];
  const linkedPO = purchaseOrders.find((p) => p.id === selectedInvoice?.purchaseOrderId);
  const linkedGRNs = goodsReceipts.filter((gr) => gr.purchaseOrderId === selectedInvoice?.purchaseOrderId);

  const matchResult = selectedInvoice ? evaluateThreeWayMatch(selectedInvoice.id) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Finance &amp; Three-Way Matching Engine
          </h1>
          <p className="text-xs text-slate-500">
            Internal controls audit comparing Purchase Order contract vs Goods Receipt dock tally vs Supplier Invoice claim
          </p>
        </div>

        <button
          onClick={() => setIsNewInvoiceModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Invoice</span>
        </button>
      </div>

      {/* Flagship Demonstration Box */}
      {selectedInvoice && matchResult && (
        <div className="space-y-4">
          {/* Status Verdict Banner */}
          {!matchResult.isMatch ? (
            <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-5 text-rose-950 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-rose-600 text-white rounded-lg shrink-0 mt-0.5 shadow-xs">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                        Disbursement Blocked
                      </span>
                      <span className="text-xs font-mono font-semibold text-rose-800">
                        Invoice #{selectedInvoice.invoiceNumber}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-rose-950 mt-1">
                      Critical Three-Way Match Discrepancy Detected
                    </h2>
                    <p className="text-xs text-rose-900 mt-1 leading-relaxed max-w-3xl">
                      {matchResult.summary}
                    </p>
                  </div>
                </div>

                {/* Resolution CTA Shortcut */}
                <div className="shrink-0 flex flex-col sm:items-end gap-2">
                  <button
                    onClick={() => resolveMissingDeliveryShortcut(selectedInvoice.purchaseOrderId)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-lg shadow transition-colors"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Receive Remaining 2 Laptops (GRN-2002)</span>
                  </button>
                  <span className="text-[11px] text-rose-700">
                    Live demo shortcut to resolve delivery gap
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-5 text-emerald-950 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-lg shrink-0 mt-0.5 shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Match Verified · Authorized
                      </span>
                      <span className="text-xs font-mono font-semibold text-emerald-800">
                        Invoice #{selectedInvoice.invoiceNumber}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-emerald-950 mt-1">
                      Three-Way Reconciliation Verified (100% Agreement)
                    </h2>
                    <p className="text-xs text-emerald-900 mt-1 leading-relaxed max-w-3xl">
                      All 10 ordered units have physical warehouse acceptance (GRN-2001 + GRN-2002).
                      Unit rate ($1,200) strictly matches PO agreement. Invoice is cleared for treasury disbursement.
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {selectedInvoice.status === 'PAID' ? (
                    <div className="px-4 py-2 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1.5 border border-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Paid &amp; Settled</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Disburse Payment (${selectedInvoice.totalAmount.toLocaleString()})</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3-Column Comparative Visual Matrix (PO vs GRN vs Invoice) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Side-by-Side 3-Way Reconciliation Comparison
                </h3>
                <p className="text-xs text-slate-500">
                  Business rule check across the 3 fundamental procurement pillars
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                Ref PO: {selectedInvoice.poNumber}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Column 1: Purchase Order (Contract) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-slate-600" />
                    <span>1. Purchase Order</span>
                  </span>
                  <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 font-semibold">
                    {selectedInvoice.poNumber}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ordered Qty:</span>
                    <strong className="font-mono text-slate-900">{matchResult.orderedQty} Units</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contract Rate:</span>
                    <strong className="font-mono text-slate-900">${matchResult.poUnitPrice.toLocaleString()} / unit</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-500 font-medium">Contract Total:</span>
                    <strong className="font-mono font-bold text-slate-900 text-sm">
                      ${matchResult.poTotal.toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-500 italic">
                  Legally agreed specification with {selectedInvoice.supplierName}.
                </div>
              </div>

              {/* Column 2: Goods Receipt (Physical Warehouse Dock) */}
              <div
                className={`p-4 rounded-xl border space-y-3 ${
                  matchResult.receivedQty < matchResult.invoicedQty
                    ? 'border-rose-300 bg-rose-50/50'
                    : 'border-emerald-300 bg-emerald-50/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-slate-600" />
                    <span>2. Goods Receipts (GRN)</span>
                  </span>
                  <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 font-semibold">
                    {linkedGRNs.length} GRN(s)
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Accepted at Dock:</span>
                    <strong
                      className={`font-mono text-sm font-bold ${
                        matchResult.receivedQty < matchResult.invoicedQty
                          ? 'text-rose-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {matchResult.receivedQty} Units
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Shortage / Missing:</span>
                    <strong
                      className={`font-mono ${
                        matchResult.orderedQty - matchResult.receivedQty > 0
                          ? 'text-rose-600 font-bold'
                          : 'text-slate-600'
                      }`}
                    >
                      {matchResult.orderedQty - matchResult.receivedQty} Units
                    </strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-500 font-medium">Physical Value:</span>
                    <strong className="font-mono font-bold text-slate-900 text-sm">
                      ${(matchResult.receivedQty * matchResult.poUnitPrice).toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-600">
                  {linkedGRNs.map((g) => `${g.receiptNumber} (${g.items.reduce((s, i) => s + i.acceptedQuantity, 0)}u)`).join(', ')}
                </div>
              </div>

              {/* Column 3: Supplier Invoice (Commercial Claim) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-slate-600" />
                    <span>3. Supplier Invoice</span>
                  </span>
                  <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 font-semibold">
                    {selectedInvoice.invoiceNumber}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Billed Quantity:</span>
                    <strong className="font-mono text-slate-900">{matchResult.invoicedQty} Units</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Billed Unit Rate:</span>
                    <strong className="font-mono text-slate-900">
                      ${matchResult.invoicedUnitPrice.toLocaleString()} / unit
                    </strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-500 font-medium">Invoice Claim:</span>
                    <strong className="font-mono font-bold text-slate-900 text-sm">
                      ${matchResult.invoicedTotal.toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-500">
                  Due: {selectedInvoice.dueDate} · Terms: Net 30
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoices List Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-900">Registered Supplier Invoices</h2>
          <span className="text-xs text-slate-500">Click any row to evaluate 3-way match</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Linked PO</th>
                <th className="py-3 px-4 text-right">Invoice Amount</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Three-Way Match State</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {invoices.map((inv) => {
                const isSelected = selectedInvoice?.id === inv.id;
                return (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoiceId(inv.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-slate-100/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-sans font-medium text-slate-900">
                      {inv.supplierName}
                    </td>
                    <td className="py-3.5 px-4 text-indigo-600 font-semibold">
                      {inv.poNumber}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      ${inv.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {inv.dueDate}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'MATCH_VERIFIED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                            : 'bg-rose-50 text-rose-700 border border-rose-300 font-bold'
                        }`}
                      >
                        {inv.status === 'PAID' && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                        {inv.status === 'MATCH_VERIFIED' && <Unlock className="w-3 h-3 text-emerald-600" />}
                        {inv.status === 'MATCH_FAILED' && <Lock className="w-3 h-3 text-rose-600" />}
                        <span>{inv.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-sans">
                      {inv.status === 'MATCH_VERIFIED' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInvoiceId(inv.id);
                            setIsPaymentModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-xs transition-colors"
                        >
                          Disburse
                        </button>
                      ) : inv.status === 'MATCH_FAILED' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInvoiceId(inv.id);
                          }}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded text-[11px] font-bold"
                        >
                          Inspect Mismatch
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-semibold">Settled</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History */}
      {payments.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-900">Executed Payment Ledger</h2>
          </div>
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200 font-sans">
              <tr>
                <th className="py-2.5 px-4">Settlement Ref</th>
                <th className="py-2.5 px-4">Invoice #</th>
                <th className="py-2.5 px-4 text-right">Amount Paid</th>
                <th className="py-2.5 px-4 font-sans">Payment Method</th>
                <th className="py-2.5 px-4 font-sans">Disbursed By</th>
                <th className="py-2.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="py-3 px-4 font-bold text-slate-900">{p.referenceNumber}</td>
                  <td className="py-3 px-4 text-indigo-600 font-semibold">{p.invoiceNumber}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    ${p.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-sans font-medium text-slate-700">
                    {p.paymentMethod.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-600">{p.processorName}</td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    {new Date(p.paymentDate).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <NewInvoiceModal
        isOpen={isNewInvoiceModalOpen}
        onClose={() => setIsNewInvoiceModalOpen(false)}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        invoice={selectedInvoice}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    </div>
  );
};
