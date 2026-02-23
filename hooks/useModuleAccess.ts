'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import apiService from '@/lib/api';

/**
 * React Hook for Module Access Control
 * BRD: Dynamic Module Management System - DM-029
 */
interface ModuleAccess {
  isEnabled: boolean;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  moduleConfig: Record<string, any> | null;
  permissions: string[];
}

export const useModuleAccess = (moduleCode: string): ModuleAccess => {
  const { currentUser } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [moduleConfig, setModuleConfig] = useState<Record<string, any> | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    const checkModuleAccess = async () => {
      if (!currentUser || !currentUser.tenantId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiService.checkModuleAccess(moduleCode);

        if (response.success) {
          const data = (response as any).data;
          setIsEnabled(data?.enabled ?? (response as any).enabled ?? false);
          // TODO: Get module config and permissions from response when implemented
          setModuleConfig(null);
          setPermissions([]);
        } else {
          setIsEnabled(false);
        }
      } catch (error) {
        console.error('Failed to check module access:', error);
        setIsEnabled(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkModuleAccess();
  }, [currentUser, moduleCode]);

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  return {
    isEnabled,
    isLoading,
    hasPermission,
    moduleConfig,
    permissions,
  };
};
