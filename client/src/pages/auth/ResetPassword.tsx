import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../../components/Logo';

const ResetPassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);
    const [tokenError, setTokenError] = useState('');

    const { resetPassword, error, clearError } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Extract token and email from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const email = queryParams.get('email');

    // Validate token and email presence
    useEffect(() => {
        if (!token || !email) {
            setTokenError('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.');
        }
    }, [token, email]);

    // Password validation
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
        if (error && (password || confirmPassword)) {
            const timer = setTimeout(() => {
                clearError();
            }, 3000);

            return () => {
                clearTimeout(timer);
            };
        }
    }, [password, confirmPassword, error, clearError]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Ensure we have token and email
        if (!token || !email) {
            setTokenError('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
            return;
        }

        // Validate password match
        if (password !== confirmPassword) {
            setPasswordError('Mật khẩu xác nhận không khớp');
            return;
        }

        // Validate password complexity
        if (password.length < 6 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
            return;
        }

        setIsSubmitting(true);
        clearError();

        try {
            const success = await resetPassword(email, token, password);
            if (success) {
                setResetSuccess(true);
                // Redirect to login page after 3 seconds
                setTimeout(() => {
                    navigate('/auth/login');
                }, 3000);
            }
        } catch (err) {
            console.error('Error resetting password:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // If there's a token error, show error message
    if (tokenError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-lime-100 py-10 px-4">
                <div className="sm:mx-auto sm:w-full sm:max-w-md w-full">
                    <div className="bg-white py-8 px-4 sm:px-8 shadow-lg rounded-xl sm:rounded-2xl">
                        <div className="text-center mb-6">
                            <Logo />
                            <h2 className="text-2xl font-bold text-gray-800">Đặt lại mật khẩu</h2>
                        </div>

                        <div className="p-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex">
                                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                                <div>
                                    <h3 className="text-sm font-medium text-yellow-800">Liên kết không hợp lệ</h3>
                                    <p className="mt-1 text-sm text-yellow-700">{tokenError}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 text-center">
                            <Link
                                to="/auth/forgot-password"
                                className="text-sm font-medium text-green-600 hover:text-green-700"
                            >
                                Yêu cầu liên kết đặt lại mật khẩu mới
                            </Link>
                        </div>

                        <div className="mt-6 text-sm text-center">
                            <Link
                                to="/auth/login"
                                className="flex items-center justify-center text-green-600 font-medium hover:text-green-700 transition-colors"
                            >
                                <ArrowLeft size={16} className="mr-1" />
                                Quay lại trang đăng nhập
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-lime-100 py-10 px-4">
            <div className="sm:mx-auto sm:w-full sm:max-w-md w-full">
                <div className="bg-white py-8 px-4 sm:px-8 shadow-lg rounded-xl sm:rounded-2xl">
                    <div className="text-center mb-6">
                        <Logo />
                        <h2 className="text-2xl font-bold text-gray-800">Đặt lại mật khẩu</h2>
                        <p className="mt-1 text-sm text-gray-600">
                            {resetSuccess
                                ? 'Mật khẩu của bạn đã được đặt lại thành công'
                                : 'Tạo mật khẩu mới cho tài khoản của bạn'}
                        </p>
                    </div>

                    {resetSuccess ? (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                <h3 className="text-sm font-medium text-green-800">Đặt lại mật khẩu thành công!</h3>
                            </div>
                            <p className="mt-2 text-sm text-green-700">
                                Mật khẩu của bạn đã được đặt lại thành công. Bạn sẽ được chuyển đến trang đăng nhập trong vài giây...
                            </p>
                            <div className="mt-4">
                                <Link
                                    to="/auth/login"
                                    className="text-sm font-medium text-green-700 hover:text-green-900 underline"
                                >
                                    Đăng nhập ngay
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="p-3 mb-4 rounded-md bg-red-50 border border-red-200 shadow-sm">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800">Lỗi đặt lại mật khẩu</h3>
                                            <div className="mt-1 text-sm text-red-700 font-medium">
                                                {error}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="relative">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Nhập mật khẩu mới"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#2563EB] focus:ring-1 focus:ring-[#4F46E5] outline-none transition-colors text-sm"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-[calc(50%+3px)] transform -translate-y-1/2 text-gray-500"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                    <p className="mt-1 text-xs italic text-gray-500">
                                        (*) Mật khẩu tối thiểu 6 ký tự, có ít nhất 1 chữ và 1 số. (VD: 12345a)
                                    </p>
                                    {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
                                </div>

                                <div className="relative">
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Nhập lại mật khẩu mới"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#2563EB] focus:ring-1 focus:ring-[#4F46E5] outline-none transition-colors text-sm"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-[calc(50%+12px)] transform -translate-y-1/2 text-gray-500"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md focus:ring-2 focus:ring-green-400 focus:outline-none mt-4 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isSubmitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                                </button>
                            </form>

                            <div className="mt-6 text-sm text-center">
                                <Link
                                    to="/auth/login"
                                    className="flex items-center justify-center text-green-600 font-medium hover:text-green-700 transition-colors"
                                >
                                    <ArrowLeft size={16} className="mr-1" />
                                    Quay lại trang đăng nhập
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
