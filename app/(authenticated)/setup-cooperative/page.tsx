"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  // CardDescription,
  // CardHeader,
  // CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

export default function SetupCooperativePage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const [cooperativeData, setCooperativeData] = useState({
    organizationNumber: "",
    companyName: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCooperativeData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get the current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("No user found");

      // Insert the cooperative data
      const { error: insertError } = await supabase
        .from("housing_cooperatives")
        .insert([
          {
            organization_number: cooperativeData.organizationNumber,
            name: cooperativeData.companyName,
            address: cooperativeData.address,
            city: cooperativeData.city,
            postal_code: cooperativeData.postalCode,
            admin_id: user.id,
          },
        ]);

      if (insertError) throw insertError;

      router.push("/dashboard");
      toast({
        title: "Success",
        description: "Your housing cooperative has been created successfully!",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Create Your Housing Cooperative
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please enter your housing cooperative details
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="organizationNumber">Organization Number</Label>
                <Input
                  id="organizationNumber"
                  name="organizationNumber"
                  value={cooperativeData.organizationNumber}
                  onChange={handleChange}
                  required
                  className="h-11"
                  placeholder="XXXXXXXXXX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={cooperativeData.companyName}
                  onChange={handleChange}
                  required
                  className="h-11"
                  placeholder="Enter company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={cooperativeData.address}
                  onChange={handleChange}
                  required
                  className="h-11"
                  placeholder="Enter street address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={cooperativeData.city}
                  onChange={handleChange}
                  required
                  className="h-11"
                  placeholder="Enter city"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={cooperativeData.postalCode}
                  onChange={handleChange}
                  required
                  className="h-11"
                  placeholder="Enter postal code"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Housing Cooperative"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
