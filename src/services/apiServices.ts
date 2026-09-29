import { api } from './apiClient';
import {
  AuthUser,
  LoginResponse,
  DepartmentDto,
  CategoryDto,
  ProductDto,
  SupplierDto,
  PurchaseRequestDto,
  ApprovalRuleDto,
  ApprovalActionDto,
  QuotationDto,
  PurchaseOrderDto,
  GoodsReceiptDto,
  InvoiceDto,
  PaymentDto,
  InventoryTransactionDto,
  AuditLogDto,
  DashboardSummaryDto,
  ReportsSummaryDto,
  PaymentMethod,
} from '../types/backend';

// 4. /api/auth
export const authService = {
  login: async (email: string, password?: string): Promise<LoginResponse> => {
    return api.post<LoginResponse>('/api/auth/login', { email, password });
  },
  getCurrentUser: async (): Promise<AuthUser> => {
    return api.get<AuthUser>('/api/auth/me');
  },
};

// 9. /api/departments
export const departmentService = {
  getAll: async (): Promise<DepartmentDto[]> => {
    return api.get<DepartmentDto[]>('/api/departments');
  },
  getById: async (id: string | number): Promise<DepartmentDto> => {
    return api.get<DepartmentDto>(`/api/departments/${id}`);
  },
  create: async (data: Partial<DepartmentDto>): Promise<DepartmentDto> => {
    return api.post<DepartmentDto>('/api/departments', data);
  },
  update: async (id: string | number, data: Partial<DepartmentDto>): Promise<DepartmentDto> => {
    return api.put<DepartmentDto>(`/api/departments/${id}`, data);
  },
  delete: async (id: string | number): Promise<void> => {
    return api.delete(`/api/departments/${id}`);
  },
};

// /api/categories
export const categoryService = {
  getAll: async (): Promise<CategoryDto[]> => {
    return api.get<CategoryDto[]>('/api/categories');
  },
  create: async (data: Partial<CategoryDto>): Promise<CategoryDto> => {
    return api.post<CategoryDto>('/api/categories', data);
  },
};

// /api/products
export const productService = {
  getAll: async (): Promise<ProductDto[]> => {
    return api.get<ProductDto[]>('/api/products');
  },
  getById: async (id: string | number): Promise<ProductDto> => {
    return api.get<ProductDto>(`/api/products/${id}`);
  },
  create: async (data: Partial<ProductDto>): Promise<ProductDto> => {
    return api.post<ProductDto>('/api/products', data);
  },
  update: async (id: string | number, data: Partial<ProductDto>): Promise<ProductDto> => {
    return api.put<ProductDto>(`/api/products/${id}`, data);
  },
  delete: async (id: string | number): Promise<void> => {
    return api.delete(`/api/products/${id}`);
  },
};

// /api/suppliers
export const supplierService = {
  getAll: async (): Promise<SupplierDto[]> => {
    return api.get<SupplierDto[]>('/api/suppliers');
  },
  getById: async (id: string | number): Promise<SupplierDto> => {
    return api.get<SupplierDto>(`/api/suppliers/${id}`);
  },
  create: async (data: Partial<SupplierDto>): Promise<SupplierDto> => {
    return api.post<SupplierDto>('/api/suppliers', data);
  },
  update: async (id: string | number, data: Partial<SupplierDto>): Promise<SupplierDto> => {
    return api.put<SupplierDto>(`/api/suppliers/${id}`, data);
  },
  delete: async (id: string | number): Promise<void> => {
    return api.delete(`/api/suppliers/${id}`);
  },
};

// 11. /api/purchase-requests
export const purchaseRequestService = {
  getAll: async (): Promise<PurchaseRequestDto[]> => {
    return api.get<PurchaseRequestDto[]>('/api/purchase-requests');
  },
  getById: async (id: string | number): Promise<PurchaseRequestDto> => {
    return api.get<PurchaseRequestDto>(`/api/purchase-requests/${id}`);
  },
  create: async (data: {
    departmentId: string | number;
    reason: string;
    items: { productId: string | number; quantity: number; estimatedUnitPrice: number }[];
  }): Promise<PurchaseRequestDto> => {
    return api.post<PurchaseRequestDto>('/api/purchase-requests', data);
  },
  submit: async (id: string | number): Promise<PurchaseRequestDto> => {
    return api.post<PurchaseRequestDto>(`/api/purchase-requests/${id}/submit`);
  },
  cancel: async (id: string | number): Promise<PurchaseRequestDto> => {
    return api.post<PurchaseRequestDto>(`/api/purchase-requests/${id}/cancel`);
  },
};

// 12. /api/approval-rules & /api/approvals
export const approvalService = {
  getRules: async (): Promise<ApprovalRuleDto[]> => {
    return api.get<ApprovalRuleDto[]>('/api/approval-rules');
  },
  approve: async (requestId: string | number, comments: string): Promise<PurchaseRequestDto> => {
    return api.post<PurchaseRequestDto>(`/api/approvals/${requestId}/approve`, { comments });
  },
  reject: async (requestId: string | number, comments: string): Promise<PurchaseRequestDto> => {
    return api.post<PurchaseRequestDto>(`/api/approvals/${requestId}/reject`, { comments });
  },
};

