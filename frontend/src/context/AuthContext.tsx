import { createContext, useContext, useEffect, useState } from "react";
import { getMe, logout as apiLogout } from "../api";

interface AuthContextType {
  isAuthenticated: boolean;
  // Set logout
  user: any;
  logout: () => Promise<void>;
  setAuthenticated: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setAuthenticated] = useState(false);
  // Added
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Added
  useEffect(() => {
    const checkSession = async () => {
        try{
            const data = await getMe();
            setUser(data.user);
            setAuthenticated(true);
        } catch{
            setAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    checkSession();
  }, []);

    const logout = async () => {
        await apiLogout();
        setAuthenticated(false);
        // Added
        setUser(null);
    }

    if (loading) return null;

//   useEffect(() => {
//     // We can't read HttpOnly cookies directly,
//     // so authentication is validated by backend on request.
//     // For now we assume not authenticated on load.
//     setAuthenticated(false);
//   }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, logout, setAuthenticated }}>
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