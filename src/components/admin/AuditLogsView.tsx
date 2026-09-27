import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { History, Search, Filter, ShieldCheck, User } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useProcurement();

  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.entityReference.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase());

    const matchesEntity = entityFilter === 'ALL' || log.entityType === entityFilter;

    return matchesSearch && matchesEntity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          System Audit Trail &amp; Traceability
        </h1>
        <p className="text-xs text-slate-500">
          Immutable event log tracking all state transitions: Requisitions, manager approvals, quotations, PO issuance, partial receipts, 3-way match exceptions, and disbursements
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, user, document reference, or text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {/* Entity filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Events' },
            { id: 'PURCHASE_REQUEST', label: 'PR' },
            { id: 'APPROVAL', label: 'Approvals' },
            { id: 'PURCHASE_ORDER', label: 'POs' },
            { id: 'GOODS_RECEIPT', label: 'Receipts' },
            { id: 'INVOICE', label: 'Invoices' },
            { id: 'PAYMENT', label: 'Payments' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setEntityFilter(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                entityFilter === item.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-mono">Timestamp</th>
                <th className="py-3 px-4">User &amp; Role</th>
                <th className="py-3 px-4 font-mono">Action Event</th>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4 font-mono">Reference</th>
                <th className="py-3 px-4">Audit Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    {new Date(log.timestamp).toLocaleDateString()}{' '}
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-3.5 px-4 font-sans">
                    <div className="font-semibold text-slate-900">{log.userName}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">{log.userRole}</div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800 text-[11px]">
                    {log.action}
                  </td>
                  <td className="py-3.5 px-4 font-sans">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {log.entityType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-indigo-700 font-bold">
                    {log.entityReference}
                  </td>
                  <td className="py-3.5 px-4 font-sans text-slate-700 max-w-lg leading-relaxed">
                    {log.description}
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
