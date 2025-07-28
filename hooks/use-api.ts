import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiError } from '@/lib/api-error';
import { useToast } from '@/hooks/use-toast';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  enabled?: boolean;
  cacheKey?: string;
  refetchInterval?: number;
  retryOnError?: boolean;
}

interface UseApiResult<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    onSuccess,
    onError,
    enabled = true,
    cacheKey,
    refetchInterval,
    retryOnError = true,
  } = options;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const executeApiCall = useCallback(async (): Promise<void> => {
    if (!enabled) return;

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      setError(null);

      const result = await apiCall();
      
      setData(result);
      onSuccess?.(result);
      
      // Show success toast for non-cached data
      if (!cacheKey) {
        toast({
          title: "Success",
          description: "Data loaded successfully",
        });
      }
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(500, String(err));
      
      setError(apiError);
      onError?.(apiError);

      // Show error toast
      toast({
        title: "Error",
        description: apiError.message,
        variant: "destructive",
      });

      // Retry on error if enabled
      if (retryOnError && apiError.status !== 401) {
        setTimeout(() => {
          executeApiCall();
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiCall, enabled, onSuccess, onError, cacheKey, retryOnError, toast]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      executeApiCall();
    }
  }, [enabled, executeApiCall]);

  // Set up refetch interval
  useEffect(() => {
    if (refetchInterval && enabled) {
      intervalRef.current = setInterval(() => {
        executeApiCall();
      }, refetchInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refetchInterval, enabled, executeApiCall]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: executeApiCall,
    clearError,
  };
}

// Specialized hooks for common API patterns
export function useMortgageDeeds(filters: any = {}) {
  return useApi(
    async () => {
      const { getMortgageDeeds } = await import('@/lib/api-client');
      return getMortgageDeeds(filters);
    },
    {
      cacheKey: `mortgage-deeds-${JSON.stringify(filters)}`,
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );
}

export function useMortgageDeed(id: number) {
  return useApi(
    async () => {
      const { getMortgageDeed } = await import('@/lib/api-client');
      return getMortgageDeed(id);
    },
    {
      cacheKey: `mortgage-deed-${id}`,
      enabled: !!id,
    }
  );
}

export function useStatisticsSummary() {
  return useApi(
    async () => {
      const { getStatisticsSummary } = await import('@/lib/api-client');
      return getStatisticsSummary();
    },
    {
      cacheKey: 'statistics-summary',
      refetchInterval: 60000, // Refetch every minute
    }
  );
}

export function useBankDashboardStats() {
  return useApi(
    async () => {
      const { getBankDashboardStats } = await import('@/lib/api-client');
      return getBankDashboardStats();
    },
    {
      cacheKey: 'bank-dashboard-stats',
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );
}

export function useCooperativeDashboardStats() {
  return useApi(
    async () => {
      const { getCooperativeDashboardStats } = await import('@/lib/api-client');
      return getCooperativeDashboardStats();
    },
    {
      cacheKey: 'cooperative-dashboard-stats',
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );
}

export function useAccountingDashboardStats() {
  return useApi(
    async () => {
      const { getAccountingDashboardStats } = await import('@/lib/api-client');
      return getAccountingDashboardStats();
    },
    {
      cacheKey: 'accounting-dashboard-stats',
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );
}

export function useHousingCooperatives(page: number = 1, pageSize: number = 10) {
  return useApi(
    async () => {
      const { getHousingCooperatives } = await import('@/lib/api-client');
      return getHousingCooperatives(page, pageSize);
    },
    {
      cacheKey: `housing-cooperatives-${page}-${pageSize}`,
    }
  );
} 