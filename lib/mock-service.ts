// Mock Service for CRUD Operations
// This file provides functional CRUD operations with mock data

import { mockRecruitement, mockEmployees } from './mock-data';

// ==================== RECRUITMENT ====================

export interface Job {
  id: string;
  tenantId: string;
  title: string;
  department: string;
  status: 'Open' | 'Closed' | 'On Hold';
  postedDate: string;
  applications: number;
  openPositions: number;
  description?: string;
  requirements?: string;
  location?: string;
  salaryRange?: string;
}

let jobs: Job[] = [...mockRecruitement];

export const jobService = {
  getAll: () => jobs,
  getById: (id: string) => jobs.find(j => j.id === id),
  create: (job: Omit<Job, 'id' | 'postedDate' | 'applications'>) => {
    const newJob: Job = {
      ...job,
      id: `job-${Date.now()}`,
      postedDate: new Date().toISOString().split('T')[0],
      applications: 0,
    };
    jobs.push(newJob);
    return newJob;
  },
  update: (id: string, updates: Partial<Job>) => {
    const index = jobs.findIndex(j => j.id === id);
    if (index !== -1) {
      jobs[index] = { ...jobs[index], ...updates };
      return jobs[index];
    }
    return null;
  },
  delete: (id: string) => {
    const index = jobs.findIndex(j => j.id === id);
    if (index !== -1) {
      jobs.splice(index, 1);
      return true;
    }
    return false;
  },
};

// ==================== DEPARTMENTS ====================

export interface Department {
  id: number;
  name: string;
  head: string;
  employees: number;
  costCenter: string;
  status: 'Active' | 'Inactive';
  parentDepartment?: string;
}

let departments: Department[] = [
  { id: 1, name: 'Finance', head: 'Deepa Gupta', employees: 45, costCenter: 'CC001', status: 'Active' },
  { id: 2, name: 'IT', head: 'Rajesh Verma', employees: 65, costCenter: 'CC002', status: 'Active' },
  { id: 3, name: 'HR', head: 'Priya Sharma', employees: 35, costCenter: 'CC003', status: 'Active' },
  { id: 4, name: 'Operations', head: 'Amit Patel', employees: 80, costCenter: 'CC004', status: 'Active' },
];

export const departmentService = {
  getAll: () => departments,
  getById: (id: number) => departments.find(d => d.id === id),
  create: (dept: Omit<Department, 'id' | 'employees'>) => {
    const newDept: Department = {
      ...dept,
      id: Date.now(),
      employees: 0,
    };
    departments.push(newDept);
    return newDept;
  },
  update: (id: number, updates: Partial<Department>) => {
    const index = departments.findIndex(d => d.id === id);
    if (index !== -1) {
      departments[index] = { ...departments[index], ...updates };
      return departments[index];
    }
    return null;
  },
  delete: (id: number) => {
    const index = departments.findIndex(d => d.id === id);
    if (index !== -1) {
      departments.splice(index, 1);
      return true;
    }
    return false;
  },
};

// ==================== BONUSES ====================

export interface Bonus {
  id: number;
  name: string;
  amount: number | string;
  frequency: 'Monthly' | 'Quarterly' | 'Yearly' | 'One-time';
  paidTo: number;
  status: 'Active' | 'Inactive' | 'Processed';
  description?: string;
}

let bonuses: Bonus[] = [
  { id: 1, name: 'Performance Bonus', amount: 50000, frequency: 'Quarterly', paidTo: 285, status: 'Active' },
  { id: 2, name: 'Diwali Bonus', amount: 100000, frequency: 'Yearly', paidTo: 280, status: 'Active' },
  { id: 3, name: 'Sales Incentive', amount: 'Variable', frequency: 'Monthly', paidTo: 120, status: 'Active' },
];

export const bonusService = {
  getAll: () => bonuses,
  getById: (id: number) => bonuses.find(b => b.id === id),
  create: (bonus: Omit<Bonus, 'id' | 'paidTo'>) => {
    const newBonus: Bonus = {
      ...bonus,
      id: Date.now(),
      paidTo: 0,
    };
    bonuses.push(newBonus);
    return newBonus;
  },
  update: (id: number, updates: Partial<Bonus>) => {
    const index = bonuses.findIndex(b => b.id === id);
    if (index !== -1) {
      bonuses[index] = { ...bonuses[index], ...updates };
      return bonuses[index];
    }
    return null;
  },
  delete: (id: number) => {
    const index = bonuses.findIndex(b => b.id === id);
    if (index !== -1) {
      bonuses.splice(index, 1);
      return true;
    }
    return false;
  },
  process: (id: number) => {
    const bonus = bonuses.find(b => b.id === id);
    if (bonus) {
      bonus.status = 'Processed';
      return true;
    }
    return false;
  },
};

