import { useState, useEffect } from 'react';
import apiService from '../api';

export function usePayroll(params?: { month?: string; year?: number; employeeId?: string; status?: string }) {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPayrolls = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiService.getPayrolls(params);
        if (response.success && response.data) {
          setPayrolls(Array.isArray(response.data) ? response.data : []);
        } else {
          setError(response.message || 'Failed to load payroll');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load payroll');
      } finally {
        setIsLoading(false);
      }
    };

    loadPayrolls();
  }, [params?.month, params?.year, params?.employeeId, params?.status]);

  return { payrolls, isLoading, error };
}
