"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";

type UserContextType = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session) {
        setUser(null);
        router.replace("/login");
        return;
      }
      setToken(session.access_token);
      // Check if session is expired or about to expire (within 5 minutes)
      if (
        session.expires_at &&
        session.expires_at <= Math.floor(Date.now() / 1000) + 300
      ) {
        const {
          data: { session: newSession },
          error: refreshError,
        } = await supabase.auth.refreshSession();

        if (refreshError) {
          // If refresh fails, redirect to login
          setUser(null);
          router.replace("/login");
          return;
        }

        if (!newSession) {
          setUser(null);
          router.replace("/login");
          return;
        }
        setToken(newSession.access_token);
      }

      // Get user data
      const {
        data: { user: authUser },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!authUser) {
        setUser(null);
        throw new Error("No user found");
      }

      // Transform auth user data to our User type
      const userData: User = {
        id: authUser.id,
        email: authUser.email!,
        user_name:
          authUser.user_metadata?.user_name ||
          authUser.email?.split("@")[0] ||
          "User",
        role: authUser.user_metadata?.role,
        bank_id: authUser.user_metadata?.bank_id,
        bank_name: authUser.user_metadata?.bank_name,
        phone: authUser.user_metadata?.phone,
      };

      setUser(userData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error refreshing user:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
      setUser(null);
      router.replace("/login");
    } finally {
      setIsLoading(false);
    }
  }, [supabase, router]);

  // Initial load
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Set up auth state change listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        router.replace("/login");
      } else if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") {
        await refreshUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, refreshUser, router]);

  return (
    <UserContext.Provider
      value={{ user, isLoading, error, refreshUser, token }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
