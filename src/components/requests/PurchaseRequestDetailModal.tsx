import React from 'react';
import { PurchaseRequest } from '../../types';
import { useProcurement } from '../../context/ProcurementContext';
import { X, CheckCircle, Clock, XCircle, ArrowRight, UserCheck, Shield } from 'lucide-react';

interface Props {
  pr: PurchaseRequest | null;
  onClose: () => void;
  onApprove?: (prId: string) => void;
}

export const PurchaseRequestDetailModal: React.FC<Props> = ({ pr, onClose, onApprove }) => {
  const { currentUser, setActiveTab, cancelPurchaseRequest } = useProcurement();

  if (!pr) return null;

  const canCancel = (pr.status === 'DRAFT' || pr.status === 'PENDING_APPROVAL') && (currentUser.id === pr.requestedBy || currentUser.role === 'ADMIN');
  const canApprove = pr.status === 'PENDING_APPROVAL' && (currentUser.role === 'MANAGER' || currentUser.role === 'ADMIN');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Purchase Requisition {pr.requestNumber}
              </h3>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  pr.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : pr.status === 'PENDING_APPROVAL'
                    ? 'bg-amber-100 text-amber-800'
                    : pr.status === 'PO_CREATED'
                    ? 'bg-indigo-100 text-indigo-800'
                    : pr.status === 'REJECTED'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {pr.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Requested by {pr.requesterName} · {pr.departmentName} · {new Date(pr.submittedAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Business Justification */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Business Justification
            </div>
            <p className="text-xs text-slate-800 mt-1 leading-relaxed">
              {pr.reason}
            </p>
          </div>

          {/* Requested Items Table */}
          <div>
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">
              Requisition Line Items ({pr.items.length})
            </div>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Product Name &amp; SKU</th>
                    <th className="py-2.5 px-3 text-right">Quantity</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Est. Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {pr.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-sans">
                        <div className="font-semibold text-slate-900">{item.productName}</div>
                        <div className="text-[11px] text-slate-500">{item.sku}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-800">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600">
                        ${item.estimatedUnitPrice.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                        ${item.estimatedTotal.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50/80 font-semibold font-mono">
                    <td colSpan={3} className="py-2.5 px-3 text-right text-slate-600 font-sans">
                      Estimated Requisition Total:
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-900 text-sm">
                      ${pr.estimatedTotal.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Approval History / Audit Chain */}
          <div>
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">
              Approval Trail &amp; Manager Review
            </div>
            {pr.approvalHistory.length === 0 ? (
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Pending initial review by Department Manager or Director.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {pr.approvalHistory.map((act) => (
                  <div
                    key={act.id}
                    className={`p-3 rounded-lg border text-xs ${
                      act.action === 'APPROVED'
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : 'bg-rose-50/60 border-rose-200 text-rose-950'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <div className="flex items-center gap-1.5">
                        {act.action === 'APPROVED' ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600" />
                        )}
                        <span>{act.action} by {act.approverName}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        {new Date(act.approvedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1 text-slate-700 italic">
                      "{act.comments}"
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            {canCancel && (
              <button
                type="button"
                onClick={() => {
                  cancelPurchaseRequest(pr.id);
                  onClose();
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
              >
                Cancel Requisition
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300"
            >
              Close
            </button>

            {pr.status === 'APPROVED' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setActiveTab('quotations');
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors"
              >
                <span>Compare Quotations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {canApprove && onApprove && (
              <button
                type="button"
                onClick={() => {
                  onApprove(pr.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Review &amp; Approve</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
