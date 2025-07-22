export type UserRole = "bank_user" | "accounting_firm" | "cooperative_admin";

export interface User {
  id: string;
  email: string;
  user_name: string;
  role: UserRole;
  bank_id?: string;
  bank_name?: string;
  phone?: string;
}

export interface HousingCooperative {
  id: string;
  name: string;
  organisation_number: string;
  address: string;
  postal_code: string;
  city: string;
  admin_id: string;
  created_at: string;
}

export enum DeedStatus {
  CREATED = "CREATED",
  PENDING_COOPERATIVE_SIGNATURE = "PENDING_COOPERATIVE_SIGNATURE",
  PENDING_BORROWER_SIGNATURE = "PENDING_BORROWER_SIGNATURE",
  PENDING_HOUSING_COOPERATIVE_SIGNATURE = "PENDING_HOUSING_COOPERATIVE_SIGNATURE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface MortgageDeed {
  id: string;
  cooperative_id: string;
  apartment_address: string;
  apartment_postal_code: string;
  apartment_city: string;
  apartment_number: string;
  credit_number: number;
  amount: number;
  status: DeedStatus;
  created_at: string;
  updated_at: string;
  cooperative?: {
    name: string;
    organisation_number: string;
    administrator_name: string;
    administrator_email: string;
  };
  borrowers: [
    {
      name: string;
      email: string;
      ownership_percentage: number;
    }
  ];
}

export interface PaginationHeaders {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface DeedFilters {
  deed_status?: DeedStatus;
  cooperative_id?: number;
  created_after?: string;
  created_before?: string;
  borrower_person_number?: string;
  housing_cooperative_name?: string;
  apartment_number?: string;
  credit_numbers?: string[];
  sort_by?: "created_at" | "status" | "apartment_number";
  sort_order?: "asc" | "desc";
  page?: number;
  page_size?: number;
}

export interface StatsSummary {
  total_deeds: number;
  total_cooperatives: number;
  status_distribution: {
    [key in DeedStatus]: number;
  };
}

export interface AuditLogEntry {
  id: string;
  deed_id: string;
  action: string;
  details: string;
  created_at: string;
  user_name: string;
  user_role: UserRole;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action_type: string;
  description: string;
  user_id: string;
}
