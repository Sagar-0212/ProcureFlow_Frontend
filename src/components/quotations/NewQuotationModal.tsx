import React, { useState, useEffect } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { X, Plus, Trash2, AlertCircle, FileText, Building, Calendar, ShieldCheck, DollarSign } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultPRId?: string;
}

export const NewQuotationModal: React.FC<Props> = ({ isOpen, onClose, defaultPRId }) => {
  const { purchaseRequests, suppliers, products, createQuotation, currentUser } = useProcurement();

  // Requisitions that can receive quotations (Approved or active PRs)
  const eligiblePRs = purchaseRequests.filter(
    (pr) => pr.status === 'APPROVED' || pr.status === 'PENDING_APPROVAL' || pr.status === 'SUBMITTED'
  );

  const [selectedPRId, setSelectedPRId] = useState<string>(
    defaultPRId || (eligiblePRs[0]?.id || '')
  );
  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [deliveryDays, setDeliveryDays] = useState<number>(5);
  const [warrantyPeriod, setWarrantyPeriod] = useState<string>('12 Months Comprehensive Warranty');
  const [paymentTerms, setPaymentTerms] = useState<string>(suppliers[0]?.paymentTerms || 'Net 30 Days');
  const [notes, setNotes] = useState<string>('Commercial proposal submitted per RFP specifications.');
  const [items, setItems] = useState<
    { productId: string; quantity: number; unitPrice: number; discount: number; taxPercent: number }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // When selected PR changes, populate quotation lines from the PR items
  useEffect(() => {
    const pr = purchaseRequests.find((p) => p.id === selectedPRId);
    if (pr && pr.items && pr.items.length > 0) {
      setItems(
        pr.items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: it.estimatedUnitPrice,
          discount: 0,
          taxPercent: 0,
        }))
      );
    } else if (products.length > 0 && items.length === 0) {
      setItems([
        {
          productId: products[0].id,
          quantity: 1,
          unitPrice: products[0].defaultPrice,
          discount: 0,
          taxPercent: 0,
        },
      ]);
    }
  }, [selectedPRId, purchaseRequests]);

  // When supplier changes, update default payment terms
  useEffect(() => {
    const sup = suppliers.find((s) => s.id === supplierId);
    if (sup && sup.paymentTerms) {
      setPaymentTerms(sup.paymentTerms);
    }
  }, [supplierId, suppliers]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    const defaultProd = products[0];
    setItems((prev) => [
      ...prev,
      {
        productId: defaultProd?.id || '',
        quantity: 1,
        unitPrice: defaultProd?.defaultPrice || 100,
        discount: 0,
        taxPercent: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      setError('A quotation must contain at least one line item.');
      return;
    }
    setError(null);
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, pId: string) => {
    const prod = products.find((p) => p.id === pId);
    setItems((prev) =>
      prev.map((it, i) =>
        i === index
          ? {
              ...it,
              productId: pId,
              unitPrice: prod ? prod.defaultPrice : it.unitPrice,
            }
          : it
      )
    );
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, quantity: Math.max(1, quantity) } : it))
    );
  };

  const handlePriceChange = (index: number, price: number) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, unitPrice: Math.max(0, price) } : it))
    );
  };

  const handleDiscountChange = (index: number, discount: number) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, discount: Math.min(100, Math.max(0, discount)) } : it))
    );
  };

  const handleTaxChange = (index: number, tax: number) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, taxPercent: Math.min(100, Math.max(0, tax)) } : it))
    );
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, it) => sum + it.quantity * it.unitPrice * (1 - (it.discount || 0) / 100), 0);
  };

  const calculateTax = () => {
    return items.reduce((sum, it) => {
      const lineNet = it.quantity * it.unitPrice * (1 - (it.discount || 0) / 100);
      return sum + lineNet * ((it.taxPercent || 0) / 100);
    }, 0);
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedPRId) {
      setError('Please select an active Purchase Requisition for this bid.');
      return;
    }

    if (!supplierId) {
      setError('Please select a participating supplier.');
      return;
    }

    if (items.length === 0) {
      setError('At least one item line must be quoted.');
      return;
    }

    setLoading(true);
    try {
      await createQuotation({
        purchaseRequestId: selectedPRId,
        supplierId,
        deliveryDays: Number(deliveryDays) || 5,
        warrantyPeriod,
        paymentTerms,
        notes,
        items,
      });

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to register quotation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Register Vendor Quotation / Bid</span>
            </h3>
            <p className="text-xs text-slate-500">Record a supplier's formal response to an active requisition RFP</p>
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
          {/* Top Selection: Requisition & Supplier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Purchase Requisition (PR)
              </label>
              <select
                value={selectedPRId}
                onChange={(e) => setSelectedPRId(e.target.value)}
                required
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {eligiblePRs.length === 0 ? (
                  <option value="">No active requisitions found</option>
                ) : (
                  eligiblePRs.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      {pr.requestNumber} — {pr.reason.slice(0, 35)}... (${pr.estimatedTotal.toLocaleString()})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bidding Supplier
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                required
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.companyName} (Rating: {s.rating}★)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Commercial Terms: Delivery Days, Warranty, Payment Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Committed Lead Time (Days)
              </label>
              <input
                type="number"
                min="1"
                required
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Warranty Coverage
              </label>
              <input
                type="text"
                required
                value={warrantyPeriod}
                onChange={(e) => setWarrantyPeriod(e.target.value)}
                placeholder="e.g. 12 Months Standard"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Terms
              </label>
              <input
                type="text"
                required
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="e.g. Net 30 Days"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Quoted Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Quoted Line Items &amp; Pricing
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item Line</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3 w-20">Qty</th>
                    <th className="py-2.5 px-3 w-28">Unit Rate ($)</th>
                    <th className="py-2.5 px-3 w-20">Disc (%)</th>
                    <th className="py-2.5 px-3 w-20">Tax (%)</th>
                    <th className="py-2.5 px-3 text-right">Line Total</th>
                    <th className="py-2.5 px-2 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => {
                    const lineNet = item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100);
                    const lineTax = lineNet * ((item.taxPercent || 0) / 100);
                    const lineTotal = lineNet + lineTax;

                    return (
                      <tr key={idx} className="bg-white">
                        <td className="p-2">
                          <select
                            value={item.productId}
                            onChange={(e) => handleProductChange(idx, e.target.value)}
                            className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-900"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.sku})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                            className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1 text-center font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handlePriceChange(idx, Number(e.target.value))}
                            className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1 text-right font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discount}
                            onChange={(e) => handleDiscountChange(idx, Number(e.target.value))}
                            className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1 text-right font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.taxPercent}
                            onChange={(e) => handleTaxChange(idx, Number(e.target.value))}
                            className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1 text-right font-mono"
                          />
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-slate-900">
                          ${lineTotal.toFixed(2)}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supplier Notes &amp; Terms Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Commercial stipulations, exclusions, delivery conditions..."
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Financial Summary */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono">${calculateSubtotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Calculated Tax:</span>
              <span className="font-mono">${calculateTax().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
              <span>Total Landed Bid:</span>
              <span className="font-mono text-indigo-700">
                ${calculateGrandTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting Bid...' : 'Register Quotation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
