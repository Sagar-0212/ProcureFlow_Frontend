import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
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
} from './src/mock/initialData';

dotenv.config();

const app = express();
app.use(express.json());

// In-Memory Database Store initialized from domain seed
let users = [...INITIAL_USERS];
let departments = [...INITIAL_DEPARTMENTS];
let approvalRules = [...INITIAL_APPROVAL_RULES];
let products = [...INITIAL_PRODUCTS];
let suppliers = [...INITIAL_SUPPLIERS];
let purchaseRequests = [...INITIAL_PURCHASE_REQUESTS];
let quotations = [...INITIAL_QUOTATIONS];
let purchaseOrders = [...INITIAL_PURCHASE_ORDERS];
let goodsReceipts = [...INITIAL_GOODS_RECEIPTS];
let invoices = [...INITIAL_INVOICES];
let payments = [...INITIAL_PAYMENTS];
let inventoryTransactions = [...INITIAL_INVENTORY_TRANSACTIONS];
let auditLogs = [...INITIAL_AUDIT_LOGS];

// Unique ID generators
let prIdSeq = 1004;
let poIdSeq = 3002;
let grnIdSeq = 2002;
let invIdSeq = 9043;
let payIdSeq = 5001;
let transIdSeq = 102;
let auditIdSeq = 6;
let quoteIdSeq = 204;

// Auth helper
function getAuthenticatedUser(req: express.Request) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // Format: jwt_token_<userId>_<timestamp> or match user ID
    for (const u of users) {
      if (token.includes(u.id) || token.includes(u.email)) {
        return u;
      }
    }
  }
  // Default to first user if token present or default user
  return users[0];
}

// Helper to log system audits
function addAuditLog(
  user: typeof users[0],
  action: string,
  entityType: string,
  entityId: string,
  entityReference: string,
  description: string
) {
  const log = {
    id: `AUD-${String(auditIdSeq++).padStart(3, '0')}`,
    timestamp: new Date().toISOString(),
    userId: user?.id || 'SYSTEM',
    userName: user?.name || 'System User',
    userRole: user?.role || 'EMPLOYEE',
    action,
    entityType,
    entityId,
    entityReference,
    description,
  };
  auditLogs.unshift(log);
  return log;
}

// -------------------------------------------------------------
// 1. /api/auth
// -------------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  const user = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase()) || users[0];
  const token = `jwt_token_${user.id}_${Date.now()}`;
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
      departmentName: user.departmentName,
    },
  });
});

app.get('/api/auth/me', (req, res) => {
  const user = getAuthenticatedUser(req);
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId,
    departmentName: user.departmentName,
  });
});

// -------------------------------------------------------------
// 2. /api/departments
// -------------------------------------------------------------
app.get('/api/departments', (req, res) => {
  res.json(departments);
});

app.get('/api/departments/:id', (req, res) => {
  const item = departments.find((d) => d.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Department not found' });
  res.json(item);
});

app.post('/api/departments', (req, res) => {
  const newDept = {
    id: `DEP-${Date.now()}`,
    name: req.body.name,
    code: req.body.code || 'GEN',
    budget: Number(req.body.budget) || 0,
    managerId: req.body.managerId,
  };
  departments.push(newDept);
  res.status(201).json(newDept);
});

app.put('/api/departments/:id', (req, res) => {
  const idx = departments.findIndex((d) => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Department not found' });
  departments[idx] = { ...departments[idx], ...req.body };
  res.json(departments[idx]);
});

app.delete('/api/departments/:id', (req, res) => {
  departments = departments.filter((d) => d.id !== req.params.id);
  res.status(204).send();
});

// -------------------------------------------------------------
// 3. /api/categories
// -------------------------------------------------------------
app.get('/api/categories', (req, res) => {
  const categories = Array.from(new Set(products.map((p) => p.category))).map((c, i) => ({
    id: `CAT-${i + 1}`,
    name: c,
    description: `${c} Product Category`,
  }));
  res.json(categories);
});

// -------------------------------------------------------------
// 4. /api/products
// -------------------------------------------------------------
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const prod = products.find((p) => p.id === req.params.id);
  if (!prod) return res.status(404).json({ message: 'Product not found' });
  res.json(prod);
});

app.post('/api/products', (req, res) => {
  const user = getAuthenticatedUser(req);
  const newProd = {
    id: `PROD-${Date.now()}`,
    name: req.body.name,
    sku: req.body.sku || `SKU-${Date.now()}`,
    category: req.body.category || 'General',
    unit: req.body.unit || 'Units',
    defaultPrice: Number(req.body.defaultPrice) || 0,
    currentStock: Number(req.body.currentStock) || 0,
    reorderLevel: Number(req.body.reorderLevel) || 5,
    leadTimeDays: Number(req.body.leadTimeDays) || 3,
    averageMonthlyUsage: Number(req.body.averageMonthlyUsage) || 10,
    isActive: true,
  };
  products.push(newProd);
  addAuditLog(user, 'CREATE_PRODUCT', 'PRODUCT', newProd.id, newProd.sku, `Created product ${newProd.name}`);
  res.status(201).json(newProd);
});

