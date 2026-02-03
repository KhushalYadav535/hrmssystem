// Type definitions for HRMS System

export type UserRole = 
  | 'Super Admin' 
  | 'Tenant Admin' 
  | 'HR Administrator' 
  | 'Payroll Administrator'
  | 'Finance Administrator'
  | 'Manager' 
  | 'Employee'
  | 'Auditor';

export interface Tenant {
  id: string;
  name: string;
  code: string;
  location: string;
  employees: number;
  status: 'active' | 'inactive';
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  designation: string;
  department: string;
  status: 'active' | 'inactive';
  joinDate: string;
  avatar: string;
}

export interface Employee {
  id: string;
  tenantId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  status: 'Active' | 'Inactive' | 'On Leave' | 'Retired';
  joinDate: string;
  designation: string;
  department: string;
  reportingManager: string;
  location: string;
  salary: number;
  ctc: number;
  pfNumber: string;
  esiNumber: string;
  panNumber: string;
  aadhaarNumber: string;
  bankAccount: string;
  ifscCode: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  bloodGroup: string;
}

export interface Payroll {
  id: string;
  tenantId: string;
  employeeId: string;
  month: string;
  year: number;
  basicSalary: number;
  da: number;
  hra: number;
  allowances: number;
  pfDeduction: number;
  esiDeduction: number;
  incomeTax: number;
  netSalary: number;
  status: 'Processed' | 'Paid' | 'Pending' | 'Draft';
  generatedDate: string;
  paidDate?: string;
}

export interface LeaveRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  leaveType: 'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Maternity Leave' | 'Paternity Leave';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  appliedDate: string;
  approverName: string;
  comments?: string;
}

export interface Expense {
  id: string;
  tenantId: string;
  employeeId: string;
  category: 'Travel' | 'Accommodation' | 'Meals' | 'Communication' | 'Other';
  amount: number;
  description: string;
  date: string;
  status: 'Submitted' | 'Pending' | 'Approved' | 'Rejected' | 'Paid';
  receiptUrl?: string;
  submittedDate: string;
  approverName: string;
  comments?: string;
}

export interface Performance {
  id: string;
  tenantId: string;
  employeeId: string;
  period: string;
  raterName: string;
  overallRating: number;
  communicationRating: number;
  teamworkRating: number;
  leadershipRating: number;
  technicalSkillsRating: number;
  comments: string;
  status: 'Completed' | 'InProgress' | 'Pending';
  date: string;
}

export interface Attendance {
  id: string;
  tenantId: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'Present' | 'Absent' | 'Half Day' | 'Leave';
  workingHours: number;
}

export interface Tax {
  id: string;
  tenantId: string;
  employeeId: string;
  financialYear: string;
  grossIncome: number;
  standardDeduction: number;
  chapter6aDeductions: number;
  otherDeductions: number;
  taxableIncome: number;
  taxCalculated: number;
  educationCess: number;
  totalTax: number;
  status: 'Filed' | 'Pending' | 'Approved';
}

export interface Job {
  id: string;
  tenantId: string;
  title: string;
  department: string;
  status: 'Open' | 'Closed' | 'On Hold';
  postedDate: string;
  applications: number;
  openPositions: number;
}

export interface Notification {
  id: string;
  type: 'leave_approval' | 'payslip' | 'appraisal' | 'expense' | 'message';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}
