"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/user-context";
import { createClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Search, Eye, Edit, Plus } from "lucide-react";
import Link from "next/link";

interface MortgageDeed {
  id: number;
  credit_number: string;
  apartment_address: string;
  apartment_number: string;
  apartment_postal_code: string;
  apartment_city: string;
  status: string;
  created_at: string;
  created_by_email: string;
  housing_cooperative: {
    name: string;
    organisation_number: string;
  };
  borrowers: Array<{
    name: string;
    email: string;
  }>;
}

export default function PantbrevPage() {
  const [deeds, setDeeds] = useState<MortgageDeed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user, token } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchDeeds = async () => {
      try {
        setIsLoading(true);
        
        if (!user?.email) {
          toast({
            title: "Error",
            description: "No user email found",
            variant: "destructive",
          });
          return;
        }

        // Fetch mortgage deeds directly from Supabase where created_by_email matches current user
        const { data: deedsData, error } = await supabase
          .from("mortgage_deeds")
          .select(`
            *,
            housing_cooperative:housing_cooperatives(
              name,
              organisation_number
            ),
            borrowers(
              name,
              email
            )
          `)
          .eq("created_by_email", user.email)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching deeds:", error);
          toast({
            title: "Error",
            description: "Failed to fetch mortgage deeds",
            variant: "destructive",
          });
          return;
        }

        setDeeds(deedsData || []);
      } catch (error) {
        console.error("Error fetching deeds:", error);
        toast({
          title: "Error",
          description: "Failed to fetch mortgage deeds",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeeds();
  }, [user?.email, supabase, toast]);

  const filteredDeeds = deeds.filter((deed) =>
    deed.credit_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deed.housing_cooperative?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deed.apartment_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deed.apartment_address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      CREATED: { variant: "default" as const, label: "Created" },
      PENDING_BORROWER_SIGNATURE: { variant: "secondary" as const, label: "Pending Borrower" },
      PENDING_HOUSING_COOPERATIVE_SIGNATURE: { variant: "secondary" as const, label: "Pending Cooperative" },
      COMPLETED: { variant: "default" as const, label: "Completed" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading mortgage deeds...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mortgage Deeds</h1>
          <p className="text-muted-foreground mt-2">
            Manage and view all mortgage deeds created by you
          </p>
        </div>
        <Link href="/skapa-pantbrev">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Deed
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by credit number, cooperative, or apartment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredDeeds.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? "No deeds found matching your search." : "No mortgage deeds found. Create your first deed!"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Credit Number</TableHead>
                  <TableHead>Cooperative</TableHead>
                  <TableHead>Apartment</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Borrowers</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeeds.map((deed) => (
                  <TableRow key={deed.id}>
                    <TableCell className="font-medium">{deed.credit_number}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{deed.housing_cooperative?.name || "N/A"}</div>
                        <div className="text-sm text-muted-foreground">
                          {deed.housing_cooperative?.organisation_number || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{deed.apartment_number}</TableCell>
                    <TableCell>
                      <div>
                        <div>{deed.apartment_address}</div>
                        <div className="text-sm text-muted-foreground">
                          {deed.apartment_postal_code} {deed.apartment_city}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {deed.borrowers && deed.borrowers.length > 0 ? (
                        deed.borrowers.map((borrower, index) => (
                          <div key={index} className="text-sm">
                            {borrower.name}
                          </div>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">No borrowers</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(deed.status)}</TableCell>
                    <TableCell>
                      {new Date(deed.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/pantbrev/${deed.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/pantbrev/${deed.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 