app.put('/api/products/:id', (req, res) => {
  const idx = products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Product not found' });
  products[idx] = { ...products[idx], ...req.body };
  res.json(products[idx]);
});

app.delete('/api/products/:id', (req, res) => {
  products = products.filter((p) => p.id !== req.params.id);
  res.status(204).send();
});

// -------------------------------------------------------------
// 5. /api/suppliers
// -------------------------------------------------------------
app.get('/api/suppliers', (req, res) => {
  res.json(suppliers);
});

app.get('/api/suppliers/:id', (req, res) => {
  const sup = suppliers.find((s) => s.id === req.params.id);
  if (!sup) return res.status(404).json({ message: 'Supplier not found' });
  res.json(sup);
});

app.post('/api/suppliers', (req, res) => {
  const user = getAuthenticatedUser(req);
  const newSup = {
    id: `SUP-${Date.now()}`,
    companyName: req.body.companyName,
    contactPerson: req.body.contactPerson || 'Account Representative',
    email: req.body.email || 'sales@supplier.com',
    phone: req.body.phone || '+1 555 000 0000',
    address: req.body.address || 'Corporate Park',
    gstNumber: req.body.gstNumber || '27XXXXX0000X1Z0',
    paymentTerms: req.body.paymentTerms || 'Net 30 Days',
    rating: Number(req.body.rating) || 4.5,
    isActive: true,
  };
  suppliers.push(newSup);
  addAuditLog(user, 'CREATE_SUPPLIER', 'SUPPLIER', newSup.id, newSup.companyName, `Registered supplier ${newSup.companyName}`);
  res.status(201).json(newSup);
});

app.put('/api/suppliers/:id', (req, res) => {
  const idx = suppliers.findIndex((s) => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Supplier not found' });
  suppliers[idx] = { ...suppliers[idx], ...req.body };
  res.json(suppliers[idx]);
});

app.delete('/api/suppliers/:id', (req, res) => {
  suppliers = suppliers.filter((s) => s.id !== req.params.id);
  res.status(204).send();
});

// -------------------------------------------------------------
// 6. /api/purchase-requests
// -------------------------------------------------------------
app.get('/api/purchase-requests', (req, res) => {
  res.json(purchaseRequests);
});

app.get('/api/purchase-requests/:id', (req, res) => {
  const pr = purchaseRequests.find((p) => p.id === req.params.id);
  if (!pr) return res.status(404).json({ message: 'Purchase Request not found' });
  res.json(pr);
});

app.post('/api/purchase-requests', (req, res) => {
  const user = getAuthenticatedUser(req);
  const { departmentId, reason, items } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ message: 'Purchase request must include at least one item.' });
  }

  const dept = departments.find((d) => d.id === String(departmentId)) || departments[0];
  const reqNumber = `PR-${prIdSeq++}`;

  const prItems = items.map((it: any, idx: number) => {
    const prod = products.find((p) => p.id === String(it.productId));
    const unitPrice = Number(it.estimatedUnitPrice) || prod?.defaultPrice || 100;
    const qty = Number(it.quantity) || 1;
    return {
      id: `PRI-${Date.now()}-${idx}`,
      productId: String(it.productId),
      productName: prod?.name || 'Procurement Item',
      sku: prod?.sku || 'SKU-GEN',
      quantity: qty,
      estimatedUnitPrice: unitPrice,
      estimatedTotal: qty * unitPrice,
    };
  });

  const estimatedTotal = prItems.reduce((sum: number, it: any) => sum + it.estimatedTotal, 0);

  const newPR = {
    id: reqNumber,
    requestNumber: reqNumber,
    requestedBy: user.id,
    requesterName: user.name,
    departmentId: dept.id,
    departmentName: dept.name,
    reason: reason || 'Operational requirements',
    estimatedTotal,
    status: 'PENDING_APPROVAL' as const,
    submittedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    items: prItems,
    approvalHistory: [],
  };

  purchaseRequests.unshift(newPR);
  addAuditLog(
    user,
    'CREATE_PURCHASE_REQUEST',
    'PURCHASE_REQUEST',
    newPR.id,
    newPR.requestNumber,
    `Submitted purchase request ${newPR.requestNumber} for $${estimatedTotal.toFixed(2)}. Reason: ${newPR.reason}`
  );

  res.status(201).json(newPR);
});

