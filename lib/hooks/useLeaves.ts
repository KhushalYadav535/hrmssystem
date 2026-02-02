import { useState, useEffect } from 'react';
import apiService from '../api';

export function useLeaves(params?: { employeeId?: string; status?: string; leaveType?: string }) {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLeaves = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiService.getLeaves(params);
        if (response.success && response.data) {
          setLeaves(Array.isArray(response.data) ? response.data : []);
        } else {
          setError(response.message || 'Failed to load leaves');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load leaves');
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaves();
  }, [params?.employeeId, params?.status, params?.leaveType]);

  return { leaves, isLoading, error };
}
