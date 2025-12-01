import React, { createContext, useState, useEffect } from 'react';
import authService from '../service/authService';
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
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (email: string, token: string, newPassword: string) => Promise<boolean>;
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

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  loginWithGoogle: () => {},
  handleGoogleCallback: async () => false,
  logout: () => {},
  forgotPassword: async () => false,
  resetPassword: async () => false,
  error: null,
  clearError: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Kiểm tra trạng thái đăng nhập khi tải trang
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const token = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          try {
            const userData = JSON.parse(storedUser);

            // Verify if the token is still valid
            const tokenData = parseJwt(token);
            if (tokenData) {
              console.log('Token still valid, user authenticated');
              setUser(userData);
            } else {
              // Token invalid or expired, log out the user
              console.log('Token invalid or expired, logging out');
              localStorage.removeItem('accessToken');
              localStorage.removeItem('user');
            }
          } catch (parseError) {
            console.error('Error parsing stored user data or token:', parseError);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
          }
        }
      } catch (err) {
        console.error('Error checking auth status:', err);
        // On error, remove potentially corrupted data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Logging in with:', email, password);

      const response = await authService.login(email, password);
      console.log('Got login response:', response);
      if (response && response.accessToken) {
        const token = response.accessToken;
        // Lưu access token
        localStorage.setItem('accessToken', token);
        console.log('Saved token:', token);

        // Parse JWT token để lấy thông tin người dùng
        const tokenData = parseJwt(token);
        console.log('Token data:', tokenData);

        if (tokenData && tokenData.id) {
          // Tạo thông tin người dùng từ dữ liệu trong token
          const user: User = {
            id: tokenData.id.toString(),
            fullName: tokenData.fullName || email.split('@')[0], // Fallback to email username if no fullName
            phone: tokenData.phone || '',
            email: tokenData.email || email,
            role: tokenData.role || 'user',
            createdAt: new Date(),
          };

          // Lưu thông tin người dùng vào localStorage để duy trì trạng thái đăng nhập
          localStorage.setItem('user', JSON.stringify(user));
          setUser(user);
          return true;
        } else {
          console.log('Using fallback user data since token did not contain user info');
          // Fallback to using the email as basic user info when token data is invalid
          const basicUser: User = {
            id: '0',
            fullName: email.split('@')[0],
            phone: '',
            email: email,
            role: 'user',
            createdAt: new Date(),
          };

          localStorage.setItem('user', JSON.stringify(basicUser));
          setUser(basicUser);
          return true;
        }
      } else {
        setError('Không thể đăng nhập. Vui lòng thử lại.');
        return false;
      }
    } catch (err: any) {
      console.error('Login error:', err);

      // Try to extract more detailed error message from API response
      if (err.response?.data?.message) {
        setError(`Lỗi: ${err.response.data.message}`);
      } else if (err.response?.status === 401) {
        setError('Email hoặc mật khẩu không đúng');
      } else if (err.response?.status === 403) {
        setError('Tài khoản của bạn chưa được xác thực. Vui lòng kiểm tra email để xác thực.');
      } else if (err.message === 'Network Error') {
        setError('Lỗi kết nối. Vui lòng kiểm tra kết nối internet và thử lại sau.');
      } else {
        setError('Không thể đăng nhập. Vui lòng thử lại sau.');
      }

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.register(userData);
      // Không đăng nhập tự động vì cần xác nhận email
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.response?.data?.message) {
        const errorMsg = error.response.data.message.toLowerCase();
        console.log('Error message:', errorMsg);

        if (errorMsg.includes('email') && errorMsg.includes('exists')) {
          setError('Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.');
        } else if (errorMsg.includes('phone') && errorMsg.includes('exists')) {
          setError('Số điện thoại này đã được đăng ký. Vui lòng sử dụng số điện thoại khác.');
        } else if (errorMsg.includes('exists')) {
          setError('Email hoặc số điện thoại này đã được đăng ký. Vui lòng sử dụng thông tin khác hoặc đăng nhập.');
        } else {
          setError(error.response.data.message);
        }
      } else if (error.message === 'Network Error') {
        setError('Lỗi kết nối. Vui lòng kiểm tra kết nối internet và thử lại sau.');
      } else {
        setError('Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
  }; const clearError = () => {
    setError(null);
  };

  // Forgot password functionality
  const forgotPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.forgotPassword(email);
      return true;
    } catch (error: any) {
      console.error('Forgot password error:', error);

      // Set user-friendly error messages
      if (error.message === 'Network Error') {
        setError('Lỗi kết nối. Vui lòng kiểm tra kết nối internet và thử lại sau.');
      } else if (error.response?.status === 404) {
        return true;
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password functionality
  const resetPassword = async (email: string, token: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.resetPassword(email, token, newPassword);
      return true;
    } catch (error: any) {
      console.error('Reset password error:', error);

      if (error.message === 'Network Error') {
        setError('Lỗi kết nối. Vui lòng kiểm tra kết nối internet và thử lại sau.');
      } else if (error.response?.status === 400) {
        setError('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại.');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Google authentication methods
  const loginWithGoogle = () => {
    authService.loginWithGoogle();
  };

  const handleGoogleCallback = async (accessToken: string): Promise<boolean> => {
    if (user) {
      console.log('User already authenticated, skipping Google callback processing');
      return true;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!accessToken) {
        setError('Không thể đăng nhập với Google. Vui lòng thử lại.');
        return false;
      }

      // Process the token from Google OAuth
      console.log('Processing Google OAuth token:', accessToken);

      // Ensure the token is stored first before processing
      localStorage.setItem('accessToken', accessToken);
      console.log('Token stored in localStorage in AuthContext');

      // Process the token with the auth service
      try {
        authService.handleGoogleCallback(accessToken);
      } catch (serviceErr) {
        console.warn('Auth service token handling error:', serviceErr);
      }

      // Parse JWT token to get user info
      const tokenData = parseJwt(accessToken);
      console.log('Google token data:', tokenData);

      if (tokenData) {
        // Create user from token data - handle different token structures
        const userId = tokenData.id || tokenData.sub || tokenData.user_id || '';
        const userEmail = tokenData.email || '';
        const userName = tokenData.fullName || tokenData.name || userEmail.split('@')[0] || 'User';

        const user: User = {
          id: userId.toString(),
          fullName: userName,
          phone: tokenData.phone || '',
          email: userEmail,
          role: tokenData.role || 'user',
          createdAt: new Date(),
        };

        console.log('Created user object from token:', user);

        // Save user info to localStorage for persistent login
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);

        // Double-check that token was saved
        const storedToken = localStorage.getItem('accessToken');
        if (!storedToken) {
          console.warn('Token not found in localStorage after saving, trying again');
          localStorage.setItem('accessToken', accessToken);
        }

        return true;
      } else {
        setError('Không thể đăng nhập với Google. Vui lòng thử lại.');
        return false;
      }
    } catch (err: any) {
      console.error('Google auth error:', err);
      setError('Đăng nhập Google thất bại. Vui lòng thử lại sau.');
      return false;
    } finally {
      setIsLoading(false);
    }
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
        forgotPassword,
        resetPassword,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
