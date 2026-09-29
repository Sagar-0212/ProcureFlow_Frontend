import React, { useState, useEffect } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  departmentService,
  productService,
  supplierService,
  categoryService,
} from '../../services/apiServices';
import { CategoryDto } from '../../types/backend';
import { Supplier, Product, Department } from '../../types';
import {
  Building,
  Package,
  ShieldCheck,
  Star,
  Users,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Tag,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export const MasterDataView: React.FC = () => {
  const {
    suppliers,
    products,
    departments,
    approvalRules,
    moduleErrors,
    refreshAllData,
    currentUser,
  } = useProcurement();

  const [activeTab, setActiveTab] = useState<'suppliers' | 'products' | 'categories' | 'departments' | 'rules'>('suppliers');
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal states
  const [supplierModal, setSupplierModal] = useState<{ isOpen: boolean; mode: 'add' | 'edit'; data: Partial<Supplier> | null }>({
    isOpen: false,
    mode: 'add',
    data: null,
  });

  const [productModal, setProductModal] = useState<{ isOpen: boolean; mode: 'add' | 'edit'; data: Partial<Product> | null }>({
    isOpen: false,
    mode: 'add',
    data: null,
  });

  const [departmentModal, setDepartmentModal] = useState<{ isOpen: boolean; mode: 'add' | 'edit'; data: Partial<Department> | null }>({
    isOpen: false,
    mode: 'add',
    data: null,
  });

  const [categoryModal, setCategoryModal] = useState<{ isOpen: boolean; data: Partial<CategoryDto> | null }>({
    isOpen: false,
    data: null,
  });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'supplier' | 'product' | 'department';
    id: string;
    title: string;
  }>({
    isOpen: false,
    type: 'supplier',
    id: '',
    title: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories from backend
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch {
      // If error occurs, compute unique categories from products
      const derived = Array.from(new Set(products.map((p) => p.category))).map((c, i) => ({
        id: `CAT-${i + 1}`,
        name: c,
        description: `${c} items and hardware`,
      }));
      setCategories(derived);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [products]);

  const isAdmin = currentUser.role === 'ADMIN';

  // --- Supplier CRUD Handlers ---
  const handleSaveSupplier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setIsSubmitting(true);
    setFeedback(null);

    const payload = {
      companyName: formData.get('companyName') as string,
      contactPerson: formData.get('contactPerson') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      gstNumber: formData.get('gstNumber') as string,
      paymentTerms: formData.get('paymentTerms') as string,
      rating: Number(formData.get('rating')) || 4.5,
    };

    try {
      if (supplierModal.mode === 'add') {
        await supplierService.create(payload);
        setFeedback({ type: 'success', message: `Supplier "${payload.companyName}" successfully registered.` });
      } else if (supplierModal.data?.id) {
        await supplierService.update(supplierModal.data.id, payload);
        setFeedback({ type: 'success', message: `Supplier "${payload.companyName}" updated successfully.` });
      }
      setSupplierModal({ isOpen: false, mode: 'add', data: null });
      await refreshAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to save supplier.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Product CRUD Handlers ---
  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setIsSubmitting(true);
    setFeedback(null);

    const payload = {
      name: formData.get('name') as string,
      sku: formData.get('sku') as string,
      category: formData.get('category') as string,
      unit: formData.get('unit') as string,
      defaultPrice: Number(formData.get('defaultPrice')) || 0,
      currentStock: Number(formData.get('currentStock')) || 0,
      reorderLevel: Number(formData.get('reorderLevel')) || 5,
      leadTimeDays: Number(formData.get('leadTimeDays')) || 3,
      averageMonthlyUsage: Number(formData.get('averageMonthlyUsage')) || 10,
    };

    try {
      if (productModal.mode === 'add') {
        await productService.create(payload);
        setFeedback({ type: 'success', message: `Product "${payload.name}" added to catalogue.` });
      } else if (productModal.data?.id) {
        await productService.update(productModal.data.id, payload);
        setFeedback({ type: 'success', message: `Product "${payload.name}" updated successfully.` });
      }
      setProductModal({ isOpen: false, mode: 'add', data: null });
      await refreshAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to save product.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Department CRUD Handlers ---
  const handleSaveDepartment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setIsSubmitting(true);
    setFeedback(null);

    const payload = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      budget: Number(formData.get('budget')) || 0,
      managerId: (formData.get('managerId') as string) || undefined,
    };

    try {
      if (departmentModal.mode === 'add') {
        await departmentService.create(payload);
        setFeedback({ type: 'success', message: `Department "${payload.name}" created.` });
      } else if (departmentModal.data?.id) {
        await departmentService.update(departmentModal.data.id, payload);
        setFeedback({ type: 'success', message: `Department "${payload.name}" updated.` });
      }
      setDepartmentModal({ isOpen: false, mode: 'add', data: null });
      await refreshAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to save department.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Category Create Handler ---
  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setIsSubmitting(true);
    setFeedback(null);

    const payload = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
    };

    try {
      await categoryService.create(payload);
      setFeedback({ type: 'success', message: `Category "${payload.name}" added.` });
      setCategoryModal({ isOpen: false, data: null });
      await fetchCategories();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to save category.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Delete Confirmation Handler ---
  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    setFeedback(null);
    try {
      if (deleteModal.type === 'supplier') {
        await supplierService.delete(deleteModal.id);
        setFeedback({ type: 'success', message: `Supplier "${deleteModal.title}" deleted.` });
      } else if (deleteModal.type === 'product') {
        await productService.delete(deleteModal.id);
        setFeedback({ type: 'success', message: `Product "${deleteModal.title}" deleted.` });
      } else if (deleteModal.type === 'department') {
        await departmentService.delete(deleteModal.id);
        setFeedback({ type: 'success', message: `Department "${deleteModal.title}" deleted.` });
      }
      setDeleteModal({ isOpen: false, type: 'supplier', id: '', title: '' });
      await refreshAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Delete operation failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const masterError = moduleErrors['suppliers'] || moduleErrors['products'] || moduleErrors['departments'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Enterprise Master Data &amp; Governance
          </h1>
          <p className="text-xs text-slate-500">
            Normalized reference entities: Supplier master records, product catalogue, categories, department cost centers, and approval rules
          </p>
        </div>

        {/* Tab specific Add Action */}
        <div className="flex items-center gap-2">
          {activeTab === 'suppliers' && (
            <button
              onClick={() => setSupplierModal({ isOpen: true, mode: 'add', data: null })}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Supplier</span>
            </button>
          )}

          {activeTab === 'products' && (
            <button
              onClick={() => setProductModal({ isOpen: true, mode: 'add', data: null })}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          )}

          {activeTab === 'categories' && (
            <button
              onClick={() => setCategoryModal({ isOpen: true, data: null })}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          )}

          {activeTab === 'departments' && (
            <button
              onClick={() => setDepartmentModal({ isOpen: true, mode: 'add', data: null })}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Department</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {masterError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between">
          <span>{masterError}</span>
          <button
            onClick={() => refreshAllData()}
            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Nav Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto">
        {[
          { id: 'suppliers', label: `Suppliers (${suppliers.length})`, icon: Building },
          { id: 'products', label: `Product Catalogue (${products.length})`, icon: Package },
          { id: 'categories', label: `Categories (${categories.length})`, icon: Tag },
          { id: 'departments', label: `Departments (${departments.length})`, icon: Users },
          { id: 'rules', label: `Approval Rules (${approvalRules.length})`, icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Suppliers */}
      {activeTab === 'suppliers' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Supplier Company</th>
                  <th className="py-3 px-4">Contact Person &amp; Email</th>
                  <th className="py-3 px-4 font-mono">Tax / GST Number</th>
                  <th className="py-3 px-4">Payment Terms</th>
                  <th className="py-3 px-4">Vendor Rating</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No suppliers registered in system.
                    </td>
                  </tr>
                ) : (
                  suppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{s.companyName}</div>
                        <div className="text-[11px] text-slate-500">{s.address}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{s.contactPerson}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{s.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 font-semibold">{s.gstNumber}</td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">{s.paymentTerms}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-mono font-bold text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{s.rating.toFixed(1)} / 5.0</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active Vendor
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSupplierModal({ isOpen: true, mode: 'edit', data: s })}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            title="Edit Supplier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteModal({
                                isOpen: true,
                                type: 'supplier',
                                id: s.id,
                                title: s.companyName,
                              })
                            }
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete Supplier"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Products */}
      {activeTab === 'products' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4 font-mono">SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Standard Price</th>
                  <th className="py-3 px-4 text-right">Stock</th>
                  <th className="py-3 px-4 text-right">Reorder Threshold</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                      No products registered in catalogue.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-sans font-semibold text-slate-900">
                        {p.name}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">{p.sku}</td>
                      <td className="py-3.5 px-4 font-sans text-slate-600">{p.category}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        ${p.defaultPrice.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {p.currentStock} {p.unit}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500">
                        {p.reorderLevel} {p.unit}
                      </td>
                      <td className="py-3.5 px-4 text-center font-sans">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setProductModal({ isOpen: true, mode: 'edit', data: p })}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteModal({
                                isOpen: true,
                                type: 'product',
                                id: p.id,
                                title: p.name,
                              })
                            }
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Categories */}
      {activeTab === 'categories' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-mono">Category ID</th>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Associated Products</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 font-sans">
                      {loadingCategories ? 'Loading categories...' : 'No categories configured.'}
                    </td>
                  </tr>
                ) : (
                  categories.map((c) => {
                    const count = products.filter((p) => p.category.toLowerCase() === c.name.toLowerCase()).length;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-bold text-slate-700">{c.id}</td>
                        <td className="py-3.5 px-4 font-sans font-semibold text-slate-900 flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{c.name}</span>
                        </td>
                        <td className="py-3.5 px-4 font-sans text-slate-600">{c.description || 'General procurement class'}</td>
                        <td className="py-3.5 px-4 text-center font-sans">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                            {count} {count === 1 ? 'item' : 'items'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Departments */}
      {activeTab === 'departments' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Department Name</th>
                  <th className="py-3 px-4 font-mono">Cost Center Code</th>
                  <th className="py-3 px-4 text-right">Annual Operating Budget</th>
                  <th className="py-3 px-4">Authorizing Manager</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {departments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-sans">
                      No departments configured.
                    </td>
                  </tr>
                ) : (
                  departments.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-sans font-semibold text-slate-900">
                        {d.name}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-indigo-700">{d.code}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        ${d.budget.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-sans text-slate-700 font-medium">
                        {d.managerName || 'Assigned Manager'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-sans">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setDepartmentModal({ isOpen: true, mode: 'edit', data: d })}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            title="Edit Department"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteModal({
                                isOpen: true,
                                type: 'department',
                                id: d.id,
                                title: d.name,
                              })
                            }
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete Department"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Rules */}
      {activeTab === 'rules' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Rule Code</th>
                  <th className="py-3 px-4">Approval Level</th>
                  <th className="py-3 px-4 font-mono">Amount Range</th>
                  <th className="py-3 px-4">Required Authorization Role</th>
                  <th className="py-3 px-4">Policy Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {approvalRules.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{r.id}</td>
                    <td className="py-3.5 px-4 font-sans font-semibold text-slate-800">
                      Tier {r.approvalLevel}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-indigo-700">
                      ${r.minAmount.toLocaleString()} – ${r.maxAmount >= 1000000 ? 'Unlimited' : r.maxAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                        {r.requiredRole}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-600 max-w-md">
                      {r.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- Modal: Add / Edit Supplier --- */}
      {supplierModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {supplierModal.mode === 'add' ? 'Add Registered Supplier' : 'Edit Supplier Details'}
              </h3>
              <button
                onClick={() => setSupplierModal({ isOpen: false, mode: 'add', data: null })}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveSupplier} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Legal Name</label>
                <input
                  type="text"
                  name="companyName"
                  required
                  defaultValue={supplierModal.data?.companyName || ''}
                  placeholder="e.g. Acme Tech Solutions Ltd."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    name="contactPerson"
                    required
                    defaultValue={supplierModal.data?.contactPerson || ''}
                    placeholder="e.g. Jane Doe"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    defaultValue={supplierModal.data?.email || ''}
                    placeholder="sales@supplier.com"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Telephone</label>
                  <input
                    type="text"
                    name="phone"
                    required
                    defaultValue={supplierModal.data?.phone || ''}
                    placeholder="+1 555 123 4567"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">GST / Tax Identification</label>
                  <input
                    type="text"
                    name="gstNumber"
                    required
                    defaultValue={supplierModal.data?.gstNumber || ''}
                    placeholder="27XXXXX0000X1Z0"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Address</label>
                <input
                  type="text"
                  name="address"
                  required
                  defaultValue={supplierModal.data?.address || ''}
                  placeholder="Corporate Hub, Suite 400"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Standard Payment Terms</label>
                  <input
                    type="text"
                    name="paymentTerms"
                    required
                    defaultValue={supplierModal.data?.paymentTerms || 'Net 30 Days'}
                    placeholder="Net 30 Days"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Rating (1-5)</label>
                  <input
                    type="number"
                    name="rating"
                    step="0.1"
                    min="1"
                    max="5"
                    defaultValue={supplierModal.data?.rating || 4.5}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSupplierModal({ isOpen: false, mode: 'add', data: null })}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : supplierModal.mode === 'add' ? 'Save Supplier' : 'Update Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Modal: Add / Edit Product --- */}
      {productModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {productModal.mode === 'add' ? 'Add Product to Catalogue' : 'Edit Product Details'}
              </h3>
              <button
                onClick={() => setProductModal({ isOpen: false, mode: 'add', data: null })}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Description / Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={productModal.data?.name || ''}
                  placeholder="e.g. Dell Latitude 5540 15.6''"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Catalogue SKU</label>
                  <input
                    type="text"
                    name="sku"
                    required
                    defaultValue={productModal.data?.sku || ''}
                    placeholder="e.g. SKU-HW-001"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    required
                    defaultValue={productModal.data?.category || 'Hardware'}
                    placeholder="e.g. Hardware, Software, Office"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    name="unit"
                    required
                    defaultValue={productModal.data?.unit || 'Units'}
                    placeholder="e.g. Units, Boxes, Licenses"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Standard Price ($)</label>
                  <input
                    type="number"
                    name="defaultPrice"
                    min="0"
                    step="0.01"
                    required
                    defaultValue={productModal.data?.defaultPrice || 100}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Stock on Hand</label>
                  <input
                    type="number"
                    name="currentStock"
                    min="0"
                    required
                    defaultValue={productModal.data?.currentStock || 0}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reorder Threshold Level</label>
                  <input
                    type="number"
                    name="reorderLevel"
                    min="0"
                    required
                    defaultValue={productModal.data?.reorderLevel || 5}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    name="leadTimeDays"
                    min="1"
                    defaultValue={productModal.data?.leadTimeDays || 3}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Avg. Monthly Usage</label>
                  <input
                    type="number"
                    name="averageMonthlyUsage"
                    min="1"
                    defaultValue={productModal.data?.averageMonthlyUsage || 10}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setProductModal({ isOpen: false, mode: 'add', data: null })}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : productModal.mode === 'add' ? 'Add Product' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Modal: Add / Edit Department --- */}
      {departmentModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {departmentModal.mode === 'add' ? 'Add Organization Department' : 'Edit Department Details'}
              </h3>
              <button
                onClick={() => setDepartmentModal({ isOpen: false, mode: 'add', data: null })}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveDepartment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={departmentModal.data?.name || ''}
                  placeholder="e.g. IT & Engineering"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Center Code</label>
                <input
                  type="text"
                  name="code"
                  required
                  defaultValue={departmentModal.data?.code || ''}
                  placeholder="e.g. CC-IT-101"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Operating Budget ($)</label>
                <input
                  type="number"
                  name="budget"
                  min="0"
                  required
                  defaultValue={departmentModal.data?.budget || 50000}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setDepartmentModal({ isOpen: false, mode: 'add', data: null })}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : departmentModal.mode === 'add' ? 'Save Department' : 'Update Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Modal: Add Category --- */}
      {categoryModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Add Product Category</h3>
              <button
                onClick={() => setCategoryModal({ isOpen: false, data: null })}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category Classification</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Telecommunications, Furniture, Consumables"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Scope of items classified under this category..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCategoryModal({ isOpen: false, data: null })}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Modal: Delete Confirmation --- */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Confirm Deletion</h4>
                <p className="text-xs text-slate-500">This action will permanently remove the record.</p>
              </div>
            </div>
            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
              Are you sure you want to remove <strong>{deleteModal.title}</strong> from active records?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, type: 'supplier', id: '', title: '' })}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
