import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  Boxes,
  Sparkles,
  AlertTriangle,
  History,
  TrendingDown,
  ArrowRight,
  PlusCircle,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export const InventoryView: React.FC<{ onTriggerReorder: (productId: string, suggestedQty: number) => void }> = ({
  onTriggerReorder,
}) => {
  const { products, inventoryTransactions, setActiveTab, moduleErrors, fetchModuleData } = useProcurement();

  const [explainModalProdId, setExplainModalProdId] = useState<string | null>(null);

  const totalValue = products.reduce((sum, p) => sum + p.currentStock * p.defaultPrice, 0);
  const lowStockItems = products.filter((p) => p.currentStock <= p.reorderLevel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Inventory Ledger &amp; Smart Reorder Intelligence
          </h1>
          <p className="text-xs text-slate-500">
            Real-time warehouse stock tracking, perpetual transaction logs, and consumption-driven reorder recommendations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-slate-500">Valuation on Hand:</span>
            <div className="font-mono font-bold text-base text-slate-900">
              ${totalValue.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {moduleErrors['inventory'] && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between">
          <span>{moduleErrors['inventory']}</span>
          <button
            onClick={() => fetchModuleData('inventory')}
            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Smart Reorder Engine */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-5 text-white shadow-md border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-white">
                Explainable Smart Reorder Engine
              </h2>
              <p className="text-[11px] text-slate-400">
                Automated replenishment recommendations based on stock consumption thresholds, monthly run rates, and supplier lead times
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {lowStockItems.length} Low Stock Triggers
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products
            .filter((p) => p.currentStock <= p.reorderLevel)
            .map((prod) => {
              // Suggested purchase based on avg monthly usage + lead time safety buffer
              const suggestedUnits = Math.round(prod.averageMonthlyUsage * 1.25);

              return (
                <div
                  key={prod.id}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        {prod.sku} · {prod.category}
                      </span>
                      <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>LOW STOCK</span>
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{prod.name}</h4>
                  </div>

                  {/* Signal Matrix */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-900/60 rounded-lg text-xs font-mono">
                    <div>
                      <div className="text-[10px] text-slate-400 font-sans">Current Stock</div>
                      <div className="text-sm font-bold text-rose-400">
                        {prod.currentStock} {prod.unit}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-sans">Monthly Usage</div>
                      <div className="text-sm font-bold text-slate-200">
                        {prod.averageMonthlyUsage} {prod.unit}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-sans">Lead Time</div>
                      <div className="text-sm font-bold text-slate-200">{prod.leadTimeDays} Days</div>
                    </div>
                  </div>

                  {/* Recommendation action */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[11px] text-slate-400">Suggested Order: </span>
                      <strong className="text-emerald-400 font-mono text-sm font-bold">
                        {suggestedUnits} {prod.unit}
                      </strong>
                    </div>

                    <button
                      onClick={() => onTriggerReorder(prod.id, suggestedUnits)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1 transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Raise Requisition</span>
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Real-time Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-900">Current Stock Levels</h2>
          <span className="text-xs text-slate-500">Perpetual warehouse ledger</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Product Name &amp; Category</th>
                <th className="py-3 px-4 font-mono">SKU</th>
                <th className="py-3 px-4 text-right">Stock On Hand</th>
                <th className="py-3 px-4 text-right">Reorder Threshold</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Total Valuation</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {products.map((prod) => {
                const isLow = prod.currentStock <= prod.reorderLevel;
                const lineVal = prod.currentStock * prod.defaultPrice;

                return (
                  <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-semibold text-slate-900">{prod.name}</div>
                      <div className="text-[11px] text-slate-500">{prod.category}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-600">{prod.sku}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-sm">
                      {prod.currentStock} {prod.unit}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500">
                      {prod.reorderLevel} {prod.unit}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600">
                      ${prod.defaultPrice.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      ${lineVal.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center font-sans">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Reorder Needed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Optimal</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Movement Ledger (Auditability of stock additions) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Inventory Transaction Movement Ledger
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-normal">
            Every unit movement recorded with timestamp and GRN reference
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200 font-sans">
              <tr>
                <th className="py-2.5 px-4">Transaction #</th>
                <th className="py-2.5 px-4">Product</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4 text-right">Quantity Change</th>
                <th className="py-2.5 px-4 text-right">Stock Balance After</th>
                <th className="py-2.5 px-4">Reference</th>
                <th className="py-2.5 px-4 font-sans">Inspector</th>
                <th className="py-2.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventoryTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{tx.id}</td>
                  <td className="py-3 px-4 font-sans text-slate-800">{tx.productName}</td>
                  <td className="py-3 px-4">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 text-[10px]">
                      {tx.transactionType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-700">
                    +{tx.quantity}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    {tx.stockAfter}
                  </td>
                  <td className="py-3 px-4 text-indigo-600 font-semibold">
                    {tx.referenceNumber}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-600">{tx.performedBy}</td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
