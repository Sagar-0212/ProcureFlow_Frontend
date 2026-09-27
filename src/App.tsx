import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProcurementProvider, useProcurement } from './context/ProcurementContext';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DemoWalkthroughBar } from './components/layout/DemoWalkthroughBar';
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
import { InterviewGuideView } from './components/interview/InterviewGuideView';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, createPurchaseRequest, products, currentUser } = useProcurement();
  const [isNewPRModalOpen, setIsNewPRModalOpen] = useState(false);

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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Header */}
      <Header />

      {/* Thinqloud Interactive Walkthrough Bar */}
      <DemoWalkthroughBar />

      {/* Main App Layout: Sidebar + Viewport */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView onOpenNewPR={() => setIsNewPRModalOpen(true)} />
          )}

          {activeTab === 'requests' && <PurchaseRequestsView />}

          {activeTab === 'approvals' && <ApprovalsView />}

          {activeTab === 'quotations' && <QuotationsView />}

          {activeTab === 'orders' && <PurchaseOrdersView />}

          {activeTab === 'receiving' && <GoodsReceiptView />}

          {activeTab === 'finance' && <ThreeWayMatchingView />}

          {activeTab === 'inventory' && (
            <InventoryView onTriggerReorder={handleTriggerReorder} />
          )}

          {activeTab === 'masterData' && <MasterDataView />}

          {activeTab === 'audit' && <AuditLogsView />}

          {activeTab === 'guide' && <InterviewGuideView />}
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

const ProtectedAppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-slate-400">Verifying session with backend...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <ProcurementProvider>
      <MainLayout />
    </ProcurementProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ProtectedAppContent />
    </AuthProvider>
  );
}
