"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function SigningPage() {
  const params = useParams();
  const token = params['token'] as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deedInfo, setDeedInfo] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${process.env['NEXT_PUBLIC_BACKEND_URL']}/api/signing/verify/${token}`
        );

        if (!response.ok) {
          throw new Error("Invalid or expired signing link");
        }

        const data = await response.json();
        setDeedInfo(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to verify token");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  const handleSign = async () => {
    try {
      setIsSigning(true);
      const response = await fetch(
        `${process.env['NEXT_PUBLIC_BACKEND_URL']}/api/signing/sign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, signature_confirmed: true }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to sign mortgage deed");
      }

      toast({
        title: "Success",
        description: "Mortgage deed signed successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign mortgage deed",
        variant: "destructive",
      });
    } finally {
      setIsSigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Verifying signing link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Signing Link Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Digital Signering av Pantbrev
          </h1>
          <p className="text-gray-600">
            Välkommen! Du är nu redo att digitalt signera ditt pantbrev.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pantbrevsinformation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {deedInfo && (
              <>
                <div>
                  <p className="text-sm font-medium text-gray-500">Referensnummer</p>
                  <p className="font-semibold">{deedInfo.deed.credit_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Lägenhet</p>
                  <p className="font-semibold">
                    {deedInfo.deed.apartment_number} - {deedInfo.deed.apartment_address}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Bostadsrättsförening</p>
                  <p className="font-semibold">{deedInfo.deed.housing_cooperative.name}</p>
                </div>
              </>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h3 className="font-semibold text-blue-900 mb-2">Viktigt att veta:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Genom att klicka "Signera" bekräftar du att du har läst och förstått pantbrevet</li>
                <li>• Din signering är juridiskt bindande</li>
                <li>• Du kan bara signera en gång</li>
              </ul>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                onClick={handleSign}
                disabled={isSigning}
                size="lg"
                className="px-8 py-3"
              >
                {isSigning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signerar...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Signera Pantbrev
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 