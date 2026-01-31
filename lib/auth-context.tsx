'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole, Tenant } from './types';
import { mockUsers, mockTenants } from './mock-data';

interface AuthContextType {
  currentUser: User | null;
  currentTenant: Tenant | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, tenantId?: string) => { success: boolean; message: string; tenant?: Tenant };
  loginWithUserSelect: (email: string, tenantId: string) => void;
  logout: () => void;
  switchTenant: (tenantId: string) => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  registerTenant: (tenantName: string, email: string, password: string) => { success: boolean; message: string; tenantId?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);

  // Restore session on mount
  useEffect(() => {
    const userId = localStorage.getItem('currentUserId');
    const tenantId = localStorage.getItem('currentTenantId');
    if (userId && tenantId) {
      const user = mockUsers.find((u) => u.id === userId);
      const tenant = mockTenants.find((t) => t.id === tenantId);
      if (user && tenant) {
        setCurrentUser(user);
        setCurrentTenant(tenant);
      }
    }
  }, []);

  const login = useCallback((email: string, password: string, tenantId?: string) => {
    const user = mockUsers.find((u) => u.email === email && u.password === password);
    
    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }

    const tenant = mockTenants.find((t) => t.id === (tenantId || user.tenantId));
    
    if (!tenant) {
      return { success: false, message: 'Tenant not found' };
    }

    setCurrentUser(user);
    setCurrentTenant(tenant);
    localStorage.setItem('currentUserId', user.id);
    localStorage.setItem('currentTenantId', tenant.id);

    return { success: true, message: 'Login successful', tenant };
  }, []);

  const loginWithUserSelect = useCallback((email: string, tenantId: string) => {
    const user = mockUsers.find((u) => u.email === email && u.tenantId === tenantId);
    const tenant = mockTenants.find((t) => t.id === tenantId);

    if (user && tenant) {
      setCurrentUser(user);
      setCurrentTenant(tenant);
      localStorage.setItem('currentUserId', user.id);
      localStorage.setItem('currentTenantId', tenantId);
    }
  }, []);

  const registerTenant = useCallback((tenantName: string, email: string, password: string) => {
    // Check if tenant already exists
    if (mockTenants.some((t) => t.name === tenantName)) {
      return { success: false, message: 'Tenant with this name already exists' };
    }

    // Create new tenant
    const tenantId = `tenant-${Date.now()}`;
    const newTenant: Tenant = {
      id: tenantId,
      name: tenantName,
      code: tenantName.toUpperCase().replace(/\s+/g, '-'),
      location: 'India',
      employees: 0,
      status: 'active',
    };
    mockTenants.push(newTenant);

    // Create new admin user for this tenant
    const userId = `user-${Date.now()}`;
    const newUser = {
      id: userId,
      tenantId,
      email,
      password,
      name: 'Tenant Administrator',
      role: 'HR Administrator' as const,
      designation: 'Administrator',
      department: 'Administration',
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Admin${tenantId}`,
    };
    mockUsers.push(newUser);

    return { success: true, message: 'Tenant registered successfully', tenantId };
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setCurrentTenant(null);
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentTenantId');
  }, []);

  const switchTenant = useCallback((tenantId: string) => {
    const tenant = mockTenants.find((t) => t.id === tenantId);
    if (tenant && currentUser) {
      const userInTenant = mockUsers.find((u) => u.email === currentUser.email && u.tenantId === tenantId);
      if (userInTenant) {
        setCurrentUser(userInTenant);
        setCurrentTenant(tenant);
        localStorage.setItem('currentTenantId', tenantId);
      }
    }
  }, [currentUser]);

  const hasPermission = useCallback(
    (permission: string) => {
      if (!currentUser) return false;
      const rolePermissions: Record<UserRole, string[]> = {
        Employee: ['view_payslip', 'apply_leave', 'submit_expense', 'view_profile'],
        Manager: ['approve_leave', 'approve_expense', 'view_team', 'view_reports'],
        'HR Administrator': ['manage_employees', 'configure_system', 'view_all_reports', 'manage_policies'],
        'Payroll Administrator': ['process_payroll', 'manage_compliance', 'view_payroll_reports'],
      };
      return rolePermissions[currentUser.role]?.includes(permission) ?? false;
    },
    [currentUser]
  );

  const hasRole = useCallback(
    (role: UserRole) => {
      return currentUser?.role === role;
    },
    [currentUser]
  );

  const value: AuthContextType = {
    currentUser,
    currentTenant,
    isAuthenticated: !!currentUser,
    login,
    loginWithUserSelect,
    logout,
    switchTenant,
    hasPermission,
    hasRole,
    registerTenant,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