// ==================== DOCUMENTS ====================

export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'excel' | 'word';
  url: string;
  size: string;
  uploadedDate: string;
  uploadedBy: string;
}

let documents: Document[] = [
  {
    id: 'doc-1',
    name: 'Form 16 - FY 2025-26',
    type: 'pdf',
    url: 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovUmVzb3VyY2VzIDQgMCBSCi9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKNCAwIG9iago8PAovRm9udCA8PAovRjEgNiAwIFIKPj4KPj4KZW5kb2JqCjUgMCBvYmoKPDwKL0xlbmd0aCA0NAo+PgpzdHJlYW0KQlQKL0YxIDEyIFRmCjAgMCAwIHJnCjcyIDcyMCBUZAooRm9ybSAxNiAtIEZJTiAyMDI1LTI2KSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCjYgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iagp4cmVmCjAgNwowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1NCAwMDAwMCBuIAowMDAwMDAwMTA3IDAwMDAwIG4gCjAwMDAwMDAyMTUgMDAwMDAgbiAKMDAwMDAwMDI3MCAwMDAwMCBuIAowMDAwMDAwMzI4IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNwovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDE1CiUlRU9G',
    size: '245 KB',
    uploadedDate: '2026-01-15',
    uploadedBy: 'Payroll Admin',
  },
  {
    id: 'doc-2',
    name: 'Salary Slip - January 2026',
    type: 'pdf',
    url: 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovUmVzb3VyY2VzIDQgMCBSCi9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKNCAwIG9iago8PAovRm9udCA8PAovRjEgNiAwIFIKPj4KPj4KZW5kb2JqCjUgMCBvYmoKPDwKL0xlbmd0aCA0NAo+PgpzdHJlYW0KQlQKL0YxIDEyIFRmCjAgMCAwIHJnCjcyIDcyMCBUZAooU2FsYXJ5IFNsaXAgLSBKYW51YXJ5IDIwMjYpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKNiAwIG9iago8PAovVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL0Jhc2VGb250IC9IZWx2ZXRpY2EKPj4KZW5kb2JqCnhyZWYKMCA3CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU0IDAwMDAwIG4gCjAwMDAwMDAxMDcgMDAwMDAgbiAKMDAwMDAwMDIxNSAwMDAwMCBuIAowMDAwMDAwMjcwIDAwMDAwIG4gCjAwMDAwMDAzMjggMDAwMDAgbiAKdHJhaWxlcgAKPDwKL1NpemUgNwovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDE1CiUlRU9G',
    size: '189 KB',
    uploadedDate: '2026-01-31',
    uploadedBy: 'System',
  },
];

export const documentService = {
  getAll: () => documents,
  getById: (id: string) => documents.find(d => d.id === id),
  view: (id: string) => {
    const doc = documents.find(d => d.id === id);
    if (doc) {
      // In a real app, this would open the document
      // For mock, we'll return the document data
      return doc;
    }
    return null;
  },
};

// ==================== APPLICATIONS ====================

export interface JobApplication {
  id: string;
  jobId: string;
  candidateName: string;
  email: string;
  phone: string;
  status: 'Applied' | 'Screened' | 'Interviewed' | 'Offered' | 'Rejected';
  appliedDate: string;
  resumeUrl?: string;
}

let applications: JobApplication[] = [
  {
    id: 'app-1',
    jobId: 'job-001',
    candidateName: 'Rahul Sharma',
    email: 'rahul.sharma@email.com',
    phone: '9876543210',
    status: 'Applied',
    appliedDate: '2026-01-20',
  },
  {
    id: 'app-2',
    jobId: 'job-001',
    candidateName: 'Priya Patel',
    email: 'priya.patel@email.com',
    phone: '9876543211',
    status: 'Screened',
    appliedDate: '2026-01-18',
  },
  {
    id: 'app-3',
    jobId: 'job-002',
    candidateName: 'Amit Kumar',
    email: 'amit.kumar@email.com',
    phone: '9876543212',
    status: 'Interviewed',
    appliedDate: '2026-01-15',
  },
];

export const applicationService = {
  getByJobId: (jobId: string) => applications.filter(a => a.jobId === jobId),
  getAll: () => applications,
  getById: (id: string) => applications.find(a => a.id === id),
  updateStatus: (id: string, status: JobApplication['status']) => {
    const app = applications.find(a => a.id === id);
    if (app) {
      app.status = status;
      return app;
    }
    return null;
  },
};
