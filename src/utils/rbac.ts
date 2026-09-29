import { BackendRole } from '../types/backend';

export const TAB_ROLE_PERMISSIONS: Record<string, BackendRole[]> = {
  dashboard: ['EMPLOYEE', 'MANAGER', 'PROCUREMENT_OFFICER', 'FINANCE_OFFICER', 'ADMIN'],
  requests: ['EMPLOYEE', 'MANAGER', 'PROCUREMENT_OFFICER', 'ADMIN'],
  approvals: ['MANAGER', 'ADMIN'],
  quotations: ['PROCUREMENT_OFFICER', 'ADMIN'],
  orders: ['PROCUREMENT_OFFICER', 'ADMIN'],
  receiving: ['PROCUREMENT_OFFICER', 'ADMIN'],
  finance: ['FINANCE_OFFICER', 'ADMIN'],
  inventory: ['PROCUREMENT_OFFICER', 'ADMIN'],
  reports: ['ADMIN'],
  masterData: ['ADMIN'],
  audit: ['ADMIN'],
};

export const isTabAccessible = (tab: string, role: BackendRole | string): boolean => {
  const allowed = TAB_ROLE_PERMISSIONS[tab];
  if (!allowed) return true;
  return allowed.includes(role as BackendRole);
};
