export enum DeedStatus {
  CREATED = 'CREATED',
  PENDING_BORROWER_SIGNATURE = 'PENDING_BORROWER_SIGNATURE',
  PENDING_HOUSING_COOPERATIVE_SIGNATURE = 'PENDING_HOUSING_COOPERATIVE_SIGNATURE',
  COMPLETED = 'COMPLETED'
}

export interface Borrower {
  id: number;
  name: string;
  email: string;
  person_number: string;
  ownership_percentage: number;
  signature_timestamp?: string;
}

export interface HousingCooperative {
  id: number;
  name: string;
  organisation_number: string;
  administrator_name: string;
  administrator_email: string;
  administrator_person_number: string;
}

export interface HousingCooperativeSigner {
  administrator_name: string;
  administrator_person_number: string;
  administrator_email: string;
}

export interface MortgageDeed {
  id: number;
  credit_number: string;
  housing_cooperative_id: number;
  apartment_number: string;
  apartment_address: string;
  apartment_postal_code: string;
  apartment_city: string;
  status: DeedStatus;
  created_at: string;
  borrowers: Borrower[];
  housing_cooperative: HousingCooperative;
  housing_cooperative_signers: HousingCooperativeSigner[];
}

export interface PaginationHeaders {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface DeedFilters {
  deed_status?: DeedStatus;
  housing_cooperative_id?: number;
  created_after?: string;
  created_before?: string;
  borrower_person_number?: string;
  housing_cooperative_name?: string;
  apartment_number?: string;
  credit_numbers?: string[];
  sort_by?: 'created_at' | 'status' | 'apartment_number';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

export interface StatsSummary {
  total_deeds: number;
  total_cooperatives: number;
  status_distribution: {
    [key in DeedStatus]: number;
  };
  average_borrowers_per_deed: number;
}

export interface AuditLog {
  id: number;
  deed_id: number;
  action_type: 'DEED_CREATED' | 'DEED_UPDATED' | 'BORROWER_ADDED' | 'BORROWER_REMOVED' | 
    'BORROWER_SIGNED' | 'COOPERATIVE_SIGNER_ADDED' | 'COOPERATIVE_SIGNER_SIGNED' | 
    'DEED_COMPLETED' | 'DEED_DELETED';
  user_id: string;
  description: string;
  timestamp: string;
} 