import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  Truck,
  Plus,
  Search,
  Package,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Boxes,
} from 'lucide-react';
import { NewGoodsReceiptModal } from './NewGoodsReceiptModal';

export const GoodsReceiptView: React.FC = () => {
  const { goodsReceipts, purchaseOrders, setActiveTab } = useProcurement();

  const [search, setSearch] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const openPOs = purchaseOrders.filter(
    (p) => p.status === 'ISSUED' || p.status === 'PARTIALLY_RECEIVED'
  );

  const filteredGRNs = goodsReceipts.filter((gr) => {
    return (
      gr.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      gr.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      gr.receiverName.toLowerCase().includes(search.toLowerCase()) ||
      gr.carrier.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Warehouse Goods Receipt Station (GRN)
          </h1>
          <p className="text-xs text-slate-500">
            Dock verification, consignment inspection, partial delivery tallies, and automated inventory sync
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Record Inward Consignment</span>
        </button>
      </div>

      {/* Partial Delivery Architecture Principle Card */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-indigo-500 rounded text-white">
              <Truck className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-slate-100">
              Thinqloud Architectural Design: Partial Delivery Handling
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">1 PO → N Receipts</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          Purchase orders frequently arrive in separated multi-batch consignments. ProcureFlow models this as a clean 1:N
          relationship: each delivery creates a distinct Goods Receipt Note (GRN) and increments inventory only for accepted
          physical units. When 8 of 10 items arrive, the PO enters <code className="text-amber-300 font-mono">PARTIALLY_RECEIVED</code>.
          Only when the final 2 units arrive does it advance to <code className="text-emerald-300 font-mono">FULLY_RECEIVED</code>.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by GRN #, PO #, receiver, or carrier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* GRN List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">GRN #</th>
                <th className="py-3 px-4">Purchase Order</th>
                <th className="py-3 px-4">Carrier &amp; Tracking</th>
                <th className="py-3 px-4">Accepted Quantity</th>
                <th className="py-3 px-4">Inspector</th>
                <th className="py-3 px-4">Receipt Date</th>
                <th className="py-3 px-4 text-center">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredGRNs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                    No goods receipts recorded yet.
                  </td>
                </tr>
              ) : (
                filteredGRNs.map((grn) => {
                  const acceptedSum = grn.items.reduce((s, i) => s + i.acceptedQuantity, 0);
                  const rejectedSum = grn.items.reduce((s, i) => s + i.rejectedQuantity, 0);

                  return (
                    <tr key={grn.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {grn.receiptNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setActiveTab('orders')}
                          className="font-bold text-indigo-600 hover:underline flex items-center gap-1"
                        >
                          <span>{grn.poNumber}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-semibold text-slate-900">{grn.carrier}</div>
                        <div className="text-[11px] font-mono text-slate-500">{grn.trackingNumber}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          +{acceptedSum} Units
                        </span>
                        {rejectedSum > 0 && (
                          <span className="ml-2 font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            {rejectedSum} Rejected
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-sans text-slate-700 font-medium">
                        {grn.receiverName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(grn.receiptDate).toLocaleDateString()}{' '}
                        {new Date(grn.receiptDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4 text-center font-sans">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Stock Incremented</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <NewGoodsReceiptModal
        isOpen={isNewModalOpen}
        poId={openPOs[0]?.id || null}
        onClose={() => setIsNewModalOpen(false)}
      />
    </div>
  );
};
