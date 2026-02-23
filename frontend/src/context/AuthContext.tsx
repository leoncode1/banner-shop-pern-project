import { createContext, useContext, useEffect, useState } from "react";
import { logout as apiLogout } from "../api";

interface AuthContextType {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  // Set logout
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setAuthenticated] = useState(false);

    const logout = async () => {
        await apiLogout();
        setAuthenticated(false);
    }

  useEffect(() => {
    // We can't read HttpOnly cookies directly,
    // so authentication is validated by backend on request.
    // For now we assume not authenticated on load.
    setAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};