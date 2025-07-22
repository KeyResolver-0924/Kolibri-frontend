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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { LockClosedIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

export default function SupabaseLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Get user data to check role
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Check if user is a cooperative admin
      if (user?.user_metadata?.role === "cooperative_admin") {
        // Check if they have any cooperatives
        const { data: cooperative, error: coopError } = await supabase
          .from("cooperatives")
          .select("id")
          .eq("admin_id", user.id)
          .single();

        if (coopError && coopError.code !== "PGRST116") {
          // PGRST116 means no rows found
          throw coopError;
        }

        // If no cooperative exists, redirect to setup
        if (!cooperative) {
          toast({
            title: "Welcome!",
            description: "Please set up your cooperative to continue.",
          });
          router.replace("/setup-cooperative");
          return;
        }
      }

      // If we reach here, either user is not a cooperative admin or already has a cooperative
      router.replace("/dashboard");
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Error",
        variant: "destructive",
      });
      // Clear the form on error
      setEmail("");
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 p-4">
      <div className="w-full max-w-[420px] space-y-6">
        <div className="text-center space-y-2">
          <ShieldCheckIcon className="h-12 w-12 mx-auto text-blue-600" />
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Mortgage Deed System
          </h1>
          <p className="text-sm text-gray-500">
            Secure Digital Mortgage Management
          </p>
        </div>
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>Sign in to access your account</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-5">
            <form onSubmit={(e) => handleLogin(e)} className="space-y-4 w-full">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder=""
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11"
                  />
                  <LockClosedIcon className="h-4 w-4 absolute right-3 top-3.5 text-gray-400" />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in securely"}
              </Button>
            </form>
            <Link href="/signup" className="text-center focus:underline">
              Don't have account?
            </Link>
          </CardContent>
        </Card>
        <p className="text-center text-sm text-gray-500">
          Protected by enterprise-grade security
        </p>
      </div>
    </div>
  );
}
