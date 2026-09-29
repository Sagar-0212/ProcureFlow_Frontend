import React, { useState, useEffect } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { X, Truck, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  poId: string | null;
  onClose: () => void;
}

export const NewGoodsReceiptModal: React.FC<Props> = ({ isOpen, poId, onClose }) => {
  const { purchaseOrders, processGoodsReceipt, currentUser } = useProcurement();

  const [selectedPOId, setSelectedPOId] = useState<string>(poId || '');
  const [carrier, setCarrier] = useState('FedEx Freight Direct');
  const [trackingNumber, setTrackingNumber] = useState('FX-9920148190');
  const [notes, setNotes] = useState('Consignment inspected at warehouse loading dock.');
  const [receiptLines, setReceiptLines] = useState<
    {
      poItemId: string;
      productId: string;
      productName: string;
      ordered: number;
      alreadyReceived: number;
      remainingToReceive: number;
      receivedQuantity: number;
      acceptedQuantity: number;
      rejectedQuantity: number;
      rejectionReason?: string;
    }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  const po = purchaseOrders.find((p) => p.id === (selectedPOId || poId));

  useEffect(() => {
    if (po) {
      setSelectedPOId(po.id);
      const lines = po.items.map((item) => {
        const remaining = item.quantityOrdered - item.quantityReceived;
        return {
          poItemId: item.id,
          productId: item.productId,
          productName: item.productName,
          ordered: item.quantityOrdered,
          alreadyReceived: item.quantityReceived,
          remainingToReceive: remaining,
          receivedQuantity: remaining, // default to remaining
          acceptedQuantity: remaining,
          rejectedQuantity: 0,
          rejectionReason: '',
        };
      });
      setReceiptLines(lines);
    }
  }, [poId, selectedPOId, purchaseOrders]);

  if (!isOpen) return null;

  const handleReceivedChange = (index: number, val: number) => {
    const qty = Math.max(0, val);
    setReceiptLines((prev) =>
      prev.map((line, i) =>
        i === index
          ? {
              ...line,
              receivedQuantity: qty,
              acceptedQuantity: Math.max(0, qty - line.rejectedQuantity),
            }
          : line
      )
    );
  };

  const handleRejectedChange = (index: number, val: number) => {
    const rej = Math.max(0, val);
    setReceiptLines((prev) =>
      prev.map((line, i) =>
        i === index
          ? {
              ...line,
              rejectedQuantity: rej,
              acceptedQuantity: Math.max(0, line.receivedQuantity - rej),
            }
          : line
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!po) {
      setError('Please select an active Purchase Order.');
      return;
    }

    const totalAccepted = receiptLines.reduce((s, l) => s + l.acceptedQuantity, 0);
    if (totalAccepted === 0) {
      setError('At least one item must have an accepted quantity greater than zero.');
      return;
    }

    // Verify constraint: Received quantity cannot exceed ordered quantity
    for (const line of receiptLines) {
      if (line.alreadyReceived + line.acceptedQuantity > line.ordered) {
        setError(
          `Constraint Error: Cumulative accepted quantity (${line.alreadyReceived + line.acceptedQuantity}) exceeds ordered amount (${line.ordered}) for ${line.productName}.`
        );
        return;
      }
    }

    if (currentUser.role !== 'PROCUREMENT_OFFICER' && currentUser.role !== 'ADMIN') {
      setError('Goods Receipts can only be processed by PROCUREMENT_OFFICER or ADMIN.');
      return;
    }

    try {
      await processGoodsReceipt({
        purchaseOrderId: po.id,
        carrier,
        trackingNumber,
        notes,
        items: receiptLines.map((l) => ({
          poItemId: l.poItemId,
          productId: l.productId,
          receivedQuantity: l.receivedQuantity,
          acceptedQuantity: l.acceptedQuantity,
          rejectedQuantity: l.rejectedQuantity,
          rejectionReason: l.rejectionReason,
        })),
      });

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to record Goods Receipt Note.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-slate-900 text-white rounded-lg">
                <Truck className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Record Inward Goods Receipt Note (GRN)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Supports partial delivery consignments and automatically updates warehouse inventory ledgers.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* PO Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Purchase Order to Receive
            </label>
            <select
              value={selectedPOId}
              onChange={(e) => setSelectedPOId(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
            >
              {purchaseOrders
                .filter((p) => p.status !== 'FULLY_RECEIVED' && p.status !== 'COMPLETED' && p.status !== 'CANCELLED')
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.poNumber} — {p.supplierName} (${p.totalAmount.toLocaleString()}) [{p.status}]
                  </option>
                ))}
            </select>
          </div>

          {/* Logistics Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Logistics Carrier
              </label>
              <input
                type="text"
                required
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="e.g. FedEx Freight Direct"
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Waybill / Tracking Number
              </label>
              <input
                type="text"
                required
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. FX-9920148190"
                className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Receiving Lines */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Consignment Item Inspection &amp; Tally
              </span>
              <span className="text-xs text-slate-500">
                Enter quantity physically arrived today
              </span>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-200">
              <div className="bg-slate-50 px-3 py-2 grid grid-cols-12 gap-2 text-[11px] font-semibold text-slate-500 uppercase">
                <div className="col-span-5">Product &amp; Order Status</div>
                <div className="col-span-2 text-right">Arrived</div>
                <div className="col-span-2 text-right">Accepted</div>
                <div className="col-span-3 text-right">Rejected (Defect)</div>
              </div>

              {receiptLines.map((line, idx) => (
                <div key={line.poItemId} className="p-3 bg-white space-y-2">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <div className="font-semibold text-xs text-slate-900 truncate">
                        {line.productName}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        Ordered: {line.ordered} · Prev Received: {line.alreadyReceived} · Outstanding: {line.remainingToReceive}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0"
                        max={line.remainingToReceive}
                        value={line.receivedQuantity}
                        onChange={(e) => handleReceivedChange(idx, parseInt(e.target.value) || 0)}
                        className="w-full text-xs text-right font-mono border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        disabled
                        value={line.acceptedQuantity}
                        className="w-full text-xs text-right font-mono bg-emerald-50 text-emerald-800 font-bold border border-emerald-300 rounded px-2 py-1.5"
                      />
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        min="0"
                        max={line.receivedQuantity}
                        value={line.rejectedQuantity}
                        onChange={(e) => handleRejectedChange(idx, parseInt(e.target.value) || 0)}
                        className="w-full text-xs text-right font-mono border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-900 text-rose-700 font-semibold"
                      />
                    </div>
                  </div>

                  {line.rejectedQuantity > 0 && (
                    <div className="pt-1">
                      <input
                        type="text"
                        placeholder="State reason for rejecting items (e.g. cracked screen, water damaged packaging)..."
                        value={line.rejectionReason}
                        onChange={(e) => {
                          const val = e.target.value;
                          setReceiptLines((prev) =>
                            prev.map((l, i) => (i === idx ? { ...l, rejectionReason: val } : l))
                          );
                        }}
                        className="w-full text-xs border border-rose-200 bg-rose-50/50 rounded px-2.5 py-1 text-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Receiving notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Receiving Inspector Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Dock conditions, package seal verification, etc."
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-[11px] text-slate-500">
              Updates PO fulfillment state and increases warehouse stock atomically.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
              >
                Confirm Goods Receipt
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
