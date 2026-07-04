"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { api, setAccessToken } from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  isVerified: boolean;
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

  const handleLogout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      setUser(null);
      setAccessToken(null);
      if (pathname.startsWith("/dashboard")) {
        router.push("/auth");
      }
    }
  }, [router, pathname]);

  // Attempt to fetch current user (silent refresh) on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // We attempt to hit the /me endpoint. If the user has a valid refresh cookie,
        // the Axios interceptor will catch the 401, refresh the token, and retry this request seamlessly.
        const response = await api.get("/auth/me");
        setUser(response.data.user);
      } catch (error) {
        setUser(null);
        setAccessToken(null);
        // If we're on a protected route and failed to fetch user, kick them to auth
        if (pathname.startsWith("/dashboard")) {
          router.push("/auth");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    // Listen for custom logout event dispatched from api.ts interceptor
    const handleAuthLogoutEvent = () => {
      toast.error("Session expired. Please log in again.");
      handleLogout();
    };

    window.addEventListener("auth:logout", handleAuthLogoutEvent);
    return () => window.removeEventListener("auth:logout", handleAuthLogoutEvent);
  }, [handleLogout, pathname, router]);

  const login = (token: string, userData: User) => {
    setAccessToken(token);
    setUser(userData);
    router.push("/dashboard/workflows"); // Default redirect as requested
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
