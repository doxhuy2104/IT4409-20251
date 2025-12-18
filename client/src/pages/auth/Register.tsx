import React, { useState, useEffect } from 'react';
import { CheckCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../../components/Logo';

const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const {register, error, clearError, loginWithGoogle } = useAuth();

  //Testing password complexity
  useEffect(() => {
    if (password) {
      if (password.length < 6) {
        setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      } else if (!/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
        setPasswordError('Mật khẩu phải chứa ít nhất 1 chữ và 1 số');
      } else {
        setPasswordError('');
      }
    } else {
      setPasswordError('');
    }
  }, [password]);

  // Clear error when inputs change
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        if (
          (error.toLowerCase().includes('email') && email) ||
          (error.toLowerCase().includes('điện thoại') && phone) ||
          (fullName || password) // For general errors
        ) {
          clearError();
        }
      }, 3000);

      // Clean up timer if component unmounts or inputs change again
      return () => {
        clearTimeout(timer);
      };
    }
  }, [email, phone, fullName, password, error, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password match
    if (password !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp');
      return;
    }

    // Validate password complexity
    if (password.length < 6 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
      return;
    }

    // Include required fields and optional fields if available
    const userData = {
      fullName,
      phone,
      email, 
      password,
      ...(birthDate && { birthDate }),
    }; setIsSubmitting(true);

    try {
      const success = await register(userData);
      if (success) {
        setRegistrationSuccess(true);
        console.log('Đăng ký thành công! Vui lòng đăng nhập.');
      } else if (error) {
        setTimeout(() => {
          const errorElement = document.getElementById('error-message');
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setRegistrationSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-lime-100 py-10 px-4">
      <div className="bg-white/95 backdrop-blur-md shadow-xl rounded-2xl border border-green-200 p-8 w-full max-w-md">
        {/* Logo và tiêu đề */}
        <div className="text-center mb-6">
          <Logo />
          <p className="text-gray-600 text-sm">
            Tạo tài khoản để bắt đầu mua sắm thực phẩm sạch 
          </p>
        </div>

        {/* Nút đăng ký bằng Google */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => loginWithGoogle()}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2.5 px-4 rounded-lg hover:bg-gray-50 transition"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            <span className="font-medium text-sm">Tiếp tục với Google</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center text-sm mb-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="mx-4 text-gray-500">hoặc</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Hiển thị lỗi */}
        {error && (
          <div
            id="error-message"
            className="p-4 mb-6 rounded-md bg-red-50 border border-red-300 shadow-sm"
          >
            <h3 className="text-sm font-bold text-red-800">Đăng ký thất bại</h3>
            <p className="mt-1 text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1 text-left ml-0">
              Họ và tên
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Nhập họ và tên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-400 outline-none text-sm"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 text-left ml-0">
              Số điện thoại
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="Nhập số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-400 outline-none text-sm"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 text-left ml-0">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-400 outline-none text-sm"
            />
          </div>

          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1 text-left ml-0">
              Ngày sinh
            </label>
            <input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-400 outline-none text-sm"
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 text-left ml-0">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-400 outline-none text-sm"
            />
            {passwordError && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}
          </div>

          <div className="relative">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1 text-left ml-0"
            >
              Xác nhận mật khẩu
            </label>
            <input
              id="confirmPassword"
              type='password'
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-400 outline-none text-sm"
            />
          </div>

          {/* Điều khoản */}
          <div className="flex items-start mt-2">
            <input
              id="terms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="w-4 h-4 mt-1 border-gray-300 rounded text-green-600 focus:ring-green-400"
              required
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
              Tôi đồng ý với{" "}
              <a href="#" className="text-green-600 hover:underline">
                Điều khoản
              </a>{" "}
              và{" "}
              <a href="#" className="text-green-600 hover:underline">
                Chính sách bảo mật
              </a>
              .
            </label>
          </div>

          {registrationSuccess && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <h3 className="text-sm font-medium text-green-800">Đăng ký thành công!</h3>
                  </div>
                  <div className="mt-2 flex items-start">
                    <Mail className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-green-700">
                        Email xác nhận đã được gửi đến <span className="font-semibold">{email}</span>
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        Vui lòng kiểm tra hộp thư (cả thư rác) và nhấn vào liên kết xác nhận để hoàn tất đăng ký.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Link to="/auth/login" className="text-sm font-medium text-green-700 hover:text-green-900 underline">
                      Quay lại trang đăng nhập
                    </Link>
                  </div>
                </div>
              )}

          {/* Nút đăng ký */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md focus:ring-2 focus:ring-green-400 focus:outline-none mt-4 ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Đăng ký ngay'}
          </button>
        </form>

        <div className="mt-6 text-sm text-center text-gray-600">
          Đã có tài khoản?{' '}
          <Link to="/auth/login" className="text-green-600 font-medium hover:text-green-700">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
    </>
  );
};

export default Register;