// 13. /api/quotations
export const quotationService = {
  getAll: async (purchaseRequestId?: string | number): Promise<QuotationDto[]> => {
    return api.get<QuotationDto[]>('/api/quotations', purchaseRequestId ? { purchaseRequestId } : undefined);
  },
  getById: async (id: string | number): Promise<QuotationDto> => {
    return api.get<QuotationDto>(`/api/quotations/${id}`);
  },
  create: async (data: Partial<QuotationDto>): Promise<QuotationDto> => {
    return api.post<QuotationDto>('/api/quotations', data);
  },
  selectSupplier: async (purchaseRequestId: string | number, quotationId: string | number): Promise<PurchaseOrderDto> => {
    return api.post<PurchaseOrderDto>(`/api/quotations/${quotationId}/select`, { purchaseRequestId });
  },
};

// 14. /api/purchase-orders
export const purchaseOrderService = {
  getAll: async (): Promise<PurchaseOrderDto[]> => {
    return api.get<PurchaseOrderDto[]>('/api/purchase-orders');
  },
  getById: async (id: string | number): Promise<PurchaseOrderDto> => {
    return api.get<PurchaseOrderDto>(`/api/purchase-orders/${id}`);
  },
  createFromQuotation: async (quotationId: string | number, purchaseRequestId: string | number): Promise<PurchaseOrderDto> => {
    return api.post<PurchaseOrderDto>('/api/purchase-orders', { quotationId, purchaseRequestId });
  },
  updateStatus: async (id: string | number, status: string): Promise<PurchaseOrderDto> => {
    return api.patch<PurchaseOrderDto>(`/api/purchase-orders/${id}/status`, { status });
  },
};

// 15. /api/goods-receipts
export const goodsReceiptService = {
  getAll: async (purchaseOrderId?: string | number): Promise<GoodsReceiptDto[]> => {
    return api.get<GoodsReceiptDto[]>('/api/goods-receipts', purchaseOrderId ? { purchaseOrderId } : undefined);
  },
  getById: async (id: string | number): Promise<GoodsReceiptDto> => {
    return api.get<GoodsReceiptDto>(`/api/goods-receipts/${id}`);
  },
  create: async (data: {
    purchaseOrderId: string | number;
    carrier: string;
    trackingNumber: string;
    notes?: string;
    items: {
      poItemId?: string | number;
      productId: string | number;
      receivedQuantity: number;
      acceptedQuantity: number;
      rejectedQuantity: number;
      rejectionReason?: string;
    }[];
  }): Promise<GoodsReceiptDto> => {
    return api.post<GoodsReceiptDto>('/api/goods-receipts', data);
  },
};

// 16. /api/inventory
export const inventoryService = {
  getProducts: async (): Promise<ProductDto[]> => {
    return api.get<ProductDto[]>('/api/inventory');
  },
  getTransactions: async (productId?: string | number): Promise<InventoryTransactionDto[]> => {
    return api.get<InventoryTransactionDto[]>('/api/inventory/transactions', productId ? { productId } : undefined);
  },
  adjustStock: async (data: {
    productId: string | number;
    quantity: number;
    type: 'RECEIPT' | 'ADJUSTMENT' | 'RETURN';
    remarks?: string;
  }): Promise<InventoryTransactionDto> => {
    return api.post<InventoryTransactionDto>('/api/inventory/adjust', data);
  },
};

// 17. /api/invoices
export const invoiceService = {
  getAll: async (purchaseOrderId?: string | number): Promise<InvoiceDto[]> => {
    return api.get<InvoiceDto[]>('/api/invoices', purchaseOrderId ? { purchaseOrderId } : undefined);
  },
  getById: async (id: string | number): Promise<InvoiceDto> => {
    return api.get<InvoiceDto>(`/api/invoices/${id}`);
  },
  create: async (data: {
    purchaseOrderId: string | number;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    items: { productId: string | number; quantity: number; unitPrice: number; tax?: number }[];
  }): Promise<InvoiceDto> => {
    return api.post<InvoiceDto>('/api/invoices', data);
  },
  verifyThreeWayMatch: async (id: string | number): Promise<InvoiceDto> => {
    return api.post<InvoiceDto>(`/api/invoices/${id}/verify-match`);
  },
};

// 18. /api/payments
export const paymentService = {
  getAll: async (invoiceId?: string | number): Promise<PaymentDto[]> => {
    return api.get<PaymentDto[]>('/api/payments', invoiceId ? { invoiceId } : undefined);
  },
  process: async (data: {
    invoiceId: string | number;
    paymentMethod: PaymentMethod;
    referenceNumber: string;
    amount?: number;
  }): Promise<PaymentDto> => {
    return api.post<PaymentDto>('/api/payments', data);
  },
};

// 10. /api/dashboard
export const dashboardService = {
  getSummary: async (): Promise<DashboardSummaryDto> => {
    return api.get<DashboardSummaryDto>('/api/dashboard/summary');
  },
};

// 19. /api/reports
export const reportsService = {
  getSummary: async (): Promise<ReportsSummaryDto> => {
    return api.get<ReportsSummaryDto>('/api/reports/summary');
  },
};

// 20. /api/audit-logs
export const auditLogService = {
  getAll: async (): Promise<AuditLogDto[]> => {
    return api.get<AuditLogDto[]>('/api/audit-logs');
  },
};