app.post('/api/purchase-requests/:id/submit', (req, res) => {
  const user = getAuthenticatedUser(req);
  const pr = purchaseRequests.find((p) => p.id === req.params.id);
  if (!pr) return res.status(404).json({ message: 'Purchase Request not found' });
  pr.status = 'PENDING_APPROVAL';
  pr.submittedAt = new Date().toISOString();
  addAuditLog(user, 'SUBMIT_PURCHASE_REQUEST', 'PURCHASE_REQUEST', pr.id, pr.requestNumber, `Submitted ${pr.requestNumber} for approval`);
  res.json(pr);
});

app.post('/api/purchase-requests/:id/cancel', (req, res) => {
  const user = getAuthenticatedUser(req);
  const pr = purchaseRequests.find((p) => p.id === req.params.id);
  if (!pr) return res.status(404).json({ message: 'Purchase Request not found' });
  pr.status = 'CANCELLED';
  addAuditLog(user, 'CANCEL_PURCHASE_REQUEST', 'PURCHASE_REQUEST', pr.id, pr.requestNumber, `Cancelled purchase request ${pr.requestNumber}`);
  res.json(pr);
});

// -------------------------------------------------------------
// 7. /api/approval-rules & /api/approvals
// -------------------------------------------------------------
app.get('/api/approval-rules', (req, res) => {
  res.json(approvalRules);
});

app.post('/api/approvals/:id/approve', (req, res) => {
  const user = getAuthenticatedUser(req);
  const pr = purchaseRequests.find((p) => p.id === req.params.id);
  if (!pr) return res.status(404).json({ message: 'Purchase Request not found' });

  const { comments } = req.body;
  pr.status = 'APPROVED';
  const actionRecord = {
    id: `APP-${Date.now()}`,
    purchaseRequestId: pr.id,
    approverId: user.id,
    approverName: user.name,
    action: 'APPROVED' as const,
    comments: comments || 'Approved in accordance with budget thresholds.',
    approvedAt: new Date().toISOString(),
  };
  pr.approvalHistory = pr.approvalHistory || [];
  pr.approvalHistory.push(actionRecord);

  addAuditLog(
    user,
    'APPROVE_PURCHASE_REQUEST',
    'APPROVAL',
    pr.id,
    pr.requestNumber,
    `Approved purchase request ${pr.requestNumber}. Comment: "${actionRecord.comments}"`
  );

  res.json(pr);
});

app.post('/api/approvals/:id/reject', (req, res) => {
  const user = getAuthenticatedUser(req);
  const pr = purchaseRequests.find((p) => p.id === req.params.id);
  if (!pr) return res.status(404).json({ message: 'Purchase Request not found' });

  const { comments } = req.body;
  pr.status = 'REJECTED';
  const actionRecord = {
    id: `APP-${Date.now()}`,
    purchaseRequestId: pr.id,
    approverId: user.id,
    approverName: user.name,
    action: 'REJECTED' as const,
    comments: comments || 'Rejected by management.',
    approvedAt: new Date().toISOString(),
  };
  pr.approvalHistory = pr.approvalHistory || [];
  pr.approvalHistory.push(actionRecord);

  addAuditLog(
    user,
    'REJECT_PURCHASE_REQUEST',
    'APPROVAL',
    pr.id,
    pr.requestNumber,
    `Rejected purchase request ${pr.requestNumber}. Reason: "${actionRecord.comments}"`
  );

  res.json(pr);
});

// -------------------------------------------------------------
// 8. /api/quotations
// -------------------------------------------------------------
app.get('/api/quotations', (req, res) => {
  const { purchaseRequestId } = req.query;
  if (purchaseRequestId) {
    return res.json(quotations.filter((q) => q.purchaseRequestId === String(purchaseRequestId)));
  }
  res.json(quotations);
});

app.get('/api/quotations/:id', (req, res) => {
  const q = quotations.find((it) => it.id === req.params.id);
  if (!q) return res.status(404).json({ message: 'Quotation not found' });
  res.json(q);
});

