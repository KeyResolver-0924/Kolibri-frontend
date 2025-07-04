import {
  DeedStatus,
  MortgageDeed,
  DeedFilters,
  StatsSummary,
  AuditLog,
  PaginationHeaders,
} from "./types";
import { createClient } from "./supabase";

const supabase = createClient();

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function makeAuthenticatedRequest(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new ApiError(401, "Unauthorized: No session found");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        ...options.headers,
      },
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Request failed: ${response.statusText}`
    );
  }

  return response;
}

export async function getMortgageDeeds(filters: DeedFilters = {}): Promise<{
  deeds: MortgageDeed[];
  pagination: PaginationHeaders;
}> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new ApiError(401, "Unauthorized: No session found");
  }

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

  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/mortgage-deeds${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  console.log("Fetching mortgage deeds from:", url);
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      method: "GET",
    });

    if (!response.ok) {
      throw new ApiError(
        response.status,
        `Failed to fetch mortgage deeds: ${response.statusText}`
      );
    }

    const pagination: PaginationHeaders = {
      totalCount: parseInt(response.headers.get("X-Total-Count") || "0"),
      totalPages: parseInt(response.headers.get("X-Total-Pages") || "0"),
      currentPage: parseInt(response.headers.get("X-Current-Page") || "1"),
      pageSize: parseInt(response.headers.get("X-Page-Size") || "10"),
    };

    const deeds: MortgageDeed[] = await response.json();
    return { deeds, pagination };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      500,
      `Failed to fetch mortgage deeds: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function refreshSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error || !session) {
    throw new ApiError(401, "Failed to refresh session");
  }
  return session;
}

export async function getStatisticsSummary(): Promise<StatsSummary> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new ApiError(401, "Unauthorized: No session found");
  }

  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/statistics/summary`;

  console.log("Fetching statistics summary from:", url);
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      method: "GET",
    });

    if (!response.ok) {
      throw new ApiError(
        response.status,
        `Failed to fetch statistics summary: ${response.statusText}`
      );
    }

    const stats: StatsSummary = await response.json();
    return stats;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      500,
      `Failed to fetch statistics summary: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function getAuditLogs(deedId: string): Promise<AuditLog[]> {
  const response = await makeAuthenticatedRequest(
    `/api/mortgage-deeds/${deedId}/audit-logs`,
    {
      method: "GET",
    }
  );
  return response.json();
}
