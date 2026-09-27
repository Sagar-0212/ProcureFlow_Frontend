import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { X, Plus, Trash2, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NewPurchaseRequestModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { products, departments, currentUser, createPurchaseRequest } = useProcurement();

  const [departmentId, setDepartmentId] = useState(currentUser.departmentId);
  const [reason, setReason] = useState('');
  const [items, setItems] = useState<{ productId: string; quantity: number; estimatedUnitPrice: number }[]>([
    { productId: products[0]?.id || '', quantity: 5, estimatedUnitPrice: products[0]?.defaultPrice || 100 },
  ]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddItem = () => {
    const defaultProd = products[0];
    setItems((prev) => [
      ...prev,
      { productId: defaultProd?.id || '', quantity: 1, estimatedUnitPrice: defaultProd?.defaultPrice || 100 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      setError('Business Rule Violation: A purchase request must contain at least one item.');
      return;
    }
    setError(null);
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, productId: string) => {
    const selectedProd = products.find((p) => p.id === productId);
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              productId,
              estimatedUnitPrice: selectedProd ? selectedProd.defaultPrice : item.estimatedUnitPrice,
            }
          : item
      )
    );
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: Math.max(1, quantity) } : item))
    );
  };

  const handlePriceChange = (index: number, price: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, estimatedUnitPrice: Math.max(0, price) } : item))
    );
  };

  const calculateGrandTotal = () => {
    return items.reduce((sum, it) => sum + it.quantity * it.estimatedUnitPrice, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError('A purchase request must contain at least one item.');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a business justification for this procurement.');
      return;
    }

    try {
      createPurchaseRequest({
        departmentId,
        reason,
        items,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit purchase request.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Create New Purchase Request (PR)</h3>
            <p className="text-xs text-slate-500">Initiate procurement workflow per thinqloud business policy</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors"
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
          {/* Top Form Fields: Requester, Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Requester
              </label>
              <input
                type="text"
                disabled
                value={`${currentUser.name} (${currentUser.role})`}
                className="w-full text-xs bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Allocated Department
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Business Justification */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Purchase Justification &amp; Business Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Hardware equipment for incoming engineering hires in Q3..."
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Requested Products &amp; Line Items
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-200">
              <div className="bg-slate-50 px-3 py-2 grid grid-cols-12 gap-2 text-[11px] font-semibold text-slate-500 uppercase">
                <div className="col-span-5">Product Catalogue</div>
                <div className="col-span-2 text-right">Quantity</div>
                <div className="col-span-2 text-right">Est. Unit Price</div>
                <div className="col-span-2 text-right">Line Total</div>
                <div className="col-span-1 text-center">Action</div>
              </div>

              {items.map((item, idx) => {
                const lineTotal = item.quantity * item.estimatedUnitPrice;
                return (
                  <div key={idx} className="p-3 grid grid-cols-12 gap-2 items-center bg-white">
                    <div className="col-span-5">
                      <select
                        value={item.productId}
                        onChange={(e) => handleProductChange(idx, e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value) || 1)}
                        className="w-full text-xs text-right font-mono border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.estimatedUnitPrice}
                        onChange={(e) => handlePriceChange(idx, parseFloat(e.target.value) || 0)}
                        className="w-full text-xs text-right font-mono border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div className="col-span-2 text-right text-xs font-mono font-semibold text-slate-900">
                      ${lineTotal.toLocaleString()}
                    </div>

                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={items.length <= 1}
                        className={`p-1 rounded ${
                          items.length <= 1
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-rose-500 hover:bg-rose-50'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total summary */}
            <div className="flex justify-end p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-right">
                <span className="text-xs text-slate-500">Estimated Total Expenditure: </span>
                <span className="text-base font-bold font-mono text-slate-900 ml-2">
                  ${calculateGrandTotal().toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
            >
              Submit for Manager Approval
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
