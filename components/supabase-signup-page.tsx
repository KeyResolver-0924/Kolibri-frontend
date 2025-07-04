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

function randomInt8() {
  return Math.floor(Math.random() * 256) - 128;
}

export default function SupabaseSignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("process");
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            phone: phone,
            user_name: userName,
            bank_id: randomInt8(),
          },
        },
      });

      if (error) {
        throw error;
      }
      toast({
        title: "Success",
        description: "Check your email for the verification link!",
        variant: "destructive",
      });
      router.push("/login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
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
            <CardDescription>Sign up your new account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
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
              <div className="space-y-2">
                <Label htmlFor="userName" className="text-sm font-medium">
                  User Name
                </Label>
                <div className="relative">
                  <Input
                    id="userName"
                    type="text"
                    placeholder=""
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    className="h-11"
                  />
                  <LockClosedIcon className="h-4 w-4 absolute right-3 top-3.5 text-gray-400" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <div className="relative">
                  <Input
                    id="phone"
                    type="text"
                    placeholder=""
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
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
                {isLoading ? "Signing up..." : "Sign up securely"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="text-center text-sm text-gray-500">
          Protected by enterprise-grade security
        </p>
      </div>
    </div>
  );
}
