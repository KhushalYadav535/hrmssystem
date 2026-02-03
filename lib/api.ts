// API Service for Frontend - Connects to Backend
// This file provides API functions that match the frontend's data structure

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'An error occurred',
          error: data.error,
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Network error',
        error: error.message,
      };
    }
  }

  // ==================== REPORTS ====================

  async getDashboardStats() {
    return this.request('/reports/dashboard-stats');
  }

  async getComprehensiveReports() {
    return this.request('/reports/comprehensive');
  }

  // ==================== AUTHENTICATION ====================

  async login(email: string, password: string, tenantId?: string) {
    return this.request<{
      token: string;
      user: any;
      tenant?: any;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, tenantId }),
    });
  }

  async register(email: string, password: string, name: string, tenantId: string, role?: string) {
    return this.request<{
      token: string;
      user: any;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, tenantId, role }),
    });
  }

  async registerTenant(tenantName: string, code: string, location: string, adminEmail: string, adminPassword: string, adminName: string) {
    return this.request<{
      token: string;
      tenant: any;
      user: any;
    }>('/auth/register-tenant', {
      method: 'POST',
      body: JSON.stringify({
        tenantName,
        code,
        location,
        adminEmail,
        adminPassword,
        adminName,
      }),
    });
  }

  async getMe() {
    return this.request('/auth/me', {
      method: 'GET',
    });
  }

  // ==================== USERS ====================

  async getUsers(params?: { search?: string; status?: string; role?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.role) query.append('role', params.role);

    return this.request(`/users?${query.toString()}`);
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id: string, data: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== EMPLOYEES ====================

  async getEmployees(params?: { search?: string; status?: string; department?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.department) query.append('department', params.department);

    return this.request(`/employees?${query.toString()}`);
  }

  async getEmployee(id: string) {
    return this.request(`/employees/${id}`);
  }

  async createEmployee(data: any) {
    return this.request('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmployee(id: string, data: any) {
    return this.request(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEmployee(id: string) {
    return this.request(`/employees/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== PAYROLL ====================

  async getPayrolls(params?: { month?: string; year?: number; employeeId?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.month) query.append('month', params.month);
    if (params?.year) query.append('year', params.year.toString());
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.status) query.append('status', params.status);

    return this.request(`/payroll?${query.toString()}`);
  }

  async getPayroll(id: string) {
    return this.request(`/payroll/${id}`);
  }

  async createPayroll(data: any) {
    return this.request('/payroll', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePayroll(id: string, data: any) {
    return this.request(`/payroll/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePayroll(id: string) {
    return this.request(`/payroll/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== LEAVES ====================

  async getLeaves(params?: { employeeId?: string; status?: string; leaveType?: string }) {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.status) query.append('status', params.status);
    if (params?.leaveType) query.append('leaveType', params.leaveType);

    return this.request(`/leaves?${query.toString()}`);
  }

  async getLeave(id: string) {
    return this.request(`/leaves/${id}`);
  }

  async createLeave(data: any) {
    return this.request('/leaves', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLeave(id: string, data: any) {
    return this.request(`/leaves/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async approveLeave(id: string, status: 'Approved' | 'Rejected', comments?: string) {
    return this.request(`/leaves/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ status, comments }),
    });
  }

  async deleteLeave(id: string) {
    return this.request(`/leaves/${id}`, {
      method: 'DELETE',
    });
  }

  async getLeaveBalance(employeeId: string) {
    return this.request(`/leaves/balance/${employeeId}`);
  }

  // ==================== EXPENSES ====================

  async getExpenses(params?: { employeeId?: string; status?: string; category?: string }) {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.status) query.append('status', params.status);
    if (params?.category) query.append('category', params.category);

    return this.request(`/expenses?${query.toString()}`);
  }

  async getExpense(id: string) {
    return this.request(`/expenses/${id}`);
  }

  async createExpense(data: any) {
    return this.request('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExpense(id: string, data: any) {
    return this.request(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async approveExpense(id: string, status: 'Approved' | 'Rejected', comments?: string) {
    return this.request(`/expenses/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ status, comments }),
    });
  }

  async deleteExpense(id: string) {
    return this.request(`/expenses/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== JOBS ====================

  async getJobs(params?: { status?: string; department?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.department) query.append('department', params.department);

    return this.request(`/jobs?${query.toString()}`);
  }

  async getJob(id: string) {
    return this.request(`/jobs/${id}`);
  }

  async createJob(data: any) {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateJob(id: string, data: any) {
    return this.request(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteJob(id: string) {
    return this.request(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== DEPARTMENTS ====================

  async getDepartments(params?: { status?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);

    return this.request(`/departments?${query.toString()}`);
  }

  async getDepartment(id: string) {
    return this.request(`/departments/${id}`);
  }

  async createDepartment(data: any) {
    return this.request('/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDepartment(id: string, data: any) {
    return this.request(`/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDepartment(id: string) {
    return this.request(`/departments/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== BONUSES ====================

  async getBonuses(params?: { status?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);

    return this.request(`/bonuses?${query.toString()}`);
  }

  async getBonus(id: string) {
    return this.request(`/bonuses/${id}`);
  }

  async createBonus(data: any) {
    return this.request('/bonuses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBonus(id: string, data: any) {
    return this.request(`/bonuses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async processBonus(id: string) {
    return this.request(`/bonuses/${id}/process`, {
      method: 'PUT',
    });
  }

  async deleteBonus(id: string) {
    return this.request(`/bonuses/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== DESIGNATIONS ====================

  async getDesignations(params?: { status?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);

    return this.request(`/designations?${query.toString()}`);
  }

  async getDesignation(id: string) {
    return this.request(`/designations/${id}`);
  }

  async createDesignation(data: any) {
    return this.request('/designations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDesignation(id: string, data: any) {
    return this.request(`/designations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDesignation(id: string) {
    return this.request(`/designations/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== LEAVE POLICIES ====================

  async getLeavePolicies(params?: { status?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);

    return this.request(`/leave-policies?${query.toString()}`);
  }

  async getLeavePolicy(id: string) {
    return this.request(`/leave-policies/${id}`);
  }

  async createLeavePolicy(data: any) {
    return this.request('/leave-policies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLeavePolicy(id: string, data: any) {
    return this.request(`/leave-policies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLeavePolicy(id: string) {
    return this.request(`/leave-policies/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== ROLE PERMISSIONS ====================

  async getRolePermissions() {
    return this.request('/role-permissions');
  }

  async getRolePermission(role: string) {
    return this.request(`/role-permissions/${role}`);
  }

  async updateRolePermissions(role: string, data: { permissions: string[] }) {
    return this.request(`/role-permissions/${role}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAvailablePermissions() {
    return this.request('/role-permissions/available/list');
  }

  // ==================== AUDIT LOGS ====================

  async getAuditLogs(params?: { module?: string; action?: string; status?: string; dateFrom?: string; dateTo?: string; userId?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.module) query.append('module', params.module);
    if (params?.action) query.append('action', params.action);
    if (params?.status) query.append('status', params.status);
    if (params?.dateFrom) query.append('dateFrom', params.dateFrom);
    if (params?.dateTo) query.append('dateTo', params.dateTo);
    if (params?.userId) query.append('userId', params.userId);
    if (params?.search) query.append('search', params.search);

    return this.request(`/audit-logs?${query.toString()}`);
  }

  async getAuditLog(id: string) {
    return this.request(`/audit-logs/${id}`);
  }

  async exportAuditLogs(params?: { module?: string; action?: string; status?: string; dateFrom?: string; dateTo?: string }) {
    const query = new URLSearchParams();
    if (params?.module) query.append('module', params.module);
    if (params?.action) query.append('action', params.action);
    if (params?.status) query.append('status', params.status);
    if (params?.dateFrom) query.append('dateFrom', params.dateFrom);
    if (params?.dateTo) query.append('dateTo', params.dateTo);

    return this.request(`/audit-logs/export?${query.toString()}`);
  }

  // ==================== TENANT SETTINGS ====================

  async getCurrentTenant() {
    return this.request('/tenants/current');
  }

  async updateTenantSettings(settings: any) {
    return this.request('/tenants/current/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    });
  }

  async updateTenant(tenantId: string, data: any) {
    return this.request(`/tenants/${tenantId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ==================== SYSTEM ====================

  async getSystemStatus() {
    return this.request('/system/status');
  }

  // ==================== TAX DECLARATIONS ====================

  async getTaxDeclarations(params?: { financialYear?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.financialYear) query.append('financialYear', params.financialYear);
    if (params?.status) query.append('status', params.status);

    return this.request(`/tax-declarations?${query.toString()}`);
  }

  async getTaxDeclaration(id: string) {
    return this.request(`/tax-declarations/${id}`);
  }

  async createTaxDeclaration(data: any) {
    return this.request('/tax-declarations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTaxDeclarationStatus(id: string, data: any) {
    return this.request(`/tax-declarations/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ==================== PERFORMANCE ====================

  async getPerformances(params?: { employeeId?: string; period?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.period) query.append('period', params.period);
    if (params?.status) query.append('status', params.status);

    return this.request(`/performance?${query.toString()}`);
  }

  async getPerformance(id: string) {
    return this.request(`/performance/${id}`);
  }

  async createPerformance(data: any) {
    return this.request('/performance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePerformance(id: string, data: any) {
    return this.request(`/performance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePerformance(id: string) {
    return this.request(`/performance/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== ATTENDANCE ====================

  async getAttendances(params?: { employeeId?: string; startDate?: string; endDate?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.status) query.append('status', params.status);

    return this.request(`/attendance?${query.toString()}`);
  }

  async getAttendance(id: string) {
    return this.request(`/attendance/${id}`);
  }

  async getAttendanceSummary(employeeId: string, params?: { startDate?: string; endDate?: string }) {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);

    return this.request(`/attendance/summary/${employeeId}?${query.toString()}`);
  }

  async createAttendance(data: any) {
    return this.request('/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAttendance(id: string, data: any) {
    return this.request(`/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAttendance(id: string) {
    return this.request(`/attendance/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== ONBOARDING ====================

  async getOnboardings(params?: { status?: string; department?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.department) query.append('department', params.department);

    return this.request(`/onboarding?${query.toString()}`);
  }

  async getOnboarding(id: string) {
    return this.request(`/onboarding/${id}`);
  }

  async createOnboarding(data: any) {
    return this.request('/onboarding', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOnboarding(id: string, data: any) {
    return this.request(`/onboarding/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateOnboardingTask(id: string, taskId: string, data: any) {
    return this.request(`/onboarding/${id}/task/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOnboarding(id: string) {
    return this.request(`/onboarding/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
export default apiService;
