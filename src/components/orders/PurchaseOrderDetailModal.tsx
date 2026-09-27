import React from 'react';
import { PurchaseOrder } from '../../types';
import { useProcurement } from '../../context/ProcurementContext';
import { X, Truck, Receipt, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

interface Props {
  po: PurchaseOrder | null;
  onClose: () => void;
  onReceiveDelivery: (poId: string) => void;
}

export const PurchaseOrderDetailModal: React.FC<Props> = ({ po, onClose, onReceiveDelivery }) => {
  const { goodsReceipts, invoices, setActiveTab } = useProcurement();

  if (!po) return null;

  const linkedGRNs = goodsReceipts.filter((gr) => gr.purchaseOrderId === po.id);
  const linkedInvoices = invoices.filter((inv) => inv.purchaseOrderId === po.id);

  const totalOrdered = po.items.reduce((s, i) => s + i.quantityOrdered, 0);
  const totalReceived = po.items.reduce((s, i) => s + i.quantityReceived, 0);
  const percentReceived = Math.round((totalReceived / totalOrdered) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-slate-900">
                Purchase Order {po.poNumber}
              </h3>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  po.status === 'FULLY_RECEIVED' || po.status === 'CLOSED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : po.status === 'PARTIALLY_RECEIVED'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}
              >
                {po.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Issued to {po.supplierName} · Created by {po.creatorName} on {po.orderDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Fulfillment Progress Bar */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Fulfillment Status:</span>
              <span className="font-mono font-bold text-slate-900">
                {totalReceived} of {totalOrdered} Units Received ({percentReceived}%)
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  percentReceived === 100 ? 'bg-emerald-600' : 'bg-amber-500'
                }`}
                style={{ width: `${percentReceived}%` }}
              />
            </div>
            {po.status === 'PARTIALLY_RECEIVED' && (
              <p className="text-[11px] text-amber-800 font-medium">
                Consignment is partially received. {totalOrdered - totalReceived} units remain pending delivery from supplier.
              </p>
            )}
          </div>

          {/* Line items */}
          <div>
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">
              Contracted Order Items
            </div>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3 text-right">Ordered</th>
                    <th className="py-2.5 px-3 text-right">Received</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {po.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-900">
                        {item.productName}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-800">
                        {item.quantityOrdered}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-indigo-700">
                        {item.quantityReceived}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600">
                        ${item.unitPrice.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        ${item.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-sans font-semibold">
                    <td colSpan={4} className="py-2.5 px-3 text-right text-slate-600">
                      Total Purchase Order Amount:
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ${po.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Connected Goods Receipts */}
          <div>
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-slate-500" />
              <span>Recorded Goods Receipt Notes (GRN)</span>
            </div>
            {linkedGRNs.length === 0 ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
                No delivery consignments recorded yet for this Purchase Order.
              </div>
            ) : (
              <div className="space-y-2">
                {linkedGRNs.map((gr) => (
                  <div
                    key={gr.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{gr.receiptNumber}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-600">{gr.carrier} ({gr.trackingNumber})</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Received by {gr.receiverName} on {new Date(gr.receiptDate).toLocaleString()} · Accepted: {gr.items.reduce((s, i) => s + i.acceptedQuantity, 0)} units
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg border border-slate-300"
          >
            Close
          </button>

          {po.status !== 'FULLY_RECEIVED' && po.status !== 'CLOSED' && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onReceiveDelivery(po.id);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm transition-colors"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Record Consignment Delivery</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
