import { useState, useEffect } from 'react';
import apiService from '../api';

export function useExpenses(params?: { employeeId?: string; status?: string; category?: string }) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiService.getExpenses(params);
        if (response.success && response.data) {
          setExpenses(Array.isArray(response.data) ? response.data : []);
        } else {
          setError(response.message || 'Failed to load expenses');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load expenses');
      } finally {
        setIsLoading(false);
      }
    };

    loadExpenses();
  }, [params?.employeeId, params?.status, params?.category]);

  return { expenses, isLoading, error };
}
