import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../../components/Logo';

const GoogleCallback: React.FC = () => {
    const [isProcessing, setIsProcessing] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { handleGoogleCallback } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Use a ref to track if callback has been processed
    const isProcessed = useRef(false);

    useEffect(() => {
        const processGoogleCallback = async () => {
            // Prevent multiple processing
            if (isProcessed.current) {
                return;
            }
            isProcessed.current = true;

            // Extract the token directly from the URL
            const searchParams = new URLSearchParams(location.search);
            const accessToken = searchParams.get('accessToken');
            const authError = searchParams.get('error');

            if (authError) {
                console.error('Google authentication error:', authError);
                setError(`Đăng nhập Google thất bại: ${authError}`);
                setIsProcessing(false);
                return;
            }

            if (!accessToken) {
                console.error('No access token found in URL');
                setError('Không tìm thấy mã truy cập. Vui lòng thử lại.');
                setIsProcessing(false);
                return;
            }

            try {
                console.log('Processing Google OAuth callback with token');

                // Process the authentication only once
                const success = await handleGoogleCallback(accessToken);

                if (success) {
                    // Add delay to ensure state is updated before navigation
                    console.log('Authentication successful, redirecting to home...');
                    setTimeout(() => {
                        navigate('/', { replace: true });
                    }, 1000);
                } else {
                    setError('Không thể xác thực với Google sau nhiều lần thử. Vui lòng thử lại sau.');
                    setIsProcessing(false);
                }
            } catch (err) {
                console.error('Error processing Google callback:', err);
                setError('Đã xảy ra lỗi khi xử lý đăng nhập Google. Vui lòng thử lại sau.');
                setIsProcessing(false);
            }
        };

        processGoogleCallback();
    }, [handleGoogleCallback, location.search, navigate]);

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-lime-100 py-10 px-4">
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
                    <Logo />
                    <div className="mt-6">
                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">Đăng nhập thất bại</h2>
                            <p className="text-red-600">{error}</p>
                        </div>
                        <button
                            onClick={() => navigate('/auth/login')}
                            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md focus:ring-2 focus:ring-green-400 focus:outline-none"
                        >
                            Quay lại trang đăng nhập
                        </button>
                    </div>
                </div>
            </div>
            
        );
    }

    if (!isProcessing) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-lime-100 py-10 px-4">
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
                    <Logo />
                    <h2 className="text-xl font-semibold text-gray-800">Đăng nhập thành công</h2>
                    <p className="text-gray-600 mt-2">Chào mừng bạn đến với cửa hàng sản phẩm hữu cơ!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-lime-100 py-10 px-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
                <Logo />
                <div className="mt-6">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
                        <h2 className="text-xl font-semibold text-gray-800">Đang xử lý đăng nhập</h2>
                        <p className="text-gray-600 mt-2">Vui lòng đợi trong giây lát...</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoogleCallback;
