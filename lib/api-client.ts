import { createClient } from './supabase';
import { ApiError } from './api-error';
import { MortgageDeed, DeedFilters, PaginationHeaders, StatsSummary } from './types';

// Configuration
const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
} as const;

// Cache for API responses
const responseCache = new Map<string, { data: any; timestamp: number }>();

// Request interceptor for logging and authentication
async function createAuthenticatedRequest(
  path: string,
  options: RequestInit = {}
): Promise<RequestInit> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new ApiError(401, "Unauthorized: No session found");
  }

  return {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      ...options.headers,
    },
  };
}

// Response interceptor for error handling and logging
async function handleResponse<T>(response: Response, operation: string): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Request failed: ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      // If we can't parse the error response, use the status text
    }

    console.error(`API Error (${operation}):`, {
      status: response.status,
      statusText: response.statusText,
      message: errorMessage,
    });

    throw new ApiError(response.status, errorMessage);
  }

  return response.json();
}

// Retry logic for failed requests
async function retryRequest<T>(
  requestFn: () => Promise<T>,
  operation: string,
  maxAttempts: number = API_CONFIG.retryAttempts
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on authentication errors
      if (error instanceof ApiError && error.status === 401) {
        throw error;
      }

      if (attempt === maxAttempts) {
        console.error(`Request failed after ${maxAttempts} attempts:`, {
          operation,
          error: lastError.message,
        });
        throw lastError;
      }

      // Exponential backoff
      const delay = API_CONFIG.retryDelay * Math.pow(2, attempt - 1);
      console.warn(`Request failed (attempt ${attempt}/${maxAttempts}), retrying in ${delay}ms:`, {
        operation,
        error: lastError.message,
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Cache management
function getCacheKey(path: string, params?: Record<string, any>): string {
  const paramString = params ? JSON.stringify(params) : '';
  return `${path}${paramString}`;
}

function getCachedResponse<T>(cacheKey: string): T | null {
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < API_CONFIG.cacheTimeout) {
    return cached.data as T;
  }
  return null;
}

function setCachedResponse<T>(cacheKey: string, data: T): void {
  responseCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
}

// Main API request function with caching and retry logic
async function makeApiRequest<T>(
  path: string,
  options: RequestInit = {},
  useCache: boolean = false,
  cacheParams?: Record<string, any>
): Promise<T> {
  const cacheKey = useCache ? getCacheKey(path, cacheParams) : null;
  
  // Return cached response if available
  if (useCache && cacheKey) {
    const cached = getCachedResponse<T>(cacheKey);
    if (cached) {
      console.log(`Returning cached response for: ${path}`);
      return cached;
    }
  }

  const operation = `${options.method || 'GET'} ${path}`;
  
  const requestFn = async (): Promise<T> => {
    const requestOptions = await createAuthenticatedRequest(path, options);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
    
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${path}`, {
        ...requestOptions,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const data = await handleResponse<T>(response, operation);
      
      // Cache successful responses
      if (useCache && cacheKey) {
        setCachedResponse(cacheKey, data);
      }
      
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  return retryRequest(requestFn, operation);
}

// Clear cache for specific paths or all cache
export function clearCache(path?: string): void {
  if (path) {
    for (const key of responseCache.keys()) {
      if (key.startsWith(path)) {
        responseCache.delete(key);
      }
    }
  } else {
    responseCache.clear();
  }
}

// Optimized API functions with caching and error handling
export async function getMortgageDeeds(filters: DeedFilters = {}): Promise<{
  deeds: MortgageDeed[];
  pagination: PaginationHeaders;
}> {
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        queryParams.set(key, value.join(","));
      } else {
        queryParams.set(key, String(value));
      }
    }
  });

  const path = `/api/mortgage-deeds${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  
  const response = await makeApiRequest<Response & { headers: Headers }>(
    path,
    { method: 'GET' },
    true, // Use cache for list requests
    filters
  );

  const pagination: PaginationHeaders = {
    totalCount: parseInt(response.headers.get("X-Total-Count") || "0"),
    totalPages: parseInt(response.headers.get("X-Total-Pages") || "0"),
    currentPage: parseInt(response.headers.get("X-Current-Page") || "1"),
    pageSize: parseInt(response.headers.get("X-Page-Size") || "10"),
  };

  return { deeds: response as any, pagination };
}

export async function getMortgageDeed(id: number): Promise<MortgageDeed> {
  return makeApiRequest<MortgageDeed>(
    `/api/mortgage-deeds/${id}`,
    { method: 'GET' },
    true, // Cache individual deed requests
    { id }
  );
}

export async function createMortgageDeed(deed: any): Promise<MortgageDeed> {
  const result = await makeApiRequest<MortgageDeed>(
    '/api/mortgage-deeds/create',
    {
      method: 'POST',
      body: JSON.stringify(deed),
    }
  );
  
  // Clear cache for mortgage deeds list
  clearCache('/api/mortgage-deeds');
  
  return result;
}

export async function updateMortgageDeed(id: number, deed: any): Promise<MortgageDeed> {
  const result = await makeApiRequest<MortgageDeed>(
    `/api/mortgage-deeds/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(deed),
    }
  );
  
  // Clear cache for mortgage deeds
  clearCache('/api/mortgage-deeds');
  
  return result;
}

export async function deleteMortgageDeed(id: number): Promise<void> {
  await makeApiRequest<void>(
    `/api/mortgage-deeds/${id}`,
    { method: 'DELETE' }
  );
  
  // Clear cache for mortgage deeds
  clearCache('/api/mortgage-deeds');
}

export async function getStatisticsSummary(): Promise<StatsSummary> {
  return makeApiRequest<StatsSummary>(
    '/api/statistics/summary',
    { method: 'GET' },
    true, // Cache statistics
    { type: 'summary' }
  );
}

export async function getBankDashboardStats(): Promise<any> {
  return makeApiRequest<any>(
    '/api/statistics/bank-dashboard',
    { method: 'GET' },
    true, // Cache dashboard stats
    { type: 'bank-dashboard' }
  );
}

export async function getCooperativeDashboardStats(): Promise<any> {
  return makeApiRequest<any>(
    '/api/statistics/cooperative-dashboard',
    { method: 'GET' },
    true, // Cache dashboard stats
    { type: 'cooperative-dashboard' }
  );
}

export async function getAccountingDashboardStats(): Promise<any> {
  return makeApiRequest<any>(
    '/api/statistics/accounting-dashboard',
    { method: 'GET' },
    true, // Cache dashboard stats
    { type: 'accounting-dashboard' }
  );
}

export async function getHousingCooperatives(page: number = 1, pageSize: number = 10): Promise<{
  cooperatives: any[];
  pagination: PaginationHeaders;
}> {
  const path = `/api/housing-cooperatives?page=${page}&page_size=${pageSize}`;
  
  const response = await makeApiRequest<Response & { headers: Headers }>(
    path,
    { method: 'GET' },
    true, // Cache cooperative list
    { page, pageSize }
  );

  const pagination: PaginationHeaders = {
    totalCount: parseInt(response.headers.get("X-Total-Count") || "0"),
    totalPages: parseInt(response.headers.get("X-Total-Pages") || "0"),
    currentPage: parseInt(response.headers.get("X-Current-Page") || "1"),
    pageSize: parseInt(response.headers.get("X-Page-Size") || "10"),
  };

  return { cooperatives: response as any, pagination };
}

export async function createHousingCooperative(cooperative: any): Promise<any> {
  const result = await makeApiRequest<any>(
    '/api/housing-cooperatives',
    {
      method: 'POST',
      body: JSON.stringify(cooperative),
    }
  );
  
  // Clear cache for cooperatives
  clearCache('/api/housing-cooperatives');
  
  return result;
}

export async function updateHousingCooperative(orgNumber: string, cooperative: any): Promise<any> {
  const result = await makeApiRequest<any>(
    `/api/housing-cooperatives/${orgNumber}`,
    {
      method: 'PUT',
      body: JSON.stringify(cooperative),
    }
  );
  
  // Clear cache for cooperatives
  clearCache('/api/housing-cooperatives');
  
  return result;
}

export async function deleteHousingCooperative(orgNumber: string): Promise<void> {
  await makeApiRequest<void>(
    `/api/housing-cooperatives/${orgNumber}`,
    { method: 'DELETE' }
  );
  
  // Clear cache for cooperatives
  clearCache('/api/housing-cooperatives');
}

// Utility function to check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch {
    return false;
  }
}
