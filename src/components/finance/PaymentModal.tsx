import React, { useState } from 'react';
import { Invoice, PaymentMethod } from '../../types';
import { useProcurement } from '../../context/ProcurementContext';
import { X, CreditCard, ShieldCheck, AlertTriangle } from 'lucide-react';

interface Props {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<Props> = ({ invoice, isOpen, onClose }) => {
  const { processPayment, currentUser } = useProcurement();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [referenceNumber, setReferenceNumber] = useState(`TXN-${Date.now().toString().slice(-6)}`);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !invoice) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (currentUser.role !== 'FINANCE_OFFICER' && currentUser.role !== 'ADMIN') {
      setError('Payment disbursement requires FINANCE_OFFICER or ADMIN role.');
      return;
    }

    setLoading(true);
    try {
      await processPayment({
        invoiceId: invoice.id,
        paymentMethod,
        referenceNumber,
      });

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Payment execution blocked by business rules.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-600 text-white rounded-lg">
              <CreditCard className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Disburse Supplier Payment
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice Number:</span>
              <strong className="font-mono text-slate-900">{invoice.invoiceNumber}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Beneficiary Supplier:</span>
              <strong className="text-slate-900">{invoice.supplierName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Linked Purchase Order:</span>
              <strong className="font-mono text-slate-900">{invoice.poNumber}</strong>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200 text-sm">
              <span className="font-semibold text-slate-700">Amount to Disburse:</span>
              <strong className="font-mono font-bold text-slate-900">
                ${invoice.totalAmount.toLocaleString()}
              </strong>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Treasury Disbursement Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="BANK_TRANSFER">Bank Wire Transfer (ACH / NEFT)</option>
              <option value="UPI">UPI Digital Transfer</option>
              <option value="CHEQUE">Treasury Bank Cheque</option>
              <option value="CASH">Cash Disbursement</option>
              <option value="OTHER">Other Authorized Method</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bank Transaction / Settlement Reference Number
            </label>
            <input
              type="text"
              required
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>3-Way Match Verification passed. Authorized by Finance &amp; Controller.</span>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Disbursing...' : 'Authorize & Disburse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
