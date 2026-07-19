"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { api, setAccessToken } from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

interface User {
  account_id: string;
  email: string;
  username: string;
  is_verified: boolean;
  joined_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = useCallback(async (skipApiCall = false) => {
    if (skipApiCall !== true) {
      try {
        await api.post("/auth/logout");
      } catch (error) {
        console.error("Logout error", error);
      }
    }
    
    setUser(null);
    setAccessToken(null);
    if (pathname.startsWith("/dashboard")) {
      router.push("/auth");
    }
  }, [router, pathname]);

  // Attempt to fetch current user on mount
  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      try {
        const response = await api.get("/auth/me");
        if (mounted) setUser(response.data.data);
      } catch (error) {
        if (mounted) {
          setUser(null);
          setAccessToken(null);
          // If we're on a protected route and failed to fetch user, kick them to auth
          if (window.location.pathname.startsWith("/dashboard")) {
            router.push("/auth");
          }
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchUser();
    
    return () => { mounted = false; };
  }, [router]);

  // Listen for custom logout event dispatched from api.ts interceptor
  useEffect(() => {
    const handleAuthLogoutEvent = () => {
      // Avoid spamming toasts if we are already unauthenticated
      if (user !== null) {
        toast.error("Session expired. Please log in again.");
      }
      handleLogout(true);
    };

    window.addEventListener("auth:logout", handleAuthLogoutEvent);
    return () => window.removeEventListener("auth:logout", handleAuthLogoutEvent);
  }, [handleLogout, user]);

  const login = (token: string, userData: User) => {
    setAccessToken(token);
    setUser(userData);
    router.push("/dashboard/workspaces"); // Default redirect as requested
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
