import React, { useState, useEffect } from 'react';
import { reportsService } from '../../services/apiServices';
import { ReportsSummaryDto } from '../../types/backend';
import {
  BarChart3,
  TrendingUp,
  Building,
  Truck,
  Boxes,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Download,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [reports, setReports] = useState<ReportsSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsService.getSummary();
      setReports(data);
    } catch (err: any) {
      // Real backend error state - NO silent mock fallback
      setError(
        err?.message ||
        'Unable to load analytics report from backend at /api/reports/summary. Please ensure the Spring Boot server is online.'
      );
      setReports(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const exportCSV = () => {
    if (!reports) return;
    const rows = [
      ['Department', 'Total Spend ($)', 'PR Count'],
      ...reports.spendByDepartment.map((d) => [d.departmentName, d.totalSpent, d.requestCount]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `procureflow_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span>Procurement Analytics &amp; Reports</span>
          </h1>
          <p className="text-xs text-slate-500">
            Real-time business intelligence: departmental spend allocation, supplier reliability metrics, and stock trajectories
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchReports}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          {reports && (
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Error state with Retry - NO silent mock replacement */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-rose-900">API Connection Error: </strong>
              <span>{error}</span>
            </div>
          </div>
          <button
            onClick={fetchReports}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shrink-0"
          >
            Retry Connection
          </button>
        </div>
      )}

      {loading && (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="text-xs font-mono">Aggregating real-time procurement telemetry from backend...</span>
        </div>
      )}

      {!loading && reports && (
        <>
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Total YTD Invoiced Spend</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                ${reports.spendByDepartment.reduce((s, d) => s + d.totalSpent, 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                Verified through 3-Way Match
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Active Requisitions</span>
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {reports.spendByDepartment.reduce((s, d) => s + d.requestCount, 0)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Across {reports.spendByDepartment.length} Cost Centers
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Supplier On-Time SLA</span>
                <Truck className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {Math.round(
                  reports.supplierPerformance.reduce((s, sp) => s + sp.onTimeDeliveryRate, 0) /
                    (reports.supplierPerformance.length || 1)
                )}%
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                Within contractual lead time
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Warehouse Valuation</span>
                <Boxes className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                ${reports.inventoryHealth.reduce((s, i) => s + i.valuation, 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {reports.inventoryHealth.length} Tracked Catalog SKUs
              </div>
            </div>
          </div>

          {/* Department Spend & Monthly Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Breakdown */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-indigo-600" />
                  <span>Spend by Department / Cost Center</span>
                </h2>
                <span className="text-xs text-slate-500">YTD Actuals</span>
              </div>

              <div className="space-y-3">
                {reports.spendByDepartment.map((dept, i) => {
                  const maxSpend = Math.max(...reports.spendByDepartment.map((d) => d.totalSpent), 1);
                  const pct = Math.round((dept.totalSpent / maxSpend) * 100);
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-800">{dept.departmentName}</span>
                        <div className="font-mono font-semibold text-slate-900">
                          ${dept.totalSpent.toLocaleString()} ({dept.requestCount} PRs)
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly Trend */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Monthly Procurement Trajectory</span>
                </h2>
                <span className="text-xs text-slate-500">Volume &amp; Capital</span>
              </div>

              <div className="grid grid-cols-4 gap-3 pt-4">
                {reports.monthlyProcurementTrend.map((m, i) => (
                  <div key={i} className="text-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="text-xs font-semibold text-slate-500">{m.month}</div>
                    <div className="font-mono font-bold text-slate-900 mt-1 text-sm">
                      ${m.amount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{m.orderCount} POs issued</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
