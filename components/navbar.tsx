"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Search, Home, Archive, Plus, Building } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { useUser } from "@/contexts/user-context";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const { user, isLoading } = useUser();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace("/login");
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Error",
        variant: "destructive",
      });
    }
  };

  // Don't render the navbar on the login page or if there's no user
  if (pathname === "/login" || (!user && !isLoading)) {
    return null;
  }

  // Show loading skeleton while user data is being fetched
  // if (isLoading) {
  //   return (
  //     <nav className="bg-primary text-primary-foreground">
  //       <div className="container mx-auto px-4">
  //         <div className="flex items-center justify-between h-16">
  //           <div className="flex items-center space-x-2">
  //             <Skeleton className="h-8 w-24" />
  //           </div>
  //           <div className="flex items-center space-x-4">
  //             <Skeleton className="h-10 w-[200px]" />
  //             <Skeleton className="h-10 w-24" />
  //             <Skeleton className="h-10 w-24" />
  //             <Skeleton className="h-10 w-24" />
  //             <Skeleton className="h-10 w-32" />
  //           </div>
  //         </div>
  //       </div>
  //     </nav>
  //   );
  // }

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
                placeholder="Search..."
                className="pl-8 bg-primary-foreground text-primary w-[200px] focus-visible:ring-primary"
              />
            </div>
            <Button
              variant="ghost"
              asChild
              className="hover:bg-primary-foreground/10 text-primary-foreground hover:text-primary-foreground"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Overview
              </Link>
            </Button>
            {user?.role === "cooperative_admin" && (
              <Button
                variant="ghost"
                asChild
                className="hover:bg-primary-foreground/10 text-primary-foreground hover:text-primary-foreground"
              >
                <Link
                  href="/my-associations"
                  className="flex items-center gap-2"
                >
                  <Building className="h-4 w-4" />
                  My Cooperatives
                </Link>
              </Button>
            )}
            <Button
              variant="ghost"
              asChild
              className="hover:bg-primary-foreground/10 text-primary-foreground hover:text-primary-foreground"
            >
              <Link href="/arkiv" className="flex items-center gap-2">
                <Archive className="h-4 w-4" />
                Archive
              </Link>
            </Button>
            <Button
              asChild
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Link href="/skapa-pantbrev" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Mortgage
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="hover:bg-primary-foreground/10 text-primary-foreground hover:text-primary-foreground"
                >
                  <span className="flex items-center gap-2">
                    {user?.user_name || "User"}
                    <User className="h-4 w-4" />
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-normal text-sm text-muted-foreground">
                      Signed in as
                    </span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user?.role === "bank_user" && (
                  <>
                    <DropdownMenuLabel>
                      <span className="font-normal text-sm text-muted-foreground">
                        Bank: {user.bank_name}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                  onSelect={handleLogout}
                >
                  Sign Out
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
