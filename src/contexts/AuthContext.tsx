"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { AuthContextType } from "./auth-types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Paprastas slaptažodis (produkcijoje reikėtų naudoti bcrypt)
const ADMIN_PASSWORD = "keliones2025*";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Tikrinam ar yra admin localStorage
    const adminSession = localStorage.getItem("admin-session");
    if (adminSession === "true") {
      setIsAdmin(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (password: string): Promise<boolean> => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      localStorage.setItem("admin-session", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem("admin-session");
  };

  return (
    <AuthContext.Provider value={{ isAdmin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
