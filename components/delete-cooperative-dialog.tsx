"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface DeleteCooperativeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cooperative: {
    name: string;
    organisation_number: string;
  };
}

export function DeleteCooperativeDialog({
  isOpen,
  onClose,
  onSuccess,
  cooperative,
}: DeleteCooperativeDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Ingen aktiv session hittades");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/housing-cooperatives/${cooperative.organisation_number}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error("Kan inte ta bort föreningen eftersom den har aktiva pantbrev");
        }
        if (response.status === 404) {
          throw new Error("Föreningen kunde inte hittas");
        }
        if (response.status === 403) {
          throw new Error("Du har inte behörighet att ta bort denna förening");
        }
        throw new Error("Ett fel uppstod när föreningen skulle tas bort");
      }

      toast({
        title: "Föreningen har tagits bort",
        description: `${cooperative.name} har tagits bort från systemet.`,
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ett fel uppstod");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ta bort förening</DialogTitle>
        </DialogHeader>

        <div className="py-6">
          <p className="text-sm text-muted-foreground mb-4">
            Är du säker på att du vill ta bort denna förening? Detta går inte att ångra.
          </p>
          <div className="grid gap-1">
            <p className="font-medium">{cooperative.name}</p>
            <p className="text-sm text-muted-foreground">
              Organisationsnummer: {cooperative.organisation_number}
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Avbryt
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Tar bort..." : "Ta bort förening"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 