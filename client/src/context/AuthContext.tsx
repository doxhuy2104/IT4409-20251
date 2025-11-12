import React, { createContext, useState, useEffect } from 'react';
import { parseJwt } from '../utils/jwt';

export interface User {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  role: 'user' | 'admin' | 'staff';
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  loginWithGoogle: () => void;
  handleGoogleCallback: (accessToken: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

export interface RegisterData {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  birthDate?: string;
}

// Test authService 
const AuthService = {
  login: async (email: string, password: string) => {
    console.log('Test login with', email);
    if (email === 'test@example.com' && password === '123456') {
      return { accessToken: 'mock.jwt.token' };
    }
    throw { response: { status: 401, data: { message: 'Invalid credentials' } } };
  },
  register: async (userData: RegisterData) => {
    console.log('Test register user:', userData);
    return { success: userData };
  },
  loginWithGoogle: () => {
    console.log('Redirecting to Google...');
  },
  handleGoogleCallback: (accessToken: string) => {
    console.log('Handling Google callback with token:', accessToken);
  },
};


const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  loginWithGoogle: () => {},
  handleGoogleCallback: async () => false,
  logout: () => {},
  error: null,
  clearError: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const token = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          const tokenData = parseJwt(token);
          if (tokenData) {
            setUser(JSON.parse(storedUser));
          } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
          }
        }
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  //Các hàm xử lý
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AuthService.login(email, password);
      const token = response.accessToken;
      localStorage.setItem('accessToken', token);

      const testUser: User = {
        id: '1',
        fullName: 'Test User',
        phone: '0123456789',
        email,
        role: 'user',
        createdAt: new Date(),
      };

      localStorage.setItem('user', JSON.stringify(testUser));
      setUser(testUser);
      return true;
    } catch (err: any) {
      setError('Email hoặc mật khẩu không đúng.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await AuthService.register(userData);
      return true;
    } catch {
      setError('Có lỗi khi đăng ký.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const clearError = () => setError(null);
  const loginWithGoogle = () => AuthService.loginWithGoogle();

  const handleGoogleCallback = async (accessToken: string): Promise<boolean> => {
    AuthService.handleGoogleCallback(accessToken);
    const fakeUser: User = {
      id: 'google123',
      fullName: 'Google User',
      phone: '',
      email: 'googleuser@example.com',
      role: 'user',
      createdAt: new Date(),
    };
    localStorage.setItem('user', JSON.stringify(fakeUser));
    setUser(fakeUser);
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginWithGoogle,
        handleGoogleCallback,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
