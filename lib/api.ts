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

  // ==================== EMPLOYEES ====================

  async getEmployees(params?: { search?: string; status?: string; department?: string; reportingManager?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.department) query.append('department', params.department);
    if (params?.reportingManager) query.append('reportingManager', params.reportingManager);

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

  // ==================== ATTENDANCE ====================

  async getAttendance(params?: { startDate?: string; endDate?: string; month?: number; year?: number; employeeId?: string }) {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.month) query.append('month', params.month.toString());
    if (params?.year) query.append('year', params.year.toString());
    if (params?.employeeId) query.append('employeeId', params.employeeId);

    return this.request(`/attendance?${query.toString()}`);
  }

  async checkIn(data: { date: string; time?: string; location?: string }) {
    return this.request('/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async checkOut(data: { date: string; time?: string }) {
    return this.request('/attendance/check-out', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== GOALS ====================

  async getGoals(params?: { status?: string; employeeId?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.employeeId) query.append('employeeId', params.employeeId);

    return this.request(`/goals?${query.toString()}`);
  }

  async createGoal(data: any) {
    return this.request('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGoal(id: string, data: any) {
    return this.request(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGoal(id: string) {
    return this.request(`/goals/${id}`, {
      method: 'DELETE',
    });
  }

  async submitGoal(id: string) {
    return this.request(`/goals/${id}/submit`, {
      method: 'PUT',
    });
  }

  async updateGoalStatus(id: string, status: string, comments?: string) {
    return this.request(`/goals/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, comments }),
    });
  }
}

export const apiService = new ApiService();
export default apiService;
