export type UserRole = 
  | 'ADMIN'
  | 'EMPLOYEE'
  | 'MANAGER'
  | 'PROCUREMENT_OFFICER'
  | 'FINANCE_OFFICER'
  | 'PROCUREMENT'
  | 'FINANCE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId: string;
  departmentName: string;
  avatar?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  budget: number;
  managerId: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  defaultPrice: number;
  currentStock: number;
  reorderLevel: number;
  leadTimeDays: number;
  averageMonthlyUsage: number;
}

export interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  gstNumber: string;
  paymentTerms: string;
  rating: number; // 1 to 5
  isActive: boolean;
}

export type PRStatus = 
  | 'DRAFT' 
  | 'PENDING_APPROVAL' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'CANCELLED' 
  | 'IN_QUOTATION' 
  | 'PO_CREATED';

export interface PurchaseRequestItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  estimatedUnitPrice: number;
  estimatedTotal: number;
}

export interface PurchaseRequest {
  id: string;
  requestNumber: string; // e.g. PR-1001
  requestedBy: string; // User ID
  requesterName: string;
  departmentId: string;
  departmentName: string;
  reason: string;
  estimatedTotal: number;
  status: PRStatus;
  submittedAt: string;
  createdAt: string;
  items: PurchaseRequestItem[];
  approvalHistory: ApprovalAction[];
}

export interface ApprovalAction {
  id: string;
  purchaseRequestId: string;
  approverId: string;
  approverName: string;
  action: 'APPROVED' | 'REJECTED';
  comments: string;
  approvedAt: string;
}

export interface ApprovalRule {
  id: string;
  minAmount: number;
  maxAmount: number;
  requiredRole: UserRole;
  approvalLevel: number;
  description: string;
}

export interface QuotationItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  discount: number;
  total: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string; // e.g. QT-2026-001
  purchaseRequestId: string;
  supplierId: string;
  supplierName: string;
  quotationDate: string;
  validUntil: string;
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  deliveryDays: number;
  warrantyPeriod: string; // e.g. "36 Months On-site"
  paymentTerms: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  items: QuotationItem[];
  notes?: string;
}

export type POStatus = 
  | 'ISSUED' 
  | 'PARTIALLY_RECEIVED' 
  | 'FULLY_RECEIVED' 
  | 'CANCELLED' 
  | 'CLOSED';

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitPrice: number;
  tax: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string; // e.g. PO-3001
  purchaseRequestId: string;
  supplierId: string;
  supplierName: string;
  quotationId: string;
  createdBy: string;
  creatorName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  subtotal: number;
  tax: number;
  totalAmount: number;
  paymentTerms: string;
  status: POStatus;
  items: PurchaseOrderItem[];
}

export interface GoodsReceiptItem {
  id: string;
  poItemId: string;
  productId: string;
  productName: string;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  rejectionReason?: string;
}

export interface GoodsReceipt {
  id: string;
  receiptNumber: string; // e.g. GRN-2001
  purchaseOrderId: string;
  poNumber: string;
  receivedBy: string;
  receiverName: string;
  receiptDate: string;
  notes: string;
  carrier: string;
  trackingNumber: string;
  items: GoodsReceiptItem[];
}

export type InvoiceStatus = 'PENDING_MATCH' | 'MATCH_VERIFIED' | 'MATCH_FAILED' | 'PAID' | 'DISPUTED';

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-9042
  supplierId: string;
  supplierName: string;
  purchaseOrderId: string;
  poNumber: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  totalAmount: number;
  status: InvoiceStatus;
  items: InvoiceItem[];
  mismatchReason?: string;
}

export interface ThreeWayMatchResult {
  isMatch: boolean;
  status: 'PERFECT_MATCH' | 'QUANTITY_MISMATCH' | 'PRICE_MISMATCH' | 'UNRECEIVED_GOODS';
  summary: string;
  orderedQty: number;
  receivedQty: number;
  invoicedQty: number;
  poUnitPrice: number;
  invoicedUnitPrice: number;
  poTotal: number;
  invoicedTotal: number;
  discrepancies: string[];
  canPay: boolean;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'NEFT_RTGS' | 'BANK_TRANSFER' | 'CORPORATE_CARD' | 'CHEQUE';
  referenceNumber: string;
  processedBy: string;
  processorName: string;
  status: 'COMPLETED';
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  transactionType: 'GOODS_RECEIPT' | 'RETURN_TO_VENDOR' | 'ISSUE_TO_DEPT' | 'STOCK_ADJUSTMENT';
  quantity: number; // positive or negative
  stockAfter: number;
  referenceType: 'GOODS_RECEIPT' | 'PURCHASE_ORDER' | 'MANUAL';
  referenceNumber: string;
  performedBy: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'PURCHASE_REQUEST' | 'APPROVAL' | 'QUOTATION' | 'PURCHASE_ORDER' | 'GOODS_RECEIPT' | 'INVOICE' | 'PAYMENT' | 'INVENTORY';
  entityId: string;
  entityReference: string;
  description: string;
}
