import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Department,
  Product,
  Supplier,
  PurchaseRequest,
  PurchaseRequestItem,
  Quotation,
  PurchaseOrder,
  GoodsReceipt,
  Invoice,
  Payment,
  InventoryTransaction,
  AuditLog,
  ApprovalRule,
  ThreeWayMatchResult,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_DEPARTMENTS,
  INITIAL_APPROVAL_RULES,
  INITIAL_PRODUCTS,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASE_REQUESTS,
  INITIAL_QUOTATIONS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_GOODS_RECEIPTS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_INVENTORY_TRANSACTIONS,
  INITIAL_AUDIT_LOGS,
} from '../mock/initialData';

interface ProcurementContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
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
  
  // Navigation State
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Business Actions
  createPurchaseRequest: (data: {
    departmentId: string;
    reason: string;
    items: { productId: string; quantity: number; estimatedUnitPrice: number }[];
  }) => PurchaseRequest;
  
  approvePurchaseRequest: (prId: string, comments: string) => void;
  rejectPurchaseRequest: (prId: string, comments: string) => void;
  cancelPurchaseRequest: (prId: string) => void;
  
  createQuotation: (data: {
    purchaseRequestId: string;
    supplierId: string;
    deliveryDays: number;
    warrantyPeriod: string;
    paymentTerms: string;
    notes?: string;
    items: { productId: string; quantity: number; unitPrice: number; discount: number; taxPercent: number }[];
  }) => Quotation;

  selectSupplierAndGeneratePO: (prId: string, quotationId: string) => PurchaseOrder;

  processGoodsReceipt: (data: {
    purchaseOrderId: string;
    carrier: string;
    trackingNumber: string;
    notes: string;
    items: {
      poItemId: string;
      productId: string;
      receivedQuantity: number;
      acceptedQuantity: number;
      rejectedQuantity: number;
      rejectionReason?: string;
    }[];
  }) => GoodsReceipt;

  createInvoice: (data: {
    purchaseOrderId: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    items: { productId: string; quantity: number; unitPrice: number; tax: number }[];
  }) => Invoice;

  evaluateThreeWayMatch: (invoiceId: string) => ThreeWayMatchResult;

  processPayment: (data: {
    invoiceId: string;
    paymentMethod: 'NEFT_RTGS' | 'BANK_TRANSFER' | 'CORPORATE_CARD' | 'CHEQUE';
    referenceNumber: string;
  }) => Payment;

  resolveMissingDeliveryShortcut: (poId: string) => void;
  resetToInitialDemoState: () => void;
  loadDemoStep: (stepNumber: number) => void;
  currentDemoStep: number;
  setCurrentDemoStep: (step: number) => void;
}

const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'procureflow_v1_';

