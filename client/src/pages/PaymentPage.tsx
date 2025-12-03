import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Copy, Check, RefreshCw, AlertCircle } from 'lucide-react';
import orderService from '../services/order.service';
import { Order } from '../types/order';

const PaymentPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [isCheckingPayment, setIsCheckingPayment] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<{ paid: boolean; message?: string } | null>(null);
    const autoCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Lấy orderId từ params hoặc query string
    const currentOrderId = orderId || searchParams.get('orderId');

    useEffect(() => {
        const fetchOrder = async () => {
            if (!currentOrderId) {
                setError('Không tìm thấy mã đơn hàng');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const orders = await orderService.getOrders({ id: parseInt(currentOrderId) });

                if (orders && orders.length > 0) {
                    setOrder(orders[0]);
                } else {
                    setError('Không tìm thấy đơn hàng');
                }
            } catch (err) {
                console.error('Error fetching order:', err);
                setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [currentOrderId]);

    const checkingRef = useRef(false);

    // Tạo function độc lập không phụ thuộc state
    const checkPayment = useCallback(async () => {
        if (!order?.id || checkingRef.current) return;

        checkingRef.current = true;
        setIsCheckingPayment(true);

        try {
            const result = await orderService.checkPayment(order.id);
            setPaymentStatus(result);

            if (result.paid) {
                const updatedOrders = await orderService.getOrders({ id: order.id });
                if (updatedOrders?.[0]) {
                    setOrder(updatedOrders[0]);
                }
                setTimeout(() => navigate(`/orders/${order.id}`), 2000);
            }
        } catch (err) {
            console.error('Error checking payment:', err);
        } finally {
            setIsCheckingPayment(false);
            checkingRef.current = false;
        }
    }, [order?.id, navigate]);

    // Effect riêng cho auto-check
    useEffect(() => {
        if (!order || order.status !== 'draft') return;

        checkPayment(); // Check ngay lập tức
        const interval = setInterval(checkPayment, 15000);

        return () => clearInterval(interval);
    }, [order?.status, checkPayment]);
    // Auto check payment every 1 seconds if order is draft
    // useEffect(() => {
    //     if (!order || order.status !== 'draft') {
    //         return;
    //     }

    //     const checkPayment = async () => {
    //         if (!order.id || isCheckingPayment) return;

    //         try {
    //             setIsCheckingPayment(true);
    //             const result = await orderService.checkPayment(order.id);
    //             setPaymentStatus(result);

    //             if (result.paid) {
    //                 // Payment successful, reload order and redirect after 2 seconds
    //                 const updatedOrders = await orderService.getOrders({ id: order.id });
    //                 if (updatedOrders && updatedOrders.length > 0) {
    //                     setOrder(updatedOrders[0]);
    //                 }

    //                 setTimeout(() => {
    //                     navigate(`/orders/${order.id}`);
    //                 }, 2000);
    //             }
    //         } catch (err) {
    //             console.error('Error checking payment:', err);
    //         } finally {
    //             setIsCheckingPayment(false);
    //         }
    //     };

    //     // Check immediately
    //     checkPayment();

    //     // Then check every 15 seconds
    //     autoCheckIntervalRef.current = setInterval(checkPayment, 15000);

    //     return () => {
    //         if (autoCheckIntervalRef.current) {
    //             clearInterval(autoCheckIntervalRef.current);
    //         }
    //     };
    // }, [order, isCheckingPayment, navigate]);

    // // Manual check payment function
    // const handleCheckPayment = async () => {
    //     if (!order || !order.id || isCheckingPayment) return;

    //     try {
    //         setIsCheckingPayment(true);
    //         setPaymentStatus(null);
    //         const result = await orderService.checkPayment(order.id);
    //         setPaymentStatus(result);

    //         if (result.paid) {
    //             // Payment successful, reload order and redirect after 2 seconds
    //             const updatedOrders = await orderService.getOrders({ id: order.id });
    //             if (updatedOrders && updatedOrders.length > 0) {
    //                 setOrder(updatedOrders[0]);
    //             }

    //             setTimeout(() => {
    //                 navigate(`/orders/${order.id}`);
    //             }, 2000);
    //         }
    //     } catch (err: any) {
    //         console.error('Error checking payment:', err);
    //         setPaymentStatus({
    //             paid: false,
    //             message: err.message || 'Không thể kiểm tra thanh toán. Vui lòng thử lại.'
    //         });
    //     } finally {
    //         setIsCheckingPayment(false);
    //     }
    // };

    // Format currency
    const formatCurrency = (amount: number | string) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('vi-VN').format(numAmount) + 'đ';
    };

    // Tạo nội dung chuyển khoản (mã đơn hàng)
    const getTransferContent = () => {
        return order ? `ORDER${order.id}` : '';
    };

    // Tạo URL QR code
    const getQRCodeUrl = () => {
        if (!order) return '';

        const amount = Math.round(parseFloat(order.totalAmount));
        // const amount = 0;

        const description = encodeURIComponent(getTransferContent());
        // const description = '';
        return `https://img.vietqr.io/image/MB-777211004-compact2.png?amount=${amount}&addInfo=${description}&accountName=Do%20Xuan%20Huy`;
    };

    // Copy to clipboard
    const copyToClipboard = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5bbb46]"></div>
                    </div>
                    <p className="text-lg text-gray-600">Đang tải thông tin thanh toán...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Đã xảy ra lỗi</h2>
                    <p className="text-gray-600 mb-6">{error || 'Không tìm thấy đơn hàng'}</p>
                    <Link
                        to="/orders"
                        className="bg-[#5bbb46] text-white py-2 px-6 rounded-md font-medium hover:bg-[#43a32d] transition-colors inline-block"
                    >
                        Quay lại danh sách đơn hàng
                    </Link>
                </div>
            </div>
        );
    }

    const qrCodeUrl = getQRCodeUrl();
    const transferContent = getTransferContent();
    const amount = Math.round(parseFloat(order.totalAmount));

    return (
        <div className="container mx-auto px-4  max-w-4xl">
            {/* Header */}
            <div className="mb-6">
                <Link
                    to={`/orders/${order.id}`}
                    className="flex items-center text-[#5bbb46] hover:text-[#43a32d] font-medium mb-4"
                >
                    <ChevronLeft size={20} />
                    <span>Quay lại chi tiết đơn hàng</span>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Thanh toán đơn hàng #{order.id}</h1>
                <p className="text-gray-600 mt-2">Tổng tiền: <span className="font-bold text-[#5bbb46]">{formatCurrency(order.totalAmount)}</span></p>
            </div>

            <div className="bg-white p-6 md:p-8  ">
                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Vui lòng quét mã QR để thanh toán</h2>

                {/* VIETQR Logo */}
                <div className="flex justify-center mb-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold">
                            <span className="text-red-600">V</span>
                            <span className="text-blue-600">IETQR</span>
                        </div>
                    </div>
                </div>

                {/* QR Code */}
                <div className="flex justify-center mb-6">
                    <img
                        src={qrCodeUrl}
                        alt="QR Code chuyển khoản"
                        className="w-100 md:w-100"
                        onError={(e) => {
                            console.error('Error loading QR code:', e);
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                </div>


                {/* Transfer Information */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
                        Thông tin chuyển khoản ngân hàng
                    </h3>

                    {/* Important Notice */}
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                        <p className="text-red-700 text-sm font-medium text-center">
                            Vui lòng chuyển đúng nội dung <span className="font-bold">{transferContent}</span> để chúng tôi có thể xác nhận thanh toán
                        </p>
                    </div>

                    {/* Bank Account Details */}
                    <div className="space-y-4">
                        {/* Account Name */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-100">
                            <span className="font-medium text-gray-700 mb-2 sm:mb-0">Tên tài khoản:</span>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-900 font-semibold">Do Xuan Huy</span>
                                <button
                                    onClick={() => copyToClipboard("Do Xuan Huy", 'accountName')}
                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                    title="Sao chép"
                                >
                                    {copiedField === 'accountName' ? (
                                        <Check size={18} className="text-green-600" />
                                    ) : (
                                        <Copy size={18} className="text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Account Number */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-100">
                            <span className="font-medium text-gray-700 mb-2 sm:mb-0">Số tài khoản:</span>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-900 font-semibold">{777211004}</span>
                                <button
                                    onClick={() => copyToClipboard("777211004", 'accountNo')}
                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                    title="Sao chép"
                                >
                                    {copiedField === 'accountNo' ? (
                                        <Check size={18} className="text-green-600" />
                                    ) : (
                                        <Copy size={18} className="text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Bank Name */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-100">
                            <span className="font-medium text-gray-700 mb-2 sm:mb-0">Ngân hàng:</span>
                            <span className="text-gray-900 font-semibold">
                                MB Bank
                            </span>
                        </div>

                        {/* Amount */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-100">
                            <span className="font-medium text-gray-700 mb-2 sm:mb-0">Số tiền:</span>
                            <span className="text-[#5bbb46] font-bold text-lg">{formatCurrency(amount)}</span>
                        </div>

                        {/* Transfer Content */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-100">
                            <span className="font-medium text-gray-700 mb-2 sm:mb-0">Nội dung:</span>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-900 font-semibold">{transferContent}</span>
                                <button
                                    onClick={() => copyToClipboard(transferContent, 'content')}
                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                    title="Sao chép"
                                >
                                    {copiedField === 'content' ? (
                                        <Check size={18} className="text-green-600" />
                                    ) : (
                                        <Copy size={18} className="text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Hướng dẫn thanh toán:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                        <li>Mở ứng dụng ngân hàng trên điện thoại của bạn</li>
                        <li>Quét mã QR code ở trên hoặc nhập thông tin chuyển khoản</li>
                        <li>Kiểm tra lại số tiền và nội dung chuyển khoản</li>
                        <li>Xác nhận thanh toán</li>
                        <li>Hệ thống sẽ tự động kiểm tra và xác nhận đơn hàng sau khi nhận được thanh toán</li>
                    </ol>
                </div>

                {/* Payment Status Message */}
                {paymentStatus && (
                    <div className={`mt-6 p-4 rounded-md border ${paymentStatus.paid
                        ? 'bg-green-50 border-green-200'
                        : 'bg-yellow-50 border-yellow-200'
                        }`}>
                        <div className="flex items-center gap-2">
                            {paymentStatus.paid ? (
                                <Check size={20} className="text-green-600" />
                            ) : (
                                <AlertCircle size={20} className="text-yellow-600" />
                            )}
                            <p className={`text-sm font-medium ${paymentStatus.paid ? 'text-green-800' : 'text-yellow-800'
                                }`}>
                                {paymentStatus.paid
                                    ? 'Đã tìm thấy giao dịch thanh toán! Đang chuyển hướng...'
                                    : paymentStatus.message || 'Chưa tìm thấy giao dịch thanh toán. Vui lòng thử lại sau khi đã chuyển khoản.'
                                }
                            </p>
                        </div>
                    </div>
                )}

                {/* Check Payment Button (only show for draft orders) */}
                {/* {order.status === 'draft' && (
                    <div className="mt-6 flex justify-center">
                        <button
                            // onClick={handleCheckPayment}
                            disabled={isCheckingPayment}
                            className="flex items-center gap-2 bg-[#5bbb46] text-white py-3 px-6 rounded-md font-medium hover:bg-[#43a32d] transition-colors disabled:bg-[#5bbb46]/50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw
                                size={20}
                                className={isCheckingPayment ? 'animate-spin' : ''}
                            />
                            <span>
                                {isCheckingPayment ? 'Đang kiểm tra...' : 'Kiểm tra thanh toán'}
                            </span>
                        </button>
                    </div>
                )} */}

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to={`/orders/${order.id}`}
                        className="bg-[#5bbb46] text-white py-3 px-6 rounded-md font-medium hover:bg-[#43a32d] transition-colors text-center"
                    >
                        Xem chi tiết đơn hàng
                    </Link>
                    <Link
                        to="/orders"
                        className="border border-[#5bbb46] text-[#5bbb46] py-3 px-6 rounded-md font-medium hover:bg-[#5bbb46] hover:text-white transition-colors text-center"
                    >
                        Danh sách đơn hàng
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;

