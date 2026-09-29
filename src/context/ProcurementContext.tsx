import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  UserRole,
  Department,
  Product,
  Supplier,
  PurchaseRequest,
  Quotation,
  PurchaseOrder,
  GoodsReceipt,
  Invoice,
  Payment,
  InventoryTransaction,
  AuditLog,
  ApprovalRule,
  ThreeWayMatchResult,
  PaymentMethod,
} from '../types';
import { useAuth } from './AuthContext';
import {
  purchaseRequestService,
  departmentService,
  productService,
  supplierService,
  quotationService,
  purchaseOrderService,
  goodsReceiptService,
  invoiceService,
  paymentService,
  inventoryService,
  approvalService,
  auditLogService,
  dashboardService,
  reportsService,
} from '../services/apiServices';
import { DashboardSummaryDto, ReportsSummaryDto } from '../types/backend';
import { ApiError } from '../services/apiClient';

interface ProcurementContextType {
  currentUser: User;
  users: User[];
  departments: Department[];
  approvalRules: ApprovalRule[];
  products: Product[];
  suppliers: Supplier[];
  purchaseRequests: PurchaseRequest[];
  quotations: Quotation[];
  purchaseOrders: PurchaseOrder[];
  goodsReceipts: GoodsReceipt[];
  invoices: Invoice[];
  payments: Payment[];
  inventoryTransactions: InventoryTransaction[];
  auditLogs: AuditLog[];
  dashboardSummary: DashboardSummaryDto | null;
  reportsSummary: ReportsSummaryDto | null;
  
  // Navigation & State
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoading: boolean;
  apiError: string | null;
  moduleErrors: Record<string, string | null>;
  refreshAllData: () => Promise<void>;
  fetchModuleData: (moduleName: string) => Promise<void>;

  // Business Actions (Strict Backend Mutations)
  createPurchaseRequest: (data: {
    departmentId: string | number;
    reason: string;
    items: { productId: string | number; quantity: number; estimatedUnitPrice: number }[];
  }) => Promise<PurchaseRequest>;
  
  approvePurchaseRequest: (prId: string | number, comments: string) => Promise<void>;
  rejectPurchaseRequest: (prId: string | number, comments: string) => Promise<void>;
  cancelPurchaseRequest: (prId: string | number) => Promise<void>;
  
  createQuotation: (data: {
    purchaseRequestId: string | number;
    supplierId: string | number;
    deliveryDays: number;
    warrantyPeriod: string;
    paymentTerms: string;
    notes?: string;
    items: { productId: string | number; quantity: number; unitPrice: number; discount: number; taxPercent: number }[];
  }) => Promise<Quotation>;

  selectSupplierAndGeneratePO: (prId: string | number, quotationId: string | number) => Promise<PurchaseOrder>;

  processGoodsReceipt: (data: {
    purchaseOrderId: string | number;
    carrier: string;
    trackingNumber: string;
    notes: string;
    items: {
      poItemId?: string | number;
      productId: string | number;
      receivedQuantity: number;
      acceptedQuantity: number;
      rejectedQuantity: number;
      rejectionReason?: string;
    }[];
  }) => Promise<GoodsReceipt>;

  createInvoice: (data: {
    purchaseOrderId: string | number;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    items: { productId: string | number; quantity: number; unitPrice: number; tax?: number }[];
  }) => Promise<Invoice>;

  evaluateThreeWayMatch: (invoiceId: string | number) => ThreeWayMatchResult;

  processPayment: (data: {
    invoiceId: string | number;
    paymentMethod: PaymentMethod;
    referenceNumber: string;
  }) => Promise<Payment>;

  adjustStock: (data: {
    productId: string | number;
    quantity: number;
    type: 'RECEIPT' | 'ADJUSTMENT' | 'RETURN';
    remarks?: string;
  }) => Promise<InventoryTransaction>;

  loadDemoStep: (stepNumber: number) => void;
  currentDemoStep: number;
  setCurrentDemoStep: (step: number) => void;
}

const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined);

