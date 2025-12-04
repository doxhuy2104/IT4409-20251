import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../../components/Logo';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const { forgotPassword, error, clearError } = useAuth();

    // Clear error when inputs change
    useEffect(() => {
        if (error && email) {
            const timer = setTimeout(() => {
                clearError();
            }, 3000);

            return () => {
                clearTimeout(timer);
            };
        }
    }, [email, error, clearError]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);
        clearError();

        try {
            const success = await forgotPassword(email);
            if (success) {
                setSubmitSuccess(true);
            }
        } catch (err) {
            console.error('Error requesting password reset:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-lime-100 py-10 px-4">
            <div className="sm:mx-auto sm:w-full sm:max-w-md w-full">
                <div className="bg-white py-8 px-4 sm:px-8 shadow-lg rounded-xl sm:rounded-2xl">
                    <div className="text-center mb-6">
                        {/* Logo */}
                        <Logo />
                        <h2 className="text-2xl font-bold text-gray-800">Quên mật khẩu</h2>
                        <p className="mt-1 text-sm text-gray-600">
                            {submitSuccess
                                ? 'Kiểm tra email của bạn để đặt lại mật khẩu'
                                : 'Nhập email của bạn để đặt lại mật khẩu'}
                        </p>
                    </div>
                    

                    {submitSuccess ? (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                <h3 className="text-sm font-medium text-green-800">Yêu cầu thành công!</h3>
                            </div>
                            <div className="mt-2 flex items-start">
                                <Mail className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-green-700">
                                        Nếu <span className="font-semibold">{email}</span> tồn tại trong hệ thống, chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu.
                                    </p>
                                    <p className="text-sm text-green-700 mt-1">
                                        Vui lòng kiểm tra hộp thư (cả thư rác) và nhấn vào liên kết trong email để đặt lại mật khẩu.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <Link
                                    to="/auth/login"
                                    className="flex items-center text-sm font-medium text-green-700 hover:text-green-900"
                                >
                                    
                                    Quay lại trang đăng nhập
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
                                            <h3 className="text-sm font-medium text-red-800">Yêu cầu thất bại</h3>
                                            <div className="mt-1 text-sm text-red-700 font-medium">
                                                {error}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

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

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md focus:ring-2 focus:ring-green-400 focus:outline-none mt-4`}
                                >
                                    {isSubmitting ? 'Đang xử lý...' : 'Gửi yêu cầu'}
                                </button>
                            </form>

                            <div className="mt-6 text-sm text-center">
                                <Link
                                    to="/auth/login"
                                    className="w-text-sm text-green-600 hover:text-green-700 font-medium"
                                >
                                    
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

export default ForgotPassword;
