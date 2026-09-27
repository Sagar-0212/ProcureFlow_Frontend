import React, { useState } from 'react';
import {
  GraduationCap,
  HelpCircle,
  Database,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Workflow,
  Sparkles,
} from 'lucide-react';

export const InterviewGuideView: React.FC = () => {
  const [openSection, setOpenSection] = useState<string>('q1');

  const questions = [
    {
      id: 'q1',
      q: 'What business problem does ProcureFlow solve?',
      a: 'Purchasing in enterprises involves multiple actors (employees, managers, procurement specialists, suppliers, receiving inspectors, finance officers). Without an interconnected workflow, organizations suffer from rogue spending, unauthorized vendor selection, phantom deliveries, overbilling risks, and lack of audit trails. ProcureFlow digitizes and connects the entire procurement lifecycle from requisition to final payment and inventory synchronization.',
    },
    {
      id: 'q2',
      q: 'Explain the complete procurement lifecycle and state transitions.',
      a: 'The procurement process follows 8 sequential stages: Purchase Request (DRAFT → PENDING_APPROVAL) → Manager Approval (APPROVED / REJECTED) → Supplier Quotation RFP (3 competitive bids collected) → Quotation Comparison & Supplier Selection → Purchase Order Generation (ISSUED) → Goods Receipt Note (GRN, partial deliveries transition PO to PARTIALLY_RECEIVED then FULLY_RECEIVED) → Supplier Invoice Registration → Three-Way Matching (reconciles PO vs GRN vs Invoice) → Treasury Payment (PAID) → Warehouse Inventory Perpetual Update.',
    },
    {
      id: 'q3',
      q: 'What is Three-Way Matching and why is it essential?',
      a: 'Three-Way Matching is the cornerstone internal financial control in enterprise procurement. It cross-examines 3 independent documents: (1) Purchase Order: What was approved and contracted, (2) Goods Receipt Note (GRN): What was physically inspected and accepted at the dock, (3) Supplier Invoice: What commercial sum the vendor is demanding. Payment is systematically blocked if invoice quantity exceeds accepted quantity, or if invoiced rates exceed agreed PO unit prices. This completely eliminates fraudulent or premature disbursements.',
    },
    {
      id: 'q4',
      q: 'Why can a Purchase Order have multiple Goods Receipts (Partial Delivery)?',
      a: 'Suppliers rarely dispatch large orders in a single shipment due to inventory shortages, logistics constraints, or backorders. In ProcureFlow, PO to Goods Receipt is modeled as a 1:N relationship. When 8 of 10 laptops arrive, the system registers GRN-2001, increments inventory by +8, and marks PO status as PARTIALLY_RECEIVED. When the final 2 units arrive next morning, GRN-2002 is generated and the PO status transitions to FULLY_RECEIVED.',
    },
    {
      id: 'q5',
      q: 'How does the system prevent payment after a mismatch occurs?',
      a: 'The Three-Way Matching engine enforces a strict invariant: Invoice Status remains MATCH_FAILED and its payment action is strictly disabled until the physical goods gap is closed. For example, if a supplier bills for 10 units but warehouse has only accepted 8, the system flags an overbilling liability of 2 units ($2,400) and displays a clear discrepancy report. Only when the remaining 2 units arrive via GRN does the match evaluate to 100% agreement and clear the payment button.',
    },
    {
      id: 'q6',
      q: 'Where do you use Database Transactions (@Transactional)?',
      a: 'Goods receipt is the prime example: When a consignment arrives, the system must atomically execute: (1) create Goods Receipt record, (2) create Goods Receipt line items, (3) update PO received quantities and status, (4) update warehouse inventory stock, (5) create inventory transaction movement records, and (6) log system audit events. If any step fails (e.g. database constraint violation), the entire transaction rolls back to ensure zero ledger corruption.',
    },
    {
      id: 'q7',
      q: 'Why separate Request Items from Purchase Requests into child tables?',
      a: 'A single purchase requisition or purchase order can contain multiple heterogeneous products with varying quantities, SKUs, and unit rates. Storing product1, product2, product3 columns inside the parent record violates 1st Normal Form (1NF), limits scalability, and makes SQL aggregations impossible. A normalized 1:N relationship (PurchaseRequest 1 ──< PurchaseRequestItem >── 1 Product) allows arbitrary line items, granular tax/discount tracking, and partial fulfillment tracking per line item.',
    },
    {
      id: 'q8',
      q: 'How does approval work and how do you prevent unauthorized approval?',
      a: 'Approval is governed by multi-tier organization threshold rules (e.g., Level 1: up to $2,500 by Dept Manager, Level 2: $2,501 to $25,000 by Senior Director, Level 3: > $25,000 by Executive VP). Role-Based Access Control (RBAC) verifies that only authenticated users possessing the required role for that cost band can invoke the approval mutation. The requester cannot approve their own requisition (Separation of Duties).',
    },
    {
      id: 'q9',
      q: 'Explain the Intelligent Feature Concept: Smart Reorder.',
      a: 'Per the Thinqloud specification (Pages 14-15), AI/heuristic enhancements must be explainable and non-dependent. The system tracks current stock on hand against reorder thresholds, taking into account average monthly usage and supplier lead times (e.g. Printer Paper: 12 current stock, 25 threshold, 80/mo usage, 7-day lead time). The system suggests 100 units and exposes the exact quantitative formula behind the suggestion, allowing 1-click requisition generation.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            <span>Thinqloud Campus Hiring Assessment Companion</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            ProcureFlow Architecture &amp; Interview Defense Guide
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Detailed breakdown of business rationale, data models, 3-way matching rules, database transaction boundaries,
            and answers to all 18 core evaluation questions from Section J of the master project document.
          </p>
        </div>

        <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 text-xs font-mono text-slate-300 shrink-0">
          <div className="text-[10px] uppercase text-slate-400">Evaluation Flow</div>
          <div className="font-bold text-indigo-300">Understand → Analyse → Design → Build → Explain</div>
        </div>
      </div>

      {/* Database Entity Relationship Architecture (Page 11 of PDF) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">
            Relational Data Model &amp; Entity Relationships (Section F)
          </h2>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          The database model is normalized around the physical business lifecycle. Every document exists as a consequence of
          the preceding workflow state rather than an isolated CRUD record.
        </p>

        <div className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
          <pre>{`Role 1 ─────────< Users
Department 1 ───< Users
User 1 ─────────< PurchaseRequests
PurchaseRequest 1 ─────< PurchaseRequestItems >───── 1 Product
Category 1 ─────< Products
PurchaseRequest 1 ─────< Approvals (1:N audit trail)
PurchaseRequest 1 ─────< Quotations (1:N multi-vendor RFP bids)
Supplier 1 ─────< Quotations
Quotation 1 ────< QuotationItems >────────────────── 1 Product
PurchaseRequest 1 ─────< PurchaseOrders
Supplier 1 ─────< PurchaseOrders
PurchaseOrder 1 ───────< PurchaseOrderItems >─────── 1 Product
PurchaseOrder 1 ───────< GoodsReceipts (1:N partial shipments)
GoodsReceipt 1 ────────< GoodsReceiptItems >──────── 1 PurchaseOrderItem
PurchaseOrder 1 ───────< Invoices
Invoice 1 ──────< InvoiceItems
Invoice 1 ────── 0..1 Payment (strictly guarded by 3-Way Match)
Product 1 ────── 1 Inventory (perpetual stock balance)
Product 1 ──────< InventoryTransactions (traceable movements)`}</pre>
        </div>
      </div>

      {/* Accordion of 9 Key Interview Questions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-slate-900" />
          <h2 className="text-base font-bold text-slate-900">
            Evaluation Defense: Core Interview Questions &amp; Technical Answers
          </h2>
        </div>

        <div className="divide-y divide-slate-200">
          {questions.map((item) => {
            const isOpen = openSection === item.id;
            return (
              <div key={item.id} className="py-3.5">
                <button
                  onClick={() => setOpenSection(isOpen ? '' : item.id)}
                  className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span>{item.q}</span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                {isOpen && (
                  <div className="mt-2.5 pl-4 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
