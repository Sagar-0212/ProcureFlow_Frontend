import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  Database,
  Building,
  Package,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react';

export const MasterDataView: React.FC = () => {
  const { suppliers, products, departments, approvalRules, users } = useProcurement();

  const [activeTab, setActiveTab] = useState<'suppliers' | 'products' | 'departments' | 'rules'>('suppliers');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Enterprise Master Data &amp; Governance
        </h1>
        <p className="text-xs text-slate-500">
          Normalized reference entities: Supplier master records, product catalogue, department cost centers, and approval rules
        </p>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        {[
          { id: 'suppliers', label: `Suppliers (${suppliers.length})`, icon: Building },
          { id: 'products', label: `Product Catalogue (${products.length})`, icon: Package },
          { id: 'departments', label: `Departments (${departments.length})`, icon: Users },
          { id: 'rules', label: `Approval Rules (${approvalRules.length})`, icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                isActive
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Suppliers */}
      {activeTab === 'suppliers' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Supplier Company</th>
                <th className="py-3 px-4">Contact Person &amp; Email</th>
                <th className="py-3 px-4 font-mono">Tax / GST Number</th>
                <th className="py-3 px-4">Payment Terms</th>
                <th className="py-3 px-4">Vendor Rating</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{s.companyName}</div>
                    <div className="text-[11px] text-slate-500">{s.address}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{s.contactPerson}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{s.email}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700 font-semibold">{s.gstNumber}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">{s.paymentTerms}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 font-mono font-bold text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{s.rating.toFixed(1)} / 5.0</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active Vendor
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Products */}
      {activeTab === 'products' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4 font-mono">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Standard Price</th>
                <th className="py-3 px-4 text-right">Stock</th>
                <th className="py-3 px-4 text-right">Reorder Threshold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-sans font-semibold text-slate-900">
                    {p.name}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-700">{p.sku}</td>
                  <td className="py-3.5 px-4 font-sans text-slate-600">{p.category}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    ${p.defaultPrice.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    {p.currentStock} {p.unit}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-500">
                    {p.reorderLevel} {p.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Departments */}
      {activeTab === 'departments' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Department Name</th>
                <th className="py-3 px-4 font-mono">Cost Center Code</th>
                <th className="py-3 px-4 text-right">Annual Operating Budget</th>
                <th className="py-3 px-4">Authorizing Manager</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {departments.map((d) => {
                const mgr = users.find((u) => u.id === d.managerId);
                return (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-sans font-semibold text-slate-900">
                      {d.name}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-indigo-700">{d.code}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      ${d.budget.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-700 font-medium">
                      {mgr?.name || 'Assigned Manager'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Rules */}
      {activeTab === 'rules' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Rule Code</th>
                <th className="py-3 px-4">Approval Level</th>
                <th className="py-3 px-4 font-mono">Amount Range</th>
                <th className="py-3 px-4">Required Authorization Role</th>
                <th className="py-3 px-4">Policy Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {approvalRules.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{r.id}</td>
                  <td className="py-3.5 px-4 font-sans font-semibold text-slate-800">
                    Tier {r.approvalLevel}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-indigo-700">
                    ${r.minAmount.toLocaleString()} – ${r.maxAmount >= 1000000 ? 'Unlimited' : r.maxAmount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-sans">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                      {r.requiredRole}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-sans text-slate-600 max-w-md">
                    {r.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
