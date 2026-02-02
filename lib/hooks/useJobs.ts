import { useState, useEffect } from 'react';
import apiService from '../api';

export function useJobs(params?: { status?: string; department?: string }) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiService.getJobs(params);
        if (response.success && response.data) {
          setJobs(Array.isArray(response.data) ? response.data : []);
        } else {
          setError(response.message || 'Failed to load jobs');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load jobs');
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
  }, [params?.status, params?.department]);

  return { jobs, isLoading, error };
}
