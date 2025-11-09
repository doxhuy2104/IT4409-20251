import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../../components/Logo';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { isAuthenticated, login, error, clearError, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting login form with:', { email, password });
    try {
      setIsSubmitting(true);
      setLocalError(null); // Clear any local errors on new submission
      clearError(); // Clear any previous auth context errors

      const success = await login(email, password);
      console.log('Login result:', success);
      if (success) {
        navigate('/');
      } else {
        // If login returns false but no error was set in context, set a local error
        if (!error) {
          setLocalError('Không thể đăng nhập. Vui lòng kiểm tra email và mật khẩu của bạn.');
        }
      }
    } catch (error: any) {
      console.error('Login error in component:', error);
      // Error is already handled in the AuthContext, but we can set it locally too
      if (!error) {
        setLocalError('Không thể đăng nhập. Vui lòng thử lại sau.');
      }
    } finally {
      setIsSubmitting(false);

      // Scroll to the error message if needed
      setTimeout(() => {
        const errorElement = document.querySelector('.bg-red-50');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  // Clear error only when unmounting
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Create a debounced error clearing effect - only clear errors after user
  // has stopped typing for a while (3 seconds)
  useEffect(() => {
    if (email || password) {
      // User is typing, set up timer to clear error after delay
      const timer = setTimeout(() => {
        if (error) {
          clearError();
        }
        if (localError) {
          setLocalError(null);
        }
      }, 3000); // Increase to 3 seconds so users have time to read the error

      // Clean up timer if component unmounts or inputs change again
      return () => {
        clearTimeout(timer);
      };
    }
  }, [email, password, clearError, error, localError]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md w-full">
        <div className="bg-white py-8 px-4 sm:px-8 shadow-lg rounded-xl sm:rounded-2xl">
          <div className="text-center mb-8">
            {/* Logo */}
            <Logo />
            <h2 className="text-2xl font-bold text-gray-800">Đăng nhập</h2>
            <p className="mt-1 text-sm text-gray-600">Chào mừng bạn quay trở lại!</p>
          </div>          {/* Social login buttons */}          <div className="mb-6">            <button
            type="button"
            onClick={() => loginWithGoogle()}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2.5 px-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            <span className="font-medium text-sm">Google</span>
          </button>
          </div>

          <div className="relative flex items-center justify-center text-sm mb-6">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-500">hoặc</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Nhập email của bạn"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#2563EB] focus:ring-1 focus:ring-[#4F46E5] outline-none transition-colors text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu của bạn"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#2563EB] focus:ring-1 focus:ring-[#4F46E5] outline-none transition-colors text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-[calc(50%+14px)] transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {(error || localError) && (
              <div className="p-3 mt-3 rounded-md bg-red-50 border border-red-200 shadow-sm transition-all duration-300 ease-in-out transform-gpu">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Đăng nhập thất bại</h3>
                    <div className="mt-1 text-sm text-red-700 font-medium">
                      {error || localError}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <Link to="/auth/forgot-password" className="text-sm text-[#2563EB] hover:text-[#4F46E5] transition-colors">
                Quên mật khẩu?
              </Link>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r from-[#2563EB] to-[#4F46E5] hover:from-[#1E40AF] hover:to-[#3730A3] text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:outline-none ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-6 text-sm text-center">
            <span className="text-gray-600">Bạn chưa có tài khoản? </span>
            <Link to="/auth/register" className="text-[#2563EB] font-medium hover:text-[#4F46E5] transition-colors">
              Đăng ký ngay
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;