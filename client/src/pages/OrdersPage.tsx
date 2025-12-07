import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, User, X, Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import { Order, OrderStatus, OrderSummary } from '../types/order';
import { useAuth } from '../hooks/useAuth';
import orderService, { OrderFilterParams } from '../services/order.service';
import { Link } from 'react-router-dom';
import { EnhancedOrderItem, fetchProductDetailsForOrderItems } from '../utils/orderEnhancer';

// Enhanced order interface with enhanced order items
interface EnhancedOrder extends Omit<Order, 'orderItems'> {
  orderItems: EnhancedOrderItem[];
}

// Format currency
const formatCurrency = (amount: string): string => {
  return new Intl.NumberFormat('vi-VN').format(parseFloat(amount)) + '₫';
};

// Format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Status badge component
const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'draft':
        return 'Chưa thanh toán';
      case 'pending':
        return 'Chờ xác nhận';
      case 'processing':
        return 'Đã xác nhận';
      case 'shipped':
        return 'Đang vận chuyển';
      case 'delivered':
        return 'Đã giao hàng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {getStatusText(status)}
    </span>
  );
};

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [filteredOrders, setFilteredOrders] = useState<EnhancedOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date('2025-01-01'),
    end: new Date()
  });
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    totalOrders: 0,
    totalSpent: 0
  });
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Handle click outside to close date picker
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch enhanced orders data with product details
  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Create filter parameters based on current selections
        const filters: OrderFilterParams = {};

        // Add status filter - send 'all' to include draft orders
        if (selectedStatus !== 'all') {
          filters.status = selectedStatus;
        } else {
          filters.status = 'all';
        }

        // Add date range filters
        if (dateRange.start) {
          // Set start date to beginning of the day in local timezone
          const startDate = new Date(dateRange.start);
          startDate.setHours(0, 0, 0, 0);
          // Convert to YYYY-MM-DD format for server
          const year = startDate.getFullYear();
          const month = String(startDate.getMonth() + 1).padStart(2, '0');
          const day = String(startDate.getDate()).padStart(2, '0');
          filters.startDate = `${year}-${month}-${day}`;
        }
        if (dateRange.end) {
          // Set end date to next day to ensure all orders on endDate are included
          // This ensures orders created at any time on endDate (up to 23:59:59) are included
          const endDate = new Date(dateRange.end);
          endDate.setDate(endDate.getDate() + 1);
          endDate.setHours(0, 0, 0, 0);
          // Convert to YYYY-MM-DD format for server
          const year = endDate.getFullYear();
          const month = String(endDate.getMonth() + 1).padStart(2, '0');
          const day = String(endDate.getDate()).padStart(2, '0');
          filters.endDate = `${year}-${month}-${day}`;
        }

        // Call API with filters
        const response = await orderService.getOrders(filters);

        if (response) {
          // Process each order to include full product details for each order item
          const enhancedOrdersPromises = response.map(async (order) => {
            // Use the utility function to enhance order items with product details
            const enhancedItems = await fetchProductDetailsForOrderItems(order.orderItems);

            // Return the enhanced order with detailed items
            return {
              ...order,
              orderItems: enhancedItems
            } as EnhancedOrder;
          });
          // Wait for all order enhancement promises to resolve
          const enhancedOrders = await Promise.all(enhancedOrdersPromises);

          setFilteredOrders(enhancedOrders);

          // Calculate order summary
          if (enhancedOrders.length > 0) {
            setOrderSummary({
              totalOrders: enhancedOrders.length,
              totalSpent: enhancedOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0)
            });
          } else {
            setOrderSummary({
              totalOrders: 0,
              totalSpent: 0
            });
          }
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Không thể tải dữ liệu đơn hàng. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user?.id, selectedStatus, dateRange.start?.toISOString().split('T')[0], dateRange.end?.toISOString().split('T')[0], refreshTrigger]);

  // Format date range for display
  const formatDateRange = () => {
    return `${dateRange.start.toLocaleDateString('vi-VN')} - ${dateRange.end.toLocaleDateString('vi-VN')}`;
  };

  // Refresh orders
  const refreshOrders = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle date range selection
  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRange({ start, end });
    setIsDatePickerOpen(false);
  };

  // Quick date range selections
  const quickDateRanges = [
    {
      label: 'Hôm nay',
      action: () => {
        const today = new Date();
        handleDateRangeChange(today, today);
      }
    },
    {
      label: '7 ngày qua',
      action: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 7);
        handleDateRangeChange(start, end);
      }
    },
    {
      label: '30 ngày qua',
      action: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        handleDateRangeChange(start, end);
      }
    },
    {
      label: 'Tháng này',
      action: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        handleDateRangeChange(start, end);
      }
    },
    {
      label: '3 tháng gần đây',
      action: () => {
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - 3);
        handleDateRangeChange(start, end);
      }
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      <div className="container mx-auto px-4 py-6">
        {/* User info and order summary section */}
        {/* <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-[#5bbb46] rounded-full p-3 mr-4">
                <User size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{user?.fullName || 'Người dùng'}</h1>
                <p className="text-gray-600 text-sm">{user?.phone || '09****868'}</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center min-w-[160px] border border-gray-100">
                <p className="text-2xl font-bold text-gray-900">{isLoading ? '-' : orderSummary.totalOrders}</p>
                <p className="text-gray-600 text-sm">đơn hàng</p>
              </div>
              <div className="bg-[#f0f9f0] rounded-lg p-4 text-center min-w-[160px] border border-[#5bbb46]/20">
                <p className="text-2xl font-bold text-[#5bbb46]">{formatCurrency(orderSummary.totalSpent.toString())}</p>
                <p className="text-gray-600 text-sm">Tổng tiền tích lũy từ 01/01/2025</p>
              </div>
            </div>
          </div>
        </div> */}

        {/* Filters section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Date range picker */}
            <div className="relative" ref={datePickerRef}>
              <button
                className="flex items-center border border-gray-300 rounded-lg px-4 py-2.5 text-sm hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-[#5bbb46] focus:border-[#5bbb46]"
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              >
                <Calendar size={16} className="mr-2 text-[#5bbb46]" />
                <span className="font-medium">{formatDateRange()}</span>
                <ChevronDown size={16} className={`ml-2 text-gray-500 transition-transform duration-200 ${isDatePickerOpen ? 'transform rotate-180' : ''}`} />
              </button>

              {/* Enhanced date picker dropdown */}
              {isDatePickerOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-5 z-20 w-[320px] animate-fadeIn">
                  <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="font-medium text-gray-700">Khoảng thời gian</h3>
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => setIsDatePickerOpen(false)}
                      aria-label="Đóng"
                      title="Đóng"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Quick selections */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Chọn nhanh:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {quickDateRanges.map((range, index) => (
                        <button
                          key={index}
                          onClick={range.action}
                          className="text-sm py-1.5 px-3 bg-gray-50 hover:bg-gray-100 rounded-md text-gray-700 transition-colors"
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom date range */}
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500">Tùy chỉnh:</p>
                    <div>
                      <label htmlFor="start-date" className="block text-xs font-medium text-gray-700 mb-1">Từ ngày</label>
                      <input
                        id="start-date"
                        type="date"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5bbb46] focus:border-[#5bbb46]"
                        value={dateRange.start.toISOString().split('T')[0]}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label htmlFor="end-date" className="block text-xs font-medium text-gray-700 mb-1">Đến ngày</label>
                      <input
                        id="end-date"
                        type="date"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5bbb46] focus:border-[#5bbb46]"
                        value={dateRange.end.toISOString().split('T')[0]}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-4 pt-3 border-t">
                    <button
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm mr-2 hover:bg-gray-300 transition-colors"
                      onClick={() => setIsDatePickerOpen(false)}
                    >
                      Hủy
                    </button>
                    <button
                      className="bg-[#5bbb46] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#43a32d] transition-colors"
                      onClick={() => handleDateRangeChange(dateRange.start, dateRange.end)}
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Refresh button */}
              <button
                className="flex items-center border border-gray-300 rounded-lg px-4 py-2.5 text-sm hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-[#5bbb46] focus:border-[#5bbb46]"
                onClick={refreshOrders}
                disabled={isLoading}
              >
                <RefreshCw size={16} className={`mr-2 text-[#5bbb46] ${isLoading ? 'animate-spin' : ''}`} />
                <span className="font-medium">Làm mới</span>
              </button>
            </div>

            {/* Status filter tabs */}
            <div className="flex overflow-x-auto gap-2 md:gap-3 pb-1 scrollbar-hide">
              <button
                className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-200 ${selectedStatus === 'all'
                  ? 'bg-[#5bbb46] text-white shadow-md'
                  : 'border border-gray-200 hover:bg-gray-50'}`}
                onClick={() => setSelectedStatus('all')}
              >
                Tất cả
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-200 ${selectedStatus === 'pending'
                  ? 'bg-[#5bbb46] text-white shadow-md'
                  : 'border border-gray-200 hover:bg-gray-50'}`}
                onClick={() => setSelectedStatus('pending')}
              >
                Chờ xác nhận
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-200 ${selectedStatus === 'processing'
                  ? 'bg-[#5bbb46] text-white shadow-md'
                  : 'border border-gray-200 hover:bg-gray-50'}`}
                onClick={() => setSelectedStatus('processing')}
              >
                Đã xác nhận
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-200 ${selectedStatus === 'shipped'
                  ? 'bg-[#5bbb46] text-white shadow-md'
                  : 'border border-gray-200 hover:bg-gray-50'}`}
                onClick={() => setSelectedStatus('shipped')}
              >
                Đang vận chuyển
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-200 ${selectedStatus === 'delivered'
                  ? 'bg-[#5bbb46] text-white shadow-md'
                  : 'border border-gray-200 hover:bg-gray-50'}`}
                onClick={() => setSelectedStatus('delivered')}
              >
                Đã giao hàng
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-200 ${selectedStatus === 'cancelled'
                  ? 'bg-[#5bbb46] text-white shadow-md'
                  : 'border border-gray-200 hover:bg-gray-50'}`}
                onClick={() => setSelectedStatus('cancelled')}
              >
                Đã hủy
              </button>
            </div>
          </div>
        </div>

        {/* Orders list */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 flex flex-col items-center justify-center border border-gray-100">
            <RefreshCw size={36} className="text-[#5bbb46] animate-spin mb-4" />
            <p className="text-gray-600">Đang tải dữ liệu đơn hàng...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm p-12 flex flex-col items-center justify-center border border-gray-100">
            <AlertCircle size={36} className="text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">Đã xảy ra lỗi</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              className="px-6 py-2 bg-[#5bbb46] text-white rounded-lg hover:bg-[#43a32d] transition-colors"
              onClick={() => window.location.reload()}
            >
              Thử lại
            </button>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                {/* Order header */}
                <div className="flex items-center justify-between border-b border-gray-100 p-4">
                  <div>
                    <p className="text-sm text-gray-500">Mã đơn hàng: <span className="font-medium text-gray-900">{order.id}</span></p>
                    <p className="text-sm text-gray-500 mt-1">Ngày đặt: {formatDate(order.createdAt)}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                {/* Order items */}
                <div className="p-4">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex items-start py-3 first:pt-0 last:pb-0 border-b last:border-0 border-gray-100">
                      <div className="w-16 h-16 rounded-md border border-gray-200 overflow-hidden flex-shrink-0 mr-4">
                        {item.product && (
                          <img
                            src={
                              // Use product image if available, otherwise use slug-based image
                              item.fullProduct && item.fullProduct.productImages && item.fullProduct.productImages.length > 0
                                ? item.fullProduct.productImages[0].imageUrl
                                : `https://cnweb-btl.onrender.com/images/products/${item.product.slug}.jpg`
                            }
                            alt={item.product.name || item.product.slug}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://cdn.tgdd.vn/Products/Images/42/299033/iphone-15-pro-max-green-titanium-600x600.jpg";
                            }}
                          />
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium text-gray-900">{item.product?.name || item.product?.slug}</p>
                        <p className="text-[#5bbb46] font-semibold mt-1">{formatCurrency(item.priceAtTime)}</p>
                        <p className="text-gray-500 text-sm mt-1">Số lượng: {item.quantity}</p>
                        {item.fullProduct && (
                          <Link to={`/product/${item.fullProduct.slug}`} className="text-sm text-[#5bbb46] hover:text-[#43a32d] hover:underline mt-1 inline-block">
                            Xem sản phẩm
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping information (if available) */}
                {order.shipping && (
                  <div className="p-4 border-t border-gray-100 ">
                    <h3 className="font-medium text-gray-700 mb-2">Thông tin giao hàng</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <p className="text-sm text-gray-600">Người nhận: <span className="font-medium">{order.shipping.name}</span></p>
                      <p className="text-sm text-gray-600">Số điện thoại: <span className="font-medium">{order.shipping.phone}</span></p>
                      <p className="text-sm text-gray-600">Email: <span className="font-medium">{order.shipping.email}</span></p>
                      <p className="text-sm text-gray-600">Địa chỉ: <span className="font-medium">{order.shipping.shippingAddress}</span></p>
                      {order.shipping.trackingNumber && (
                        <p className="text-sm text-gray-600">Mã vận đơn: <span className="font-medium">{order.shipping.trackingNumber}</span></p>
                      )}
                    </div>
                  </div>
                )}

                {/* Order footer */}
                <div className="bg-[#f0f9f0] p-4 flex-col items-center justify-between border-t border-gray-100">
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className="text-sm text-gray-600">
                        Phương thức thanh toán:
                        <span className="font-medium text-gray-900">
                          {order.payments && order.payments.length > 0
                            ? ` ${order.payments[0].paymentMethod}`
                            : ' Chưa thanh toán'}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center">
                      <p className="text-sm text-gray-600 mr-2">Tổng tiền:</p>
                      <p className="text-lg font-bold text-[#5bbb46]">{formatCurrency(order.totalAmount)}</p>
                    </div>
                  </div>
                  <div className='flex justify-end '>
                    {order.status === 'draft' && (
                      <Link
                        to={`/payment/${order.id}`}
                        className="px-4 mt-3 py-2 text-sm bg-[#5bbb46] text-white rounded-md hover:bg-[#43a32d] font-medium transition-colors"
                      >
                        Thanh toán
                      </Link>
                    )}
                  </div>
                </div>                {/* Order actions */}
                <div className="py-4 flex justify-between items-center border-t border-gray-100">
                  <Link
                    to={`/orders/${order.id}`}
                    className="px-4 py-2 text-sm text-[#5bbb46] hover:text-[#43a32d] font-medium flex items-center ml-auto"
                  >
                    Xem chi tiết
                    <ChevronDown size={16} className="ml-1 transform rotate-270" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center">
            <img
              src="/images/empty-order.png"
              alt="Không có đơn hàng"
              className="w-48 h-48 object-contain mx-auto mb-4 opacity-50"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://cellphones.com.vn/media/wysiwyg/empty-cat.png";
              }}
            />
            <h2 className="text-xl font-bold text-gray-700">Không có đơn hàng nào thỏa mãn!</h2>
            <p className="text-gray-500 mt-2 mb-6">Có vẻ như bạn chưa có đơn hàng nào trong khoảng thời gian này</p>
            <button
              className="px-6 py-2 bg-[#5bbb46] text-white rounded-lg hover:bg-[#43a32d] transition-colors"
              onClick={() => window.location.href = '/'}
            >
              Tiếp tục mua sắm
            </button>
          </div>
        )}
      </div>

      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default OrdersPage;
