"use client";

import { createClient } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@/contexts/user-context";

// Function to format phone number to E.164
// function formatPhoneNumber(value: string): string {
//   // Remove all non-digit characters
//   const digits = value.replace(/\D/g, "");

//   // If it starts with '0', replace with '+46'
//   if (digits.startsWith("0")) {
//     return "+46" + digits.substring(1);
//   }

//   // If it doesn't start with '+', add it
//   if (!value.startsWith("+")) {
//     return "+" + digits;
//   }

//   return value;
// }

// Function to validate E.164 format
function isValidE164(phone: string): boolean {
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
}

export default function SettingsPage() {
  const supabase = createClient();
  const { refreshUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [bankId, setBankId] = useState("");

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (user) {
        setFirstName(user.user_metadata?.first_name || "");
        setLastName(user.user_metadata?.last_name || "");
        setEmail(user.email || "");
        setCurrentEmail(user.email || "");
        setPhone(user.user_metadata?.phone || "");
        setBankId(user.user_metadata?.bank_id || "");
      }
    } catch (err) {
      console.log(err);
      toast({
        title: "Error",
        description: "Could not load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  // const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const formattedPhone = formatPhoneNumber(e.target.value);
  //   setPhone(formattedPhone);

  //   if (formattedPhone && !isValidE164(formattedPhone)) {
  //     setPhoneError("Phone number must be in format +46701234567");
  //   } else {
  //     setPhoneError("");
  //   }
  // };

  async function updateProfile() {
    try {
      if (!phone.match(/^\+46[0-9]{9}$/)) {
        setPhoneError("Phone number must be in format +46701234567");
        toast({
          title: "Error",
          description: "Phone number must be in format +46701234567",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);

      // Update user metadata (first name, last name, and phone)
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          bank_id: bankId,
        },
      });

      if (updateError) throw updateError;

      // Update email if changed
      if (email !== currentEmail) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email,
        });
        if (emailError) throw emailError;
      }

      // Refresh user data to update the navbar
      await refreshUser();

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Manage your personal information and settings here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateProfile();
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              {email !== currentEmail && (
                <p className="text-sm text-muted-foreground">
                  You will receive a verification email to your new email
                  address.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number in format +46701234567"
                className={phoneError ? "border-red-500" : ""}
                disabled={loading}
              />
              {phoneError && (
                <p className="text-sm text-red-500 mt-1">{phoneError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankId">Bank ID</Label>
              <Input
                id="bankId"
                type="text"
                value={bankId}
                onChange={(e) => setBankId(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={Boolean(loading || (phone && !isValidE164(phone)))}
            >
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
