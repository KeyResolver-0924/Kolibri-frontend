"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PasswordReset } from "./password-reset";
import { useRouter } from "next/navigation";

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    // andra användarfält...
  };
}

export default function ClerkLoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("password");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsVisible(false);
    setTimeout(() => setIsVisible(true), 50);
  }, [activeTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log('Försöker logga in med:', { username: email, password: password });

      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      });

      console.log('Server response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Inloggningen misslyckades");
      }

      const data = await response.json();
      console.log('Server response data:', data);

      // Uppdaterad tokenhantering för att matcha serversvaret
      let token = null;
      if (data.jwt) {
        token = data.jwt;
      } else if (data.token) {
        token = data.token;
      } else if (typeof data === 'string') {
        token = data;
      }

      if (!token) {
        throw new Error("Ingen giltig token hittades i svaret från servern");
      }

      localStorage.setItem("token", token);
      console.log('Token sparad:', token);
      
      router.push("/dashboard");

    } catch (err) {
      console.error("Inloggningsfel:", err);
      setError(err instanceof Error ? err.message : "Ett fel uppstod vid inloggning");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-white shadow-sm rounded-2xl">
        {!isResettingPassword ? (
          <>
            <h1 className="text-4xl font-bold text-center mb-8 text-primary">
              Logga in
            </h1>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex justify-center mb-6 bg-gray-50 rounded-lg p-1 w-full">
                <TabsTrigger
                  value="password"
                  className="flex-1 px-8 py-3 text-primary rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Lösenord
                </TabsTrigger>
                <TabsTrigger 
                  value="bankid" 
                  className="flex-1 px-8 py-3 text-primary rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  BankID
                </TabsTrigger>
              </TabsList>
              <div
                className={`transition-opacity duration-300 ease-in-out ${
                  isVisible ? "opacity-100" : "opacity-0"
                }`}
              >
                <TabsContent value="password">
                  <form className="space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-2">
                      <label
                        htmlFor="personal-number"
                        className="block text-base font-medium text-gray-700"
                      >
                        Använd ditt Kolibri ID
                      </label>
                      <Input
                        id="personal-number"
                        type="text"
                        placeholder="Personnummer eller e-post"
                        className="w-full h-12 text-base"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        type="password"
                        placeholder="Lösenord"
                        className="w-full h-12 text-base"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    {error && (
                      <div className="text-red-500 text-sm">{error}</div>
                    )}
                    <Button
                      type="submit"
                      className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                    >
                      Logga in
                    </Button>
                  </form>
                  <div className="mt-4 text-base">
                    <Button
                      variant="link"
                      className="text-blue-600 hover:text-blue-700 p-0 h-auto font-normal"
                      onClick={() => setIsResettingPassword(true)}
                    >
                      Glömt ditt lösenord?
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="bankid">
                  <div className="space-y-4">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Mobilt BankID
                    </Button>
                    <div className="text-center text-blue-600">eller</div>
                    <Button className="w-full bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors">
                      BankID på denna enhet
                    </Button>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </>
        ) : (
          <PasswordReset onBack={() => setIsResettingPassword(false)} />
        )}
      </div>
    </div>
  );
}