app.post('/api/quotations', (req, res) => {
  const user = getAuthenticatedUser(req);
  const { purchaseRequestId, supplierId, deliveryDays, warrantyPeriod, paymentTerms, items, notes } = req.body;

  const sup = suppliers.find((s) => s.id === String(supplierId)) || suppliers[0];
  const qNum = `QT-2026-${String(quoteIdSeq++).padStart(3, '0')}`;

  const quoteItems = (items || []).map((it: any, idx: number) => {
    const prod = products.find((p) => p.id === String(it.productId));
    const qty = Number(it.quantity) || 1;
    const unitPrice = Number(it.unitPrice) || prod?.defaultPrice || 100;
    const discount = Number(it.discount) || 0;
    const taxPercent = Number(it.taxPercent) || 0;
    const lineSubtotal = qty * unitPrice * (1 - discount / 100);
    const lineTax = lineSubtotal * (taxPercent / 100);
    return {
      id: `QTI-${Date.now()}-${idx}`,
      productId: String(it.productId),
      productName: prod?.name || 'Product Item',
      quantity: qty,
      unitPrice,
      taxPercent,
      tax: lineTax,
      discount,
      total: lineSubtotal + lineTax,
    };
  });

  const subtotal = quoteItems.reduce((acc: number, it: any) => acc + it.quantity * it.unitPrice, 0);
  const totalAmount = quoteItems.reduce((acc: number, it: any) => acc + it.total, 0);
  const tax = totalAmount - subtotal;

  const newQuote = {
    id: qNum,
    quotationNumber: qNum,
    purchaseRequestId: String(purchaseRequestId),
    supplierId: sup.id,
    supplierName: sup.companyName,
    quotationDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    subtotal,
    tax: Math.max(0, tax),
    discount: 0,
    totalAmount,
    deliveryDays: Number(deliveryDays) || 5,
    warrantyPeriod: warrantyPeriod || '12 Months Standard',
    paymentTerms: paymentTerms || sup.paymentTerms,
    status: 'PENDING' as const,
    items: quoteItems,
    notes: notes || '',
  };

  quotations.unshift(newQuote);
  addAuditLog(user, 'CREATE_QUOTATION', 'QUOTATION', newQuote.id, newQuote.quotationNumber, `Registered bid ${newQuote.quotationNumber} from ${sup.companyName}`);
  res.status(201).json(newQuote);
});

app.post('/api/quotations/:id/select', (req, res) => {
  const user = getAuthenticatedUser(req);
  const quote = quotations.find((q) => q.id === req.params.id);
  if (!quote) return res.status(404).json({ message: 'Quotation not found' });

  const prId = req.body.purchaseRequestId || quote.purchaseRequestId;

  // Mark selected quote ACCEPTED, others REJECTED
  quotations.forEach((q) => {
    if (q.purchaseRequestId === String(prId)) {
      q.status = q.id === quote.id ? 'ACCEPTED' : 'REJECTED';
    }
  });

  // Automatically generate Purchase Order
  const poNum = `PO-${poIdSeq++}`;
  const poItems = quote.items.map((qi, idx) => ({
    id: `POI-${Date.now()}-${idx}`,
    productId: qi.productId,
    productName: qi.productName,
    sku: products.find((p) => p.id === qi.productId)?.sku || 'SKU-GEN',
    quantityOrdered: qi.quantity,
    quantityReceived: 0,
    unitPrice: qi.unitPrice,
    tax: (qi as any).tax || 0,
    total: qi.total,
  }));

  const newPO = {
    id: poNum,
    poNumber: poNum,
    purchaseRequestId: String(prId),
    supplierId: quote.supplierId,
    supplierName: quote.supplierName,
    quotationId: quote.id,
    createdBy: user.id,
    creatorName: user.name,
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: new Date(Date.now() + quote.deliveryDays * 86400000).toISOString().split('T')[0],
    subtotal: quote.subtotal,
    tax: quote.tax,
    totalAmount: quote.totalAmount,
    paymentTerms: quote.paymentTerms,
    status: 'SENT_TO_SUPPLIER' as const,
    items: poItems,
  };

  purchaseOrders.unshift(newPO);

  addAuditLog(
    user,
    'SELECT_SUPPLIER_AND_CREATE_PO',
    'PURCHASE_ORDER',
    newPO.id,
    newPO.poNumber,
    `Evaluated quotations for PR ${prId}. Selected ${quote.supplierName} (${quote.quotationNumber}). Generated PO ${newPO.poNumber} for $${newPO.totalAmount.toFixed(2)}.`
  );

  res.status(201).json(newPO);
});

// -------------------------------------------------------------
// 9. /api/purchase-orders
// -------------------------------------------------------------
app.get('/api/purchase-orders', (req, res) => {
  res.json(purchaseOrders);
});

app.get('/api/purchase-orders/:id', (req, res) => {
  const po = purchaseOrders.find((p) => p.id === req.params.id);
  if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
  res.json(po);
});

