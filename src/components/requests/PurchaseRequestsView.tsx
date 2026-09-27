import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { PurchaseRequest, PRStatus } from '../../types';
import {
  Plus,
  Search,
  Filter,
  Eye,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  XCircle,
  ShoppingBag,
} from 'lucide-react';
import { NewPurchaseRequestModal } from './NewPurchaseRequestModal';
import { PurchaseRequestDetailModal } from './PurchaseRequestDetailModal';

export const PurchaseRequestsView: React.FC = () => {
  const { purchaseRequests, setActiveTab } = useProcurement();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedPR, setSelectedPR] = useState<PurchaseRequest | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const filtered = purchaseRequests.filter((pr) => {
    const matchesSearch =
      pr.requestNumber.toLowerCase().includes(search.toLowerCase()) ||
      pr.requesterName.toLowerCase().includes(search.toLowerCase()) ||
      pr.departmentName.toLowerCase().includes(search.toLowerCase()) ||
      pr.reason.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || pr.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Purchase Requisitions (PR)
          </h1>
          <p className="text-xs text-slate-500">
            Employee requisitions pipeline with multi-item specifications, justification, and approval state
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Requisition</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by PR #, requester, department, or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {/* Status Segmented Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Requests' },
            { id: 'PENDING_APPROVAL', label: 'Pending' },
            { id: 'APPROVED', label: 'Approved' },
            { id: 'PO_CREATED', label: 'PO Created' },
            { id: 'REJECTED', label: 'Rejected' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === st.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requisitions Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Requisition #</th>
                <th className="py-3 px-4">Requester &amp; Dept</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4 text-right">Est. Total</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No purchase requests match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((pr) => {
                  const firstItem = pr.items[0];
                  const otherCount = pr.items.length - 1;

                  return (
                    <tr
                      key={pr.id}
                      onClick={() => setSelectedPR(pr)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {pr.requestNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{pr.requesterName}</div>
                        <div className="text-[11px] text-slate-500">{pr.departmentName}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="truncate font-medium text-slate-800">
                          {firstItem?.productName || 'Line item'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Qty: {firstItem?.quantity} {otherCount > 0 ? `+ ${otherCount} other item(s)` : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        ${pr.estimatedTotal.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(pr.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                            pr.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : pr.status === 'PENDING_APPROVAL'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : pr.status === 'PO_CREATED'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : pr.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {pr.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3" />}
                          {pr.status === 'PENDING_APPROVAL' && <Clock className="w-3 h-3" />}
                          {pr.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                          {pr.status === 'PO_CREATED' && <ShoppingBag className="w-3 h-3" />}
                          <span>{pr.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPR(pr);
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <NewPurchaseRequestModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />

      <PurchaseRequestDetailModal
        pr={selectedPR}
        onClose={() => setSelectedPR(null)}
        onApprove={(prId) => {
          setActiveTab('approvals');
        }}
      />
    </div>
  );
};
