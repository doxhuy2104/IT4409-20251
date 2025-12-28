import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";

interface User {
  id: string;
  email: string;
  fullName?: string;
  role?: any;
}

interface DecodedToken {
  sub: string;
  email: string;
  exp: number;
  [key: string]: any;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * Check if token is expired
 */
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp <= currentTime;
  } catch {
    return true;
  }
};

/**
 * Check if token expires soon (within 5 minutes)
 */
const isTokenExpiringSoon = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp - currentTime < 300;
  } catch {
    return true;
  }
};

/**
 * Get token from localStorage
 */
const getStoredToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

/**
 * Store token in localStorage
 */
const storeToken = (token: string): void => {
  localStorage.setItem("accessToken", token);
};

/**
 * Remove token from localStorage
 */
const removeToken = (): void => {
  localStorage.removeItem("accessToken");
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch user information from API
   */
  const fetchUserInfo = async (): Promise<void> => {
    try {
      const res = await api.get("/manager/me");
      setCurrentUser({
        id: res.data.data.id,
        email: res.data.data.email,
        fullName: res.data.data.fullName,
        role: res.data.data.role,
      });
      setError(null);
    } catch (error) {
      console.error("Error fetching user info:", error);
      setError("Failed to fetch user information");
      throw error;
    }
  };

  /**
   * Refresh access token
   */
  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const response = await api.get("/auth/managers/refresh-token");
      const { accessToken } = response.data.data;
      storeToken(accessToken);
      console.log("Token refreshed successfully");
      return accessToken;
    } catch (err) {
      console.error("Error refreshing token:", err);
      return null;
    }
  };

  /**
   * Check and validate token
   */
  const checkToken = async (): Promise<void> => {
    try {
      const token = getStoredToken();
      
      if (!token) {
        handleLogout();
        return;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log("Token expired, attempting refresh");
        const newToken = await refreshAccessToken();
        
        if (newToken) {
          await fetchUserInfo();
        } else {
          handleLogout();
        }
        return;
      }

      // Check if token expires soon
      if (isTokenExpiringSoon(token)) {
        console.log("Token expiring soon, refreshing");
        await refreshAccessToken();
      }

      await fetchUserInfo();
    } catch (err) {
      console.error("Error checking token:", err);
      handleLogout();
    }
  };

  /**
   * Initialize auth state
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await checkToken();
      } catch (err) {
        console.error("Error initializing auth:", err);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up token check interval (every minute)
    const tokenCheckInterval = setInterval(checkToken, 60000);

    return () => clearInterval(tokenCheckInterval);
  }, []);

  /**
   * Handle user login
   */
  const handleLogin = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      setLoading(true);

      const response = await api.post("/auth/managers/login", { 
        email: email.trim(), 
        password 
      });

      const { accessToken } = response.data.data;

      if (!accessToken) {
        throw new Error("No access token received");
      }

      storeToken(accessToken);
      await fetchUserInfo();
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.message || "Login failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle user logout
   */
  const handleLogout = async (): Promise<void> => {
    try {
      removeToken();
      setCurrentUser(null);
      setError(null);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Context value
   */
  const value: AuthContextType = {
    currentUser,
    loading,
    error,
    login: handleLogin,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
