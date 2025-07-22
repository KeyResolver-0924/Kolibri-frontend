"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export interface HousingCooperativeFormData {
  id?: number;
  name: string;
  organisation_number: string;
  address: string;
  city: string;
  postal_code: string;
  administrator_company: string | null;
  administrator_name: string;
  administrator_person_number: string;
  administrator_email: string;
  created_at?: string;
  created_by?: string;
}

interface HousingCooperativeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: HousingCooperativeFormData;
}

export function HousingCooperativeForm({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: HousingCooperativeFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<HousingCooperativeFormData>(
    initialData || {
      name: "",
      organisation_number: "",
      address: "",
      city: "",
      postal_code: "",
      administrator_company: "",
      administrator_name: "",
      administrator_person_number: "",
      administrator_email: "",
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Ingen aktiv session hittades");
      }

      const endpoint = isEditing
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/housing-cooperatives/${initialData.organisation_number}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/housing-cooperatives`;

      const requestBody = {
        ...formData,
        created_by: session.user.id,
        administrator_company: formData.administrator_company || null,
      };

      const response = await fetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isEditing
            ? {
                name: formData.name,
                address: formData.address,
                city: formData.city,
                postal_code: formData.postal_code,
                administrator_company: formData.administrator_company,
                administrator_name: formData.administrator_name,
                administrator_email: formData.administrator_email,
                administrator_person_number:
                  formData.administrator_person_number,
              }
            : requestBody
        ),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ett fel uppstod");
      }

      toast({
        title: isEditing ? "Cooperative Updated" : "Cooperative Created",
        description: isEditing
          ? "The housing cooperative has been updated successfully"
          : "The housing cooperative has been created successfully",
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Redigera förening" : "Lägg till ny förening"}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Namn</Label>
              <Input
                id="name"
                autoFocus
                onFocus={(e) =>
                  e.target.setSelectionRange(
                    e.target.value.length,
                    e.target.value.length
                  )
                }
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {!isEditing && (
              <div className="grid gap-2">
                <Label htmlFor="organisation_number">Organisationsnummer</Label>
                <Input
                  id="organisation_number"
                  autoFocus={false}
                  value={formData.organisation_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      organisation_number: e.target.value,
                    })
                  }
                  required
                  pattern="\d{6}-\d{4}"
                  placeholder="XXXXXX-XXXX"
                />
                <p className="text-sm text-muted-foreground">
                  Format: XXXXXX-XXXX
                </p>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="address">Adress</Label>
              <Input
                id="address"
                autoFocus={false}
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="postal_code">Postnummer</Label>
                <Input
                  id="postal_code"
                  autoFocus={false}
                  value={formData.postal_code}
                  onChange={(e) =>
                    setFormData({ ...formData, postal_code: e.target.value })
                  }
                  required
                  pattern="\d{3}\s?\d{2}"
                  placeholder="XXX XX"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="city">Ort</Label>
                <Input
                  id="city"
                  autoFocus={false}
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="administrator_company">
                Administratörsföretag
              </Label>
              <Input
                id="administrator_company"
                autoFocus={false}
                value={formData.administrator_company || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    administrator_company: e.target.value,
                  })
                }
                placeholder="Valfritt"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="administrator_name">Administratörens namn</Label>
              <Input
                id="administrator_name"
                autoFocus={false}
                value={formData.administrator_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    administrator_name: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="administrator_email">
                Administratörens e-post
              </Label>
              <Input
                id="administrator_email"
                autoFocus={false}
                type="email"
                value={formData.administrator_email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    administrator_email: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="administrator_person_number">
                Administratörens personnummer
              </Label>
              <Input
                id="administrator_person_number"
                autoFocus={false}
                value={formData.administrator_person_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    administrator_person_number: e.target.value,
                  })
                }
                required
                pattern="\d{12}"
                placeholder="YYYYMMDDXXXX"
              />
              <p className="text-sm text-muted-foreground">
                Format: YYYYMMDDXXXX (12 siffror)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Avbryt
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Sparar..."
                : isEditing
                ? "Spara ändringar"
                : "Skapa förening"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
