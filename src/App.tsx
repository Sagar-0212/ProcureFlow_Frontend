import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProcurementProvider, useProcurement } from './context/ProcurementContext';
import { isTabAccessible } from './utils/rbac';
import { ShieldAlert } from 'lucide-react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { PurchaseRequestsView } from './components/requests/PurchaseRequestsView';
import { NewPurchaseRequestModal } from './components/requests/NewPurchaseRequestModal';
import { ApprovalsView } from './components/approvals/ApprovalsView';
import { QuotationsView } from './components/quotations/QuotationsView';
import { PurchaseOrdersView } from './components/orders/PurchaseOrdersView';
import { GoodsReceiptView } from './components/receiving/GoodsReceiptView';
import { ThreeWayMatchingView } from './components/finance/ThreeWayMatchingView';
import { InventoryView } from './components/inventory/InventoryView';
import { MasterDataView } from './components/admin/MasterDataView';
import { AuditLogsView } from './components/admin/AuditLogsView';
import { ReportsView } from './components/reports/ReportsView';
import { LoginPage } from './components/auth/LoginPage';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, createPurchaseRequest, products, currentUser } = useProcurement();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [isNewPRModalOpen, setIsNewPRModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser?.role && !isTabAccessible(activeTab, currentUser.role)) {
      setActiveTab('dashboard');
    }
  }, [currentUser?.role, activeTab, setActiveTab]);

  const handleTriggerReorder = (productId: string, suggestedQty: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    createPurchaseRequest({
      departmentId: currentUser.departmentId,
      reason: `Automated smart replenishment for low stock: ${prod.name}.`,
      items: [
        {
          productId: prod.id,
          quantity: suggestedQty,
          estimatedUnitPrice: prod.defaultPrice,
        },
      ],
    });

    setActiveTab('requests');
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-300">Checking authenticated backend session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Header */}
      <Header />

      {/* Main App Layout: Sidebar + Viewport */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {!isTabAccessible(activeTab, currentUser.role) && (
            <div className="bg-white border border-rose-200 rounded-xl p-8 text-center max-w-lg mx-auto my-12 shadow-sm">
              <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-slate-900">Access Restricted (403)</h2>
              <p className="text-xs text-slate-600 mt-2">
                Your authenticated role (<strong className="font-mono text-slate-800">{currentUser.role}</strong>) does not have authorization to access this module.
              </p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <DashboardView onOpenNewPR={() => setIsNewPRModalOpen(true)} />
          )}

          {activeTab === 'requests' && isTabAccessible('requests', currentUser.role) && (
            <PurchaseRequestsView />
          )}

          {activeTab === 'approvals' && isTabAccessible('approvals', currentUser.role) && (
            <ApprovalsView />
          )}

          {activeTab === 'quotations' && isTabAccessible('quotations', currentUser.role) && (
            <QuotationsView />
          )}

          {activeTab === 'orders' && isTabAccessible('orders', currentUser.role) && (
            <PurchaseOrdersView />
          )}

          {activeTab === 'receiving' && isTabAccessible('receiving', currentUser.role) && (
            <GoodsReceiptView />
          )}

          {activeTab === 'finance' && isTabAccessible('finance', currentUser.role) && (
            <ThreeWayMatchingView />
          )}

          {activeTab === 'inventory' && isTabAccessible('inventory', currentUser.role) && (
            <InventoryView onTriggerReorder={handleTriggerReorder} />
          )}

          {activeTab === 'reports' && isTabAccessible('reports', currentUser.role) && (
            <ReportsView />
          )}

          {activeTab === 'masterData' && isTabAccessible('masterData', currentUser.role) && (
            <MasterDataView />
          )}

          {activeTab === 'audit' && isTabAccessible('audit', currentUser.role) && (
            <AuditLogsView />
          )}
        </main>
      </div>

      {/* Global New PR Modal */}
      <NewPurchaseRequestModal
        isOpen={isNewPRModalOpen}
        onClose={() => setIsNewPRModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ProcurementProvider>
        <MainLayout />
      </ProcurementProvider>
    </AuthProvider>
  );
}
