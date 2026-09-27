import { apiRequest } from './api';

export interface LowStockProductSummary {
  productId: number;
  productName: string;
  productSku: string;
  currentStock: number;
  minimumStockLevel: number;
}

export interface DashboardSummaryResponse {
  totalPurchaseRequests: number;
  pendingApprovals: number;
  approvedRequests: number;

  totalPurchaseOrders: number;
  pendingPOCount: number;
  partialPOCount: number;
  fullPOCount: number;

  totalInvoiceAmount: number;
  pendingInvoices: number;
  pendingInvoicesCount: number;
  mismatchedInvoices: number;
  mismatchedInvoicesCount: number;
  paidInvoiceAmount: number;

  totalInventoryItems: number;
  totalInventoryItemsCount: number;
  lowStockProducts?: LowStockProductSummary[];
}

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummaryResponse> => {
    return apiRequest<DashboardSummaryResponse>('/api/dashboard/summary', {
      method: 'GET',
    });
  },
};
