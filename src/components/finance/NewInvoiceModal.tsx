import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { X, Receipt, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NewInvoiceModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { purchaseOrders, createInvoice, currentUser, switchRole } = useProcurement();

  const [selectedPOId, setSelectedPOId] = useState<string>(purchaseOrders[0]?.id || '');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [billedQuantity, setBilledQuantity] = useState(10);
  const [billedUnitPrice, setBilledUnitPrice] = useState(1200);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const po = purchaseOrders.find((p) => p.id === selectedPOId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!po) {
      setError('Please select an active Purchase Order.');
      return;
    }

    try {
      if (currentUser.role !== 'FINANCE' && currentUser.role !== 'ADMIN') {
        switchRole('FINANCE');
      }

      createInvoice({
        purchaseOrderId: po.id,
        invoiceNumber,
        invoiceDate,
        dueDate,
        items: [
          {
            productId: po.items[0]?.productId || 'PROD-01',
            quantity: billedQuantity,
            unitPrice: billedUnitPrice,
            tax: 0,
          },
        ],
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to register invoice.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-slate-900 text-white rounded-lg">
              <Receipt className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Register Supplier Invoice
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
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Associate with Purchase Order
            </label>
            <select
              value={selectedPOId}
              onChange={(e) => {
                setSelectedPOId(e.target.value);
                const found = purchaseOrders.find((p) => p.id === e.target.value);
                if (found && found.items[0]) {
                  setBilledQuantity(found.items[0].quantityOrdered);
                  setBilledUnitPrice(found.items[0].unitPrice);
                }
              }}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {purchaseOrders.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.poNumber} — {p.supplierName} (${p.totalAmount.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supplier Invoice #
              </label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Invoice Issue Date
              </label>
              <input
                type="date"
                required
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <span className="text-xs font-bold text-slate-900 uppercase">
              Billed Line Item Details
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Quantity Billed on Invoice
                </label>
                <input
                  type="number"
                  min="1"
                  value={billedQuantity}
                  onChange={(e) => setBilledQuantity(parseInt(e.target.value) || 1)}
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Unit Price Charged ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={billedUnitPrice}
                  onChange={(e) => setBilledUnitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200">
              <span className="text-slate-500">Computed Invoice Total:</span>
              <strong className="font-mono text-slate-900 text-sm">
                ${(billedQuantity * billedUnitPrice).toLocaleString()}
              </strong>
            </div>
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
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
            >
              Register &amp; Run 3-Way Match
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
