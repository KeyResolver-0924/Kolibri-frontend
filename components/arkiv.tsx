"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PantbrevsVisare } from "./pantbrevs-visare";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Deed {
  id: string;
  association: string;
  apartment: string;
  date: string;
  status: string;
  bank: string;
  bankEmployee: string;
}

export function Arkiv() {
  const router = useRouter();
  const [deeds, setDeeds] = useState<Deed[]>([]);
  const [sökterm, setSökterm] = useState("");
  const [valttPantbrev, setValttPantbrev] = useState<Deed | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Current token:", token);
    if (!token) {
      console.log("No token found, redirecting to login");
      router.push("/login");
      return;
    }
    const fetchDeeds = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const endpoint =
          statusFilter === "approved" ? "/deed/archive" : "/deed/listDeeds";
        console.log(`Hämtar data från endpoint: ${endpoint}`);

        const response = await fetch(`http://localhost:4000${endpoint}`, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        });

        console.log("Server svarstatus:", response.status);
        const data = await response.json();
        console.log("Server svarsdata:", data);

        if (response.status === 401 || response.status === 403) {
          console.log("Token ogiltig eller utgången");
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || "Kunde inte hämta pantbrev");
        }

        setDeeds(data || []);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Ett oväntat fel uppstod";
        setError(`Ett fel uppstod vid hämtning av pantbrev: ${errorMessage}`);
        console.error("Fel vid hämtning:", err);

        if (
          err instanceof Error &&
          (err.message.includes("401") || err.message.includes("403"))
        ) {
          localStorage.removeItem("token");
          router.push("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeeds();
  }, [statusFilter, router]);

  const filtreradePantbrev = deeds.filter(
    (deed) =>
      (deed.association?.toLowerCase() || "").includes(sökterm.toLowerCase()) ||
      (deed.apartment?.toLowerCase() || "").includes(sökterm.toLowerCase()) ||
      (deed.bank?.toLowerCase() || "").includes(sökterm.toLowerCase()) ||
      (deed.bankEmployee?.toLowerCase() || "").includes(sökterm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center space-x-2 mb-4">
        <Search className="w-5 h-5 text-gray-500" />
        <Input
          type="text"
          placeholder="Sök pantbrev..."
          value={sökterm}
          onChange={(e) => setSökterm(e.target.value)}
          className="w-full max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrera efter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Väntande</SelectItem>
            <SelectItem value="approved">Godkända</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {isLoading ? (
        <div className="text-center py-4">Laddar pantbrev...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Förening</TableHead>
              <TableHead>Lägenhet</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Bank</TableHead>
              <TableHead>Bankhandläggare</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Åtgärder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtreradePantbrev.map((deed) => (
              <TableRow key={deed.id}>
                <TableCell>{deed.association}</TableCell>
                <TableCell>{deed.apartment}</TableCell>
                <TableCell>{deed.date}</TableCell>
                <TableCell>{deed.bank}</TableCell>
                <TableCell>{deed.bankEmployee}</TableCell>
                <TableCell>{deed.status}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    onClick={() => setValttPantbrev(deed)}
                  >
                    Visa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {valttPantbrev && (
        <PantbrevsVisare
          pantbrev={valttPantbrev}
          vidStängning={() => setValttPantbrev(null)}
        />
      )}
    </div>
  );
}