export const ProcurementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local storage helpers
  const loadStored = <T,>(key: string, fallback: T): T => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  };

  const [users] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    return loadStored('currentUser', INITIAL_USERS[0]);
  });
  const [departments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [approvalRules] = useState<ApprovalRule[]>(INITIAL_APPROVAL_RULES);
  const [products, setProducts] = useState<Product[]>(() => loadStored('products', INITIAL_PRODUCTS));
  const [suppliers] = useState<Supplier[]>(() => loadStored('suppliers', INITIAL_SUPPLIERS));
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(() =>
    loadStored('purchaseRequests', INITIAL_PURCHASE_REQUESTS)
  );
  const [quotations, setQuotations] = useState<Quotation[]>(() =>
    loadStored('quotations', INITIAL_QUOTATIONS)
  );
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() =>
    loadStored('purchaseOrders', INITIAL_PURCHASE_ORDERS)
  );
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceipt[]>(() =>
    loadStored('goodsReceipts', INITIAL_GOODS_RECEIPTS)
  );
  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    loadStored('invoices', INITIAL_INVOICES)
  );
  const [payments, setPayments] = useState<Payment[]>(() =>
    loadStored('payments', INITIAL_PAYMENTS)
  );
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>(() =>
    loadStored('inventoryTransactions', INITIAL_INVENTORY_TRANSACTIONS)
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    loadStored('auditLogs', INITIAL_AUDIT_LOGS)
  );

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentDemoStep, setCurrentDemoStep] = useState<number>(5); // Default to Step 5 (Mismatch state from PDF)

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'currentUser', JSON.stringify(currentUser));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'products', JSON.stringify(products));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'purchaseRequests', JSON.stringify(purchaseRequests));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'quotations', JSON.stringify(quotations));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'purchaseOrders', JSON.stringify(purchaseOrders));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'goodsReceipts', JSON.stringify(goodsReceipts));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'invoices', JSON.stringify(invoices));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'payments', JSON.stringify(payments));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'inventoryTransactions', JSON.stringify(inventoryTransactions));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'auditLogs', JSON.stringify(auditLogs));
    } catch {
      // storage limit ignore
    }
  }, [
    currentUser,
    products,
    purchaseRequests,
    quotations,
    purchaseOrders,
    goodsReceipts,
    invoices,
    payments,
    inventoryTransactions,
    auditLogs,
  ]);

  const switchRole = (role: UserRole) => {
    const targetUser = users.find((u) => u.role === role) || users[0];
    setCurrentUser(targetUser);
  };

  const addAuditLog = (
    action: string,
    entityType: AuditLog['entityType'],
    entityId: string,
    entityReference: string,
    description: string
  ) => {
    const newLog: AuditLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      entityReference,
      description,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // 1. Create PR
  const createPurchaseRequest = (data: {
    departmentId: string;
    reason: string;
    items: { productId: string; quantity: number; estimatedUnitPrice: number }[];
  }): PurchaseRequest => {
    if (data.items.length === 0) {
      throw new Error('A purchase request must contain at least one item.');
    }

    const dept = departments.find((d) => d.id === data.departmentId) || departments[0];
    const reqNum = `PR-${1000 + purchaseRequests.length + 1}`;
    
    let total = 0;
    const prItems: PurchaseRequestItem[] = data.items.map((item, index) => {
      const prod = products.find((p) => p.id === item.productId);
      const sub = item.quantity * item.estimatedUnitPrice;
      total += sub;
      return {
        id: `PRI-${Date.now()}-${index}`,
        productId: item.productId,
        productName: prod ? prod.name : 'Unknown Product',
        sku: prod ? prod.sku : 'N/A',
        quantity: item.quantity,
        estimatedUnitPrice: item.estimatedUnitPrice,
        estimatedTotal: sub,
      };
    });

    const newPR: PurchaseRequest = {
      id: reqNum,
      requestNumber: reqNum,
      requestedBy: currentUser.id,
      requesterName: currentUser.name,
      departmentId: dept.id,
      departmentName: dept.name,
      reason: data.reason,
      estimatedTotal: total,
      status: 'PENDING_APPROVAL',
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      items: prItems,
      approvalHistory: [],
    };

    setPurchaseRequests((prev) => [newPR, ...prev]);
    addAuditLog(
      'CREATE_PURCHASE_REQUEST',
      'PURCHASE_REQUEST',
      reqNum,
      reqNum,
      `Submitted Purchase Request ${reqNum} for ${prItems.length} items total $${total.toLocaleString()}: "${data.reason}"`
    );

    return newPR;
  };

  // 2. Approve PR
  const approvePurchaseRequest = (prId: string, comments: string) => {
    const pr = purchaseRequests.find((p) => p.id === prId);
    if (!pr) throw new Error('Purchase request not found');
    if (pr.status === 'REJECTED' || pr.status === 'CANCELLED') {
      throw new Error('A request cannot be approved if it is already rejected or cancelled.');
    }

    const approvalAction = {
      id: `APP-${Date.now().toString().slice(-4)}`,
      purchaseRequestId: prId,
      approverId: currentUser.id,
      approverName: currentUser.name,
      action: 'APPROVED' as const,
      comments: comments || 'Approved according to departmental procurement policy.',
      approvedAt: new Date().toISOString(),
    };

    setPurchaseRequests((prev) =>
      prev.map((p) =>
        p.id === prId
          ? {
              ...p,
              status: 'APPROVED',
              approvalHistory: [...p.approvalHistory, approvalAction],
            }
          : p
      )
    );

    addAuditLog(
      'APPROVE_PURCHASE_REQUEST',
      'APPROVAL',
      prId,
      pr.requestNumber,
      `Approved ${pr.requestNumber} ($${pr.estimatedTotal.toLocaleString()}). Comment: "${approvalAction.comments}"`
    );
  };

  // 3. Reject PR
  const rejectPurchaseRequest = (prId: string, comments: string) => {
    const pr = purchaseRequests.find((p) => p.id === prId);
    if (!pr) throw new Error('Purchase request not found');

    const rejectAction = {
      id: `APP-${Date.now().toString().slice(-4)}`,
      purchaseRequestId: prId,
      approverId: currentUser.id,
      approverName: currentUser.name,
      action: 'REJECTED' as const,
      comments: comments || 'Rejected by approver.',
      approvedAt: new Date().toISOString(),
    };

    setPurchaseRequests((prev) =>
      prev.map((p) =>
        p.id === prId
          ? {
              ...p,
              status: 'REJECTED',
              approvalHistory: [...p.approvalHistory, rejectAction],
            }
          : p
      )
    );

    addAuditLog(
      'REJECT_PURCHASE_REQUEST',
      'APPROVAL',
      prId,
      pr.requestNumber,
      `Rejected ${pr.requestNumber}. Reason: "${rejectAction.comments}"`
    );
  };

  // 4. Cancel PR
  const cancelPurchaseRequest = (prId: string) => {
    const pr = purchaseRequests.find((p) => p.id === prId);
    if (!pr) throw new Error('Purchase request not found');
    if (pr.status !== 'DRAFT' && pr.status !== 'PENDING_APPROVAL') {
      throw new Error('Requests can only be cancelled while in draft or pending approval state.');
    }

    setPurchaseRequests((prev) =>
      prev.map((p) => (p.id === prId ? { ...p, status: 'CANCELLED' } : p))
    );

    addAuditLog(
      'CANCEL_PURCHASE_REQUEST',
      'PURCHASE_REQUEST',
      prId,
      pr.requestNumber,
      `Cancelled ${pr.requestNumber} by requester ${currentUser.name}.`
    );
  };

  // 5. Create Quotation
  const createQuotation = (data: {
    purchaseRequestId: string;
    supplierId: string;
    deliveryDays: number;
    warrantyPeriod: string;
    paymentTerms: string;
    notes?: string;
    items: { productId: string; quantity: number; unitPrice: number; discount: number; taxPercent: number }[];
  }): Quotation => {
    const supp = suppliers.find((s) => s.id === data.supplierId) || suppliers[0];
    const qtNum = `QT-${new Date().getFullYear()}-${String(quotations.length + 1).padStart(3, '0')}`;
    
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    const qItems = data.items.map((it, idx) => {
      const prod = products.find((p) => p.id === it.productId);
      const gross = it.quantity * it.unitPrice;
      const disc = (gross * (it.discount || 0)) / 100;
      const net = gross - disc;
      const tax = (net * (it.taxPercent || 0)) / 100;
      const lineTotal = net + tax;

      subtotal += net;
      totalDiscount += disc;
      totalTax += tax;

      return {
        id: `QTI-${Date.now()}-${idx}`,
        productId: it.productId,
        productName: prod ? prod.name : 'Product',
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        taxPercent: it.taxPercent,
        discount: disc,
        total: lineTotal,
      };
    });

    const newQuotation: Quotation = {
      id: `QT-${Date.now().toString().slice(-4)}`,
      quotationNumber: qtNum,
      purchaseRequestId: data.purchaseRequestId,
      supplierId: supp.id,
      supplierName: supp.companyName,
      quotationDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      subtotal,
      tax: totalTax,
      discount: totalDiscount,
      totalAmount: subtotal + totalTax,
      deliveryDays: data.deliveryDays,
      warrantyPeriod: data.warrantyPeriod,
      paymentTerms: data.paymentTerms,
      status: 'PENDING',
      items: qItems,
      notes: data.notes,
    };

    setQuotations((prev) => [newQuotation, ...prev]);

    addAuditLog(
      'RECORD_SUPPLIER_QUOTATION',
      'QUOTATION',
      newQuotation.id,
      qtNum,
      `Recorded quote ${qtNum} from ${supp.companyName} for PR ${data.purchaseRequestId} ($${newQuotation.totalAmount.toLocaleString()}).`
    );

    return newQuotation;
  };

  // 6. Select Supplier & Generate PO
  const selectSupplierAndGeneratePO = (prId: string, quotationId: string): PurchaseOrder => {
    const pr = purchaseRequests.find((p) => p.id === prId);
    const quote = quotations.find((q) => q.id === quotationId);
    if (!pr || !quote) throw new Error('PR or Quotation not found');

    if (pr.status === 'REJECTED' || pr.status === 'CANCELLED') {
      throw new Error('A purchase order cannot be created from a rejected or cancelled request.');
    }

    // Mark winning quotation as ACCEPTED, others for this PR as REJECTED
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.purchaseRequestId === prId) {
          return {
            ...q,
            status: q.id === quotationId ? 'ACCEPTED' : 'REJECTED',
          };
        }
        return q;
      })
    );

    // Update PR status
    setPurchaseRequests((prev) =>
      prev.map((p) => (p.id === prId ? { ...p, status: 'PO_CREATED' } : p))
    );

    const poNum = `PO-${3000 + purchaseOrders.length + 1}`;
    const expDate = new Date(Date.now() + (quote.deliveryDays || 3) * 86400000)
      .toISOString()
      .split('T')[0];

    const poItems = quote.items.map((qi, idx) => ({
      id: `POI-${Date.now()}-${idx}`,
      productId: qi.productId,
      productName: qi.productName,
      sku: products.find((p) => p.id === qi.productId)?.sku || 'SKU-GEN',
      quantityOrdered: qi.quantity,
      quantityReceived: 0,
      unitPrice: qi.unitPrice,
      tax: qi.taxPercent || 0,
      total: qi.total,
    }));

    const newPO: PurchaseOrder = {
      id: poNum,
      poNumber: poNum,
      purchaseRequestId: prId,
      supplierId: quote.supplierId,
      supplierName: quote.supplierName,
      quotationId: quote.id,
      createdBy: currentUser.id,
      creatorName: currentUser.name,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: expDate,
      subtotal: quote.subtotal,
      tax: quote.tax,
      totalAmount: quote.totalAmount,
      paymentTerms: quote.paymentTerms,
      status: 'ISSUED',
      items: poItems,
    };

    setPurchaseOrders((prev) => [newPO, ...prev]);

    addAuditLog(
      'GENERATE_PURCHASE_ORDER',
      'PURCHASE_ORDER',
      poNum,
      poNum,
      `Generated Purchase Order ${poNum} awarded to ${quote.supplierName} for $${newPO.totalAmount.toLocaleString()} based on Quote ${quote.quotationNumber}.`
    );

    return newPO;
  };

  // 7. Process Goods Receipt (Supports partial deliveries & updates inventory atomically)
  const processGoodsReceipt = (data: {
    purchaseOrderId: string;
    carrier: string;
    trackingNumber: string;
    notes: string;
    items: {
      poItemId: string;
      productId: string;
      receivedQuantity: number;
      acceptedQuantity: number;
      rejectedQuantity: number;
      rejectionReason?: string;
    }[];
  }): GoodsReceipt => {
    const po = purchaseOrders.find((p) => p.id === data.purchaseOrderId);
    if (!po) throw new Error('Purchase order not found');

    const grnNum = `GRN-${2000 + goodsReceipts.length + 1}`;
    const grnId = grnNum;

    // Build Receipt Items
    const grnItems = data.items.map((it, idx) => {
      const prod = products.find((p) => p.id === it.productId);
      return {
        id: `GRI-${Date.now()}-${idx}`,
        poItemId: it.poItemId,
        productId: it.productId,
        productName: prod ? prod.name : 'Item',
        receivedQuantity: it.receivedQuantity,
        acceptedQuantity: it.acceptedQuantity,
        rejectedQuantity: it.rejectedQuantity,
        rejectionReason: it.rejectionReason,
      };
    });

    const newGRN: GoodsReceipt = {
      id: grnId,
      receiptNumber: grnNum,
      purchaseOrderId: po.id,
      poNumber: po.poNumber,
      receivedBy: currentUser.id,
      receiverName: currentUser.name,
      receiptDate: new Date().toISOString(),
      notes: data.notes,
      carrier: data.carrier,
      trackingNumber: data.trackingNumber,
      items: grnItems,
    };

    // Calculate updated received quantities on PO
    let totalOrdered = 0;
    let totalAcceptedAcrossReceipts = 0;

    const updatedPOItems = po.items.map((poItem) => {
      const match = data.items.find((it) => it.poItemId === poItem.id);
      const newlyAccepted = match ? match.acceptedQuantity : 0;
      const cumulativeReceived = poItem.quantityReceived + newlyAccepted;

      // Validate constraint: Received quantity cannot exceed ordered quantity
      if (cumulativeReceived > poItem.quantityOrdered) {
        throw new Error(
          `Constraint Violation: Received quantity (${cumulativeReceived}) cannot exceed ordered quantity (${poItem.quantityOrdered}) for ${poItem.productName}.`
        );
      }

      totalOrdered += poItem.quantityOrdered;
      totalAcceptedAcrossReceipts += cumulativeReceived;

      return {
        ...poItem,
        quantityReceived: cumulativeReceived,
      };
    });

    const newPOStatus =
      totalAcceptedAcrossReceipts >= totalOrdered ? 'FULLY_RECEIVED' : 'PARTIALLY_RECEIVED';

    // Update PO
    setPurchaseOrders((prev) =>
      prev.map((p) =>
        p.id === po.id
          ? {
              ...p,
              status: newPOStatus,
              items: updatedPOItems,
            }
          : p
      )
    );

    // Save GRN
    setGoodsReceipts((prev) => [newGRN, ...prev]);

    // Update Inventory and log inventory transactions
    const newTxns: InventoryTransaction[] = [];
    setProducts((prev) =>
      prev.map((prod) => {
        const itemReceipt = grnItems.find((gi) => gi.productId === prod.id && gi.acceptedQuantity > 0);
        if (itemReceipt) {
          const newStock = prod.currentStock + itemReceipt.acceptedQuantity;
          newTxns.push({
            id: `ITX-${Date.now()}-${prod.id}`,
            productId: prod.id,
            productName: prod.name,
            transactionType: 'GOODS_RECEIPT',
            quantity: itemReceipt.acceptedQuantity,
            stockAfter: newStock,
            referenceType: 'GOODS_RECEIPT',
            referenceNumber: grnNum,
            performedBy: currentUser.name,
            timestamp: new Date().toISOString(),
          });
          return {
            ...prod,
            currentStock: newStock,
          };
        }
        return prod;
      })
    );

    if (newTxns.length > 0) {
      setInventoryTransactions((prev) => [...newTxns, ...prev]);
    }

    addAuditLog(
      newPOStatus === 'FULLY_RECEIVED' ? 'PROCESS_GOODS_RECEIPT_FULL' : 'PROCESS_GOODS_RECEIPT_PARTIAL',
      'GOODS_RECEIPT',
      grnId,
      grnNum,
      `Recorded goods receipt ${grnNum} for PO ${po.poNumber}. Total accepted: ${data.items.reduce(
        (acc, i) => acc + i.acceptedQuantity,
        0
      )} units. PO status now: ${newPOStatus}.`
    );

    // Re-evaluate pending/failed invoices for this PO automatically!
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.purchaseOrderId === po.id && inv.status === 'MATCH_FAILED') {
          // Check if now all items are received
          const matchResult = checkThreeWayMatch(inv, updatedPOItems);
          if (matchResult.isMatch) {
            return {
              ...inv,
              status: 'MATCH_VERIFIED',
              mismatchReason: undefined,
            };
          }
        }
        return inv;
      })
    );

    return newGRN;
  };

  // Helper calculation for 3-way matching
  const checkThreeWayMatch = (
    inv: Invoice,
    poItemsOverride?: PurchaseOrder['items']
  ): ThreeWayMatchResult => {
    const po = purchaseOrders.find((p) => p.id === inv.purchaseOrderId);
    if (!po) {
      return {
        isMatch: false,
        status: 'UNRECEIVED_GOODS',
        summary: 'Linked Purchase Order not found.',
        orderedQty: 0,
        receivedQty: 0,
        invoicedQty: inv.items.reduce((s, i) => s + i.quantity, 0),
        poUnitPrice: 0,
        invoicedUnitPrice: inv.items[0]?.unitPrice || 0,
        poTotal: 0,
        invoicedTotal: inv.totalAmount,
        discrepancies: ['Linked Purchase Order not found.'],
        canPay: false,
      };
    }

    const itemsToEvaluate = poItemsOverride || po.items;
    const discrepancies: string[] = [];

    let totalOrdered = 0;
    let totalReceived = 0;
    let totalInvoiced = 0;

    itemsToEvaluate.forEach((poi) => {
      totalOrdered += poi.quantityOrdered;
      totalReceived += poi.quantityReceived;

      const invoicedItem = inv.items.find((ii) => ii.productId === poi.productId);
      if (!invoicedItem) {
        discrepancies.push(`Item "${poi.productName}" ordered on PO was not included in invoice.`);
      } else {
        totalInvoiced += invoicedItem.quantity;
        // Check unit price mismatch
        if (Math.abs(invoicedItem.unitPrice - poi.unitPrice) > 0.01) {
          discrepancies.push(
            `Unit Price discrepancy for "${poi.productName}": PO agreed rate $${poi.unitPrice.toFixed(
              2
            )} vs Invoiced rate $${invoicedItem.unitPrice.toFixed(2)}`
          );
        }
        // Check quantity mismatch: Invoiced cannot exceed Received
        if (invoicedItem.quantity > poi.quantityReceived) {
          discrepancies.push(
            `Quantity discrepancy for "${poi.productName}": Supplier billed for ${invoicedItem.quantity} units, but warehouse has only received and accepted ${poi.quantityReceived} units (${invoicedItem.quantity - poi.quantityReceived} unfulfilled/pending).`
          );
        }
      }
    });

    const isMatch = discrepancies.length === 0;

    return {
      isMatch,
      status: isMatch
        ? 'PERFECT_MATCH'
        : totalInvoiced > totalReceived
        ? 'QUANTITY_MISMATCH'
        : 'PRICE_MISMATCH',
      summary: isMatch
        ? '3-Way Match Verified: Purchase Order, Goods Receipt, and Supplier Invoice match perfectly.'
        : `Discrepancy detected: ${discrepancies.join('; ')}`,
      orderedQty: totalOrdered,
      receivedQty: totalReceived,
      invoicedQty: totalInvoiced,
      poUnitPrice: itemsToEvaluate[0]?.unitPrice || 0,
      invoicedUnitPrice: inv.items[0]?.unitPrice || 0,
      poTotal: po.totalAmount,
      invoicedTotal: inv.totalAmount,
      discrepancies,
      canPay: isMatch,
    };
  };

  // 8. Create Invoice
  const createInvoice = (data: {
    purchaseOrderId: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    items: { productId: string; quantity: number; unitPrice: number; tax: number }[];
  }): Invoice => {
    const po = purchaseOrders.find((p) => p.id === data.purchaseOrderId);
    if (!po) throw new Error('Purchase order not found');

    let subtotal = 0;
    let taxTotal = 0;
    const items = data.items.map((it, idx) => {
      const prod = products.find((p) => p.id === it.productId);
      const gross = it.quantity * it.unitPrice;
      subtotal += gross;
      taxTotal += it.tax || 0;
      return {
        id: `INVI-${Date.now()}-${idx}`,
        productId: it.productId,
        productName: prod ? prod.name : 'Product',
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        tax: it.tax || 0,
        total: gross + (it.tax || 0),
      };
    });

    const tempInvoice: Invoice = {
      id: data.invoiceNumber,
      invoiceNumber: data.invoiceNumber,
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      purchaseOrderId: po.id,
      poNumber: po.poNumber,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      subtotal,
      tax: taxTotal,
      totalAmount: subtotal + taxTotal,
      status: 'PENDING_MATCH',
      items,
    };

    // Run 3-Way Match right away
    const match = checkThreeWayMatch(tempInvoice);
    tempInvoice.status = match.isMatch ? 'MATCH_VERIFIED' : 'MATCH_FAILED';
    if (!match.isMatch) {
      tempInvoice.mismatchReason = match.summary;
    }

    setInvoices((prev) => [tempInvoice, ...prev]);

    addAuditLog(
      match.isMatch ? 'REGISTER_INVOICE_MATCHED' : 'REGISTER_INVOICE_MISMATCH_LOCKED',
      'INVOICE',
      tempInvoice.id,
      tempInvoice.invoiceNumber,
      `Registered Invoice ${tempInvoice.invoiceNumber} for PO ${po.poNumber} ($${tempInvoice.totalAmount.toLocaleString()}). Three-Way Match Status: ${
        tempInvoice.status
      }.`
    );

    return tempInvoice;
  };

  // 9. Evaluate Three Way Match
  const evaluateThreeWayMatch = (invoiceId: string): ThreeWayMatchResult => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) throw new Error('Invoice not found');
    return checkThreeWayMatch(inv);
  };

  // 10. Process Payment
  const processPayment = (data: {
    invoiceId: string;
    paymentMethod: 'NEFT_RTGS' | 'BANK_TRANSFER' | 'CORPORATE_CARD' | 'CHEQUE';
    referenceNumber: string;
  }): Payment => {
    const inv = invoices.find((i) => i.id === data.invoiceId);
    if (!inv) throw new Error('Invoice not found');

    if (inv.status === 'MATCH_FAILED' || inv.status === 'PENDING_MATCH') {
      throw new Error(
        'Critical Business Rule Violation: An invoice cannot be paid when three-way matching fails. Resolve goods delivery discrepancy first.'
      );
    }

    if (inv.status === 'PAID') {
      throw new Error('Invoice is already paid.');
    }

    const newPayment: Payment = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      amount: inv.totalAmount,
      paymentDate: new Date().toISOString(),
      paymentMethod: data.paymentMethod,
      referenceNumber: data.referenceNumber,
      processedBy: currentUser.id,
      processorName: currentUser.name,
      status: 'COMPLETED',
    };

    setPayments((prev) => [newPayment, ...prev]);
    setInvoices((prev) =>
      prev.map((i) => (i.id === inv.id ? { ...i, status: 'PAID' } : i))
    );

    // Also close PO if fully received and paid
    setPurchaseOrders((prev) =>
      prev.map((p) => {
        if (p.id === inv.purchaseOrderId && p.status === 'FULLY_RECEIVED') {
          return { ...p, status: 'CLOSED' };
        }
        return p;
      })
    );

    addAuditLog(
      'PROCESS_PAYMENT_DISBURSED',
      'PAYMENT',
      newPayment.id,
      newPayment.referenceNumber,
      `Disbursed payment of $${inv.totalAmount.toLocaleString()} for Invoice ${inv.invoiceNumber} via ${data.paymentMethod} (Ref: ${data.referenceNumber}).`
    );

    return newPayment;
  };

  // 11. Live Demo Shortcut: Resolve Remaining Delivery (from 8 to 10 units for PR-1001/PO-3001)
  const resolveMissingDeliveryShortcut = (poId: string) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) return;

    const poItem = po.items[0];
    if (!poItem) return;

    const remainingQty = poItem.quantityOrdered - poItem.quantityReceived;
    if (remainingQty <= 0) return;

    processGoodsReceipt({
      purchaseOrderId: po.id,
      carrier: 'FedEx Freight Express (Final Consignment)',
      trackingNumber: 'FX-9920148191-FINAL',
      notes: `Final shipment delivered. Remaining ${remainingQty} units inspected and accepted with zero defects.`,
      items: [
        {
          poItemId: poItem.id,
          productId: poItem.productId,
          receivedQuantity: remainingQty,
          acceptedQuantity: remainingQty,
          rejectedQuantity: 0,
        },
      ],
    });

    setCurrentDemoStep(7); // Advances demo to Step 7
  };

  // Reset to initial clean state
  const resetToInitialDemoState = () => {
    localStorage.clear();
    setCurrentUser(INITIAL_USERS[0]);
    setProducts(INITIAL_PRODUCTS);
    setPurchaseRequests(INITIAL_PURCHASE_REQUESTS);
    setQuotations(INITIAL_QUOTATIONS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setGoodsReceipts(INITIAL_GOODS_RECEIPTS);
    setInvoices(INITIAL_INVOICES);
    setPayments(INITIAL_PAYMENTS);
    setInventoryTransactions(INITIAL_INVENTORY_TRANSACTIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentDemoStep(5);
    setActiveTab('dashboard');
  };

  // Load specific step in the 8-step demo story
  const loadDemoStep = (stepNumber: number) => {
    setCurrentDemoStep(stepNumber);
    switch (stepNumber) {
      case 1:
        // Step 1: Employee Alex raises PR-1001
        switchRole('EMPLOYEE');
        setActiveTab('requests');
        break;
      case 2:
        // Step 2: Manager Sarah reviews & approves
        switchRole('MANAGER');
        setActiveTab('approvals');
        break;
      case 3:
        // Step 3: Procurement Officer Marcus compares quotations
        switchRole('PROCUREMENT');
        setActiveTab('quotations');
        break;
      case 4:
        // Step 4: Purchase order issued
        switchRole('PROCUREMENT');
        setActiveTab('orders');
        break;
      case 5:
        // Step 5: Goods Receipt partial (8/10)
        switchRole('PROCUREMENT');
        setActiveTab('receiving');
        break;
      case 6:
        // Step 6: Finance sees invoice for 10 units -> 3-Way Match Fails & Blocks Payment!
        switchRole('FINANCE');
        setActiveTab('finance');
        break;
      case 7:
        // Step 7: Resolve delivery and re-match!
        switchRole('FINANCE');
        setActiveTab('finance');
        break;
      case 8:
        // Step 8: Payment processed & Inventory Audited!
        switchRole('ADMIN');
        setActiveTab('inventory');
        break;
      default:
        setActiveTab('dashboard');
    }
  };

  return (
    <ProcurementContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        users,
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
        activeTab,
        setActiveTab,
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
        resolveMissingDeliveryShortcut,
        resetToInitialDemoState,
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
