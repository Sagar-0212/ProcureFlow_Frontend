// Backend API Configuration & Type Definitions

export type BackendRole =
  | 'ADMIN'
  | 'EMPLOYEE'
  | 'MANAGER'
  | 'PROCUREMENT_OFFICER'
  | 'FINANCE_OFFICER';

export interface AuthUser {
  id: string | number;
  name: string;
  email: string;
  role: BackendRole;
  departmentId?: string | number;
  departmentName?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// 6. Backend Status Enums
export type PurchaseRequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SENT_TO_SUPPLIER'
  | 'PARTIALLY_RECEIVED'
  | 'FULLY_RECEIVED'
  | 'COMPLETED'
  | 'CANCELLED';

export type InvoiceStatus =
  | 'PENDING_VERIFICATION'
  | 'MATCHED'
  | 'MISMATCH'
  | 'APPROVED'
  | 'PAID'
  | 'REJECTED';

export type PaymentStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type PaymentMethod =
  | 'BANK_TRANSFER'
  | 'UPI'
  | 'CHEQUE'
  | 'CASH'
  | 'OTHER';

export type InventoryTransactionType =
  | 'RECEIPT'
  | 'ADJUSTMENT'
  | 'RETURN';

// DTOs
export interface DepartmentDto {
  id: string | number;
  name: string;
  code: string;
  budget?: number;
  managerId?: string | number;
  managerName?: string;
  description?: string;
}

export interface CategoryDto {
  id: string | number;
  name: string;
  description?: string;
}

export interface ProductDto {
  id: string | number;
  categoryId?: string | number;
  categoryName?: string;
  category?: string;
  name: string;
  description?: string;
  sku: string;
  unit: string;
  defaultPrice?: number;
  price?: number;
  currentStock: number;
  reorderLevel: number;
  leadTimeDays?: number;
  averageMonthlyUsage?: number;
  isActive?: boolean;
}

export interface SupplierDto {
  id: string | number;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  gstNumber: string;
  paymentTerms: string;
  rating?: number;
  isActive?: boolean;
}

export interface PurchaseRequestItemDto {
  id?: string | number;
  productId: string | number;
  productName?: string;
  sku?: string;
  quantity: number;
  estimatedUnitPrice: number;
  estimatedTotal?: number;
}

export interface ApprovalActionDto {
  id?: string | number;
  approverId?: string | number;
  approverName?: string;
  action: 'APPROVED' | 'REJECTED';
  comments: string;
  approvedAt?: string;
}

export interface PurchaseRequestDto {
  id: string | number;
  requestNumber: string;
  requestedBy: string | number;
  requesterName?: string;
  departmentId: string | number;
  departmentName?: string;
  reason: string;
  estimatedTotal: number;
  status: PurchaseRequestStatus;
  submittedAt?: string;
  createdAt?: string;
  items: PurchaseRequestItemDto[];
  approvalHistory?: ApprovalActionDto[];
}

export interface ApprovalRuleDto {
  id: string | number;
  minAmount: number;
  maxAmount: number;
  requiredRole: BackendRole;
  approvalLevel: number;
  description?: string;
  isActive?: boolean;
}

export interface QuotationItemDto {
  id?: string | number;
  productId: string | number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  taxPercent?: number;
  tax?: number;
  discount?: number;
  total: number;
}

export interface QuotationDto {
  id: string | number;
  quotationNumber: string;
  purchaseRequestId: string | number;
  supplierId: string | number;
  supplierName?: string;
  quotationDate: string;
  validUntil: string;
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  deliveryDays: number;
  warrantyPeriod: string;
  paymentTerms: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  items: QuotationItemDto[];
  notes?: string;
}

export interface PurchaseOrderItemDto {
  id?: string | number;
  productId: string | number;
  productName?: string;
  sku?: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitPrice: number;
  tax?: number;
  total: number;
}

export interface PurchaseOrderDto {
  id: string | number;
  poNumber: string;
  purchaseRequestId: string | number;
  supplierId: string | number;
  supplierName?: string;
  quotationId?: string | number;
  createdBy?: string | number;
  creatorName?: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  subtotal: number;
  tax: number;
  totalAmount: number;
  paymentTerms: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItemDto[];
}

export interface GoodsReceiptItemDto {
  id?: string | number;
  poItemId?: string | number;
  productId: string | number;
  productName?: string;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  rejectionReason?: string;
}

export interface GoodsReceiptDto {
  id: string | number;
  receiptNumber: string;
  purchaseOrderId: string | number;
  poNumber?: string;
  receivedBy?: string | number;
  receiverName?: string;
  receiptDate: string;
  notes?: string;
  carrier?: string;
  trackingNumber?: string;
  items: GoodsReceiptItemDto[];
}

export interface InvoiceItemDto {
  id?: string | number;
  productId: string | number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  tax?: number;
  total: number;
}

export interface InvoiceDto {
  id: string | number;
  invoiceNumber: string;
  supplierId: string | number;
  supplierName?: string;
  purchaseOrderId: string | number;
  poNumber?: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  totalAmount: number;
  status: InvoiceStatus;
  items: InvoiceItemDto[];
  mismatchReason?: string;
}

export interface PaymentDto {
  id: string | number;
  invoiceId: string | number;
  invoiceNumber?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  processedBy?: string | number;
  processorName?: string;
  status: PaymentStatus;
}

export interface InventoryTransactionDto {
  id: string | number;
  productId: string | number;
  productName?: string;
  transactionType: InventoryTransactionType;
  quantity: number;
  stockAfter: number;
  referenceType?: string;
  referenceNumber?: string;
  performedBy?: string;
  timestamp: string;
  remarks?: string;
}

export interface AuditLogDto {
  id: string | number;
  timestamp: string;
  userId?: string | number;
  userName?: string;
  userRole?: string;
  action: string;
  entityType: string;
  entityId?: string | number;
  entityReference?: string;
  description: string;
}

export interface DashboardSummaryDto {
  totalPurchaseRequests: number;
  pendingApprovals: number;
  activePurchaseOrders: number;
  partialDeliveries: number;
  totalInvoices: number;
  mismatchedInvoices: number;
  verifiedInvoices: number;
  totalInventoryValuation: number;
  lowStockItemsCount: number;
  totalSpendYtd?: number;
}

export interface ReportSpendByDepartment {
  departmentName: string;
  totalSpent: number;
  requestCount: number;
}

export interface ReportSupplierPerformance {
  supplierName: string;
  totalOrders: number;
  totalSpend: number;
  onTimeDeliveryRate: number;
  rating: number;
}

export interface ReportInventoryStock {
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  valuation: number;
  status: 'OPTIMAL' | 'LOW_STOCK';
}

export interface ReportsSummaryDto {
  spendByDepartment: ReportSpendByDepartment[];
  supplierPerformance: ReportSupplierPerformance[];
  inventoryHealth: ReportInventoryStock[];
  monthlyProcurementTrend: { month: string; amount: number; orderCount: number }[];
}