app.post('/api/purchase-orders', (req, res) => {
  const user = getAuthenticatedUser(req);
  const { quotationId, purchaseRequestId } = req.body;
  const quote = quotations.find((q) => q.id === String(quotationId));
  if (!quote) return res.status(404).json({ message: 'Quotation not found' });

  const poNum = `PO-${poIdSeq++}`;
  const newPO = {
    id: poNum,
    poNumber: poNum,
    purchaseRequestId: String(purchaseRequestId || quote.purchaseRequestId),
    supplierId: quote.supplierId,
    supplierName: quote.supplierName,
    quotationId: quote.id,
    createdBy: user.id,
    creatorName: user.name,
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: new Date(Date.now() + quote.deliveryDays * 86400000).toISOString().split('T')[0],
    subtotal: quote.subtotal,
    tax: quote.tax,
    totalAmount: quote.totalAmount,
    paymentTerms: quote.paymentTerms,
    status: 'SENT_TO_SUPPLIER' as const,
    items: quote.items.map((qi, idx) => ({
      id: `POI-${Date.now()}-${idx}`,
      productId: qi.productId,
      productName: qi.productName,
      sku: products.find((p) => p.id === qi.productId)?.sku || 'SKU-GEN',
      quantityOrdered: qi.quantity,
      quantityReceived: 0,
      unitPrice: qi.unitPrice,
      tax: (qi as any).tax || 0,
      total: qi.total,
    })),
  };

  purchaseOrders.unshift(newPO);
  addAuditLog(user, 'CREATE_PURCHASE_ORDER', 'PURCHASE_ORDER', newPO.id, newPO.poNumber, `Issued PO ${newPO.poNumber} to ${newPO.supplierName}`);
  res.status(201).json(newPO);
});

app.patch('/api/purchase-orders/:id/status', (req, res) => {
  const user = getAuthenticatedUser(req);
  const po = purchaseOrders.find((p) => p.id === req.params.id);
  if (!po) return res.status(404).json({ message: 'Purchase Order not found' });

  const { status } = req.body;
  po.status = status;
  addAuditLog(user, 'UPDATE_PO_STATUS', 'PURCHASE_ORDER', po.id, po.poNumber, `Changed PO status to ${status}`);
  res.json(po);
});

// -------------------------------------------------------------
// 10. /api/goods-receipts (Atomic Receipt & Inventory Updates)
// -------------------------------------------------------------
app.get('/api/goods-receipts', (req, res) => {
  const { purchaseOrderId } = req.query;
  if (purchaseOrderId) {
    return res.json(goodsReceipts.filter((gr) => gr.purchaseOrderId === String(purchaseOrderId)));
  }
  res.json(goodsReceipts);
});

app.get('/api/goods-receipts/:id', (req, res) => {
  const gr = goodsReceipts.find((g) => g.id === req.params.id);
  if (!gr) return res.status(404).json({ message: 'Goods Receipt not found' });
  res.json(gr);
});

app.post('/api/goods-receipts', (req, res) => {
  const user = getAuthenticatedUser(req);
  const { purchaseOrderId, carrier, trackingNumber, notes, items } = req.body;

  const po = purchaseOrders.find((p) => p.id === String(purchaseOrderId));
  if (!po) return res.status(404).json({ message: 'Associated Purchase Order not found' });

  const grNum = `GRN-${grnIdSeq++}`;

  // 1. Process items and update PO received quantities
  const grItems = (items || []).map((it: any, idx: number) => {
    const prod = products.find((p) => p.id === String(it.productId));
    const receivedQty = Number(it.receivedQuantity) || 0;
    const acceptedQty = Number(it.acceptedQuantity) || 0;
    const rejectedQty = Number(it.rejectedQuantity) || 0;

    // Update PO item quantityReceived
    const poItem = po.items.find((poi) => String(poi.productId) === String(it.productId) || poi.id === it.poItemId);
    if (poItem) {
      poItem.quantityReceived = (poItem.quantityReceived || 0) + acceptedQty;
    }

    // 2. Synchronize Warehouse Stock perpetual inventory
    if (prod && acceptedQty > 0) {
      prod.currentStock += acceptedQty;

      // Add perpetual Inventory Transaction
      const tx = {
        id: `ITX-${transIdSeq++}`,
        productId: prod.id,
        productName: prod.name,
        transactionType: 'RECEIPT' as const,
        quantity: acceptedQty,
        stockAfter: prod.currentStock,
        referenceType: 'GOODS_RECEIPT',
        referenceNumber: grNum,
        performedBy: user.name,
        timestamp: new Date().toISOString(),
        remarks: `Dock receipt for PO ${po.poNumber}. Carrier: ${carrier || 'Direct'}.`,
      };
      inventoryTransactions.unshift(tx);
    }

    return {
      id: `GRI-${Date.now()}-${idx}`,
      poItemId: it.poItemId || poItem?.id || '',
      productId: String(it.productId),
      productName: prod?.name || 'Product',
      receivedQuantity: receivedQty,
      acceptedQuantity: acceptedQty,
      rejectedQuantity: rejectedQty,
      rejectionReason: it.rejectionReason || '',
    };
  });

  // 3. Update PO status: check if all quantities fully received
  const totalOrdered = po.items.reduce((s, it) => s + it.quantityOrdered, 0);
  const totalReceived = po.items.reduce((s, it) => s + (it.quantityReceived || 0), 0);

  if (totalReceived >= totalOrdered) {
    po.status = 'FULLY_RECEIVED';
  } else if (totalReceived > 0) {
    po.status = 'PARTIALLY_RECEIVED';
  }

  // 4. Create Goods Receipt Note
  const newGR = {
    id: grNum,
    receiptNumber: grNum,
    purchaseOrderId: po.id,
    poNumber: po.poNumber,
    receivedBy: user.id,
    receiverName: user.name,
    receiptDate: new Date().toISOString(),
    notes: notes || '',
    carrier: carrier || 'Carrier Freight',
    trackingNumber: trackingNumber || 'TRK-DEFAULT',
    items: grItems,
  };

  goodsReceipts.unshift(newGR);

  addAuditLog(
    user,
    totalReceived >= totalOrdered ? 'PROCESS_GOODS_RECEIPT_FULL' : 'PROCESS_GOODS_RECEIPT_PARTIAL',
    'GOODS_RECEIPT',
    newGR.id,
    newGR.receiptNumber,
    `Registered GRN ${newGR.receiptNumber} for PO ${po.poNumber}. Accepted ${grItems.reduce((s: number, i: any) => s + i.acceptedQuantity, 0)} units. PO status transitioned to ${po.status}.`
  );

  res.status(201).json(newGR);
});

