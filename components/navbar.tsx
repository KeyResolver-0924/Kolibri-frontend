"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Search } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/user-context";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const { refreshUser } = useUser();
  const [userFullName, setUserFullName] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const fetchUserData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setIsAuthenticated(false);
        setUserFullName("");
        return;
      }

      setIsAuthenticated(true);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("Error fetching user:", error);
        return;
      }

      // const firstName = user.user_metadata?.first_name;
      // const lastName = user.user_metadata?.last_name;?
      const userName = user.user_metadata?.user_name;

      if (userName) {
        setUserFullName(userName);
      } else {
        setUserFullName(
          user.user_metadata?.full_name || user.email?.split("@")[0] || "User"
        );
      }
    } catch (error: any) {
      console.error("Error fetching user:", error);
      setIsAuthenticated(false);
      setUserFullName("");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setIsAuthenticated(false);
        setUserFullName("");
      } else {
        fetchUserData();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setIsAuthenticated(false);
      setUserFullName("");
      router.replace("/login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Don't render the navbar on the login page
  if (pathname === "/login") {
    return null;
  }

  // If not authenticated, show minimal navbar or return null
  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Link href="/" className="text-xl font-bold">
              Kolibri v1
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative mr-2">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Sök..."
                className="pl-8 bg-primary-foreground text-primary w-[200px] focus-visible:ring-primary"
              />
            </div>
            <Button
              variant="ghost"
              asChild
              className="hover:bg-primary-foreground/10 text-primary-foreground hover:text-primary-foreground"
            >
              <Link href="/dashboard">Översikt</Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              className="hover:bg-primary-foreground/10 text-primary-foreground hover:text-primary-foreground"
            >
              <Link href="/my-associations">Mina Föreningar</Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              className="hover:bg-primary-foreground/10 text-primary-foreground hover:text-primary-foreground"
            >
              <Link href="/arkiv">Arkiv</Link>
            </Button>
            <Button
              asChild
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Link href="/skapa-pantbrev">Ny inteckning</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="hover:bg-primary-foreground/10 text-primary-foreground hover:text-primary-foreground"
                >
                  <span>{userFullName || "Loading..."}</span>
                  <User className="w-5 h-5 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="w-full">
                    Inställningar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleLogout}>
                  Logga ut
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
