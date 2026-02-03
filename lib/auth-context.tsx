'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole, Tenant } from './types';
import apiService from './api';

interface AuthContextType {
  currentUser: User | null;
  currentTenant: Tenant | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, tenantId?: string) => Promise<{ success: boolean; message: string; tenant?: Tenant }>;
  loginWithUserSelect: (email: string, tenantId: string) => Promise<void>;
  logout: () => void;
  switchTenant: (tenantId: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  registerTenant: (tenantName: string, email: string, password: string) => Promise<{ success: boolean; message: string; tenantId?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('currentUserId');
      const tenantId = localStorage.getItem('currentTenantId');
      
      if (token && userId && tenantId) {
        try {
          const response = await apiService.getMe();
          if (response.success && response.data) {
            const user = response.data;
            setCurrentUser({
              id: user._id || user.id,
              tenantId: user.tenantId._id ? user.tenantId._id.toString() : user.tenantId.toString(),
              email: user.email,
              password: '', // Don't store password
              name: user.name,
              role: user.role,
              designation: user.designation || '',
              department: user.department || '',
              status: user.status,
              joinDate: user.joinDate,
              avatar: user.avatar || '',
            });
            
            const tenantData = user.tenantId._id ? user.tenantId : { id: tenantId };
            setCurrentTenant({
              id: tenantData._id ? tenantData._id.toString() : tenantData.id || tenantId,
              name: tenantData.name || '',
              code: tenantData.code || '',
              location: tenantData.location || '',
              employees: tenantData.employees || 0,
              status: tenantData.status || 'active',
            });
          }
        } catch (error) {
          // Session expired or invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('currentUserId');
          localStorage.removeItem('currentTenantId');
        }
      }
      setIsLoading(false);
    };
    
    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string, tenantId?: string) => {
    try {
      const response = await apiService.login(email, password, tenantId);
      
      if (response.success && response.data) {
        const { token, user, tenant } = response.data;
        
        // Store token and user info
        localStorage.setItem('token', token);
        localStorage.setItem('currentUserId', user.id);
        localStorage.setItem('currentTenantId', user.tenantId);
        
        // Set user and tenant
        setCurrentUser({
          id: user.id,
          tenantId: user.tenantId,
          email: user.email,
          password: '', // Don't store password
          name: user.name,
          role: user.role,
          designation: user.designation || '',
          department: user.department || '',
          status: user.status,
          joinDate: user.joinDate || new Date().toISOString().split('T')[0],
          avatar: user.avatar || '',
        });
        
        if (tenant) {
          setCurrentTenant({
            id: tenant.id,
            name: tenant.name,
            code: tenant.code,
            location: tenant.location,
            employees: tenant.employees || 0,
            status: tenant.status,
          });
        }
        
        return { success: true, message: 'Login successful', tenant };
      }
      
      return { success: false, message: response.message || 'Login failed' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Network error' };
    }
  }, []);

  const loginWithUserSelect = useCallback(async (email: string, tenantId: string) => {
    try {
      const response = await apiService.login(email, '', tenantId);
      if (response.success && response.data) {
        const { token, user, tenant } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('currentUserId', user.id);
        localStorage.setItem('currentTenantId', user.tenantId);
        
        setCurrentUser({
          id: user.id,
          tenantId: user.tenantId,
          email: user.email,
          password: '',
          name: user.name,
          role: user.role,
          designation: user.designation || '',
          department: user.department || '',
          status: user.status,
          joinDate: user.joinDate || new Date().toISOString().split('T')[0],
          avatar: user.avatar || '',
        });
        
        if (tenant) {
          setCurrentTenant({
            id: tenant.id,
            name: tenant.name,
            code: tenant.code,
            location: tenant.location,
            employees: tenant.employees || 0,
            status: tenant.status,
          });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  }, []);

  const registerTenant = useCallback(async (tenantName: string, email: string, password: string) => {
    try {
      const code = tenantName.toUpperCase().replace(/\s+/g, '-');
      const response = await apiService.registerTenant(
        tenantName,
        code,
        'India', // Default location
        email,
        password,
        'Tenant Administrator'
      );
      
      if (response.success && response.data) {
        const { token, tenant, user } = response.data;
        
        // Store token
        localStorage.setItem('token', token);
        localStorage.setItem('currentUserId', user.id);
        localStorage.setItem('currentTenantId', tenant.id);
        
        // Set user and tenant
        setCurrentUser({
          id: user.id,
          tenantId: tenant.id,
          email: user.email,
          password: '',
          name: user.name,
          role: user.role,
          designation: '',
          department: '',
          status: 'active',
          joinDate: new Date().toISOString().split('T')[0],
          avatar: '',
        });
        
        setCurrentTenant({
          id: tenant.id,
          name: tenant.name,
          code: tenant.code,
          location: 'India',
          employees: 0,
          status: 'active',
        });
        
        return { success: true, message: 'Tenant registered successfully', tenantId: tenant.id };
      }
      
      return { success: false, message: response.message || 'Registration failed' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Network error' };
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setCurrentTenant(null);
    localStorage.removeItem('token');
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentTenantId');
  }, []);

  const switchTenant = useCallback(async (tenantId: string) => {
    if (currentUser) {
      try {
        // Re-login with the new tenant
        const response = await apiService.login(currentUser.email, '', tenantId);
        if (response.success && response.data) {
          const { token, user, tenant } = response.data;
          localStorage.setItem('token', token);
          localStorage.setItem('currentTenantId', tenantId);
          
          setCurrentUser({
            id: user.id,
            tenantId: user.tenantId,
            email: user.email,
            password: '',
            name: user.name,
            role: user.role,
            designation: user.designation || '',
            department: user.department || '',
            status: user.status,
            joinDate: user.joinDate || new Date().toISOString().split('T')[0],
            avatar: user.avatar || '',
          });
          
          if (tenant) {
            setCurrentTenant({
              id: tenant.id,
              name: tenant.name,
              code: tenant.code,
              location: tenant.location,
              employees: tenant.employees || 0,
              status: tenant.status,
            });
          }
        }
      } catch (error) {
        console.error('Switch tenant error:', error);
      }
    }
  }, [currentUser]);

  const hasPermission = useCallback(
    (permission: string) => {
      if (!currentUser) return false;
      
      // Super Admin has ALL permissions
      if (currentUser.role === 'Super Admin') {
        return true;
      }
      
      const rolePermissions: Record<UserRole, string[]> = {
        'Super Admin': [
          // All permissions - checked above
          'manage_all', 'view_all', 'configure_all', 'delete_all'
        ],
        'Tenant Admin': [
          // Company owner/CEO - can manage everything including system configuration within tenant
          'manage_employees', 'view_all_reports', 'manage_policies', 'manage_onboarding', 
          'manage_recruitment', 'view_payroll_reports', 'approve_leave', 'approve_expense',
          'approve_appraisal', 'view_team', 'manage_finance', 'view_financial_reports',
          'manage_departments', 'manage_designations', 'view_audit_logs',
          // Merged System Administrator permissions
          'configure_system', 'manage_users', 'manage_roles', 'manage_integrations',
          'manage_settings', 'manage_sms', 'manage_whatsapp', 'system_maintenance'
        ],
        'HR Administrator': [
          'manage_employees', 'configure_system', 'view_all_reports', 'manage_policies', 
          'manage_onboarding', 'manage_recruitment', 'approve_leave', 'approve_expense',
          'view_team', 'manage_departments', 'manage_designations', 'view_audit_logs',
          'manage_users', 'manage_roles'
        ],
        'Payroll Administrator': [
          'process_payroll', 'manage_compliance', 'view_payroll_reports', 'view_payslip',
          'generate_form16', 'generate_form24q', 'manage_epfo', 'manage_esic',
          'generate_bank_files', 'view_employee_salary'
        ],
        'Finance Administrator': [
          'view_financial_reports', 'approve_expense', 'manage_budget', 'view_payroll_reports',
          'reconcile_accounts', 'view_audit_logs', 'manage_finance'
        ],
        'Manager': [
          'approve_leave', 'approve_expense', 'approve_travel', 'view_team', 
          'view_reports', 'approve_appraisal', 'view_team_payslip', 'manage_team_goals'
        ],
        'Employee': [
          'view_payslip', 'apply_leave', 'submit_expense', 'view_profile', 
          'view_tax', 'view_attendance', 'submit_appraisal', 'view_own_data'
        ],
        'Auditor': [
          'view_all_reports', 'view_audit_logs', 'view_financial_reports', 
          'view_payroll_reports', 'view_employee_data', 'export_reports'
        ],
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
    isAuthenticated: !!currentUser && !isLoading,
    login,
    loginWithUserSelect,
    logout,
    switchTenant,
    hasPermission,
    hasRole,
    registerTenant,
  };

  // Show loading state while restoring session (only on client)
  if (isLoading && typeof window !== 'undefined') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-primary/30 rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
