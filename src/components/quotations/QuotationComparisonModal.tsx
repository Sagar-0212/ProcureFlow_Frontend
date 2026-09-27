import React from 'react';
import { Quotation, PurchaseRequest } from '../../types';
import { useProcurement } from '../../context/ProcurementContext';
import {
  X,
  Award,
  CheckCircle,
  Truck,
  Shield,
  CreditCard,
  Star,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';

interface Props {
  pr: PurchaseRequest | null;
  quotations: Quotation[];
  isOpen: boolean;
  onClose: () => void;
}

export const QuotationComparisonModal: React.FC<Props> = ({
  pr,
  quotations,
  isOpen,
  onClose,
}) => {
  const { selectSupplierAndGeneratePO, setActiveTab, currentUser, switchRole } = useProcurement();

  if (!isOpen || !pr) return null;

  const relevantQuotes = quotations.filter((q) => q.purchaseRequestId === pr.id);

  const handleAwardSupplier = (quoteId: string) => {
    if (currentUser.role !== 'PROCUREMENT' && currentUser.role !== 'ADMIN') {
      switchRole('PROCUREMENT');
    }
    selectSupplierAndGeneratePO(pr.id, quoteId);
    onClose();
    setActiveTab('orders');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                <Award className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Supplier Quotation Comparison Matrix — Requisition {pr.requestNumber}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Multi-criteria vendor analysis: Evaluating unit costs, delivery SLA, warranty coverage, and supplier credibility.
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
          {/* Requisition Context Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-slate-500">Requested Items: </span>
              <strong className="text-slate-900">
                {pr.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
              </strong>
            </div>
            <div>
              <span className="text-slate-500">Department Budget Estimate: </span>
              <strong className="font-mono text-slate-900">${pr.estimatedTotal.toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-slate-500">Requester: </span>
              <strong className="text-slate-900">{pr.requesterName}</strong>
            </div>
          </div>

          {/* Side-by-Side Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relevantQuotes.map((quote) => {
              const isRecommended = quote.supplierId === 'SUP-01'; // TechSupply Pro as recommended in PDF
              const isAccepted = quote.status === 'ACCEPTED';

              return (
                <div
                  key={quote.id}
                  className={`rounded-xl border p-5 flex flex-col justify-between transition-all relative ${
                    isAccepted
                      ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20'
                      : isRecommended
                      ? 'border-emerald-500 bg-emerald-50/20 ring-1 ring-emerald-400/40 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {/* Top Badge */}
                  {isAccepted && (
                    <div className="absolute -top-3 left-4 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Awarded PO</span>
                    </div>
                  )}
                  {!isAccepted && isRecommended && (
                    <div className="absolute -top-3 left-4 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      <span>Best Balanced Value</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Supplier Name & Bid # */}
                    <div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {quote.quotationNumber}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">
                        {quote.supplierName}
                      </h4>
                    </div>

                    {/* Price Block */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                      <div className="text-[11px] text-slate-500">Total Landed Bid</div>
                      <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                        ${quote.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        Unit Rate: ${quote.items[0]?.unitPrice.toLocaleString()} / unit
                      </div>
                    </div>

                    {/* Multi-Criteria Comparison Attributes */}
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-start gap-2">
                        <Truck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-500">Delivery Lead Time:</span>{' '}
                          <strong className="text-slate-900">{quote.deliveryDays} Business Days</strong>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-500">Warranty Coverage:</span>{' '}
                          <strong className="text-slate-900">{quote.warrantyPeriod}</strong>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <CreditCard className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-500">Payment Terms:</span>{' '}
                          <strong className="text-slate-900">{quote.paymentTerms}</strong>
                        </div>
                      </div>

                      {quote.notes && (
                        <div className="p-2.5 rounded bg-amber-50/60 border border-amber-200/60 text-[11px] text-amber-900">
                          <strong>Perk:</strong> {quote.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Award Action */}
                  <div className="pt-5 mt-4 border-t border-slate-100">
                    {isAccepted ? (
                      <div className="w-full text-center py-2 text-xs font-bold text-indigo-700 bg-indigo-100/60 rounded-lg">
                        PO Issued &amp; Active
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAwardSupplier(quote.id)}
                        className={`w-full py-2 px-3 text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 ${
                          isRecommended
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        <span>Award &amp; Issue Purchase Order</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Thinqloud Assessment Principle Callout */}
          <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 text-xs text-slate-700 leading-relaxed">
            <strong className="text-slate-900 font-semibold">Assessment Insight (Why TechSupply Pro was selected):</strong>{' '}
            Although Apex Global offered a slightly lower subtotal ($11,500), their delivery lead time is 8 business days with depot-only warranty.
            TechSupply Pro provides 3-day rapid delivery, 36 months on-site next business day warranty, and free pre-configured OS provisioning, making it
            the superior overall business decision.
          </div>
        </div>
      </div>
    </div>
  );
};
