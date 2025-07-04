"use client";

import { useState, useEffect } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, Bell, Edit, Eye, Loader2 } from "lucide-react";
import { DeedStatus, MortgageDeed, DeedFilters, PaginationHeaders } from "@/lib/types";
import { getMortgageDeeds, ApiError } from "@/lib/api-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useRouter } from "next/navigation";

interface DeedListProps {
  onDeedsUpdate?: (deeds: MortgageDeed[]) => void;
}

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";

interface ActionButtonProps {
  variant: ButtonVariant;
  icon: React.ElementType;
  text: string;
  onClick: () => void;
}

export function DeedList({ onDeedsUpdate }: DeedListProps) {
  const router = useRouter();
  const [deeds, setDeeds] = useState<MortgageDeed[]>([]);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<DeedFilters>({
    page: 1,
    page_size: 10,
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  const [pagination, setPagination] = useState<PaginationHeaders>({
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10
  });

  const debouncedFilters = useDebounce(filters, 300);

  useEffect(() => {
    fetchDeeds();
  }, [debouncedFilters]);

  const fetchDeeds = async () => {
    try {
      if (isInitialLoading) {
        setIsInitialLoading(true);
      } else {
        setIsTableLoading(true);
      }
      const { deeds: newDeeds, pagination: newPagination } = await getMortgageDeeds(filters);
      setDeeds(newDeeds);
      setPagination(newPagination);
      onDeedsUpdate?.(newDeeds);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Ett oväntat fel uppstod');
      }
      console.error("Fel vid hämtning:", err);
    } finally {
      setIsInitialLoading(false);
      setIsTableLoading(false);
    }
  };

  const handleFilterChange = (key: keyof DeedFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1
    }));
    if (key === 'page') {
      setCurrentPage(value);
    }
  };

  const handlePageChange = async (e: React.MouseEvent, newPage: number) => {
    e.preventDefault();
    setCurrentPage(newPage);
    handleFilterChange('page', newPage);
  };

  const getStatusBadgeVariant = (status: DeedStatus) => {
    switch (status) {
      case DeedStatus.COMPLETED:
        return "default";
      case DeedStatus.PENDING_BORROWER_SIGNATURE:
      case DeedStatus.PENDING_HOUSING_COOPERATIVE_SIGNATURE:
        return "secondary";
      default:
        return "destructive";
    }
  };

  const getStatusText = (status: DeedStatus) => {
    switch (status) {
      case DeedStatus.CREATED:
        return "Skapad";
      case DeedStatus.PENDING_BORROWER_SIGNATURE:
        return "Väntar på låntagares signering";
      case DeedStatus.PENDING_HOUSING_COOPERATIVE_SIGNATURE:
        return "Väntar på föreningens signering";
      case DeedStatus.COMPLETED:
        return "Slutförd";
      default:
        return status;
    }
  };

  const getActionButton = (deed: MortgageDeed) => {
    let props: ActionButtonProps = {
      variant: "default",
      icon: Eye,
      text: "Visa",
      onClick: () => handleDeedAction(deed)
    };

    switch (deed.status) {
      case DeedStatus.COMPLETED:
        props = {
          ...props,
          icon: Check,
          text: "Visa",
          variant: "default"
        };
        break;
      case DeedStatus.PENDING_BORROWER_SIGNATURE:
        props = {
          ...props,
          icon: Bell,
          text: "Påminn",
          variant: "secondary"
        };
        break;
      case DeedStatus.PENDING_HOUSING_COOPERATIVE_SIGNATURE:
        props = {
          ...props,
          icon: Edit,
          text: "Signera",
          variant: "destructive"
        };
        break;
    }

    const Icon = props.icon;
    return (
      <Button
        variant={props.variant}
        size="sm"
        onClick={props.onClick}
        className="w-[100px]"
      >
        <Icon className="mr-2 h-4 w-4" />
        {props.text}
      </Button>
    );
  };

  const handleDeedClick = (deed: MortgageDeed) => {
    router.push(`/pantbrev/${deed.id}`, { scroll: false });
  };

  const handleDeedAction = (deed: MortgageDeed) => {
    router.push(`/pantbrev/${deed.id}`, { scroll: false });
  };

  if (isInitialLoading) {
    return <div className="text-center py-4">Laddar pantbrev...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <Select
          value={filters.deed_status}
          onValueChange={(value) => handleFilterChange('deed_status', value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrera på status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={DeedStatus.CREATED}>Skapad</SelectItem>
            <SelectItem value={DeedStatus.PENDING_BORROWER_SIGNATURE}>Väntar på låntagare</SelectItem>
            <SelectItem value={DeedStatus.PENDING_HOUSING_COOPERATIVE_SIGNATURE}>Väntar på förening</SelectItem>
            <SelectItem value={DeedStatus.COMPLETED}>Slutförd</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Sök på lägenhetsnummer"
          className="w-[200px]"
          value={filters.apartment_number || ''}
          onChange={(e) => handleFilterChange('apartment_number', e.target.value)}
        />

        <Input
          placeholder="Sök på föreningsnamn"
          className="w-[200px]"
          value={filters.housing_cooperative_name || ''}
          onChange={(e) => handleFilterChange('housing_cooperative_name', e.target.value)}
        />
      </div>

      <div className="rounded-md border relative">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Förening</TableHead>
              <TableHead>Lägenhetsnummer</TableHead>
              <TableHead>Pantnummer</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Åtgärd</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deeds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Inga pantbrev hittades
                </TableCell>
              </TableRow>
            ) : (
              deeds.map((deed) => (
                <TableRow key={deed.id}>
                  <TableCell>
                    <button
                      onClick={() => handleDeedClick(deed)}
                      className="hover:underline text-left"
                    >
                      {deed.housing_cooperative?.name || '-'}
                    </button>
                  </TableCell>
                  <TableCell>{deed.apartment_number || '-'}</TableCell>
                  <TableCell>{deed.credit_number || '-'}</TableCell>
                  <TableCell>
                    {deed.created_at 
                      ? new Date(deed.created_at).toLocaleDateString('sv-SE')
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(deed.status)}>
                      {getStatusText(deed.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{getActionButton(deed)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="relative">
        {deeds.length > 0 && (
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Visar {(pagination.currentPage - 1) * pagination.pageSize + 1} - {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} av {pagination.totalCount} pantbrev
            </div>
            <div className="flex gap-2 items-center">
              {isTableLoading && (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => handlePageChange(e, pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                Föregående
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => handlePageChange(e, pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Nästa
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
