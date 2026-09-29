import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { PurchaseOrder } from '../../types';
import {
  ShoppingBag,
  Search,
  Eye,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { PurchaseOrderDetailModal } from './PurchaseOrderDetailModal';
import { NewGoodsReceiptModal } from '../receiving/NewGoodsReceiptModal';

export const PurchaseOrdersView: React.FC = () => {
  const { purchaseOrders, setActiveTab, moduleErrors, fetchModuleData } = useProcurement();

  const [search, setSearch] = useState('');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [receivingPOId, setReceivingPOId] = useState<string | null>(null);

  const filtered = purchaseOrders.filter((po) => {
    return (
      po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(search.toLowerCase()) ||
      po.creatorName.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Purchase Orders (PO)
          </h1>
          <p className="text-xs text-slate-500">
            Legally binding procurement contracts with suppliers, fulfillment tracking, and delivery milestones
          </p>
        </div>

        <button
          onClick={() => setActiveTab('quotations')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors shrink-0"
        >
          <span>From Quotations</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {moduleErrors['purchaseOrders'] && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between">
          <span>{moduleErrors['purchaseOrders']}</span>
          <button
            onClick={() => fetchModuleData('purchaseOrders')}
            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by PO #, supplier name, or creator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Awarded Supplier</th>
                <th className="py-3 px-4">Line Items</th>
                <th className="py-3 px-4 text-right">Order Value</th>
                <th className="py-3 px-4">Fulfillment Progress</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No purchase orders found.
                  </td>
                </tr>
              ) : (
                filtered.map((po) => {
                  const totalOrdered = po.items.reduce((s, i) => s + i.quantityOrdered, 0);
                  const totalReceived = po.items.reduce((s, i) => s + i.quantityReceived, 0);
                  const pct = Math.round((totalReceived / totalOrdered) * 100);

                  return (
                    <tr
                      key={po.id}
                      onClick={() => setSelectedPO(po)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {po.poNumber}
                        <div className="text-[10px] text-slate-400 font-sans font-normal">
                          Ref: {po.purchaseRequestId}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{po.supplierName}</div>
                        <div className="text-[11px] text-slate-500">Terms: {po.paymentTerms}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="truncate font-medium text-slate-800">
                          {po.items[0]?.productName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {totalOrdered} total units ordered
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        ${po.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 w-44">
                        <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                          <span className="text-slate-600">{totalReceived}/{totalOrdered}</span>
                          <span className="font-semibold text-slate-800">{pct}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              pct === 100 ? 'bg-emerald-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                            po.status === 'FULLY_RECEIVED' || po.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : po.status === 'PARTIALLY_RECEIVED'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {po.status === 'PARTIALLY_RECEIVED' && <Clock className="w-3 h-3 text-amber-600" />}
                          {po.status === 'FULLY_RECEIVED' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          <span>{po.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPO(po);
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View PO Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {po.status !== 'FULLY_RECEIVED' && po.status !== 'COMPLETED' && po.status !== 'CANCELLED' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setReceivingPOId(po.id);
                              }}
                              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-semibold transition-colors"
                              title="Record Delivery"
                            >
                              Receive
                            </button>
                          )}
                        </div>
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
      <PurchaseOrderDetailModal
        po={selectedPO}
        onClose={() => setSelectedPO(null)}
        onReceiveDelivery={(poId) => setReceivingPOId(poId)}
      />

      <NewGoodsReceiptModal
        isOpen={Boolean(receivingPOId)}
        poId={receivingPOId}
        onClose={() => setReceivingPOId(null)}
      />
    </div>
  );
};
