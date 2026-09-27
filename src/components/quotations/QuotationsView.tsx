import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Quotation, PurchaseRequest } from '../../types';
import {
  Scale,
  Award,
  CheckCircle,
  Clock,
  Plus,
  ArrowRight,
  ExternalLink,
  Shield,
  Truck,
} from 'lucide-react';
import { QuotationComparisonModal } from './QuotationComparisonModal';

export const QuotationsView: React.FC = () => {
  const { purchaseRequests, quotations, suppliers } = useProcurement();

  // Find PRs that are approved or have quotations
  const approvedPRs = purchaseRequests.filter(
    (pr) => pr.status === 'APPROVED' || pr.status === 'PO_CREATED'
  );

  const [selectedPRForComparison, setSelectedPRForComparison] = useState<PurchaseRequest | null>(
    approvedPRs[0] || null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Quotation Management &amp; Vendor Selection
          </h1>
          <p className="text-xs text-slate-500">
            Multi-vendor RFP evaluation comparing unit rates, SLA lead times, warranty periods, and payment terms
          </p>
        </div>

        {approvedPRs.length > 0 && (
          <button
            onClick={() => {
              setSelectedPRForComparison(approvedPRs[0]);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Scale className="w-4 h-4" />
            <span>Launch Comparison Matrix</span>
          </button>
        )}
      </div>

      {/* Requisitions Ready for Quotation / Comparison */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900">
          Approved Requisitions with Active Vendor Bids
        </h2>

        {approvedPRs.map((pr) => {
          const prQuotes = quotations.filter((q) => q.purchaseRequestId === pr.id);
          const acceptedQuote = prQuotes.find((q) => q.status === 'ACCEPTED');

          return (
            <div
              key={pr.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {pr.requestNumber}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Approved Requisition
                    </span>
                    {acceptedQuote && (
                      <span className="text-xs px-2 py-0.5 rounded font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        <span>Awarded to {acceptedQuote.supplierName}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                    {pr.reason}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400">Target Budget</div>
                    <div className="font-mono font-bold text-sm text-slate-900">
                      ${pr.estimatedTotal.toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPRForComparison(pr);
                      setIsModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <span>Compare {prQuotes.length} Quotes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Mini quotation comparison strip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {prQuotes.map((q) => (
                  <div
                    key={q.id}
                    className={`p-3.5 rounded-lg border text-xs ${
                      q.status === 'ACCEPTED'
                        ? 'border-indigo-300 bg-indigo-50/40'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-slate-500">{q.quotationNumber}</span>
                      {q.status === 'ACCEPTED' ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                          Selected
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-medium">Alternative</span>
                      )}
                    </div>

                    <div className="font-bold text-slate-900 mt-1 truncate">
                      {q.supplierName}
                    </div>

                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-[11px] text-slate-500">Landed Bid:</span>
                      <span className="font-mono font-bold text-sm text-slate-900">
                        ${q.totalAmount.toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3 text-slate-400" />
                        <span>{q.deliveryDays}d delivery</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[120px]">{q.warrantyPeriod.split(' ')[0]} {q.warrantyPeriod.split(' ')[1]}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Modal */}
      <QuotationComparisonModal
        isOpen={isModalOpen}
        pr={selectedPRForComparison}
        quotations={quotations}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
