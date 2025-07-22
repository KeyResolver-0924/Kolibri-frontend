"use client";

import { useEffect, useState } from "react";
import { MortgageDeed } from "@/lib/types";
import { ApiError } from "@/lib/api-client";
import { createClient } from "@/lib/supabase";
import { AuditLogTimeline } from "@/components/audit-log-timeline";
import { Button } from "@/components/ui/button";
import { Edit, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/use-toast";

interface DeedViewerProps {
  id: string;
}

export function DeedViewer({ id }: DeedViewerProps) {
  const router = useRouter();
  const [deed, setDeed] = useState<MortgageDeed | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const { toast } = useToast();
  useEffect(() => {
    const fetchDeed = async () => {
      try {
        setIsLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          throw new ApiError(401, "Unauthorized: No session found");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/mortgage-deeds/${id}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new ApiError(
            response.status,
            `Failed to fetch deed: ${response.statusText}`
          );
        }

        const data = await response.json();
        setDeed(data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Ett oväntat fel uppstod");
        }
        console.error("Error fetching deed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeed();
  }, [id, supabase.auth]);

  const handleClickSign = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new ApiError(401, "Unauthorized: No session found");
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/mortgage-deeds/deeds/${id}/send-for-signing`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          method: "POST",
        }
      );
      if (!response.ok) {
        throw new ApiError(
          response.status,
          `Failed to send signing: ${response.statusText}`
        );
      }
      toast({
        title: "Success",
        description: "Sent for Signing",
        variant: "destructive",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };
  if (isLoading) {
    return <div className="text-center py-4">Laddar pantbrev...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  if (!deed) {
    return <div className="text-center py-4">Pantbrev hittades inte</div>;
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Pantbrev</h1>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/pantbrev/${id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Deed
          </Button>
          <Button onClick={() => handleClickSign()}>
            <Send className="mr-2 h-4 w-4" />
            Send for Signing
          </Button>
        </div>
      </div>

      {/* Mortgage Deed Details */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Mortgage Deed Details</h3>
        <dl className="grid grid-cols-2 gap-2">
          <dt className="font-medium">Credit Number:</dt>
          <dd>{deed.credit_number}</dd>
          <dt className="font-medium">Created Date:</dt>
          <dd>{new Date(deed.created_at).toLocaleDateString("sv-SE")}</dd>
        </dl>
      </div>

      {/* Housing Cooperative Details */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Housing Cooperative</h3>
        <dl className="grid grid-cols-2 gap-2">
          <dt className="font-medium">Organization Number:</dt>
          <dd>{deed.cooperative?.organisation_number}</dd>
          <dt className="font-medium">Name:</dt>
          <dd>{deed.cooperative?.name}</dd>
        </dl>

        <div className="mt-4">
          <h4 className="font-medium mb-2">Administrator Information</h4>
          <dl className="grid grid-cols-2 gap-2">
            <dt className="font-medium">Name:</dt>
            <dd>{deed.cooperative?.administrator_name}</dd>
            <dt className="font-medium">Email:</dt>
            <dd>{deed.cooperative?.administrator_email}</dd>
          </dl>
        </div>
        {/* 
        <div className="mt-4">
          <h4 className="font-medium mb-2">Cooperative Signers</h4>
          <div className="space-y-4">
            {deed.cooperative_signers?.map((signer, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h5 className="font-medium mb-2">Signer {index + 1}</h5>
                <dl className="grid grid-cols-2 gap-2">
                  <dt className="font-medium">Name:</dt>
                  <dd>{signer.administrator_name}</dd>
                  <dt className="font-medium">Person Number:</dt>
                  <dd>{signer.administrator_person_number}</dd>
                  <dt className="font-medium">Email:</dt>
                  <dd>{signer.administrator_email}</dd>
                </dl>
              </div>
            ))}
          </div>
        </div> */}
      </div>

      {/* Apartment Information */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Apartment Information</h3>
        <dl className="grid grid-cols-2 gap-2">
          <dt className="font-medium">Address:</dt>
          <dd>{deed.apartment_address}</dd>
          <dt className="font-medium">Apartment Number:</dt>
          <dd>{deed.apartment_number}</dd>
          <dt className="font-medium">Postal Code:</dt>
          <dd>{deed.apartment_postal_code}</dd>
          <dt className="font-medium">City:</dt>
          <dd>{deed.apartment_city}</dd>
        </dl>
      </div>

      {/* Borrowers Information */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Borrowers</h3>
        <div className="space-y-4">
          {deed.borrowers?.map((borrower, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Borrower {index + 1}</h4>
              <dl className="grid grid-cols-2 gap-2">
                <dt className="font-medium">Name:</dt>
                <dd>{borrower.name}</dd>
                <dt className="font-medium">Email:</dt>
                <dd>{borrower.email}</dd>
                <dt className="font-medium">Ownership Percentage:</dt>
                <dd>{borrower.ownership_percentage}%</dd>
              </dl>
            </div>
          ))}
        </div>
      </div>

      {/* Status Information */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Status Information</h3>
        <dl className="grid grid-cols-2 gap-2">
          <dt className="font-medium">Status:</dt>
          <dd>{deed.status}</dd>
        </dl>
      </div>

      {/* Audit Log Timeline */}
      <AuditLogTimeline deedId={id} />
    </div>
  );
}
