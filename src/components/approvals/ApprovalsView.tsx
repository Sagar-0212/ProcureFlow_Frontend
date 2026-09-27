import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { PurchaseRequest } from '../../types';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Building,
  User,
  Clock,
  Check,
  X,
  FileText,
} from 'lucide-react';

export const ApprovalsView: React.FC = () => {
  const {
    currentUser,
    purchaseRequests,
    approvalRules,
    approvePurchaseRequest,
    rejectPurchaseRequest,
    switchRole,
  } = useProcurement();

  const [activeModalPR, setActiveModalPR] = useState<PurchaseRequest | null>(null);
  const [modalAction, setModalAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [comments, setComments] = useState('');
  const [error, setError] = useState<string | null>(null);

  const pendingRequests = purchaseRequests.filter((pr) => pr.status === 'PENDING_APPROVAL');
  const pastApprovals = purchaseRequests.filter((pr) => pr.status === 'APPROVED' || pr.status === 'REJECTED');

  const isAuthorized = currentUser.role === 'MANAGER' || currentUser.role === 'ADMIN';

  const handleOpenAction = (pr: PurchaseRequest, action: 'APPROVE' | 'REJECT') => {
    setActiveModalPR(pr);
    setModalAction(action);
    setComments(
      action === 'APPROVE'
        ? 'Verified against departmental budget and operational roadmap. Approved for vendor quotation.'
        : ''
    );
    setError(null);
  };

  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalPR) return;
    setError(null);

    if (modalAction === 'REJECT' && !comments.trim()) {
      setError('A rejection reason is strictly required by audit governance.');
      return;
    }

    try {
      if (modalAction === 'APPROVE') {
        approvePurchaseRequest(activeModalPR.id, comments);
      } else {
        rejectPurchaseRequest(activeModalPR.id, comments);
      }
      setActiveModalPR(null);
    } catch (err: any) {
      setError(err.message || 'Operation failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Manager Approval Center
          </h1>
          <p className="text-xs text-slate-500">
            Enforces departmental budget thresholds, multi-tier approval delegation, and audit verification
          </p>
        </div>

        {!isAuthorized && (
          <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>You are currently viewing as <strong>{currentUser.role}</strong>. Switch to <strong>Manager</strong> or <strong>Admin</strong> to authorize requisitions:</span>
            <button
              onClick={() => switchRole('MANAGER')}
              className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded text-xs transition-colors shrink-0"
            >
              Switch to Sarah (Manager)
            </button>
          </div>
        )}
      </div>

      {/* Approval Rules Reference Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Active Organization Approval Threshold Rules</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {approvalRules.map((rule) => (
            <div key={rule.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <div className="font-semibold text-slate-900 flex items-center justify-between">
                <span>Tier {rule.approvalLevel}: {rule.requiredRole}</span>
                <span className="font-mono text-slate-600">
                  ${rule.minAmount.toLocaleString()} – ${rule.maxAmount >= 1000000 ? 'Unlimited' : rule.maxAmount.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {rule.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Requisitions Queue */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Pending Requisitions Requiring Action ({pendingRequests.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Managerial review gate before RFQ quotation stage
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No requisitions currently awaiting managerial authorization.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingRequests.map((pr) => (
              <div key={pr.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {pr.requestNumber}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs font-semibold text-slate-700">
                      {pr.requesterName}
                    </span>
                    <span className="text-xs text-slate-500">({pr.departmentName})</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Submitted {new Date(pr.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "{pr.reason}"
                  </p>

                  <div className="pt-1 flex items-center gap-4 text-xs text-slate-500">
                    <span>
                      Items: <strong>{pr.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-500 uppercase font-medium">Requisition Total</div>
                    <div className="text-base font-bold font-mono text-slate-900">
                      ${pr.estimatedTotal.toLocaleString()}
                    </div>
                  </div>

                  {isAuthorized ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenAction(pr, 'REJECT')}
                        className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleOpenAction(pr, 'APPROVE')}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => switchRole('MANAGER')}
                      className="px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg"
                    >
                      Login as Manager to Approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decision Modal */}
      {activeModalPR && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              modalAction === 'APPROVE' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <div>
                <h3 className="text-base font-bold">
                  {modalAction === 'APPROVE' ? 'Approve Requisition' : 'Reject Requisition'} — {activeModalPR.requestNumber}
                </h3>
                <p className="text-xs opacity-80">
                  Total amount: ${activeModalPR.estimatedTotal.toLocaleString()} · Requested by {activeModalPR.requesterName}
                </p>
              </div>
              <button
                onClick={() => setActiveModalPR(null)}
                className="p-1 rounded hover:bg-black/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleConfirmAction} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Manager Review Remarks &amp; Audit Comments {modalAction === 'REJECT' && <span className="text-rose-500">*</span>}
                </label>
                <textarea
                  rows={3}
                  required={modalAction === 'REJECT'}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={
                    modalAction === 'APPROVE'
                      ? 'e.g. Approved within Q3 departmental hardware allocation.'
                      : 'Provide explicit business reason for rejection...'
                  }
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModalPR(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-sm text-white ${
                    modalAction === 'APPROVE'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {modalAction === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