// -------------------------------------------------------------
// 11. /api/inventory
// -------------------------------------------------------------
app.get('/api/inventory', (req, res) => {
  res.json(products);
});

app.get('/api/inventory/transactions', (req, res) => {
  const { productId } = req.query;
  if (productId) {
    return res.json(inventoryTransactions.filter((tx) => tx.productId === String(productId)));
  }
  res.json(inventoryTransactions);
});

app.post('/api/inventory/adjust', (req, res) => {
  const user = getAuthenticatedUser(req);
  const { productId, quantity, type, remarks } = req.body;

  const prod = products.find((p) => p.id === String(productId));
  if (!prod) return res.status(404).json({ message: 'Product not found' });

  const qty = Number(quantity) || 0;
  if (type === 'RETURN') {
    prod.currentStock = Math.max(0, prod.currentStock - qty);
  } else {
    prod.currentStock += qty;
  }

  const tx = {
    id: `ITX-${transIdSeq++}`,
    productId: prod.id,
    productName: prod.name,
    transactionType: type || 'ADJUSTMENT',
    quantity: qty,
    stockAfter: prod.currentStock,
    referenceType: 'MANUAL_ADJUSTMENT',
    referenceNumber: `ADJ-${Date.now()}`,
    performedBy: user.name,
    timestamp: new Date().toISOString(),
    remarks: remarks || 'Stock manual correction',
  };

  inventoryTransactions.unshift(tx);
  addAuditLog(user, 'STOCK_ADJUSTMENT', 'INVENTORY', prod.id, prod.sku, `Manual stock adjustment on ${prod.name}: ${qty > 0 ? '+' : ''}${qty} (${type})`);
  res.status(201).json(tx);
});

// -------------------------------------------------------------
// 12. /api/invoices & 3-Way Matching
// -------------------------------------------------------------
app.get('/api/invoices', (req, res) => {
  const { purchaseOrderId } = req.query;
  if (purchaseOrderId) {
    return res.json(invoices.filter((inv) => inv.purchaseOrderId === String(purchaseOrderId)));
  }
  res.json(invoices);
});

app.get('/api/invoices/:id', (req, res) => {
  const inv = invoices.find((i) => i.id === req.params.id);
  if (!inv) return res.status(404).json({ message: 'Invoice not found' });
  res.json(inv);
});

app.post('/api/invoices', (req, res) => {
  const user = getAuthenticatedUser(req);
  const { purchaseOrderId, invoiceNumber, invoiceDate, dueDate, items } = req.body;

  const po = purchaseOrders.find((p) => p.id === String(purchaseOrderId));
  if (!po) return res.status(404).json({ message: 'Purchase Order not found' });

  const invNum = invoiceNumber || `INV-${invIdSeq++}`;

  const invItems = (items || []).map((it: any, idx: number) => {
    const prod = products.find((p) => p.id === String(it.productId));
    const qty = Number(it.quantity) || 1;
    const unitPrice = Number(it.unitPrice) || 0;
    const tax = Number(it.tax) || 0;
    return {
      id: `INVI-${Date.now()}-${idx}`,
      productId: String(it.productId),
      productName: prod?.name || 'Product Item',
      quantity: qty,
      unitPrice,
      tax,
      total: qty * unitPrice + tax,
    };
  });

  const subtotal = invItems.reduce((acc: number, it: any) => acc + it.quantity * it.unitPrice, 0);
  const tax = invItems.reduce((acc: number, it: any) => acc + it.tax, 0);
  const totalAmount = subtotal + tax;

  const newInv = {
    id: invNum,
    invoiceNumber: invNum,
    supplierId: po.supplierId,
    supplierName: po.supplierName,
    purchaseOrderId: po.id,
    poNumber: po.poNumber,
    invoiceDate: invoiceDate || new Date().toISOString().split('T')[0],
    dueDate: dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    subtotal,
    tax,
    totalAmount,
    status: 'PENDING_VERIFICATION' as const,
    items: invItems,
  };

  invoices.unshift(newInv);
  addAuditLog(user, 'REGISTER_INVOICE', 'INVOICE', newInv.id, newInv.invoiceNumber, `Registered vendor invoice ${newInv.invoiceNumber} for PO ${po.poNumber} ($${totalAmount.toFixed(2)})`);
  res.status(201).json(newInv);
});

