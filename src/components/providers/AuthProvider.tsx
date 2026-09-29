"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface AuthUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  streak: number;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  updateProfile: (data: { name?: string; bio?: string; image?: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  incrementStreak: (newStreak: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [streak, setStreak] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        }
      }
    } catch (e) {
      console.error("Failed to load user profile", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const updateProfile = async (data: { name?: string; bio?: string; image?: string }) => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        setUser(result.user);
        router.refresh();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const incrementStreak = (newStreak: number) => {
    setStreak(newStreak);
    router.refresh();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        streak,
        isLoading,
        refreshUser,
        updateProfile,
        logout,
        incrementStreak,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
