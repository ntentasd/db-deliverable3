import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { isAdminJWT } from "../services/authUtils";

interface AuthContextProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAuthToken: (token: string | null) => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authToken, setAuthTokenState] = useState<string | null>(localStorage.getItem("authToken"));

  const setAuthToken = (token: string | null) => {
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
    setAuthTokenState(token);
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setAuthTokenState(token);
  }, []);

  const isAuthenticated = !!authToken;
  const isAdmin = isAuthenticated && isAdminJWT();

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, setAuthToken }}>
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