// Three-Way Match Engine Endpoint
app.post('/api/invoices/:id/verify-match', (req, res) => {
  const user = getAuthenticatedUser(req);
  const inv = invoices.find((i) => i.id === req.params.id);
  if (!inv) return res.status(404).json({ message: 'Invoice not found' });

  const po = purchaseOrders.find((p) => p.id === String(inv.purchaseOrderId));
  if (!po) {
    inv.status = 'MISMATCH';
    inv.mismatchReason = 'Associated Purchase Order not found.';
    return res.json(inv);
  }

  const relatedGRNs = goodsReceipts.filter((gr) => gr.purchaseOrderId === po.id);
  const discrepancies: string[] = [];

  for (const invItem of inv.items) {
    const poItem = po.items.find((poi) => String(poi.productId) === String(invItem.productId));
    if (!poItem) {
      discrepancies.push(`Billed item ${invItem.productName} was not ordered on PO ${po.poNumber}.`);
      continue;
    }

    // Check rate / price invariance
    if (Math.abs(invItem.unitPrice - poItem.unitPrice) > 0.01) {
      discrepancies.push(
        `Price Variance: Billed at $${invItem.unitPrice.toFixed(2)}/unit, but agreed PO price was $${poItem.unitPrice.toFixed(2)}/unit.`
      );
    }

    // Check physical quantity invariance against all accepted warehouse GRNs
    let totalAccepted = 0;
    relatedGRNs.forEach((gr) => {
      gr.items.forEach((gri) => {
        if (String(gri.productId) === String(invItem.productId)) {
          totalAccepted += gri.acceptedQuantity;
        }
      });
    });

    if (invItem.quantity > totalAccepted) {
      const gap = invItem.quantity - totalAccepted;
      discrepancies.push(
        `Overbilling Hazard: Vendor invoiced ${invItem.quantity} units, but warehouse has only accepted ${totalAccepted} units (${gap} units missing).`
      );
    }
  }

  if (discrepancies.length === 0) {
    inv.status = 'MATCHED';
    inv.mismatchReason = undefined;
    addAuditLog(
      user,
      'THREE_WAY_MATCH_SUCCESS',
      'INVOICE',
      inv.id,
      inv.invoiceNumber,
      `Three-Way Match 100% verified against PO ${po.poNumber} and warehouse receipts. Payment approved.`
    );
  } else {
    inv.status = 'MISMATCH';
    inv.mismatchReason = discrepancies.join(' ');
    addAuditLog(
      user,
      'THREE_WAY_MATCH_FAILED',
      'INVOICE',
      inv.id,
      inv.invoiceNumber,
      `Three-Way Match verification FAILED for ${inv.invoiceNumber}: ${inv.mismatchReason}. Payment locked.`
    );
  }

  res.json(inv);
});

// -------------------------------------------------------------
// 13. /api/payments
// -------------------------------------------------------------
app.get('/api/payments', (req, res) => {
  const { invoiceId } = req.query;
  if (invoiceId) {
    return res.json(payments.filter((p) => p.invoiceId === String(invoiceId)));
  }
  res.json(payments);
});

app.post('/api/payments', (req, res) => {
  const user = getAuthenticatedUser(req);
  const { invoiceId, paymentMethod, referenceNumber, amount } = req.body;

  const inv = invoices.find((i) => i.id === String(invoiceId));
  if (!inv) return res.status(404).json({ message: 'Invoice not found' });

  // Disburse payment
  const payId = `PAY-${payIdSeq++}`;
  const payAmount = Number(amount) || inv.totalAmount;

  const newPayment = {
    id: payId,
    invoiceId: inv.id,
    invoiceNumber: inv.invoiceNumber,
    amount: payAmount,
    paymentDate: new Date().toISOString(),
    paymentMethod: paymentMethod || 'BANK_TRANSFER',
    referenceNumber: referenceNumber || `REF-TRX-${Date.now()}`,
    processedBy: user.id,
    processorName: user.name,
    status: 'COMPLETED' as const,
  };

  payments.unshift(newPayment);
  inv.status = 'PAID';

  addAuditLog(
    user,
    'PROCESS_PAYMENT',
    'PAYMENT',
    newPayment.id,
    newPayment.referenceNumber,
    `Disbursed $${payAmount.toFixed(2)} via ${newPayment.paymentMethod} for Invoice ${inv.invoiceNumber}. Ref: ${newPayment.referenceNumber}.`
  );

  res.status(201).json(newPayment);
});

