import { useState, useEffect } from 'react';
import apiService from '../api';

export function useEmployees(params?: { search?: string; status?: string; department?: string }) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiService.getEmployees(params);
        if (response.success && response.data) {
          setEmployees(Array.isArray(response.data) ? response.data : []);
        } else {
          setError(response.message || 'Failed to load employees');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load employees');
      } finally {
        setIsLoading(false);
      }
    };

    loadEmployees();
  }, [params?.search, params?.status, params?.department]);

  return { employees, isLoading, error, refetch: () => {
    const loadEmployees = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiService.getEmployees(params);
        if (response.success && response.data) {
          setEmployees(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load employees');
      } finally {
        setIsLoading(false);
      }
    };
    loadEmployees();
  }};
}
