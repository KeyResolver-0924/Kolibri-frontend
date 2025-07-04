"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus } from "lucide-react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { HousingCooperativeForm, type HousingCooperativeFormData } from "@/components/housing-cooperative-form";
import { DeleteCooperativeDialog } from "@/components/delete-cooperative-dialog";

interface HousingCooperative {
  id: number;
  name: string;
  organisation_number: string;
  address: string;
  city: string;
  postal_code: string;
  administrator_company: string | null;
  administrator_name: string;
  administrator_email: string;
  administrator_person_number: string;
  created_at: string;
  created_by: string;
}

interface PaginationHeaders {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '-';
    }
    return format(date, 'PPP', { locale: sv });
  } catch (error) {
    return '-';
  }
};

export default function MyAssociationsPage() {
  const [cooperatives, setCooperatives] = useState<HousingCooperative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCooperative, setSelectedCooperative] = useState<HousingCooperative | null>(null);
  const [pagination, setPagination] = useState<PaginationHeaders>({
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cooperativeToDelete, setCooperativeToDelete] = useState<HousingCooperative | null>(null);

  const fetchCooperatives = async (page: number, pageSize: number) => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Ingen aktiv session hittades");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/housing-cooperatives?page=${page}&page_size=${pageSize}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error("Kunde inte hämta bostadsrättsföreningar");
      }

      const data = await response.json();
      setCooperatives(data);
      
      setPagination({
        totalCount: parseInt(response.headers.get('X-Total-Count') || '0'),
        totalPages: parseInt(response.headers.get('X-Total-Pages') || '0'),
        currentPage: parseInt(response.headers.get('X-Current-Page') || '1'),
        pageSize: parseInt(response.headers.get('X-Page-Size') || '10'),
      });

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchCooperatives(newPage, pagination.pageSize);
  };

  const handlePageSizeChange = (newSize: string) => {
    fetchCooperatives(1, parseInt(newSize));
  };

  const handleEdit = (cooperative: HousingCooperative) => {
    setSelectedCooperative(cooperative);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    fetchCooperatives(pagination.currentPage, pagination.pageSize);
  };

  const handleDelete = (cooperative: HousingCooperative) => {
    setCooperativeToDelete(cooperative);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    fetchCooperatives(pagination.currentPage, pagination.pageSize);
  };

  useEffect(() => {
    fetchCooperatives(1, 10);
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bostadsrättsföreningar</h1>
        <Button onClick={() => {
          setSelectedCooperative(null);
          setIsFormOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Lägg till förening
        </Button>
      </div>
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Alla föreningar</CardTitle>
            <Select
              value={pagination.pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Välj antal per sida" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per sida</SelectItem>
                <SelectItem value="25">25 per sida</SelectItem>
                <SelectItem value="50">50 per sida</SelectItem>
                <SelectItem value="100">100 per sida</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Namn</TableHead>
                    <TableHead>Organisationsnummer</TableHead>
                    <TableHead>Adress</TableHead>
                    <TableHead>Administratörsföretag</TableHead>
                    <TableHead>Administratör</TableHead>
                    <TableHead>E-post</TableHead>
                    <TableHead>Skapad</TableHead>
                    <TableHead>Åtgärder</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        Laddar föreningar...
                      </TableCell>
                    </TableRow>
                  ) : cooperatives.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        Inga föreningar hittades
                      </TableCell>
                    </TableRow>
                  ) : (
                    cooperatives.map((cooperative) => (
                      <TableRow key={cooperative.id}>
                        <TableCell>{cooperative.name}</TableCell>
                        <TableCell>{cooperative.organisation_number}</TableCell>
                        <TableCell>
                          {cooperative.address}, {cooperative.postal_code} {cooperative.city}
                        </TableCell>
                        <TableCell>{cooperative.administrator_company || "-"}</TableCell>
                        <TableCell>{cooperative.administrator_name}</TableCell>
                        <TableCell>{cooperative.administrator_email}</TableCell>
                        <TableCell>
                          {formatDate(cooperative.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEdit(cooperative)}
                            >
                              Redigera
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDelete(cooperative)}
                            >
                              Ta bort
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {cooperatives.length > 0 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-muted-foreground">
                  Visar {(pagination.currentPage - 1) * pagination.pageSize + 1} - {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} av {pagination.totalCount} föreningar
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                  >
                    Föregående
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                  >
                    Nästa
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <HousingCooperativeForm
          key={selectedCooperative?.id || 'new'}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedCooperative(null);
          }}
          onSuccess={handleFormSuccess}
          initialData={selectedCooperative as HousingCooperativeFormData | undefined}
        />

        {cooperativeToDelete && (
          <DeleteCooperativeDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => {
              setIsDeleteDialogOpen(false);
              setCooperativeToDelete(null);
            }}
            onSuccess={handleDeleteSuccess}
            cooperative={cooperativeToDelete}
          />
        )}
      </div>
    </main>
  );
} 