// -------------------------------------------------------------
// 14. /api/dashboard & /api/reports & /api/audit-logs
// -------------------------------------------------------------
app.get('/api/dashboard/summary', (req, res) => {
  const pendingApprovals = purchaseRequests.filter((pr) => pr.status === 'PENDING_APPROVAL').length;
  const activePOs = purchaseOrders.filter((po) => po.status === 'SENT_TO_SUPPLIER' || po.status === 'PARTIALLY_RECEIVED').length;
  const partialDeliveries = purchaseOrders.filter((po) => po.status === 'PARTIALLY_RECEIVED').length;
  const mismatchedInvoices = invoices.filter((inv) => inv.status === 'MISMATCH').length;
  const verifiedInvoices = invoices.filter((inv) => inv.status === 'MATCHED' || inv.status === 'PAID').length;
  const lowStockItemsCount = products.filter((p) => p.currentStock <= p.reorderLevel).length;
  const totalInventoryValuation = products.reduce((sum, p) => sum + p.currentStock * p.defaultPrice, 0);
  const totalSpendYtd = payments.reduce((sum, p) => sum + p.amount, 0);

  res.json({
    totalPurchaseRequests: purchaseRequests.length,
    pendingApprovals,
    activePurchaseOrders: activePOs,
    partialDeliveries,
    totalInvoices: invoices.length,
    mismatchedInvoices,
    verifiedInvoices,
    totalInventoryValuation,
    lowStockItemsCount,
    totalSpendYtd,
  });
});

app.get('/api/reports/summary', (req, res) => {
  // Aggregate spend by department
  const spendMap: Record<string, { totalSpent: number; requestCount: number }> = {};
  purchaseRequests.forEach((pr) => {
    const deptName = pr.departmentName || 'General';
    if (!spendMap[deptName]) {
      spendMap[deptName] = { totalSpent: 0, requestCount: 0 };
    }
    spendMap[deptName].requestCount++;
    if (pr.status === 'APPROVED') {
      spendMap[deptName].totalSpent += pr.estimatedTotal;
    }
  });

  const spendByDepartment = Object.entries(spendMap).map(([departmentName, data]) => ({
    departmentName,
    totalSpent: data.totalSpent,
    requestCount: data.requestCount,
  }));

  // Aggregate supplier performance
  const supMap: Record<string, { totalOrders: number; totalSpend: number; rating: number }> = {};
  suppliers.forEach((s) => {
    supMap[s.companyName] = { totalOrders: 0, totalSpend: 0, rating: s.rating };
  });

  purchaseOrders.forEach((po) => {
    if (supMap[po.supplierName]) {
      supMap[po.supplierName].totalOrders++;
      supMap[po.supplierName].totalSpend += po.totalAmount;
    }
  });

  const supplierPerformance = Object.entries(supMap).map(([supplierName, data]) => ({
    supplierName,
    totalOrders: data.totalOrders,
    totalSpend: data.totalSpend,
    onTimeDeliveryRate: 96,
    rating: data.rating,
  }));

  // Inventory health
  const inventoryHealth = products.map((p) => ({
    productName: p.name,
    sku: p.sku,
    category: p.category,
    currentStock: p.currentStock,
    reorderLevel: p.reorderLevel,
    valuation: p.currentStock * p.defaultPrice,
    status: p.currentStock <= p.reorderLevel ? ('LOW_STOCK' as const) : ('OPTIMAL' as const),
  }));

  const monthlyProcurementTrend = [
    { month: 'Jun', amount: 34500, orderCount: 14 },
    { month: 'Jul', amount: 48200, orderCount: 22 },
    { month: 'Aug', amount: 29800, orderCount: 11 },
    { month: 'Sep', amount: 56400, orderCount: 28 },
  ];

  res.json({
    spendByDepartment,
    supplierPerformance,
    inventoryHealth,
    monthlyProcurementTrend,
  });
});

app.get('/api/audit-logs', (req, res) => {
  res.json(auditLogs);
});

// -------------------------------------------------------------
// Vite Middleware / Static SPA Serving
// -------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ProcureFlow Full-Stack Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start ProcureFlow server:', err);
});
