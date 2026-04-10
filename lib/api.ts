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
  // BR-P0-001 Bug 3: Token is now stored in HttpOnly cookie, not localStorage
  // Cookies are automatically sent with requests, no need to manually add Authorization header
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // BR-P0-001 Bug 3: Cookies are automatically sent with credentials: 'include'
    // Keep Authorization header for backward compatibility during migration
    // TODO: Remove after full migration to cookies

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include', // BR-P0-001 Bug 3: Include cookies in requests
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

  // ==================== GENERIC HTTP HELPERS ====================
  // These allow new pages to call any endpoint without defining typed methods.
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // ==================== REPORTS ====================

  async getDashboardStats() {
    return this.request('/reports/dashboard-stats');
  }

  async getComprehensiveReports() {
    return this.request('/reports/comprehensive');
  }

  async getStandardReportTypes() {
    return this.request('/reports/standard-types');
  }

  async generateStandardReport(reportType: string, filters?: Record<string, any>) {
    return this.request('/reports/standard', {
      method: 'POST',
      body: JSON.stringify({ reportType, filters: filters || {} }),
    });
  }

  async getScheduledReports() {
    return this.request('/reports/scheduled');
  }

  async createScheduledReport(data: { reportName: string; reportType: string; frequency: string; recipients?: any[]; format?: string }) {
    return this.request('/reports/scheduled', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateScheduledReport(id: string, data: Partial<{ status: string }>) {
    return this.request(`/reports/scheduled/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ==================== AUTHENTICATION ====================

  async login(email: string, password: string, tenantId?: string) {
    // BR-P0-001 Bug 3: Token is now stored in HttpOnly cookie by backend
    // Still return token in response for backward compatibility during migration
    return this.request<{
      token: string;
      user: any;
      tenant?: any;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, tenantId }),
      credentials: 'include', // Include cookies in request
    });
  }

  // US-A1-02: Forgot Password
  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // US-A1-02: Reset Password
  async resetPassword(token: string, email: string, newPassword: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, email, newPassword }),
    });
  }

  // BR-P0-001 Bug 1: Logout endpoint
  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
      credentials: 'include',
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
    email?: string;
    name?: string;
    employeeId?: string;
    role: string;
    roles?: string[];
    designation?: string;
    department?: string;
    username?: string;
    payrollSubRole?: 'Maker' | 'Checker' | null;
  }) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProvisionableEmployees() {
    return this.request('/users/provisionable-employees');
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

  // ==================== EMPLOYEE BANK ACCOUNTS ====================

  async getEmployeeBankAccounts(employeeId: string) {
    return this.request(`/employees/${employeeId}/bank-accounts`);
  }

  async getBankAccount(employeeId: string, accountId: string) {
    return this.request(`/employees/${employeeId}/bank-accounts/${accountId}`);
  }

  async createBankAccount(employeeId: string, data: any) {
    return this.request(`/employees/${employeeId}/bank-accounts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBankAccount(employeeId: string, accountId: string, data: any) {
    return this.request(`/employees/${employeeId}/bank-accounts/${accountId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBankAccount(employeeId: string, accountId: string) {
    return this.request(`/employees/${employeeId}/bank-accounts/${accountId}`, {
      method: 'DELETE',
    });
  }

  // ==================== EMPLOYEE EMERGENCY CONTACTS ====================

  async getEmployeeEmergencyContacts(employeeId: string) {
    return this.request(`/employees/${employeeId}/emergency-contacts`);
  }

  async createEmergencyContact(employeeId: string, data: any) {
    return this.request(`/employees/${employeeId}/emergency-contacts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmergencyContact(employeeId: string, contactId: string, data: any) {
    return this.request(`/employees/${employeeId}/emergency-contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEmergencyContact(employeeId: string, contactId: string) {
    return this.request(`/employees/${employeeId}/emergency-contacts/${contactId}`, {
      method: 'DELETE',
    });
  }

  // ==================== EMPLOYEE NOMINEES ====================

  async getEmployeeNominees(employeeId: string, nomineeType?: string) {
    const query = nomineeType ? `?nomineeType=${nomineeType}` : '';
    return this.request(`/employees/${employeeId}/nominees${query}`);
  }

  async createNominee(employeeId: string, data: any) {
    return this.request(`/employees/${employeeId}/nominees`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateNominee(employeeId: string, nomineeId: string, data: any) {
    return this.request(`/employees/${employeeId}/nominees/${nomineeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteNominee(employeeId: string, nomineeId: string) {
    return this.request(`/employees/${employeeId}/nominees/${nomineeId}`, {
      method: 'DELETE',
    });
  }

  // ==================== EMPLOYEE PREVIOUS EMPLOYMENTS ====================

  async getEmployeePreviousEmployments(employeeId: string) {
    return this.request(`/employees/${employeeId}/previous-employments`);
  }

  async createPreviousEmployment(employeeId: string, data: any) {
    return this.request(`/employees/${employeeId}/previous-employments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePreviousEmployment(employeeId: string, employmentId: string, data: any) {
    return this.request(`/employees/${employeeId}/previous-employments/${employmentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePreviousEmployment(employeeId: string, employmentId: string) {
    return this.request(`/employees/${employeeId}/previous-employments/${employmentId}`, {
      method: 'DELETE',
    });
  }

  // ==================== EMPLOYEE FAMILY DETAILS ====================

  async getEmployeeFamilyDetails(employeeId: string) {
    return this.request(`/family-members/${employeeId}`);
  }

  // ==================== BULK EMPLOYEE IMPORT/EXPORT (BR-P0-006) ====================

  async downloadImportTemplate() {
    const response = await fetch(`${API_BASE_URL}/employees/bulk/template`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to download template');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee-import-template.xlsx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true };
  }

  async validateBulkImport(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/employees/bulk/validate`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Validation failed',
        error: data.error,
      };
    }

    return {
      success: true,
      data: data.data,
    };
  }

  async bulkImportEmployees(filePath: string, importValidOnly: boolean = true) {
    return this.request('/employees/bulk/import', {
      method: 'POST',
      body: JSON.stringify({ filePath, importValidOnly }),
    });
  }

  async bulkExportEmployees(params: {
    exportType?: 'complete' | 'basic' | 'statutory' | 'payroll';
    department?: string;
    status?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/employees/bulk/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        message: error.message || 'Export failed',
        error: error.error,
      };
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees-export-${Date.now()}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true };
  }

  async getFamilyDetails(employeeId: string) {
    return this.request(`/employees/${employeeId}/family-details`);
  }

  async upsertFamilyDetails(employeeId: string, data: any) {
    return this.request(`/employees/${employeeId}/family-details`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFamilyDetails(employeeId: string, data: any) {
    return this.request(`/employees/${employeeId}/family-details`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFamilyDetails(employeeId: string) {
    return this.request(`/employees/${employeeId}/family-details`, {
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

  // ==================== COMP-OFF (BR-P1-003) ====================

  async getCompOffs(params?: { employeeId?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.status) query.append('status', params.status);
    return this.request(`/comp-off?${query.toString()}`);
  }

  async requestCompOff(data: { workedDate: string; workedHours: number; reason: string }) {
    return this.request('/comp-off/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveCompOff(id: string) {
    return this.request(`/comp-off/${id}/approve`, {
      method: 'PATCH',
    });
  }

  async availCompOff(id: string, availDate: string) {
    return this.request(`/comp-off/${id}/avail`, {
      method: 'POST',
      body: JSON.stringify({ availDate }),
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

  async getJobs(params?: { status?: string; department?: string; postingUnitId?: string; jobType?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.department) query.append('department', params.department);
    if (params?.postingUnitId) query.append('postingUnitId', params.postingUnitId);
    if (params?.jobType) query.append('jobType', params.jobType);

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

  // ==================== PROMOTIONS ====================
  async getPromotions(params?: {
    employeeId?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    postingUnitId?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.status) query.append('status', params.status);
    if (params?.fromDate) query.append('fromDate', params.fromDate);
    if (params?.toDate) query.append('toDate', params.toDate);
    if (params?.postingUnitId) query.append('postingUnitId', params.postingUnitId);
    return this.request(`/promotions?${query.toString()}`);
  }

  async getPromotion(id: string) {
    return this.request(`/promotions/${id}`);
  }

  async createPromotion(data: {
    employeeId: string;
    promotionType: string;
    newDesignation: string;
    newGrade?: string;
    newSalary?: number;
    newDepartment?: string;
    effectiveDate: string;
    justification: string;
    newPostingUnitId?: string;
    includesTransfer?: boolean;
    newLocation?: string;
  }) {
    return this.request('/promotions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approvePromotion(id: string, comments?: string) {
    return this.request(`/promotions/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    });
  }

  async rejectPromotion(id: string, reason: string) {
    return this.request(`/promotions/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async generatePromotionLetter(id: string) {
    return this.request(`/promotions/${id}/letter`, { method: 'GET' });
  }

  async getEmployeePromotionHistory(employeeId: string) {
    return this.request(`/promotions/employee/${employeeId}`);
  }

  // ==================== POSITIONS ====================
  async getPositions(params?: {
    status?: string;
    postingUnitId?: string;
    designation?: string;
    department?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.postingUnitId) query.append('postingUnitId', params.postingUnitId);
    if (params?.designation) query.append('designation', params.designation);
    if (params?.department) query.append('department', params.department);
    return this.request(`/positions?${query.toString()}`);
  }

  async getPosition(id: string) {
    return this.request(`/positions/${id}`);
  }

  async createPosition(data: {
    positionCode: string;
    title: string;
    designation: string;
    grade?: string;
    department: string;
    postingUnitId: string;
    locationId?: string;
    reportingManagerId?: string;
    minExperience?: number;
    minSalary?: number;
    maxSalary?: number;
    description?: string;
    requirements?: string;
  }) {
    return this.request('/positions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async fillPosition(id: string, data: {
    employeeId: string;
    startDate: string;
    reason?: string;
  }) {
    return this.request(`/positions/${id}/fill`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async vacatePosition(id: string, data: {
    endDate?: string;
    reason?: string;
  }) {
    return this.request(`/positions/${id}/vacate`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getVacantPositionsByBranch(branchId?: string) {
    const query = branchId ? `?branchId=${branchId}` : '';
    return this.request(`/positions/vacant/by-branch${query}`);
  }

  async getBranchPositionSummary(branchId?: string) {
    const query = branchId ? `?branchId=${branchId}` : '';
    return this.request(`/positions/summary/by-branch${query}`);
  }

  // ==================== BRANCH REPORTS ====================
  async getBranchReport(branchId: string, params?: { fromDate?: string; toDate?: string }) {
    const query = new URLSearchParams();
    if (params?.fromDate) query.append('fromDate', params.fromDate);
    if (params?.toDate) query.append('toDate', params.toDate);
    const queryString = query.toString();
    return this.request(`/reports/branch/${branchId}${queryString ? `?${queryString}` : ''}`);
  }

  async compareBranches(branchIds: string[], params?: { fromDate?: string; toDate?: string }) {
    const query = new URLSearchParams();
    branchIds.forEach((id) => query.append('branchIds', id));
    if (params?.fromDate) query.append('fromDate', params.fromDate);
    if (params?.toDate) query.append('toDate', params.toDate);
    return this.request(`/reports/branch/compare?${query.toString()}`);
  }

  async getAllBranchesSummary() {
    return this.request('/reports/branch/summary/all');
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

  // ==================== DESIGNATIONS (Spec C1-01) ====================

  async getDesignations(params?: { status?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    return this.request(`/designations?${query.toString()}`);
  }

  async getActiveDesignations() {
    return this.request('/designations?status=Active');
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

  // ==================== LOCATIONS (Spec C1-02) ====================

  async getLocations(params?: { status?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    return this.request(`/locations?${query.toString()}`);
  }

  async getActiveLocations() {
    return this.request('/locations/active');
  }

  async getLocation(id: string) {
    return this.request(`/locations/${id}`);
  }

  async createLocation(data: any) {
    return this.request('/locations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLocation(id: string, data: any) {
    return this.request(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLocation(id: string) {
    return this.request(`/locations/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== GRADES (Spec C1-03) ====================

  async getGrades(params?: { status?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    return this.request(`/grades?${query.toString()}`);
  }

  async getActiveGrades() {
    return this.request('/grades/active');
  }

  async getGrade(id: string) {
    return this.request(`/grades/${id}`);
  }

  async createGrade(data: any) {
    return this.request('/grades', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGrade(id: string, data: any) {
    return this.request(`/grades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGrade(id: string) {
    return this.request(`/grades/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== ORGANIZATION UNITS ====================

  async getOrganizationHierarchy() {
    return this.request('/org/hierarchy');
  }

  async getOrganizationUnits(params?: {
    type?: 'HO' | 'ZO' | 'RO' | 'BRANCH';
    isActive?: boolean;
    parentUnitId?: string;
    city?: string;
    state?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.isActive !== undefined) query.append('isActive', String(params.isActive));
    if (params?.parentUnitId) query.append('parentUnitId', params.parentUnitId);
    if (params?.city) query.append('city', params.city);
    if (params?.state) query.append('state', params.state);
    return this.request(`/org/units?${query.toString()}`);
  }

  async getOrganizationUnit(id: string) {
    return this.request(`/org/units/${id}`);
  }

  async getOrganizationUnitChildren(id: string) {
    return this.request(`/org/units/${id}/children`);
  }
  async getUnitChildren(id: string) {
    return this.request(`/org/units/${id}/children`);
  }

  async getUnitEmployees(id: string) {
    return this.request(`/org/units/${id}/employees`);
  }

  async createOrganizationUnit(data: {
    unitCode: string;
    unitName: string;
    unitType: 'HO' | 'ZO' | 'RO' | 'BRANCH' | 'DEPARTMENT';
    parentUnitId?: string;
    unitHeadId?: string;
    state?: string;
    city?: string;
    address?: string;
    pinCode?: string;
    isActive?: boolean;
    branchCode?: string;
    branchType?: 'Urban' | 'Semi-Urban' | 'Rural';
    openingDate?: string;
    headquartersCity?: string;
    effectiveDate?: string;
  }) {
    return this.request('/org/units', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrganizationUnit(id: string, data: {
    unitCode?: string;
    unitName?: string;
    unitType?: 'HO' | 'ZO' | 'RO' | 'BRANCH' | 'DEPARTMENT';
    parentUnitId?: string;
    unitHeadId?: string;
    state?: string;
    city?: string;
    address?: string;
    pinCode?: string;
    isActive?: boolean;
    branchCode?: string;
    branchType?: 'Urban' | 'Semi-Urban' | 'Rural';
    openingDate?: string;
    headquartersCity?: string;
    effectiveDate?: string;
  }) {
    return this.request(`/org/units/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteOrganizationUnit(id: string) {
    return this.request(`/org/units/${id}`, {
      method: 'DELETE',
    });
  }
  async mergeOrganizationUnits(sourceUnitId: string, targetUnitId: string) {
    return this.request(`/org/units/${sourceUnitId}/merge`, {
      method: 'POST',
      body: JSON.stringify({ targetUnitId }),
    });
  }
  async getOrganizationHierarchy() {
    return this.request('/org/hierarchy');
  }
  async seedOrganizationSampleData() {
    return this.request('/org/units/seed', {
      method: 'POST',
    });
  }
  async deleteSeedData() {
    return this.request('/org/units/seed', {
      method: 'DELETE',
    });
  }

  // ==================== EMPLOYEE TRANSFERS ====================
  async createEmployeeTransfer(data: {
    employeeId: string;
    toUnitId: string;
    transferType?: 'Permanent' | 'Temporary' | 'Deputation';
    effectiveDate: string;
    reason?: string;
    remarks?: string;
    isTemporary?: boolean;
    temporaryEndDate?: string;
  }) {
    return this.request('/employee-transfers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async getEmployeeTransfers(params?: {
    status?: string;
    employeeId?: string;
    fromUnitId?: string;
    toUnitId?: string;
    transferType?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.fromUnitId) query.append('fromUnitId', params.fromUnitId);
    if (params?.toUnitId) query.append('toUnitId', params.toUnitId);
    if (params?.transferType) query.append('transferType', params.transferType);
    return this.request(`/employee-transfers?${query.toString()}`);
  }
  async getEmployeeTransfer(id: string) {
    return this.request(`/employee-transfers/${id}`);
  }
  async approveEmployeeTransfer(id: string) {
    return this.request(`/employee-transfers/${id}/approve`, { method: 'POST' });
  }
  async rejectEmployeeTransfer(id: string, rejectionReason: string) {
    return this.request(`/employee-transfers/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason }),
    });
  }
  async getEmployeeTransferHistory(employeeId: string) {
    return this.request(`/employee-transfers/employee/${employeeId}`);
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

  async getTenants() {
    return this.request('/tenants');
  }

  async getCurrentTenant() {
    return this.request('/tenants/current');
  }

  // US-A2-02: Platform Admin approval workflow
  async approveTenant(tenantId: string) {
    return this.request(`/tenants/${tenantId}/approve`, {
      method: 'POST',
    });
  }

  async rejectTenant(tenantId: string, reason: string) {
    return this.request(`/tenants/${tenantId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async suspendTenant(tenantId: string, reason: string) {
    return this.request(`/tenants/${tenantId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async deactivateTenant(tenantId: string, reason: string) {
    return this.request(`/tenants/${tenantId}/deactivate`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async reactivateTenant(tenantId: string) {
    return this.request(`/tenants/${tenantId}/reactivate`, {
      method: 'POST',
    });
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

  async deleteTenant(tenantId: string) {
    return this.request(`/tenants/${tenantId}`, {
      method: 'DELETE',
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

    return this.request(`/tax/declarations?${query.toString()}`);
  }

  async getTaxDeclaration(id: string) {
    return this.request(`/tax/declarations/${id}`);
  }

  async createTaxDeclaration(data: any) {
    return this.request('/tax/declarations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTaxDeclarationStatus(id: string, data: any) {
    return this.request(`/tax/declarations/${id}/status`, {
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

  async createOfferLetter(data: { candidateId: string;[key: string]: any }) {
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
  async getNormalizationPreview(params: { appraisalCycleId: string; departmentId?: string; departmentName?: string }) {
    const query = new URLSearchParams();
    query.append('appraisalCycleId', params.appraisalCycleId);
    if (params?.departmentId) query.append('departmentId', params.departmentId);
    if (params?.departmentName) query.append('departmentName', params.departmentName);
    return this.request(`/appraisal/normalizations/preview?${query.toString()}`);
  }

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

  // ==================== LOAN TYPES (MASTER DATA) ====================

  async getLoanTypes(params?: { isActive?: boolean }) {
    const query = new URLSearchParams();
    if (params?.isActive !== undefined) query.append('isActive', String(params.isActive));
    return this.request(`/loan-types?${query.toString()}`);
  }

  async getLoanType(id: string) {
    return this.request(`/loan-types/${id}`);
  }

  async createLoanType(data: Record<string, unknown>) {
    return this.request('/loan-types', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLoanType(id: string, data: Record<string, unknown>) {
    return this.request(`/loan-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLoanType(id: string) {
    return this.request(`/loan-types/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== WORKFLOW RULES (APPROVAL MASTER) ====================

  async getWorkflowRules() {
    return this.request('/workflow-rules');
  }

  async createWorkflowRule(data: Record<string, unknown>) {
    return this.request('/workflow-rules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWorkflowRule(id: string, data: Record<string, unknown>) {
    return this.request(`/workflow-rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWorkflowRule(id: string) {
    return this.request(`/workflow-rules/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== REIMBURSEMENT CATEGORIES (MASTER) ====================

  async getReimbursementCategories(params?: { isActive?: string }) {
    const q = new URLSearchParams();
    if (params?.isActive != null) q.append('isActive', params.isActive);
    const qs = q.toString();
    return this.request(`/reimbursement-categories${qs ? `?${qs}` : ''}`);
  }

  async createReimbursementCategory(data: Record<string, unknown>) {
    return this.request('/reimbursement-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReimbursementCategory(id: string, data: Record<string, unknown>) {
    return this.request(`/reimbursement-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteReimbursementCategory(id: string) {
    return this.request(`/reimbursement-categories/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== EMPLOYEE LOANS ====================

  async applyForLoan(data: {
    loanTypeId: string;
    appliedAmount: number;
    tenureMonths: number;
    remarks?: string;
  }) {
    return this.request('/loans/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyLoans() {
    return this.request('/loans/my-loans');
  }

  async getLoanDetails(id: string) {
    return this.request(`/loans/${id}`);
  }

  async getLoanSchedule(id: string) {
    return this.request(`/loans/${id}/schedule`);
  }

  async getApprovalQueue() {
    return this.request('/loans/approve-queue');
  }

  async approveLoan(id: string, data: {
    action: 'APPROVED' | 'REJECTED';
    remarks?: string;
    sanctionedAmount?: number;
  }) {
    return this.request(`/loans/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async disburseLoan(id: string) {
    return this.request(`/loans/${id}/disburse`, {
      method: 'PATCH',
    });
  }

  async getAllLoans(params?: {
    status?: string;
    loanTypeId?: string;
    employeeId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    skip?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.loanTypeId) query.append('loanTypeId', params.loanTypeId);
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.skip) query.append('skip', String(params.skip));
    return this.request(`/loans/admin?${query.toString()}`);
  }

  // ==================== EXIT MANAGEMENT ====================

  async submitResignation(data: {
    separationType: string;
    resignationDate?: string;
    lastWorkingDate: string;
    noticePeriodDays?: number;
    resignationReason?: string;
    resignationLetterUrl?: string;
  }) {
    return this.request('/exit/resign', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMySeparation() {
    return this.request('/exit/my-separation');
  }

  async getSeparation(id: string) {
    return this.request(`/exit/${id}`);
  }

  async acceptResignation(id: string, data: {
    acceptedDate?: string;
    hrRemarks?: string;
  }) {
    return this.request(`/exit/${id}/accept`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getClearances(id: string) {
    return this.request(`/exit/${id}/clearances`);
  }

  async markClearance(id: string, department: string, data: {
    status: 'CLEARED' | 'WAIVED';
    remarks?: string;
    checklistItems?: any[];
  }) {
    return this.request(`/exit/${id}/clearance/${department}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async calculateFnf(id: string) {
    return this.request(`/exit/${id}/fnf`);
  }

  async createFnfSettlement(id: string) {
    return this.request(`/exit/${id}/fnf`, {
      method: 'POST',
    });
  }

  async approveFnfSettlement(id: string, data: {
    remarks?: string;
  }) {
    return this.request(`/exit/${id}/fnf/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async markFnfPaid(id: string, data: {
    paidDate?: string;
    paymentMode?: string;
    paymentReference?: string;
  }) {
    return this.request(`/exit/${id}/fnf/pay`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getAllExits(params?: {
    status?: string;
    separationType?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.separationType) query.append('separationType', params.separationType);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    return this.request(`/exit/admin/all?${query.toString()}`);
  }

  // ==================== MODULE MANAGEMENT ====================
  // BRD: Dynamic Module Management System

  // Platform Admin APIs
  async getAllPlatformModules(params?: { category?: string; isActive?: boolean }) {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.isActive !== undefined) query.append('isActive', String(params.isActive));
    return this.request(`/platform/modules?${query.toString()}`);
  }

  async getCompanyModules(tenantId: string, includeInactive?: boolean) {
    const query = includeInactive ? '?includeInactive=true' : '';
    return this.request(`/platform/companies/${tenantId}/modules${query}`);
  }

  async enableModule(tenantId: string, moduleId: string, data: {
    pricingModel?: string;
    monthlyCost?: number;
    userLimit?: number;
    moduleConfig?: any;
    trialDays?: number;
  }) {
    return this.request(`/platform/companies/${tenantId}/modules/${moduleId}/enable`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async disableModule(tenantId: string, moduleId: string, reason: string) {
    return this.request(`/platform/companies/${tenantId}/modules/${moduleId}/disable`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getModuleRequests(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/platform/module-requests${query}`);
  }

  /** Company Admin: Get my tenant's module requests */
  async getCompanyModuleRequests(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/company/module-requests${query}`);
  }

  async approveModuleRequest(requestId: string, customPricing?: any) {
    return this.request(`/platform/module-requests/${requestId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ customPricing }),
    });
  }

  async rejectModuleRequest(requestId: string, rejectionReason: string) {
    return this.request(`/platform/module-requests/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason }),
    });
  }

  async applySubscriptionPackage(tenantId: string, packageId: string) {
    return this.request(`/platform/companies/${tenantId}/subscription/package`, {
      method: 'POST',
      body: JSON.stringify({ packageId }),
    });
  }

  // Platform Admin - Subscription Packages CRUD
  async getSubscriptionPackages() {
    return this.request('/platform-admin/subscription-packages');
  }
  async getSubscriptionPackage(id: string) {
    return this.request(`/platform-admin/subscription-packages/${id}`);
  }
  async createSubscriptionPackage(data: any) {
    return this.request('/platform-admin/subscription-packages', { method: 'POST', body: JSON.stringify(data) });
  }
  async updateSubscriptionPackage(id: string, data: any) {
    return this.request(`/platform-admin/subscription-packages/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async deleteSubscriptionPackage(id: string) {
    return this.request(`/platform-admin/subscription-packages/${id}`, { method: 'DELETE' });
  }
  async archiveSubscriptionPackage(id: string) {
    return this.request(`/platform-admin/subscription-packages/${id}/archive`, { method: 'POST' });
  }

  // Platform Admin - Create/Update Platform Modules
  async createPlatformModule(data: any) {
    return this.request('/platform-admin/modules', { method: 'POST', body: JSON.stringify(data) });
  }
  async updatePlatformModule(id: string, data: any) {
    return this.request(`/platform-admin/modules/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  // Platform Admin - Integrations
  async getIntegrations() {
    return this.request('/platform-admin/integrations');
  }
  async updateIntegration(id: string, data: { isEnabled?: boolean; config?: Record<string, any> }) {
    return this.request(`/platform-admin/integrations/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async testIntegrationConnection(id: string) {
    return this.request(`/platform-admin/integrations/${id}/test-connection`, { method: 'POST' });
  }
  async getIntegrationHealth() {
    return this.request('/platform-admin/integrations/health');
  }

  // Platform Admin - Settings
  async getPlatformSettings() {
    return this.request('/platform-admin/settings');
  }
  async updatePlatformSettings(data: Record<string, any>) {
    return this.request('/platform-admin/settings', { method: 'PUT', body: JSON.stringify(data) });
  }

  // Platform Admin - Analytics
  async getPlatformAnalytics() {
    return this.request('/platform-admin/analytics');
  }
  async exportAnalyticsReport(params: { format?: 'csv' | 'pdf'; timeRange?: string; filters?: any }) {
    const query = new URLSearchParams();
    if (params.format) query.append('format', params.format);
    if (params.timeRange) query.append('timeRange', params.timeRange);
    const response = await fetch(`${API_BASE_URL}/platform-admin/analytics/export?${query.toString()}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Export failed');
    return {
      success: true,
      data: params.format === 'csv' ? await response.text() : await response.blob(),
    };
  }

  // Platform Admin - Create Tenant (same as register-tenant: creates tenant + Tenant Admin user)
  async createTenant(data: {
    name: string;
    code: string;
    location?: string;
    adminEmail: string;
    adminPassword: string;
    adminName?: string;
    bank_id?: string;
    bank_code?: string;
    bank_name?: string;
    short_name?: string;
    registration_no?: string;
    rbi_license_no?: string;
    registered_office?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pin?: string;
    phone?: string;
    email?: string;
    website?: string;
  }) {
    return this.request('/tenants', { method: 'POST', body: JSON.stringify(data) });
  }

  // Company Admin APIs
  async getMyCompanyModules() {
    return this.request('/company/modules');
  }

  /** Enabled module codes for current tenant; any logged-in tenant user. */
  async getMyEnabledModuleCodes() {
    return this.request<{ codes: string[] }>('/company/enabled-module-codes');
  }

  async requestModuleActivation(data: {
    moduleId: string;
    requestType: string;
    businessJustification: string;
    expectedUsers?: number;
    trialRequested?: boolean;
  }) {
    return this.request('/company/module-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAvailableModules() {
    return this.request('/company/available-modules');
  }

  // Common APIs
  async checkModuleAccess(moduleCode: string) {
    return this.request(`/modules/check/${moduleCode}`);
  }

  // ==================== ATTENDANCE ENHANCEMENTS (BR-P1-002) ====================

  // Shift Management
  async getShifts() {
    return this.request('/shifts');
  }

  async createShift(data: any) {
    return this.request('/shifts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateShift(id: string, data: any) {
    return this.request(`/shifts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async assignShift(data: { employeeId: string; shiftId: string; effectiveDate: string }) {
    return this.request('/shifts/assign', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getEmployeeShift(employeeId: string) {
    return this.request(`/shifts/employee/${employeeId}`);
  }

  async getShiftRoster(params?: { startDate?: string; endDate?: string; department?: string }) {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.department) query.append('department', params.department);
    return this.request(`/shifts/roster?${query.toString()}`);
  }

  // Overtime Management
  async requestOvertime(data: { date: string; requestedHours: number; reason: string; otType?: string }) {
    return this.request('/overtime/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveOvertime(id: string, data: { approvedHours?: number; remarks?: string }) {
    return this.request(`/overtime/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getOvertime(params?: { employeeId?: string; status?: string; startDate?: string; endDate?: string }) {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.status) query.append('status', params.status);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    return this.request(`/overtime?${query.toString()}`);
  }

  async autoDetectOvertime(data: { date: string; employeeIds?: string[] }) {
    return this.request('/overtime/auto-detect', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Profile Update Requests (ESS - BR-P2-005)
  async getProfileUpdateRequests(params?: { employeeId?: string; status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    return this.request(`/profile-update-requests?${query.toString()}`);
  }

  async getProfileUpdateRequest(id: string) {
    return this.request(`/profile-update-requests/${id}`);
  }

  async createProfileUpdateRequest(data: { requestType?: string; requestedFields: { field: string; requestedValue: any; label?: string }[]; reason?: string }) {
    return this.request('/profile-update-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async reviewProfileUpdateRequest(id: string, data: { action: 'Approved' | 'Rejected'; reviewComments?: string }) {
    return this.request(`/profile-update-requests/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Biometric Integration
  async syncBiometricPunches(punches: any[]) {
    return this.request('/biometric/sync', {
      method: 'POST',
      body: JSON.stringify({ punches }),
    });
  }

  async processBiometricPunches(data: { startDate: string; endDate: string; employeeIds?: string[] }) {
    return this.request('/biometric/process', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBiometricPunches(params?: { employeeId?: string; startDate?: string; endDate?: string }) {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    return this.request(`/biometric/punches?${query.toString()}`);
  }

  // Weekly Off Configuration
  async getWeeklyOff(params?: { employeeId?: string; department?: string; location?: string }) {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.department) query.append('department', params.department);
    if (params?.location) query.append('location', params.location);
    return this.request(`/weekly-off?${query.toString()}`);
  }

  async createWeeklyOff(data: any) {
    return this.request('/weekly-off', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWeeklyOff(id: string, data: any) {
    return this.request(`/weekly-off/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWeeklyOff(id: string) {
    return this.request(`/weekly-off/${id}`, {
      method: 'DELETE',
    });
  }

  async getEmployeeWeeklyOffCalendar(employeeId: string, params?: { startDate?: string; endDate?: string }) {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    return this.request(`/weekly-off/employee/${employeeId}/calendar?${query.toString()}`);
  }

  // ==================== LEAVE ENHANCEMENTS (BR-P1-003) ====================

  // Holiday Calendar
  async getHolidayCalendar(params?: { year?: number; location?: string }) {
    const query = new URLSearchParams();
    if (params?.year) query.append('year', params.year.toString());
    if (params?.location) query.append('location', params.location);
    return this.request(`/holiday-calendar?${query.toString()}`);
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

  // ==================== LMS (BR-P1-005) ====================

  async getCourses(params?: { category?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.status) query.append('status', params.status);
    return this.request(`/lms/courses?${query.toString()}`);
  }

  async createCourse(data: any) {
    return this.request('/lms/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async assignTraining(data: { employeeIds: string[]; courseId: string; dueDate?: string; trainingEndDate?: string; priority?: string }) {
    const body: any = { ...data };
    if (data.trainingEndDate) body.trainingEndDate = data.trainingEndDate;
    else if (data.dueDate) body.trainingEndDate = data.dueDate;
    return this.request('/lms/assign', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getMyTrainings(params?: { status?: string; category?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.category) query.append('category', params.category);
    return this.request(`/lms/my-trainings?${query.toString()}`);
  }

  async updateTrainingProgress(assignmentId: string, data: { progress: number; completed?: boolean; notes?: string }) {
    return this.request(`/lms/assignments/${assignmentId}/progress`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getTrainingCalendar(params?: { startDate?: string; endDate?: string }) {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    return this.request(`/lms/calendar?${query.toString()}`);
  }

  async createTrainingCalendar(data: any) {
    return this.request('/lms/calendar', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCertificates(params?: { employeeId?: string; courseId?: string }) {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.courseId) query.append('courseId', params.courseId);
    return this.request(`/lms/certificates?${query.toString()}`);
  }

  // ==================== TRANSFER MANAGEMENT (BR-P2-003) ====================

  async submitTransferRequest(data: any) {
    return this.request('/transfers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTransferRequests(params?: { status?: string; employeeId?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    return this.request(`/transfers?${query.toString()}`);
  }

  async getTransferRequest(id: string) {
    return this.request(`/transfers/${id}`);
  }

  async currentManagerApproval(id: string, data: { approved: boolean; recommendation?: string; rejectionReason?: string }) {
    return this.request(`/transfers/${id}/current-manager-approval`, {
      method: 'PATCH',
      body: JSON.stringify({
        action: data.approved ? 'APPROVE' : 'REJECT',
        recommendation: data.recommendation,
        rejectionReason: data.rejectionReason,
      }),
    });
  }

  async destinationManagerApproval(id: string, data: { approved: boolean; acceptance?: string; rejectionReason?: string }) {
    return this.request(`/transfers/${id}/destination-manager-approval`, {
      method: 'PATCH',
      body: JSON.stringify({
        action: data.approved ? 'APPROVE' : 'REJECT',
        acceptance: data.acceptance,
        rejectionReason: data.rejectionReason,
      }),
    });
  }

  async hrVerification(id: string, data: { verified?: boolean; availabilityConfirmed?: boolean; remarks?: string; approvedLocation?: any; approvedRelievingDate?: string; approvedJoiningDate?: string }) {
    const verified = data.verified ?? data.availabilityConfirmed ?? true;
    return this.request(`/transfers/${id}/hr-verification`, {
      method: 'PATCH',
      body: JSON.stringify({
        availabilityConfirmed: verified,
        remarks: data.remarks,
        approvedLocation: data.approvedLocation,
        approvedRelievingDate: data.approvedRelievingDate,
        approvedJoiningDate: data.approvedJoiningDate,
      }),
    });
  }

  async generateTransferOrder(id: string) {
    return this.request(`/transfers/${id}/generate-order`, {
      method: 'POST',
    });
  }

  async markRelieved(id: string, data: { relievedDate: string; remarks?: string }) {
    return this.request(`/transfers/${id}/relieve`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async markJoined(id: string, data: { joinedDate: string; remarks?: string }) {
    return this.request(`/transfers/${id}/join`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ==================== GRIEVANCE MANAGEMENT (BR-P1-004) ====================

  async submitGrievance(data: {
    category: string;
    subCategory?: string;
    subject: string;
    description: string;
    incidentDate?: string;
    incidentLocation?: string;
    witnesses?: Array<{ name: string; employeeCode?: string; contact?: string }>;
    documents?: Array<{ name: string; type: string; url: string }>;
    preferredResolution?: string;
    confidentialityRequired?: boolean;
    anonymousSubmission?: boolean;
  }) {
    return this.request('/grievances', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyGrievances(params?: { status?: string; category?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.category) query.append('category', params.category);
    return this.request(`/grievances/my-grievances?${query.toString()}`);
  }

  async getGrievance(id: string) {
    return this.request(`/grievances/${id}`);
  }

  async getAllGrievances(params?: {
    status?: string;
    category?: string;
    severity?: string;
    assignedTo?: string;
    slaStatus?: string;
    department?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.category) query.append('category', params.category);
    if (params?.severity) query.append('severity', params.severity);
    if (params?.assignedTo) query.append('assignedTo', params.assignedTo);
    if (params?.slaStatus) query.append('slaStatus', params.slaStatus);
    if (params?.department) query.append('department', params.department);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return this.request(`/grievances?${query.toString()}`);
  }

  async assignGrievance(id: string, data: { assignedTo: string; assignedDepartment?: string; severity?: string }) {
    return this.request(`/grievances/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async addGrievanceComment(id: string, comment: string, isInternal: boolean = false) {
    return this.request(`/grievances/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment, isInternal }),
    });
  }

  async proposeResolution(id: string, data: { resolutionDetails: string; actionTaken: string }) {
    return this.request(`/grievances/${id}/resolution`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveResolution(id: string, implementationDate?: string) {
    return this.request(`/grievances/${id}/resolution/approve`, {
      method: 'POST',
      body: JSON.stringify({ implementationDate }),
    });
  }

  async submitGrievanceFeedback(id: string, satisfactionRating: number, feedback?: string) {
    return this.request(`/grievances/${id}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ satisfactionRating, feedback }),
    });
  }

  async getGrievanceDashboardStats() {
    return this.request('/grievances/dashboard/stats');
  }

  // ==================== PERFORMANCE APPRAISAL (BR-P1-001) ====================

  async getAppraisalCycles() {
    return this.request('/performance/cycles');
  }

  async createAppraisalCycle(data: {
    cycleName: string;
    cycleType: string;
    startDate: string;
    endDate: string;
    selfAssessmentDeadline: string;
    managerReviewDeadline: string;
    normalizationDeadline: string;
    applicableTo: string;
    applicableDepartments?: string[];
    applicableGrades?: string[];
  }) {
    return this.request('/performance/cycles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async activateAppraisalCycle(cycleId: string) {
    return this.request(`/performance/cycles/${cycleId}/activate`, {
      method: 'PATCH',
    });
  }

  async getMyAppraisal(cycleId?: string) {
    const query = cycleId ? `?cycleId=${cycleId}` : '';
    return this.request(`/performance/my-appraisal${query}`);
  }

  async submitSelfAssessment(appraisalId: string, data: {
    competencyRatings: Record<string, number>;
    trainingNeeds?: Array<{ skill: string; program: string; priority: string }>;
    careerAspirations?: { goals: string; preferredPath: string };
    achievements?: string;
    challengesFaced?: string;
    overallComments?: string;
    goalAchievements?: Array<{ goalId: string; achievement: number }>;
  }) {
    return this.request(`/performance/${appraisalId}/self-assessment`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getManagerAppraisals(params?: { cycleId?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.cycleId) query.append('cycleId', params.cycleId);
    if (params?.status) query.append('status', params.status);
    return this.request(`/performance/manager/appraisals?${query.toString()}`);
  }

  async submitManagerReview(appraisalId: string, data: {
    competencyRatings: Record<string, number>;
    overallPerformanceRating: number;
    strengths?: string;
    developmentAreas?: string;
    developmentPlan?: string;
    trainingRecommendations?: string[];
    promotionRecommendation?: boolean;
    retentionRisk?: boolean;
    incrementRecommendation?: { percentage: number; justification: string };
    commentsToEmployee?: string;
    goalRatings?: Array<{ goalId: string; achievement: number }>;
  }) {
    return this.request(`/performance/${appraisalId}/manager-review`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async normalizeRatings(data: {
    cycleId: string;
    department?: string;
    adjustments: Array<{ appraisalId: string; normalizedRating: number; justification?: string }>;
  }) {
    return this.request('/performance/normalize', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAllAppraisals(params?: {
    cycleId?: string;
    status?: string;
    department?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.cycleId) query.append('cycleId', params.cycleId);
    if (params?.status) query.append('status', params.status);
    if (params?.department) query.append('department', params.department);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return this.request(`/performance/admin/all?${query.toString()}`);
  }

  // ==================== PLATFORM ADMIN: INTEGRATIONS ====================

  async getIntegrations() {
    return this.request('/platform-admin/integrations');
  }

  async updateIntegration(id: string, data: { isEnabled?: boolean; config?: Record<string, any> }) {
    return this.request(`/platform-admin/integrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ==================== PLATFORM ADMIN: SETTINGS ====================

  async getPlatformSettings() {
    return this.request('/platform-admin/settings');
  }

  async updatePlatformSettings(data: {
    billingCycle?: string;
    autoRenew?: boolean;
    currency?: string;
    whitelabelEnabled?: boolean;
    appName?: string;
    supportEmail?: string;
    [key: string]: any;
  }) {
    return this.request('/platform-admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ==================== PLATFORM ADMIN: AUDIT LOGS ====================

  async getPlatformAuditLogs(params?: {
    module?: string;
    action?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.module) query.append('module', params.module);
    if (params?.action) query.append('action', params.action);
    if (params?.status) query.append('status', params.status);
    if (params?.dateFrom) query.append('dateFrom', params.dateFrom);
    if (params?.dateTo) query.append('dateTo', params.dateTo);
    if (params?.search) query.append('search', params.search);
    return this.request(`/platform-admin/audit-logs?${query.toString()}`);
  }

  async exportPlatformAuditLogs(params?: {
    module?: string;
    action?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.module) query.append('module', params.module);
    if (params?.action) query.append('action', params.action);
    if (params?.status) query.append('status', params.status);
    if (params?.dateFrom) query.append('dateFrom', params.dateFrom);
    if (params?.dateTo) query.append('dateTo', params.dateTo);
    return this.request(`/platform-admin/audit-logs/export?${query.toString()}`);
  }
}

export const apiService = new ApiService();
export default apiService;