export const ProcurementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser } = useAuth();

  // Role and identity strictly derived from authenticated backend session
  const currentUser: User = authUser
    ? {
        id: String(authUser.id),
        name: authUser.name,
        email: authUser.email,
        role: authUser.role as UserRole,
        departmentId: String(authUser.departmentId || '1'),
        departmentName: authUser.departmentName || 'General',
      }
    : {
        id: '0',
        name: 'Unauthenticated User',
        email: '',
        role: 'EMPLOYEE',
        departmentId: '1',
        departmentName: 'General',
      };

  // Real backend collections - NO in-memory mock fallback
  const [departments, setDepartments] = useState<Department[]>([]);
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceipt[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummaryDto | null>(null);
  const [reportsSummary, setReportsSummary] = useState<ReportsSummaryDto | null>(null);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentDemoStep, setCurrentDemoStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [moduleErrors, setModuleErrors] = useState<Record<string, string | null>>({});

  // Fetch real data from all backend endpoints
  const refreshAllData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    const newErrors: Record<string, string | null> = {};

    try {
      const results = await Promise.allSettled([
        departmentService.getAll(),
        productService.getAll(),
        supplierService.getAll(),
        purchaseRequestService.getAll(),
        quotationService.getAll(),
        purchaseOrderService.getAll(),
        goodsReceiptService.getAll(),
        invoiceService.getAll(),
        paymentService.getAll(),
        inventoryService.getTransactions(),
        approvalService.getRules(),
        dashboardService.getSummary(),
        reportsService.getSummary(),
        auditLogService.getAll(),
      ]);

      const [
        deptRes,
        prodRes,
        supRes,
        prRes,
        quoteRes,
        poRes,
        grRes,
        invRes,
        payRes,
        transRes,
        rulesRes,
        dashRes,
        repRes,
        auditRes,
      ] = results;

      if (deptRes.status === 'fulfilled' && Array.isArray(deptRes.value)) {
        setDepartments(deptRes.value.map((d) => ({
          ...d,
          id: String(d.id),
          budget: d.budget ?? 0,
          managerId: d.managerId ? String(d.managerId) : undefined,
        })));
      } else if (deptRes.status === 'rejected') {
        newErrors['departments'] = (deptRes.reason as ApiError)?.message || 'Failed to load departments';
      }

      if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value)) {
        setProducts(
          prodRes.value.map((p) => ({
            ...p,
            id: String(p.id),
            category: p.category || p.categoryName || 'General',
            defaultPrice: p.defaultPrice || p.price || 0,
            leadTimeDays: p.leadTimeDays || 3,
            averageMonthlyUsage: p.averageMonthlyUsage || 10,
          }))
        );
      } else if (prodRes.status === 'rejected') {
        newErrors['products'] = (prodRes.reason as ApiError)?.message || 'Failed to load products';
      }

      if (supRes.status === 'fulfilled' && Array.isArray(supRes.value)) {
        setSuppliers(
          supRes.value.map((s) => ({
            ...s,
            id: String(s.id),
            rating: s.rating || 4.5,
            isActive: s.isActive !== false,
          }))
        );
      } else if (supRes.status === 'rejected') {
        newErrors['suppliers'] = (supRes.reason as ApiError)?.message || 'Failed to load suppliers';
      }

      if (prRes.status === 'fulfilled' && Array.isArray(prRes.value)) {
        setPurchaseRequests(
          prRes.value.map((pr: any) => ({
            id: String(pr.id),
            requestNumber: pr.requestNumber || `PR-${pr.id}`,
            requestedBy: String(pr.requestedBy),
            requesterName: pr.requesterName || 'Alex Rivera',
            departmentId: String(pr.departmentId),
            departmentName: pr.departmentName || 'General',
            reason: pr.reason,
            estimatedTotal: pr.estimatedTotal || 0,
            status: pr.status,
            submittedAt: pr.submittedAt || pr.createdAt || new Date().toISOString(),
            createdAt: pr.createdAt || new Date().toISOString(),
            items: (pr.items || []).map((it: any) => ({
              id: String(it.id || `PRI-${Math.random()}`),
              productId: String(it.productId),
              productName: it.productName || 'Product Item',
              sku: it.sku || 'SKU-GEN',
              quantity: it.quantity,
              estimatedUnitPrice: it.estimatedUnitPrice,
              estimatedTotal: it.estimatedTotal || it.quantity * it.estimatedUnitPrice,
            })),
            approvalHistory: (pr.approvalHistory || []).map((ah: any) => ({
              id: String(ah.id || `APP-${Math.random()}`),
              purchaseRequestId: String(pr.id),
              approverId: String(ah.approverId || ''),
              approverName: ah.approverName || 'Approver',
              action: ah.action,
              comments: ah.comments || '',
              approvedAt: ah.approvedAt || new Date().toISOString(),
            })),
          }))
        );
      } else if (prRes.status === 'rejected') {
        newErrors['purchaseRequests'] = (prRes.reason as ApiError)?.message || 'Failed to load purchase requests';
      }

      if (quoteRes.status === 'fulfilled' && Array.isArray(quoteRes.value)) {
        setQuotations(
          quoteRes.value.map((q: any) => ({
            ...q,
            id: String(q.id),
            purchaseRequestId: String(q.purchaseRequestId),
            supplierId: String(q.supplierId),
            items: (q.items || []).map((it: any) => ({
              ...it,
              id: String(it.id || `QTI-${Math.random()}`),
              productId: String(it.productId),
            })),
          }))
        );
      } else if (quoteRes.status === 'rejected') {
        newErrors['quotations'] = (quoteRes.reason as ApiError)?.message || 'Failed to load quotations';
      }

      if (poRes.status === 'fulfilled' && Array.isArray(poRes.value)) {
        setPurchaseOrders(
          poRes.value.map((po: any) => ({
            ...po,
            id: String(po.id),
            purchaseRequestId: String(po.purchaseRequestId),
            supplierId: String(po.supplierId),
            quotationId: po.quotationId ? String(po.quotationId) : undefined,
            createdBy: String(po.createdBy || ''),
            creatorName: po.creatorName || 'Procurement Officer',
            items: (po.items || []).map((it: any) => ({
              ...it,
              id: String(it.id || `POI-${Math.random()}`),
              productId: String(it.productId),
            })),
          }))
        );
      } else if (poRes.status === 'rejected') {
        newErrors['purchaseOrders'] = (poRes.reason as ApiError)?.message || 'Failed to load purchase orders';
      }

      if (grRes.status === 'fulfilled' && Array.isArray(grRes.value)) {
        setGoodsReceipts(
          grRes.value.map((gr: any) => ({
            ...gr,
            id: String(gr.id),
            purchaseOrderId: String(gr.purchaseOrderId),
            items: (gr.items || []).map((it: any) => ({
              ...it,
              id: String(it.id || `GRI-${Math.random()}`),
              poItemId: String(it.poItemId || ''),
              productId: String(it.productId),
            })),
          }))
        );
      } else if (grRes.status === 'rejected') {
        newErrors['goodsReceipts'] = (grRes.reason as ApiError)?.message || 'Failed to load goods receipts';
      }

      if (invRes.status === 'fulfilled' && Array.isArray(invRes.value)) {
        setInvoices(
          invRes.value.map((inv: any) => ({
            ...inv,
            id: String(inv.id),
            supplierId: String(inv.supplierId),
            purchaseOrderId: String(inv.purchaseOrderId),
            items: (inv.items || []).map((it: any) => ({
              ...it,
              id: String(it.id || `INVI-${Math.random()}`),
              productId: String(it.productId),
            })),
          }))
        );
      } else if (invRes.status === 'rejected') {
        newErrors['invoices'] = (invRes.reason as ApiError)?.message || 'Failed to load invoices';
      }

      if (payRes.status === 'fulfilled' && Array.isArray(payRes.value)) {
        setPayments(
          payRes.value.map((p: any) => ({
            ...p,
            id: String(p.id),
            invoiceId: String(p.invoiceId),
          }))
        );
      } else if (payRes.status === 'rejected') {
        newErrors['payments'] = (payRes.reason as ApiError)?.message || 'Failed to load payments';
      }

      if (transRes.status === 'fulfilled' && Array.isArray(transRes.value)) {
        setInventoryTransactions(
          transRes.value.map((t: any) => ({
            ...t,
            id: String(t.id),
            productId: String(t.productId),
          }))
        );
      } else if (transRes.status === 'rejected') {
        newErrors['inventory'] = (transRes.reason as ApiError)?.message || 'Failed to load inventory transactions';
      }

      if (rulesRes.status === 'fulfilled' && Array.isArray(rulesRes.value)) {
        setApprovalRules(rulesRes.value.map((r) => ({ ...r, id: String(r.id), requiredRole: r.requiredRole as UserRole, description: r.description || '' })));
      }

      if (dashRes.status === 'fulfilled' && dashRes.value) {
        setDashboardSummary(dashRes.value);
      } else if (dashRes.status === 'rejected') {
        newErrors['dashboard'] = (dashRes.reason as ApiError)?.message || 'Failed to load dashboard summary';
      }

      if (repRes.status === 'fulfilled' && repRes.value) {
        setReportsSummary(repRes.value);
      }

      if (auditRes.status === 'fulfilled' && Array.isArray(auditRes.value)) {
        setAuditLogs(
          auditRes.value.map((a: any) => ({
            ...a,
            id: String(a.id),
            userRole: a.userRole as UserRole,
            entityId: String(a.entityId || ''),
          }))
        );
      } else if (auditRes.status === 'rejected') {
        newErrors['audit'] = (auditRes.reason as ApiError)?.message || 'Failed to load audit logs';
      }

      // Check if backend was completely unreachable
      const rejectedCount = results.filter((r) => r.status === 'rejected').length;
      if (rejectedCount === results.length) {
        const firstError = (results[0] as PromiseRejectedResult).reason as ApiError;
        setApiError(
          firstError?.message ||
          'Unable to connect to Spring Boot backend at http://localhost:8080. Please ensure the backend server is running.'
        );
      }

      setModuleErrors(newErrors);
    } catch (err: any) {
      setApiError(err?.message || 'Error communicating with backend API.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchModuleData = async (moduleName: string) => {
    switch (moduleName) {
      case 'purchaseRequests':
        try {
          const data = await purchaseRequestService.getAll();
          setPurchaseRequests(data.map((pr: any) => ({ ...pr, id: String(pr.id) })));
          setModuleErrors((prev) => ({ ...prev, purchaseRequests: null }));
        } catch (err: any) {
          setModuleErrors((prev) => ({ ...prev, purchaseRequests: err?.message || 'Failed to load purchase requests' }));
        }
        break;
      case 'purchaseOrders':
        try {
          const data = await purchaseOrderService.getAll();
          setPurchaseOrders(data.map((po: any) => ({ ...po, id: String(po.id) })));
          setModuleErrors((prev) => ({ ...prev, purchaseOrders: null }));
        } catch (err: any) {
          setModuleErrors((prev) => ({ ...prev, purchaseOrders: err?.message || 'Failed to load purchase orders' }));
        }
        break;
      case 'invoices':
        try {
          const data = await invoiceService.getAll();
          setInvoices(data.map((inv: any) => ({ ...inv, id: String(inv.id) })));
          setModuleErrors((prev) => ({ ...prev, invoices: null }));
        } catch (err: any) {
          setModuleErrors((prev) => ({ ...prev, invoices: err?.message || 'Failed to load invoices' }));
        }
        break;
      default:
        await refreshAllData();
        break;
    }
  };

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // 1. Create Purchase Request (Strict Backend Mutation)
  const createPurchaseRequest = async (data: {
    departmentId: string | number;
    reason: string;
    items: { productId: string | number; quantity: number; estimatedUnitPrice: number }[];
  }): Promise<PurchaseRequest> => {
    if (data.items.length === 0) {
      throw new Error('A purchase request must contain at least one item.');
    }

    // Call real backend endpoint POST /api/purchase-requests
    const backendDto = await purchaseRequestService.create(data);
    if (!backendDto || !backendDto.id) {
      throw new Error('Backend failed to return created Purchase Request.');
    }

    const formattedPR: PurchaseRequest = {
      id: String(backendDto.id),
      requestNumber: backendDto.requestNumber || `PR-${backendDto.id}`,
      requestedBy: String(backendDto.requestedBy),
      requesterName: backendDto.requesterName || currentUser.name,
      departmentId: String(backendDto.departmentId),
      departmentName: backendDto.departmentName || currentUser.departmentName,
      reason: backendDto.reason,
      estimatedTotal: backendDto.estimatedTotal,
      status: backendDto.status,
      submittedAt: backendDto.submittedAt || new Date().toISOString(),
      createdAt: backendDto.createdAt || new Date().toISOString(),
      items: (backendDto.items || []).map((it) => ({
        id: String(it.id || `PRI-${Math.random()}`),
        productId: String(it.productId),
        productName: it.productName || 'Product Item',
        sku: it.sku || 'SKU-GEN',
        quantity: it.quantity,
        estimatedUnitPrice: it.estimatedUnitPrice,
        estimatedTotal: it.estimatedTotal || it.quantity * it.estimatedUnitPrice,
      })),
      approvalHistory: [],
    };

    setPurchaseRequests((prev) => [formattedPR, ...prev]);
    return formattedPR;
  };

  // 2. Approve PR (Strict Backend Mutation)
  const approvePurchaseRequest = async (prId: string | number, comments: string) => {
    const updatedDto = await approvalService.approve(prId, comments);
    setPurchaseRequests((prev) =>
      prev.map((p) =>
        p.id === String(prId)
          ? {
              ...p,
              status: (updatedDto?.status as any) || 'APPROVED',
              approvalHistory: [
                ...(p.approvalHistory || []),
                {
                  id: `APP-${Date.now()}`,
                  purchaseRequestId: String(prId),
                  approverId: currentUser.id,
                  approverName: currentUser.name,
                  action: 'APPROVED' as const,
                  comments,
                  approvedAt: new Date().toISOString(),
                },
              ],
            }
          : p
      )
    );
  };

  // 3. Reject PR (Strict Backend Mutation)
  const rejectPurchaseRequest = async (prId: string | number, comments: string) => {
    const updatedDto = await approvalService.reject(prId, comments);
    setPurchaseRequests((prev) =>
      prev.map((p) =>
        p.id === String(prId)
          ? {
              ...p,
              status: (updatedDto?.status as any) || 'REJECTED',
              approvalHistory: [
                ...(p.approvalHistory || []),
                {
                  id: `APP-${Date.now()}`,
                  purchaseRequestId: String(prId),
                  approverId: currentUser.id,
                  approverName: currentUser.name,
                  action: 'REJECTED' as const,
                  comments,
                  approvedAt: new Date().toISOString(),
                },
              ],
            }
          : p
      )
    );
  };

  // 4. Cancel PR
  const cancelPurchaseRequest = async (prId: string | number) => {
    await purchaseRequestService.cancel(prId);
    setPurchaseRequests((prev) =>
      prev.map((p) => (p.id === String(prId) ? { ...p, status: 'CANCELLED' } : p))
    );
  };

  // 5. Create Quotation (Strict Backend Mutation)
  const createQuotation = async (data: {
    purchaseRequestId: string | number;
    supplierId: string | number;
    deliveryDays: number;
    warrantyPeriod: string;
    paymentTerms: string;
    notes?: string;
    items: { productId: string | number; quantity: number; unitPrice: number; discount: number; taxPercent: number }[];
  }): Promise<Quotation> => {
    const quotePayload = {
      ...data,
      items: data.items.map((it) => ({
        ...it,
        total: it.unitPrice * it.quantity * (1 - (it.discount || 0) / 100),
      })),
    };
    const createdDto = await quotationService.create(quotePayload);
    const newQuote: Quotation = {
      ...createdDto,
      id: String(createdDto.id),
      purchaseRequestId: String(createdDto.purchaseRequestId),
      supplierId: String(createdDto.supplierId),
      supplierName: createdDto.supplierName || suppliers.find((s) => s.id === String(createdDto.supplierId))?.companyName || 'Supplier',
      items: (createdDto.items || []).map((it) => ({
        ...it,
        id: String(it.id || `QTI-${Math.random()}`),
        productId: String(it.productId),
        productName: it.productName || products.find((p) => p.id === String(it.productId))?.name || 'Product',
        discount: it.discount || 0,
        taxPercent: it.taxPercent || 0,
      })),
    };

    setQuotations((prev) => [newQuote, ...prev]);
    return newQuote;
  };

  // 6. Select Supplier & Generate Purchase Order (Strict Backend Mutation)
  const selectSupplierAndGeneratePO = async (
    prId: string | number,
    quotationId: string | number
  ): Promise<PurchaseOrder> => {
    const poDto = await quotationService.selectSupplier(prId, quotationId);
    const formattedPO: PurchaseOrder = {
      ...poDto,
      id: String(poDto.id),
      poNumber: poDto.poNumber || `PO-${poDto.id}`,
      purchaseRequestId: String(poDto.purchaseRequestId),
      supplierId: String(poDto.supplierId),
      quotationId: poDto.quotationId ? String(poDto.quotationId) : undefined,
      supplierName: poDto.supplierName || suppliers.find((s) => s.id === String(poDto.supplierId))?.companyName || 'Supplier',
      expectedDeliveryDate: poDto.expectedDeliveryDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      createdBy: String(poDto.createdBy || currentUser.id),
      creatorName: poDto.creatorName || currentUser.name,
      status: poDto.status,
      items: (poDto.items || []).map((it) => ({
        ...it,
        id: String(it.id || `POI-${Math.random()}`),
        productId: String(it.productId),
        productName: it.productName || products.find((p) => p.id === String(it.productId))?.name || 'Product',
        sku: it.sku || products.find((p) => p.id === String(it.productId))?.sku || 'SKU-GEN',
        tax: it.tax || 0,
      })),
    };

    setPurchaseOrders((prev) => [formattedPO, ...prev]);
    setQuotations((prev) =>
      prev.map((q) =>
        q.purchaseRequestId === String(prId)
          ? { ...q, status: q.id === String(quotationId) ? 'ACCEPTED' : 'REJECTED' }
          : q
      )
    );

    return formattedPO;
  };

  // 7. Process Goods Receipt / GRN (Strict Backend Mutation)
  const processGoodsReceipt = async (data: {
    purchaseOrderId: string | number;
    carrier: string;
    trackingNumber: string;
    notes: string;
    items: {
      poItemId?: string | number;
      productId: string | number;
      receivedQuantity: number;
      acceptedQuantity: number;
      rejectedQuantity: number;
      rejectionReason?: string;
    }[];
  }): Promise<GoodsReceipt> => {
    const grDto = await goodsReceiptService.create(data);
    const parentPO = purchaseOrders.find((p) => p.id === String(grDto.purchaseOrderId));
    const formattedGR: GoodsReceipt = {
      ...grDto,
      id: String(grDto.id),
      receiptNumber: grDto.receiptNumber || `GRN-${grDto.id}`,
      purchaseOrderId: String(grDto.purchaseOrderId),
      poNumber: grDto.poNumber || parentPO?.poNumber || 'PO',
      receivedBy: String(grDto.receivedBy || currentUser.id),
      receiverName: grDto.receiverName || currentUser.name,
      notes: grDto.notes || data.notes || '',
      carrier: grDto.carrier || data.carrier || '',
      trackingNumber: grDto.trackingNumber || data.trackingNumber || '',
      items: (grDto.items || []).map((it) => ({
        ...it,
        id: String(it.id || `GRI-${Math.random()}`),
        poItemId: String(it.poItemId || ''),
        productId: String(it.productId),
        productName: it.productName || products.find((p) => p.id === String(it.productId))?.name || 'Product',
      })),
    };

    setGoodsReceipts((prev) => [formattedGR, ...prev]);

    // Refresh affected purchase orders and inventory
    try {
      const updatedPOs = await purchaseOrderService.getAll();
      setPurchaseOrders(updatedPOs.map((p) => ({ ...p, id: String(p.id) } as any)));
    } catch {
      // Ignore background refetch failure
    }

    return formattedGR;
  };

  // 8. Create Invoice (Strict Backend Mutation)
  const createInvoice = async (data: {
    purchaseOrderId: string | number;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    items: { productId: string | number; quantity: number; unitPrice: number; tax?: number }[];
  }): Promise<Invoice> => {
    const invDto = await invoiceService.create(data);
    const parentPO = purchaseOrders.find((p) => p.id === String(invDto.purchaseOrderId));
    const formattedInv: Invoice = {
      ...invDto,
      id: String(invDto.id),
      supplierId: String(invDto.supplierId || parentPO?.supplierId || ''),
      supplierName: invDto.supplierName || parentPO?.supplierName || suppliers.find((s) => s.id === String(invDto.supplierId))?.companyName || 'Supplier',
      purchaseOrderId: String(invDto.purchaseOrderId),
      poNumber: invDto.poNumber || parentPO?.poNumber || 'PO',
      status: invDto.status,
      items: (invDto.items || []).map((it) => ({
        ...it,
        id: String(it.id || `INVI-${Math.random()}`),
        productId: String(it.productId),
        productName: it.productName || products.find((p) => p.id === String(it.productId))?.name || 'Product',
        tax: it.tax || 0,
      })),
    };

    setInvoices((prev) => [formattedInv, ...prev]);
    return formattedInv;
  };

  // 9. Three-Way Matching Evaluation (PO vs GRN vs Invoice)
  const evaluateThreeWayMatch = (invoiceId: string | number): ThreeWayMatchResult => {
    const inv = invoices.find((i) => i.id === String(invoiceId));
    if (!inv) {
      return {
        isMatch: false,
        status: 'UNRECEIVED_GOODS',
        summary: 'Invoice not found in system records.',
        orderedQty: 0,
        receivedQty: 0,
        invoicedQty: 0,
        poUnitPrice: 0,
        invoicedUnitPrice: 0,
        poTotal: 0,
        invoicedTotal: 0,
        discrepancies: ['Invoice not found'],
        canPay: false,
      };
    }

    const po = purchaseOrders.find((p) => p.id === String(inv.purchaseOrderId));
    if (!po) {
      return {
        isMatch: false,
        status: 'UNRECEIVED_GOODS',
        summary: `Associated Purchase Order ${inv.purchaseOrderId} does not exist.`,
        orderedQty: 0,
        receivedQty: 0,
        invoicedQty: inv.items.reduce((s, it) => s + it.quantity, 0),
        poUnitPrice: 0,
        invoicedUnitPrice: 0,
        poTotal: 0,
        invoicedTotal: inv.totalAmount,
        discrepancies: ['Missing Purchase Order'],
        canPay: false,
      };
    }

    const relatedGRNs = goodsReceipts.filter((gr) => gr.purchaseOrderId === String(po.id));
    const discrepancies: string[] = [];

    let totalOrderedQty = 0;
    let totalReceivedQty = 0;
    let totalInvoicedQty = 0;
    let poUnitP = 0;
    let invUnitP = 0;

    for (const invItem of inv.items) {
      totalInvoicedQty += invItem.quantity;
      invUnitP = invItem.unitPrice;

      const poItem = po.items.find((p) => String(p.productId) === String(invItem.productId));
      if (!poItem) {
        discrepancies.push(`Billed item ${invItem.productName} is not in Purchase Order ${po.poNumber}.`);
        continue;
      }

      totalOrderedQty += poItem.quantityOrdered;
      poUnitP = poItem.unitPrice;

      let acceptedQtyForProduct = 0;
      relatedGRNs.forEach((gr) => {
        gr.items.forEach((gri) => {
          if (String(gri.productId) === String(invItem.productId)) {
            acceptedQtyForProduct += gri.acceptedQuantity;
          }
        });
      });

      totalReceivedQty += acceptedQtyForProduct;

      // Rule A: Quantity Invariance
      if (invItem.quantity > acceptedQtyForProduct) {
        const gap = invItem.quantity - acceptedQtyForProduct;
        discrepancies.push(
          `Overbilling: Invoiced ${invItem.quantity} units of ${invItem.productName}, but warehouse has only accepted ${acceptedQtyForProduct} units (${gap} units missing).`
        );
      }

      // Rule B: Price Invariance
      if (Math.abs(invItem.unitPrice - poItem.unitPrice) > 0.01) {
        discrepancies.push(
          `Price Variance: Billed at $${invItem.unitPrice.toFixed(2)}/unit, but agreed PO price was $${poItem.unitPrice.toFixed(2)}/unit.`
        );
      }
    }

    const isMatch = discrepancies.length === 0 && totalReceivedQty >= totalInvoicedQty;

    let status: 'PERFECT_MATCH' | 'QUANTITY_MISMATCH' | 'PRICE_MISMATCH' | 'UNRECEIVED_GOODS' = 'PERFECT_MATCH';
    if (discrepancies.some((d) => d.includes('Overbilling'))) {
      status = 'QUANTITY_MISMATCH';
    } else if (discrepancies.some((d) => d.includes('Price Variance'))) {
      status = 'PRICE_MISMATCH';
    } else if (totalReceivedQty === 0) {
      status = 'UNRECEIVED_GOODS';
    }

    return {
      isMatch,
      status,
      summary: isMatch
        ? `Three-Way Match 100% verified against PO ${po.poNumber} and warehouse receipts.`
        : `Discrepancy detected between PO ${po.poNumber}, warehouse receipts, and vendor invoice.`,
      orderedQty: totalOrderedQty,
      receivedQty: totalReceivedQty,
      invoicedQty: totalInvoicedQty,
      poUnitPrice: poUnitP,
      invoicedUnitPrice: invUnitP,
      poTotal: po.totalAmount,
      invoicedTotal: inv.totalAmount,
      discrepancies,
      canPay: isMatch,
    };
  };

  // 10. Process Payment (Strict Backend Mutation)
  const processPayment = async (data: {
    invoiceId: string | number;
    paymentMethod: PaymentMethod;
    referenceNumber: string;
  }): Promise<Payment> => {
    const payDto = await paymentService.process(data);
    const newPayment: Payment = {
      ...payDto,
      id: String(payDto.id),
      invoiceId: String(payDto.invoiceId),
      invoiceNumber: payDto.invoiceNumber || 'INV-PAID',
      status: payDto.status,
      processedBy: String(payDto.processedBy || currentUser.id),
      processorName: payDto.processorName || currentUser.name,
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Update invoice status in state to PAID
    setInvoices((prev) =>
      prev.map((i) => (i.id === String(data.invoiceId) ? { ...i, status: 'PAID' } : i))
    );

    return newPayment;
  };

  // 11. Adjust Stock (Strict Backend Mutation)
  const adjustStock = async (data: {
    productId: string | number;
    quantity: number;
    type: 'RECEIPT' | 'ADJUSTMENT' | 'RETURN';
    remarks?: string;
  }): Promise<InventoryTransaction> => {
    const transDto = await inventoryService.adjustStock(data);
    const newTrans: InventoryTransaction = {
      ...transDto,
      id: String(transDto.id),
      productId: String(transDto.productId),
      productName: transDto.productName || products.find((p) => p.id === String(transDto.productId))?.name || 'Product',
      referenceNumber: transDto.referenceNumber || `TX-${Date.now()}`,
      performedBy: transDto.performedBy || currentUser.name,
    };

    setInventoryTransactions((prev) => [newTrans, ...prev]);

    // Update product current stock
    setProducts((prev) =>
      prev.map((p) =>
        p.id === String(data.productId)
          ? { ...p, currentStock: transDto.stockAfter }
          : p
      )
    );

    return newTrans;
  };

  // Walkthrough navigation without fake role switching
  const loadDemoStep = (stepNumber: number) => {
    setCurrentDemoStep(stepNumber);
    switch (stepNumber) {
      case 1:
        setActiveTab('requests');
        break;
      case 2:
        setActiveTab('approvals');
        break;
      case 3:
        setActiveTab('quotations');
        break;
      case 4:
        setActiveTab('orders');
        break;
      case 5:
        setActiveTab('receiving');
        break;
      case 6:
      case 7:
        setActiveTab('finance');
        break;
      case 8:
        setActiveTab('inventory');
        break;
      default:
        setActiveTab('dashboard');
        break;
    }
  };

  return (
    <ProcurementContext.Provider
      value={{
        currentUser,
        users: [],
        departments,
        approvalRules,
        products,
        suppliers,
        purchaseRequests,
        quotations,
        purchaseOrders,
        goodsReceipts,
        invoices,
        payments,
        inventoryTransactions,
        auditLogs,
        dashboardSummary,
        reportsSummary,
        activeTab,
        setActiveTab,
        isLoading,
        apiError,
        moduleErrors,
        refreshAllData,
        fetchModuleData,
        createPurchaseRequest,
        approvePurchaseRequest,
        rejectPurchaseRequest,
        cancelPurchaseRequest,
        createQuotation,
        selectSupplierAndGeneratePO,
        processGoodsReceipt,
        createInvoice,
        evaluateThreeWayMatch,
        processPayment,
        adjustStock,
        loadDemoStep,
        currentDemoStep,
        setCurrentDemoStep,
      }}
    >
      {children}
    </ProcurementContext.Provider>
  );
};

export const useProcurement = () => {
  const context = useContext(ProcurementContext);
  if (!context) {
    throw new Error('useProcurement must be used within a ProcurementProvider');
  }
  return context;
};
