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
import { User, Search, Home, Archive, Plus, Building, Calculator, FileText, Settings } from "lucide-react";
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

  // Role-based navigation items
  const getNavigationItems = () => {
    switch (user?.role) {
      case "bank_user":
        return [
          { href: "/dashboard", label: "Dashboard", icon: Home },
          { href: "/skapa-pantbrev", label: "Create Deed", icon: Plus },
          { href: "/pantbrev", label: "All Deeds", icon: FileText },
          { href: "/arkiv", label: "Archive", icon: Archive },
        ];
      case "cooperative_admin":
        return [
          { href: "/dashboard", label: "Dashboard", icon: Home },
          { href: "/pantbrev", label: "Review Deeds", icon: FileText },
          { href: "/my-associations", label: "My Cooperative", icon: Building },
          { href: "/settings", label: "Settings", icon: Settings },
        ];
      case "accounting_firm":
        return [
          { href: "/dashboard", label: "Dashboard", icon: Home },
          { href: "/pantbrev", label: "Manage Deeds", icon: FileText },
          { href: "/my-associations", label: "Cooperatives", icon: Building },
          { href: "/settings", label: "Settings", icon: Settings },
        ];
      default:
        return [
          { href: "/dashboard", label: "Dashboard", icon: Home },
        ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Building className="h-6 w-6" />
              <span className="font-bold">Kolibri</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-10 w-64"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.user_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.role === "bank_user" && `Bank: ${user?.bank_name}`}
                      {user?.role === "cooperative_admin" && "Cooperative Admin"}
                      {user?.role === "accounting_firm" && "Accounting Firm"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
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
