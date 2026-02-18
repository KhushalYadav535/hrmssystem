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

  async createUser(data: {
    email: string;
    name: string;
    employeeId?: string;
    role: string;
    designation?: string;
    department?: string;
    username?: string;
  }) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetUserPassword(id: string) {
    return this.request(`/users/${id}/reset-password`, {
      method: 'POST',
    });
  }

  async deactivateUser(id: string, reason?: string) {
    return this.request(`/users/${id}/deactivate`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async activateUser(id: string) {
    return this.request(`/users/${id}/activate`, {
      method: 'POST',
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

  async processPayroll(month: string, year: number) {
    return this.request('/payroll/process', {
      method: 'POST',
      body: JSON.stringify({ month, year }),
    });
  }

  async getPayrollStats(params?: { month?: string; year?: number }) {
    const query = new URLSearchParams();
    if (params?.month) query.append('month', params.month);
    if (params?.year) query.append('year', params.year.toString());

    return this.request(`/payroll/stats?${query.toString()}`);
  }

  async submitPayroll(id: string, comments?: string) {
    return this.request(`/payroll/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    });
  }

  async approvePayroll(id: string, comments?: string) {
    return this.request(`/payroll/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    });
  }

  async rejectPayroll(id: string, reason: string) {
    return this.request(`/payroll/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async finalizePayroll(id: string, comments?: string) {
    return this.request(`/payroll/${id}/finalize`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    });
  }

  async generateBankFile(month: string, year: number, format: 'NEFT' | 'RTGS' | 'INTERNAL' = 'NEFT') {
    return this.request(`/payroll/bank-file/generate?month=${month}&year=${year}&format=${format}`);
  }

  async generateECRFile(month: string, year: number) {
    return this.request(`/payroll/ecr/generate?month=${month}&year=${year}`);
  }

  async uploadECRFile(month: string, year: number, fileContent: string, fileName: string) {
    return this.request('/payroll/ecr/upload', {
      method: 'POST',
      body: JSON.stringify({ month, year, fileContent, fileName }),
    });
  }

  async downloadEPFOAcknowledgment(fileName: string, month: string, year: number) {
    return this.request(`/payroll/ecr/acknowledgment?fileName=${encodeURIComponent(fileName)}&month=${month}&year=${year}`);
  }

  async validateUAN(uan: string) {
    return this.request('/payroll/ecr/validate-uan', {
      method: 'POST',
      body: JSON.stringify({ uan }),
    });
  }

  async bulkValidateUANs(uans: string[]) {
    return this.request('/payroll/ecr/validate-uans', {
      method: 'POST',
      body: JSON.stringify({ uans }),
    });
  }

  async generateESICFile(month: string, year: number) {
    return this.request(`/payroll/esic/generate?month=${month}&year=${year}`);
  }

  async uploadESICFile(month: string, year: number, fileContent: string, fileName: string) {
    return this.request('/payroll/esic/upload', {
      method: 'POST',
      body: JSON.stringify({ month, year, fileContent, fileName }),
    });
  }

  async getESICPaymentStatus(month: string, year: number) {
    return this.request(`/payroll/esic/payment-status?month=${month}&year=${year}`);
  }

  async generatePayslipPDF(id: string) {
    return this.request(`/payroll/payslip/${id}/pdf`);
  }

  // ==================== CBS (Core Banking System) ====================

  async validateBankAccount(accountNumber: string, ifscCode: string, accountHolderName?: string, employeeId?: string) {
    return this.request('/payroll/cbs/validate-account', {
      method: 'POST',
      body: JSON.stringify({ accountNumber, ifscCode, accountHolderName, employeeId }),
    });
  }

  async getBankAccountDetails(accountNumber: string, ifscCode?: string) {
    const query = new URLSearchParams();
    query.append('accountNumber', accountNumber);
    if (ifscCode) query.append('ifscCode', ifscCode);
    return this.request(`/payroll/cbs/account-details?${query.toString()}`);
  }

  async confirmTransactionStatus(transactionReference: string, transactionDate?: string) {
    return this.request('/payroll/cbs/transaction-status', {
      method: 'POST',
      body: JSON.stringify({ transactionReference, transactionDate }),
    });
  }

  async bulkConfirmTransactionStatus(transactionReferences: string[], month?: string, year?: number) {
    return this.request('/payroll/cbs/bulk-transaction-status', {
      method: 'POST',
      body: JSON.stringify({ transactionReferences, month, year }),
    });
  }

  async getFailedTransactions(month?: string, year?: number) {
    const query = new URLSearchParams();
    if (month) query.append('month', month);
    if (year) query.append('year', year.toString());
    return this.request(`/payroll/cbs/failed-transactions?${query.toString()}`);
  }

  async retryFailedTransaction(transactionId: string) {
    return this.request(`/payroll/cbs/transaction/${transactionId}/retry`, {
      method: 'POST',
    });
  }

  async getTransactionHistory(accountNumber: string, fromDate?: string, toDate?: string, limit?: number) {
    const query = new URLSearchParams();
    query.append('accountNumber', accountNumber);
    if (fromDate) query.append('fromDate', fromDate);
    if (toDate) query.append('toDate', toDate);
    if (limit) query.append('limit', limit.toString());
    return this.request(`/payroll/cbs/transaction-history?${query.toString()}`);
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

  async cancelLeave(id: string, cancellationReason?: string) {
    return this.request(`/leaves/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ cancellationReason }),
    });
  }

  async getTeamCalendar(params?: { startDate?: string; endDate?: string; employeeId?: string }) {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    return this.request(`/leaves/team-calendar?${query.toString()}`);
  }

  // ==================== HOLIDAY CALENDAR ====================

  async getHolidays(params?: { year?: number; month?: number; holidayType?: string; location?: string }) {
    const query = new URLSearchParams();
    if (params?.year) query.append('year', params.year.toString());
    if (params?.month !== undefined) query.append('month', params.month.toString());
    if (params?.holidayType) query.append('holidayType', params.holidayType);
    if (params?.location) query.append('location', params.location);
    return this.request(`/holiday-calendar?${query.toString()}`);
  }

  async getHoliday(id: string) {
    return this.request(`/holiday-calendar/${id}`);
  }

  async createHoliday(data: any) {
    return this.request('/holiday-calendar', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateHoliday(id: string, data: any) {
    return this.request(`/holiday-calendar/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteHoliday(id: string) {
    return this.request(`/holiday-calendar/${id}`, {
      method: 'DELETE',
    });
  }

  async checkHoliday(date: string, location?: string) {
    const query = new URLSearchParams();
    query.append('date', date);
    if (location) query.append('location', location);
    return this.request(`/holiday-calendar/check?${query.toString()}`);
  }

  // ==================== LEAVE ENCASHMENT ====================

  async getLeaveEncashments(params?: { employeeId?: string; status?: string; financialYear?: number }) {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.status) query.append('status', params.status);
    if (params?.financialYear) query.append('financialYear', params.financialYear.toString());
    return this.request(`/leave-encashment?${query.toString()}`);
  }

  async getLeaveEncashment(id: string) {
    return this.request(`/leave-encashment/${id}`);
  }

  async createLeaveEncashment(data: any) {
    return this.request('/leave-encashment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLeaveEncashment(id: string, data: any) {
    return this.request(`/leave-encashment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async approveLeaveEncashment(id: string, remarks?: string) {
    return this.request(`/leave-encashment/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ remarks }),
    });
  }

  async rejectLeaveEncashment(id: string, remarks?: string) {
    return this.request(`/leave-encashment/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ remarks }),
    });
  }

  async processLeaveEncashment(id: string, paymentData?: any) {
    return this.request(`/leave-encashment/${id}/process`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async deleteLeaveEncashment(id: string) {
    return this.request(`/leave-encashment/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== TRAVEL MANAGEMENT ====================

  // Travel Requests
  async getTravelRequests(params?: { employeeId?: string; status?: string; travelType?: string }) {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.status) query.append('status', params.status);
    if (params?.travelType) query.append('travelType', params.travelType);
    return this.request(`/travel/requests?${query.toString()}`);
  }

  async getTravelRequest(id: string) {
    return this.request(`/travel/requests/${id}`);
  }

  async createTravelRequest(data: any) {
    return this.request('/travel/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTravelRequest(id: string, data: any) {
    return this.request(`/travel/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async submitTravelRequest(id: string) {
    return this.request(`/travel/requests/${id}/submit`, {
      method: 'POST',
    });
  }

  async approveTravelRequest(id: string, status: 'Approved' | 'Rejected', comments?: string) {
    return this.request(`/travel/requests/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ status, comments }),
    });
  }

  async deleteTravelRequest(id: string) {
    return this.request(`/travel/requests/${id}`, {
      method: 'DELETE',
    });
  }

  // Travel Advances
  async getTravelAdvances(params?: { employeeId?: string; status?: string; travelRequestId?: string }) {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.status) query.append('status', params.status);
    if (params?.travelRequestId) query.append('travelRequestId', params.travelRequestId);
    return this.request(`/travel/advances?${query.toString()}`);
  }

  async createTravelAdvance(data: any) {
    return this.request('/travel/advances', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveTravelAdvance(id: string, comments?: string) {
    return this.request(`/travel/advances/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    });
  }

  async rejectTravelAdvance(id: string, comments?: string) {
    return this.request(`/travel/advances/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    });
  }

  async markTravelAdvancePaid(id: string, paymentData?: any) {
    return this.request(`/travel/advances/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // Travel Claims
  async getTravelClaims(params?: { employeeId?: string; status?: string; claimType?: string }) {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.status) query.append('status', params.status);
    if (params?.claimType) query.append('claimType', params.claimType);
    return this.request(`/travel/claims?${query.toString()}`);
  }

  async createTravelClaim(data: any) {
    return this.request('/travel/claims', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitTravelClaim(id: string) {
    return this.request(`/travel/claims/${id}/submit`, {
      method: 'POST',
    });
  }

  async approveTravelClaim(id: string, level: 'Level1' | 'Level2' | 'Level3' | 'Finance', comments?: string, approvedAmount?: number) {
    return this.request(`/travel/claims/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ level, comments, approvedAmount }),
    });
  }

  async rejectTravelClaim(id: string, comments?: string) {
    return this.request(`/travel/claims/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    });
  }

  async settleTravelClaim(id: string, paymentData?: any) {
    return this.request(`/travel/claims/${id}/settle`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // Travel Policies
  async getTravelPolicies(params?: { grade?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.grade) query.append('grade', params.grade);
    if (params?.status) query.append('status', params.status);
    return this.request(`/travel/policies?${query.toString()}`);
  }

  async createTravelPolicy(data: any) {
    return this.request('/travel/policies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTravelPolicy(id: string, data: any) {
    return this.request(`/travel/policies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTravelPolicy(id: string) {
    return this.request(`/travel/policies/${id}`, {
      method: 'DELETE',
    });
  }

  // LTA (Leave Travel Allowance)
  async getLTAs(params?: { employeeId?: string; blockYear?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.blockYear) query.append('blockYear', params.blockYear);
    if (params?.status) query.append('status', params.status);
    return this.request(`/travel/lta?${query.toString()}`);
  }

  async getLTABalance(employeeId: string) {
    return this.request(`/travel/lta/balance/${employeeId}`);
  }

  async createLTA(data: any) {
    return this.request('/travel/lta', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addLTAJourney(id: string, journeyData: any) {
    return this.request(`/travel/lta/${id}/journey`, {
      method: 'POST',
      body: JSON.stringify(journeyData),
    });
  }

  async approveLTAJourney(id: string, journeyIndex: number) {
    return this.request(`/travel/lta/${id}/journey/approve`, {
      method: 'POST',
      body: JSON.stringify({ journeyIndex }),
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

  // ==================== SALARY STRUCTURES ====================

  async getSalaryStructures(params?: { status?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);

    return this.request(`/salary-structures?${query.toString()}`);
  }

  async getSalaryStructure(id: string) {
    return this.request(`/salary-structures/${id}`);
  }

  async createSalaryStructure(data: any) {
    return this.request('/salary-structures', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSalaryStructure(id: string, data: any) {
    return this.request(`/salary-structures/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSalaryStructure(id: string) {
    return this.request(`/salary-structures/${id}`, {
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
    return this.request(`/role-permissions/${encodeURIComponent(role)}`);
  }

  async updateRolePermissions(role: string, permissions: string[]) {
    return this.request(`/role-permissions/${encodeURIComponent(role)}`, {
      method: 'PUT',
      body: JSON.stringify({ permissions }),
    });
  }

  async getAvailablePermissions() {
    return this.request('/role-permissions/available/list');
  }

  async getRolePermission(role: string) {
    return this.request(`/role-permissions/${role}`);
  }

  async updateRolePermissions(role: string, data: { permissions: string[] }) {
    // URL encode role name to handle spaces
    const encodedRole = encodeURIComponent(role);
    return this.request(`/role-permissions/${encodedRole}`, {
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

  // ==================== TAX COMPUTATION ====================

  async getTaxComputation(financialYear?: string) {
    const query = financialYear ? `?financialYear=${financialYear}` : '';
    return this.request(`/tax/computation${query}`);
  }

  async calculateMonthlyTDS(data: { month: string; year: number }) {
    return this.request('/tax/computation/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTaxComputationSheet(financialYear?: string) {
    const query = financialYear ? `?financialYear=${financialYear}` : '';
    return this.request(`/tax/computation/sheet${query}`);
  }

  // ==================== TAX CALCULATOR ====================

  async compareTaxRegimes(data: {
    financialYear?: string;
    annualSalary?: number;
    basicSalary?: number;
    hra?: number;
    otherAllowances?: number;
    declarations?: any;
    rentDetails?: any;
  }) {
    return this.request('/tax/calculator/compare-regimes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async selectTaxRegime(data: { regime: 'Old' | 'New'; financialYear?: string }) {
    return this.request('/tax/calculator/select-regime', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRecommendedTaxRegime(financialYear?: string) {
    const query = financialYear ? `?financialYear=${financialYear}` : '';
    return this.request(`/tax/calculator/recommended-regime${query}`);
  }

  async calculateHRA(data: {
    monthlyRent: number;
    basicSalary: number;
    hraReceived: number;
    isMetro: boolean;
  }) {
    return this.request('/tax/calculator/hra', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== FORM 16 ====================

  async getForm16(financialYear?: string, employeeId?: string) {
    const query = new URLSearchParams();
    if (financialYear) query.append('financialYear', financialYear);
    if (employeeId) query.append('employeeId', employeeId);
    return this.request(`/tax/form16?${query.toString()}`);
  }

  async generateForm16(data: { financialYear?: string; employeeId?: string }) {
    return this.request('/tax/form16', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== FORM 24Q (TRACES) ====================

  async getForm24Qs(params?: { financialYear?: string; quarter?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.financialYear) query.append('financialYear', params.financialYear);
    if (params?.quarter) query.append('quarter', params.quarter);
    if (params?.status) query.append('status', params.status);

    return this.request(`/tax/form24q?${query.toString()}`);
  }

  async getForm24Q(form24QId: string) {
    return this.request(`/tax/form24q/${form24QId}`);
  }

  async generateForm24Q(data: { financialYear: string; quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4' }) {
    return this.request('/tax/form24q', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async validateForm24Q(form24QId: string) {
    return this.request(`/tax/form24q/${form24QId}/validate`, {
      method: 'POST',
    });
  }

  async uploadForm24Q(form24QId: string) {
    return this.request(`/tax/form24q/${form24QId}/upload`, {
      method: 'POST',
    });
  }

  async checkTRACESStatus(form24QId: string) {
    return this.request(`/tax/form24q/${form24QId}/traces-status`);
  }

  async downloadForm16PartA(form24QId: string, employeePan: string) {
    return this.request(`/tax/form24q/form16-part-a?form24QId=${form24QId}&employeePan=${employeePan}`);
  }

  // ==================== HRA DECLARATION ====================

  async getHRADeclaration(financialYear?: string) {
    const query = financialYear ? `?financialYear=${financialYear}` : '';
    return this.request(`/tax/hra${query}`);
  }

  async createHRADeclaration(data: {
    financialYear?: string;
    rentDetails: {
      address: string;
      city: string;
      state: string;
      pinCode: string;
      monthlyRent: number;
      landlordName: string;
      landlordPan?: string;
      rentReceipts?: string[];
    };
  }) {
    return this.request('/tax/hra', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyHRADeclaration(id: string, data: { status: 'Verified' | 'Rejected'; rejectionReason?: string }) {
    return this.request(`/tax/hra/${id}/verify`, {
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

  async getTodayAttendance() {
    return this.request('/attendance/today');
  }

  async checkIn(location?: string, remarks?: string) {
    return this.request('/attendance/checkin', {
      method: 'POST',
      body: JSON.stringify({ location, remarks }),
    });
  }

  async checkOut(remarks?: string) {
    return this.request('/attendance/checkout', {
      method: 'POST',
      body: JSON.stringify({ remarks }),
    });
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

  async completeOnboarding(id: string) {
    return this.request(`/onboarding/${id}/complete`, {
      method: 'POST',
    });
  }

  // ==================== OFFER LETTERS ====================

  async createOfferLetter(data: { candidateId: string; [key: string]: any }) {
    return this.request('/onboarding/offer-letters', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOfferLetter(candidateId?: string, id?: string) {
    const query = candidateId ? `?candidateId=${candidateId}` : id ? `/${id}` : '';
    return this.request(`/onboarding/offer-letters${query}`);
  }

  async acceptOfferLetter(token: string, signature: string) {
    return this.request('/onboarding/offer-letters/accept', {
      method: 'POST',
      body: JSON.stringify({ token, signature }),
    });
  }

  async generateOfferLetterPDF(id: string) {
    return this.request(`/onboarding/offer-letters/${id}/generate-pdf`, {
      method: 'POST',
    });
  }

  // ==================== DOCUMENT VERIFICATION ====================

  async createDocumentVerification(data: { candidateId: string; aadhaar?: any; pan?: any }) {
    return this.request('/onboarding/document-verification', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDocumentVerification(candidateId?: string, id?: string) {
    const query = candidateId ? `?candidateId=${candidateId}` : id ? `/${id}` : '';
    return this.request(`/onboarding/document-verification${query}`);
  }

  async verifyAadhaar(id: string, data: { name: string; dob: string; gender: string }) {
    return this.request(`/onboarding/document-verification/${id}/verify-aadhaar`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyPAN(id: string, data: { name: string; dob: string }) {
    return this.request(`/onboarding/document-verification/${id}/verify-pan`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async fetchDigiLockerDocuments(id: string, data: { consentToken: string; aadhaarNumber?: string }) {
    return this.request(`/onboarding/document-verification/${id}/digilocker`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async uploadDocument(id: string, data: { type: string; name: string; url: string }) {
    return this.request(`/onboarding/document-verification/${id}/upload`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyDocument(id: string, docId: string, data: { verified: boolean; remarks?: string }) {
    return this.request(`/onboarding/document-verification/${id}/documents/${docId}/verify`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ==================== BACKGROUND VERIFICATION ====================

  async initiateBackgroundVerification(data: { candidateId: string; agencyId?: string; agencyName?: string }) {
    return this.request('/onboarding/background-verification', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBackgroundVerification(candidateId?: string, id?: string) {
    const query = candidateId ? `?candidateId=${candidateId}` : id ? `/${id}` : '';
    return this.request(`/onboarding/background-verification${query}`);
  }

  async updateVerificationComponent(id: string, data: { component: string; status: string; remarks?: string; data?: any }) {
    return this.request(`/onboarding/background-verification/${id}/component`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async addDiscrepancy(id: string, data: { component: string; description: string; severity: string }) {
    return this.request(`/onboarding/background-verification/${id}/discrepancies`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resolveDiscrepancy(id: string, discrepancyId: string, data: { resolutionNotes: string }) {
    return this.request(`/onboarding/background-verification/${id}/discrepancies/${discrepancyId}/resolve`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async approveBackgroundVerification(id: string, data: { approvalStatus: string; rejectionReason?: string }) {
    return this.request(`/onboarding/background-verification/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ==================== PROBATION ====================

  async createProbation(data: { employeeId: string; onboardingId?: string; startDate: string; duration?: number }) {
    return this.request('/onboarding/probation', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProbations(employeeId?: string, status?: string) {
    const query = new URLSearchParams();
    if (employeeId) query.append('employeeId', employeeId);
    if (status) query.append('status', status);
    return this.request(`/onboarding/probation?${query.toString()}`);
  }

  async getProbation(id: string) {
    return this.request(`/onboarding/probation/${id}`);
  }

  async addProbationReview(id: string, data: { reviewDate?: string; rating: string; comments: string; recommendation: string }) {
    return this.request(`/onboarding/probation/${id}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async confirmEmployee(id: string, data: { confirmationLetterUrl?: string }) {
    return this.request(`/onboarding/probation/${id}/confirm`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async extendProbation(id: string, data: { extensionReason: string; additionalMonths: number }) {
    return this.request(`/onboarding/probation/${id}/extend`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProbationsDueForReminder(daysBefore?: number) {
    const query = daysBefore ? `?daysBefore=${daysBefore}` : '';
    return this.request(`/onboarding/probation/reminders${query}`);
  }

  // ==================== APPRAISAL MANAGEMENT SYSTEM (AMS) ====================

  // Appraisal Cycles
  async getAppraisalCycles(params?: { cycleType?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.cycleType) query.append('cycleType', params.cycleType);
    if (params?.status) query.append('status', params.status);
    return this.request(`/appraisal/cycles?${query.toString()}`);
  }

  async getActiveAppraisalCycle() {
    return this.request('/appraisal/cycles/active');
  }

  async createAppraisalCycle(data: any) {
    return this.request('/appraisal/cycles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAppraisalCycle(id: string, data: any) {
    return this.request(`/appraisal/cycles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async activateAppraisalCycle(id: string) {
    return this.request(`/appraisal/cycles/${id}/activate`, {
      method: 'POST',
    });
  }

  // Goals
  async getGoals(params?: { employeeId?: string; appraisalCycleId?: string; goalLevel?: string; status?: string; departmentId?: string }) {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.appraisalCycleId) query.append('appraisalCycleId', params.appraisalCycleId);
    if (params?.goalLevel) query.append('goalLevel', params.goalLevel);
    if (params?.status) query.append('status', params.status);
    if (params?.departmentId) query.append('departmentId', params.departmentId);
    return this.request(`/appraisal/goals?${query.toString()}`);
  }

  async createGoal(data: any) {
    return this.request('/appraisal/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGoal(id: string, data: any) {
    return this.request(`/appraisal/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async approveGoal(id: string, comments?: string) {
    return this.request(`/appraisal/goals/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    });
  }

  async updateGoalProgress(id: string, progress: number, currentValue?: string) {
    return this.request(`/appraisal/goals/${id}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ progress, currentValue }),
    });
  }

  // Self Appraisals
  async getSelfAppraisals(params?: { employeeId?: string; appraisalCycleId?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.appraisalCycleId) query.append('appraisalCycleId', params.appraisalCycleId);
    if (params?.status) query.append('status', params.status);
    return this.request(`/appraisal/self-appraisals?${query.toString()}`);
  }

  async createOrUpdateSelfAppraisal(data: any) {
    return this.request('/appraisal/self-appraisals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitSelfAppraisal(id: string) {
    return this.request(`/appraisal/self-appraisals/${id}/submit`, {
      method: 'POST',
    });
  }

  // Manager Appraisals
  async getManagerAppraisals(params?: { employeeId?: string; managerId?: string; appraisalCycleId?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.managerId) query.append('managerId', params.managerId);
    if (params?.appraisalCycleId) query.append('appraisalCycleId', params.appraisalCycleId);
    if (params?.status) query.append('status', params.status);
    return this.request(`/appraisal/manager-appraisals?${query.toString()}`);
  }

  async createManagerAppraisal(data: any) {
    return this.request('/appraisal/manager-appraisals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitManagerAppraisal(id: string) {
    return this.request(`/appraisal/manager-appraisals/${id}/submit`, {
      method: 'POST',
    });
  }

  // Normalization
  async getNormalizations(params?: { appraisalCycleId?: string; departmentId?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.appraisalCycleId) query.append('appraisalCycleId', params.appraisalCycleId);
    if (params?.departmentId) query.append('departmentId', params.departmentId);
    if (params?.status) query.append('status', params.status);
    return this.request(`/appraisal/normalizations?${query.toString()}`);
  }

  async createNormalization(data: any) {
    return this.request('/appraisal/normalizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async adjustRating(id: string, adjustmentData: any) {
    return this.request(`/appraisal/normalizations/${id}/adjust`, {
      method: 'POST',
      body: JSON.stringify(adjustmentData),
    });
  }

  async completeNormalization(id: string) {
    return this.request(`/appraisal/normalizations/${id}/complete`, {
      method: 'POST',
    });
  }

  // PIPs
  async getPIPs(params?: { employeeId?: string; managerId?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.managerId) query.append('managerId', params.managerId);
    if (params?.status) query.append('status', params.status);
    return this.request(`/appraisal/pips?${query.toString()}`);
  }

  async createPIP(data: any) {
    return this.request('/appraisal/pips', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approvePIP(id: string) {
    return this.request(`/appraisal/pips/${id}/approve`, {
      method: 'POST',
    });
  }

  async acknowledgePIP(id: string, comments?: string) {
    return this.request(`/appraisal/pips/${id}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    });
  }

  // IDPs
  async getIDPs(params?: { employeeId?: string; managerId?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.managerId) query.append('managerId', params.managerId);
    if (params?.status) query.append('status', params.status);
    return this.request(`/appraisal/idps?${query.toString()}`);
  }

  async createIDP(data: any) {
    return this.request('/appraisal/idps', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async finalizeIDP(id: string) {
    return this.request(`/appraisal/idps/${id}/finalize`, {
      method: 'POST',
    });
  }

  // Continuous Feedback
  async getFeedbacks(params?: { employeeId?: string; fromUserId?: string; feedbackType?: string; goalId?: string }) {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.fromUserId) query.append('fromUserId', params.fromUserId);
    if (params?.feedbackType) query.append('feedbackType', params.feedbackType);
    if (params?.goalId) query.append('goalId', params.goalId);
    return this.request(`/appraisal/feedbacks?${query.toString()}`);
  }

  async createFeedback(data: any) {
    return this.request('/appraisal/feedbacks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 360-Degree Feedback
  async getFeedback360s(params?: { employeeId?: string; appraisalCycleId?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.appraisalCycleId) query.append('appraisalCycleId', params.appraisalCycleId);
    if (params?.status) query.append('status', params.status);
    return this.request(`/appraisal/feedback-360?${query.toString()}`);
  }

  async createFeedback360(data: any) {
    return this.request('/appraisal/feedback-360', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitPeerFeedback(id: string, feedbackData: any) {
    return this.request(`/appraisal/feedback-360/${id}/peer`, {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  }

  // ==================== DELEGATION (UAM) ====================

  async getDelegations(params?: { delegatorId?: string; delegateeId?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.delegatorId) query.append('delegatorId', params.delegatorId);
    if (params?.delegateeId) query.append('delegateeId', params.delegateeId);
    if (params?.status) query.append('status', params.status);
    return this.request(`/delegations?${query.toString()}`);
  }

  async getDelegation(id: string) {
    return this.request(`/delegations/${id}`);
  }

  async createDelegation(data: {
    delegateeId: string;
    permissions: string[];
    modules?: string[];
    startDate: string;
    endDate: string;
    reason: string;
    requiresApproval?: boolean;
  }) {
    return this.request('/delegations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDelegation(id: string, data: any) {
    return this.request(`/delegations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async approveDelegation(id: string) {
    return this.request(`/delegations/${id}/approve`, {
      method: 'POST',
    });
  }

  async revokeDelegation(id: string, reason?: string) {
    return this.request(`/delegations/${id}/revoke`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // ==================== ACCESS CERTIFICATION (UAM) ====================

  async getCertificationCampaigns(params?: { status?: string; certifierId?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.certifierId) query.append('certifierId', params.certifierId);
    return this.request(`/access-certification/campaigns?${query.toString()}`);
  }

  async getCertificationCampaign(id: string) {
    return this.request(`/access-certification/campaigns/${id}`);
  }

  async createCertificationCampaign(data: {
    campaignName: string;
    campaignType: 'Quarterly' | 'Annual' | 'Ad-hoc';
    startDate: string;
    endDate: string;
    deadline: string;
    certifierId: string;
    userIds: string[];
  }) {
    return this.request('/access-certification/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async certifyUserAccess(campaignId: string, userId: string, data: {
    status: 'Certified' | 'Changes Requested';
    changesRequested?: Array<{
      type: 'Revoke Role' | 'Revoke Permission' | 'Add Role' | 'Add Permission';
      role?: string;
      permission?: string;
      reason: string;
    }>;
    comments?: string;
  }) {
    return this.request(`/access-certification/campaigns/${campaignId}/certify/${userId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async bulkCertify(campaignId: string, userIds: string[], status: 'Certified' | 'Changes Requested') {
    return this.request(`/access-certification/campaigns/${campaignId}/bulk-certify`, {
      method: 'POST',
      body: JSON.stringify({ userIds, status }),
    });
  }

  async getCampaignsDueForReminder() {
    return this.request('/access-certification/campaigns/reminders/due');
  }

  // ==================== ROLE PERMISSIONS (UAM) ====================

  async getRoles() {
    return this.request('/role-permissions');
  }

  async getRole(id: string) {
    return this.request(`/role-permissions/${id}`);
  }

  async createRole(data: { name: string; description?: string; permissions: string[] }) {
    return this.request('/role-permissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRole(id: string, data: { name?: string; description?: string; permissions?: string[] }) {
    return this.request(`/role-permissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRole(id: string) {
    return this.request(`/role-permissions/${id}`, {
      method: 'DELETE',
    });
  }

  async assignRoleToUser(userId: string, roleId: string) {
    return this.request(`/users/${userId}/roles`, {
      method: 'POST',
      body: JSON.stringify({ roleId }),
    });
  }

  async revokeRoleFromUser(userId: string, roleId: string) {
    return this.request(`/users/${userId}/roles/${roleId}`, {
      method: 'DELETE',
    });
  }

  // ==================== ACTIVE DIRECTORY / LDAP (UAM) ====================

  async getLDAPConfig() {
    return this.request('/ldap/config');
  }

  async updateLDAPConfig(data: {
    enabled: boolean;
    serverUrl: string;
    bindDN: string;
    bindPassword: string;
    baseDN: string;
    userSearchBase?: string;
    groupSearchBase?: string;
    sslEnabled?: boolean;
    syncInterval?: number;
  }) {
    return this.request('/ldap/config', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async testLDAPConnection() {
    return this.request('/ldap/test', {
      method: 'POST',
    });
  }

  async syncLDAPUsers() {
    return this.request('/ldap/sync', {
      method: 'POST',
    });
  }

  async getLDAPUsers(params?: { search?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    return this.request(`/ldap/users?${query.toString()}`);
  }

  async mapLDAPRole(ldapGroup: string, systemRole: string) {
    return this.request('/ldap/role-mapping', {
      method: 'POST',
      body: JSON.stringify({ ldapGroup, systemRole }),
    });
  }

  async getLDAPRoleMappings() {
    return this.request('/ldap/role-mapping');
  }

  async deleteLDAPRoleMapping(id: string) {
    return this.request(`/ldap/role-mapping/${id}`, {
      method: 'DELETE',
    });
  }

  async ssoLogin(samlResponse?: string, ldapCredentials?: { username: string; password: string }) {
    return this.request<{
      token: string;
      user: any;
      tenant: any;
    }>('/auth/sso', {
      method: 'POST',
      body: JSON.stringify({ samlResponse, ldapCredentials }),
    });
  }
}

export const apiService = new ApiService();
export default apiService;
