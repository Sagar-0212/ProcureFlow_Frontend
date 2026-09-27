import React, { useState, useEffect } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  masterDataService,
  DepartmentResponse,
  CategoryResponse,
  ProductResponse,
  SupplierResponse,
} from '../../services/masterDataService';
import {
  Building,
  Package,
  ShieldCheck,
  Star,
  Users,
  Layers,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  AlertCircle,
  X,
  CheckCircle,
} from 'lucide-react';

export const MasterDataView: React.FC = () => {
  const { approvalRules } = useProcurement();

  const [activeTab, setActiveTab] = useState<'suppliers' | 'products' | 'departments' | 'categories' | 'rules'>('suppliers');

  // API State
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Field States
  // Department / Category
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Product
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState<number>(0);
  const [unit, setUnit] = useState('UNIT');

  // Supplier
  const [supplierCode, setSupplierCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [taxIdentifier, setTaxIdentifier] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [deptRes, catRes, prodRes, suppRes] = await Promise.all([
        masterDataService.getDepartments().catch(() => []),
        masterDataService.getCategories().catch(() => []),
        masterDataService.getProducts().catch(() => []),
        masterDataService.getSuppliers().catch(() => []),
      ]);
      setDepartments(deptRes);
      setCategories(catRes);
      setProducts(prodRes);
      setSuppliers(suppRes);
    } catch (err: any) {
      setError(err?.message || 'Failed to load master data from API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormError(null);

    setName('');
    setDescription('');
    setSku(`SKU-${Date.now().toString().slice(-5)}`);
    setCategoryId(categories[0]?.id || 1);
    setUnit('UNIT');
    setSupplierCode(`SUP-${Date.now().toString().slice(-4)}`);
    setCompanyName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setAddress('');
    setTaxIdentifier('');
    setPaymentTerms('Net 30');

    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormError(null);

    setName(item.name || '');
    setDescription(item.description || '');
    setSku(item.sku || '');
    setCategoryId(item.categoryId || (categories[0]?.id || 1));
    setUnit(item.unit || 'UNIT');
    setSupplierCode(item.supplierCode || '');
    setCompanyName(item.companyName || '');
    setContactPerson(item.contactPerson || '');
    setEmail(item.email || '');
    setPhone(item.phone || '');
    setAddress(item.address || '');
    setTaxIdentifier(item.taxIdentifier || '');
    setPaymentTerms(item.paymentTerms || 'Net 30');

    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      if (activeTab === 'departments') {
        if (!name) throw new Error('Department name is required.');
        if (editingItem) {
          await masterDataService.updateDepartment(editingItem.id, { name, description });
          showNotification(`Department "${name}" updated successfully.`);
        } else {
          await masterDataService.createDepartment({ name, description });
          showNotification(`Department "${name}" created successfully.`);
        }
      } else if (activeTab === 'categories') {
        if (!name) throw new Error('Category name is required.');
        if (editingItem) {
          await masterDataService.updateCategory(editingItem.id, { name, description });
          showNotification(`Category "${name}" updated successfully.`);
        } else {
          await masterDataService.createCategory({ name, description });
          showNotification(`Category "${name}" created successfully.`);
        }
      } else if (activeTab === 'products') {
        if (!name || !sku) throw new Error('Product name and SKU are required.');
        if (editingItem) {
          await masterDataService.updateProduct(editingItem.id, {
            sku,
            name,
            description,
            categoryId: Number(categoryId),
            unit,
          });
          showNotification(`Product "${name}" updated successfully.`);
        } else {
          await masterDataService.createProduct({
            sku,
            name,
            description,
            categoryId: Number(categoryId),
            unit,
          });
          showNotification(`Product "${name}" created successfully.`);
        }
      } else if (activeTab === 'suppliers') {
        if (!companyName || !supplierCode) throw new Error('Company name and supplier code are required.');
        if (editingItem) {
          await masterDataService.updateSupplier(editingItem.id, {
            supplierCode,
            companyName,
            contactPerson,
            email,
            phone,
            address,
            taxIdentifier,
            paymentTerms,
          });
          showNotification(`Supplier "${companyName}" updated successfully.`);
        } else {
          await masterDataService.createSupplier({
            supplierCode,
            companyName,
            contactPerson,
            email,
            phone,
            address,
            taxIdentifier,
            paymentTerms,
          });
          showNotification(`Supplier "${companyName}" created successfully.`);
        }
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save record.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, itemName: string) => {
    if (!window.confirm(`Are you sure you want to deactivate/delete "${itemName}"?`)) return;

    try {
      if (activeTab === 'departments') {
        await masterDataService.deleteDepartment(id);
      } else if (activeTab === 'categories') {
        await masterDataService.deleteCategory(id);
      } else if (activeTab === 'products') {
        await masterDataService.deleteProduct(id);
      } else if (activeTab === 'suppliers') {
        await masterDataService.deleteSupplier(id);
      }

      showNotification(`"${itemName}" status updated.`);
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete record.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Enterprise Master Data &amp; Governance
          </h1>
          <p className="text-xs text-slate-500">
            Normalized reference entities connected live to Spring Boot REST APIs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {activeTab !== 'rules' && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add {activeTab.slice(0, -1).replace(/^./, (str) => str.toUpperCase())}</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications / Alerts */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={loadData} className="px-2.5 py-1 bg-rose-600 text-white font-semibold rounded text-xs">
            Retry
          </button>
        </div>
      )}

      {/* Nav Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto">
        {[
          { id: 'suppliers', label: `Suppliers (${suppliers.length})`, icon: Building },
          { id: 'products', label: `Products (${products.length})`, icon: Package },
          { id: 'departments', label: `Departments (${departments.length})`, icon: Users },
          { id: 'categories', label: `Categories (${categories.length})`, icon: Layers },
          { id: 'rules', label: `Approval Rules (${approvalRules.length})`, icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
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
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
              <span>Fetching suppliers from backend API...</span>
            </div>
          ) : suppliers.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No suppliers found. Click "Add Supplier" to create one.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Code &amp; Company</th>
                  <th className="py-3 px-4">Contact &amp; Email</th>
                  <th className="py-3 px-4 font-mono">Tax Identifier</th>
                  <th className="py-3 px-4">Payment Terms</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{s.companyName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{s.supplierCode} · {s.address || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{s.contactPerson || 'N/A'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{s.email || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 font-semibold">{s.taxIdentifier || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{s.paymentTerms || 'Net 30'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${s.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {s.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                        title="Edit Supplier"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id, s.companyName)}
                        className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-50 rounded transition-colors"
                        title="Toggle / Delete Supplier"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 2: Products */}
      {activeTab === 'products' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
              <span>Fetching products from backend API...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No products found. Click "Add Product" to create one.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4 font-mono">SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-sans font-semibold text-slate-900">
                      <div>{p.name}</div>
                      <div className="text-[11px] font-normal text-slate-500">{p.description || 'No description'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">{p.sku}</td>
                    <td className="py-3.5 px-4 font-sans text-slate-600">{p.categoryName || `Category #${p.categoryId}`}</td>
                    <td className="py-3.5 px-4 font-sans font-medium text-slate-700">{p.unit}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold font-sans border ${p.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {p.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1 font-sans">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-50 rounded transition-colors"
                        title="Toggle / Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 3: Departments */}
      {activeTab === 'departments' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
              <span>Fetching departments from backend API...</span>
            </div>
          ) : departments.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No departments found. Click "Add Department" to create one.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Department Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {departments.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-sans font-semibold text-slate-900">
                      {d.name}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-600">{d.description || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold font-sans border ${d.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {d.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1 font-sans">
                      <button
                        onClick={() => openEditModal(d)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                        title="Edit Department"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(d.id, d.name)}
                        className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-50 rounded transition-colors"
                        title="Toggle / Delete Department"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 4: Categories */}
      {activeTab === 'categories' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
              <span>Fetching categories from backend API...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No categories found. Click "Add Category" to create one.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{c.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{c.description || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${c.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {c.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-50 rounded transition-colors"
                        title="Toggle / Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 5: Rules */}
      {activeTab === 'rules' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
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
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem ? 'Edit' : 'Add New'} {activeTab.slice(0, -1).replace(/^./, (str) => str.toUpperCase())}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Department / Category Fields */}
              {(activeTab === 'departments' || activeTab === 'categories') && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {activeTab === 'departments' ? 'Department Name' : 'Category Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. IT Operations"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Optional notes or details"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                    />
                  </div>
                </>
              )}

              {/* Product Fields */}
              {activeTab === 'products' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">SKU Code *</label>
                    <input
                      type="text"
                      required
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="e.g. LAP-MBP-16"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Apple MacBook Pro 16"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Product Unit *</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                    >
                      <option value="UNIT">UNIT</option>
                      <option value="PIECE">PIECE</option>
                      <option value="BOX">BOX</option>
                      <option value="SET">SET</option>
                      <option value="LICENSE">LICENSE</option>
                      <option value="SERVICE">SERVICE</option>
                      <option value="KILOGRAM">KILOGRAM</option>
                      <option value="METER">METER</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Optional specification notes"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                    />
                  </div>
                </>
              )}

              {/* Supplier Fields */}
              {activeTab === 'suppliers' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Supplier Code *</label>
                      <input
                        type="text"
                        required
                        value={supplierCode}
                        onChange={(e) => setSupplierCode(e.target.value)}
                        placeholder="SUP-1001"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Dell Technologies Ltd"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
                      <input
                        type="text"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        placeholder="John Smith"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="sales@dell.com"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 800-555-0199"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Tax / GST Identifier</label>
                      <input
                        type="text"
                        value={taxIdentifier}
                        onChange={(e) => setTaxIdentifier(e.target.value)}
                        placeholder="TAX-99401"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Payment Terms</label>
                    <input
                      type="text"
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      placeholder="Net 30 / Immediate"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="City, Country"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold shadow-sm flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save {editingItem ? 'Changes' : 'Record'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
