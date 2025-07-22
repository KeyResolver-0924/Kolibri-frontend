"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { LockClosedIcon, BuildingLibraryIcon } from "@heroicons/react/24/solid";

// Map of user types to roles in the system
const userTypeToRole = {
  bank: "bank_user",
  accounting: "accounting_firm",
  cooperative: "cooperative_admin",
} as const;

type UserType = keyof typeof userTypeToRole;

interface Props {
  preselectedRole: UserType;
}

export default function SupabaseSignUpPage({ preselectedRole }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [userName, setUserName] = useState("");
  const [bankId, setBankId] = useState("");
  const [bankName, setBankName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const validateForm = () => {
    if (!email || !password || !confirmPassword || !userName || !bankId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }

    if (preselectedRole === "bank" && !bankName) {
      toast({
        title: "Error",
        description: "Please enter the bank name",
        variant: "destructive",
      });
      return false;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return false;
    }

    if (password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const role = userTypeToRole[preselectedRole];
      const userData = {
        email,
        password,
        options: {
          emailRedirectTo: "http://localhost:3000/login",
          data: {
            phone,
            user_name: userName,
            role,
            bank_id: bankId,
            bank_name: bankName || undefined,
          },
        },
      };

      const { data, error } = await supabase.auth.signUp(userData);

      if (error) {
        throw error;
      }

      if (!data.user?.id) {
        throw new Error("Failed to create user account - no user ID returned");
      }

      console.log("Auth user created:", data.user);

      if (role === "bank_user") {
        await supabase.from("bank_users").insert({
          id: data.user.id,
          email: email,
          name: userName,
          bank_id: parseInt(bankId, 10),
          phone_number: phone,
          bank_name: bankName,
        });
      } else if (role === "accounting_firm") {
        await supabase.from("accounting_firms").insert({
          id: data.user?.id,
          email: email,
          name: userName,
          bank_id: bankId,
          phone_number: phone,
        });
      } else if (role === "cooperative_admin") {
        await supabase.from("housing_cooperative_admins").insert({
          id: data.user?.id,
          email: email,
          name: userName,
          bank_id: bankId,
          phone_number: phone,
        });
      }

      toast({
        title: "Success",
        description: "Please check your email for the verification link!",
      });

      router.push("/login");
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

  const roleLabels = {
    bank: "Bank",
    accounting: "Accounting Firm",
    cooperative: "Housing Cooperative (Admin)",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {preselectedRole === "bank" ? (
          <BuildingLibraryIcon className="mx-auto h-12 w-12 text-emerald-600" />
        ) : (
          <LockClosedIcon className="mx-auto h-12 w-12 text-emerald-600" />
        )}
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mt-6">
          Create Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign up as {roleLabels[preselectedRole]}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSignUp} className="space-y-4">
              {preselectedRole === "bank" && (
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                    className="h-11"
                    placeholder="e.g. Swedbank"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userName">Name</Label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankId">BankID</Label>
                <Input
                  id="bankId"
                  value={bankId}
                  onChange={(e) => setBankId(e.target.value)}
                  required
                  className="h-11"
                  placeholder="Personal number for BankID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Creating Account..."
                ) : (
                  <>
                    <LockClosedIcon className="h-5 w-5 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
