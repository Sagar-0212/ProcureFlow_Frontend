import { apiRequest } from './api';

// --- Department ---
export interface DepartmentRequest {
  name: string;
  description?: string;
}

export interface DepartmentResponse {
  id: number;
  name: string;
  description?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// --- Category ---
export interface CategoryRequest {
  name: string;
  description?: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  description?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// --- Product ---
export interface ProductRequest {
  sku: string;
  name: string;
  description?: string;
  categoryId: number;
  unit: string;
}

export interface ProductResponse {
  id: number;
  sku: string;
  name: string;
  description?: string;
  categoryId: number;
  categoryName?: string;
  unit: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// --- Supplier ---
export interface SupplierRequest {
  supplierCode: string;
  companyName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxIdentifier?: string;
  paymentTerms?: string;
}

export interface SupplierResponse {
  id: number;
  supplierCode: string;
  companyName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxIdentifier?: string;
  paymentTerms?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Master Data Service
export const masterDataService = {
  // Departments API
  getDepartments: async (): Promise<DepartmentResponse[]> => {
    return apiRequest<DepartmentResponse[]>('/api/departments', { method: 'GET' });
  },
  createDepartment: async (data: DepartmentRequest): Promise<DepartmentResponse> => {
    return apiRequest<DepartmentResponse>('/api/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateDepartment: async (id: number, data: DepartmentRequest): Promise<DepartmentResponse> => {
    return apiRequest<DepartmentResponse>(`/api/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deleteDepartment: async (id: number): Promise<void> => {
    try {
      await apiRequest(`/api/departments/${id}`, { method: 'DELETE' });
    } catch (err: any) {
      // If backend uses toggle-active instead of DELETE
      if (err.status === 405 || err.status === 404) {
        await apiRequest(`/api/departments/${id}/toggle-active`, { method: 'PATCH' });
      } else {
        throw err;
      }
    }
  },

  // Categories API
  getCategories: async (): Promise<CategoryResponse[]> => {
    return apiRequest<CategoryResponse[]>('/api/categories', { method: 'GET' });
  },
  createCategory: async (data: CategoryRequest): Promise<CategoryResponse> => {
    return apiRequest<CategoryResponse>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateCategory: async (id: number, data: CategoryRequest): Promise<CategoryResponse> => {
    return apiRequest<CategoryResponse>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deleteCategory: async (id: number): Promise<void> => {
    try {
      await apiRequest(`/api/categories/${id}`, { method: 'DELETE' });
    } catch (err: any) {
      if (err.status === 405 || err.status === 404) {
        await apiRequest(`/api/categories/${id}/toggle-active`, { method: 'PATCH' });
      } else {
        throw err;
      }
    }
  },

  // Products API
  getProducts: async (): Promise<ProductResponse[]> => {
    return apiRequest<ProductResponse[]>('/api/products', { method: 'GET' });
  },
  createProduct: async (data: ProductRequest): Promise<ProductResponse> => {
    return apiRequest<ProductResponse>('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateProduct: async (id: number, data: ProductRequest): Promise<ProductResponse> => {
    return apiRequest<ProductResponse>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deleteProduct: async (id: number): Promise<void> => {
    try {
      await apiRequest(`/api/products/${id}`, { method: 'DELETE' });
    } catch (err: any) {
      if (err.status === 405 || err.status === 404) {
        await apiRequest(`/api/products/${id}/toggle-active`, { method: 'PATCH' });
      } else {
        throw err;
      }
    }
  },

  // Suppliers API
  getSuppliers: async (): Promise<SupplierResponse[]> => {
    return apiRequest<SupplierResponse[]>('/api/suppliers', { method: 'GET' });
  },
  createSupplier: async (data: SupplierRequest): Promise<SupplierResponse> => {
    return apiRequest<SupplierResponse>('/api/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateSupplier: async (id: number, data: SupplierRequest): Promise<SupplierResponse> => {
    return apiRequest<SupplierResponse>(`/api/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deleteSupplier: async (id: number): Promise<void> => {
    try {
      await apiRequest(`/api/suppliers/${id}`, { method: 'DELETE' });
    } catch (err: any) {
      if (err.status === 405 || err.status === 404) {
        await apiRequest(`/api/suppliers/${id}/toggle-active`, { method: 'PATCH' });
      } else {
        throw err;
      }
    }
  },
};
