import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { isAdminJWT } from "../services/authUtils";

interface AuthContextProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  setAuthToken: (token: string | null) => void;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authToken, setAuthTokenState] = useState<string | null>(localStorage.getItem("authToken"));
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const setAuthToken = (token: string | null) => {
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
    setAuthTokenState(token);
    updateIsAdmin(token);
  };

  const updateIsAdmin = (token: string | null) => {
    setIsAdmin(!!token && isAdminJWT());
  };

  const logout = () => {
    setAuthToken(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setAuthTokenState(token);
    updateIsAdmin(token);
    setLoading(false);
  }, []);

  const isAuthenticated = !!authToken;

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, loading, setAuthToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};