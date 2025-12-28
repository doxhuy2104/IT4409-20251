import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ChevronLeft, Plus, Minus, ShoppingBag, Check } from 'lucide-react';
import { CartItem, RecommendedProduct } from '../types/cart';
import cartService, { UpdateCartItemParams } from '../services/cart.service';
import productService from '../services/product.service';
import orderService, { CreateOrderParams, ConfirmOrderParams } from '../services/order.service';
import profileService from '../services/profile.service';
import locationService, { Province, Ward } from '../services/location.service';

const ShoppingCart: React.FC = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [addedRecommendedProducts, setAddedRecommendedProducts] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [recommendedProductsMap, setRecommendedProductsMap] = useState<Record<string, RecommendedProduct[]>>({});

    // Customer information
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        province: '',
        district: '',
        ward: ''
    });
    const [provinceOptions, setProvinceOptions] = useState<Province[]>([]);
    const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
    const [wardOptions, setWardOptions] = useState<Ward[]>([]);
    const [selectedWardCode, setSelectedWardCode] = useState('');
    const [isLoadingWards, setIsLoadingWards] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Delivery method
    const [deliveryMethod, setDeliveryMethod] = useState<'store' | 'delivery'>('store');

    // Payment method
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'QR'>('COD');

    // Hàm để lấy sản phẩm đề xuất dựa trên category
    const fetchRecommendedProducts = async (items: CartItem[]) => {
        if (!items || items.length === 0) {
            setRecommendedProductsMap({});
            return;
        }

        try {
            // Thu thập các categoryId từ sản phẩm trong giỏ hàng
            const categoryIds: number[] = [];
            const productIds: string[] = []; // Để loại trừ các sản phẩm đã có trong giỏ hàng

            items.forEach(item => {
                if (item.product) {
                    if (item.product.id) {
                        productIds.push(item.product.id.toString());
                    }
                    if (item.product.categoryId &&
                        !categoryIds.includes(item.product.categoryId)) {
                        categoryIds.push(item.product.categoryId);
                    }
                }
            });

            if (categoryIds.length === 0) {
                setRecommendedProductsMap({});
                return;
            }

            // Tạo các promise để lấy sản phẩm theo từng categoryId
            const productPromises = categoryIds.map(categoryId =>
                productService.getProducts({ categoryId, limit: 6 }) // Lấy nhiều sản phẩm hơn để có thể lọc
            );

            // Thực hiện tất cả các promise đồng thời
            const responses = await Promise.all(productPromises);

            // Map để lưu các sản phẩm được đề xuất cho mỗi sản phẩm trong giỏ hàng
            const newRecommendedMap: Record<string, RecommendedProduct[]> = {};
            // Xử lý dữ liệu cho mỗi sản phẩm trong giỏ hàng
            items.forEach(item => {
                if (item.product) {
                    const productId = item.product.id.toString();
                    const categoryId = item.product.categoryId;

                    if (categoryId) {
                        const recommendedList: RecommendedProduct[] = [];

                        responses.forEach(response => {
                            if (response.data && response.data.length > 0) {
                                const matchingProducts = response.data
                                    .filter(p =>
                                        p.categoryId === categoryId &&
                                        !productIds.includes(p.id.toString()) &&
                                        p.id.toString() !== productId
                                    )
                                    .slice(0, 3);

                                matchingProducts.forEach(p => {
                                    const imageUrl =
                                        p.productImages && p.productImages.length > 0
                                            ? p.productImages[0].imageUrl
                                            : '';

                                    if (!recommendedList.some(r => r.id === p.id.toString())) {
                                        recommendedList.push({
                                            id: p.id.toString(),
                                            name: p.name,
                                            image: imageUrl,
                                            price: (p as any).price ?? 0,
                                            originalPrice: (p as any).originalPrice ?? (p as any).price ?? 0,
                                            discount: 0
                                        });
                                    }
                                });
                            }
                        });

                        if (recommendedList.length > 0) {
                            newRecommendedMap[productId] = recommendedList;
                        }
                    }
                }
            });

            // Cập nhật state với map mới
            setRecommendedProductsMap(newRecommendedMap);
        } catch (error) {
            console.error('Error fetching recommended products:', error);
        }
    };

    // Fetch cart items on component mount
    useEffect(() => {
        const fetchCart = async () => {
            console.log('Fetching cart items...');
            try {
                setLoading(true);
                const response = await cartService.getCart();

                if (response && response.cart) {
                    setCartItems(response.cart.cartItems);
                    await fetchRecommendedProducts(response.cart.cartItems);
                } else {
                    setCartItems([]);
                }
            } catch (err) {
                console.error('Error fetching cart:', err);
                setError('Có lỗi xảy ra khi tải giỏ hàng');
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, []);

    // Handle quantity change
    const handleQuantityChange = async (id: number, newQuantity: number) => {
        if (newQuantity < 1) return;

        try {
            // Cập nhật số lượng trên UI trước để người dùng thấy phản hồi ngay lập tức
            setCartItems(prev =>
                prev.map(item =>
                    item.id === id ? { ...item, quantity: newQuantity } : item
                )
            );

            // Gửi yêu cầu cập nhật lên server
            const params: UpdateCartItemParams = { quantity: newQuantity };
            await cartService.updateCartItem(id, params);

            // Tải lại giỏ hàng từ server để đảm bảo dữ liệu đồng bộ
            const updatedCart = await cartService.getCart();
            if (updatedCart && updatedCart.cart) {
                setCartItems(updatedCart.cart.cartItems);
                await fetchRecommendedProducts(updatedCart.cart.cartItems);
            }
        } catch (err) {
            console.error('Error updating cart item:', err);
            // Reload cart to restore original state
            const updatedCart = await cartService.getCart();
            if (updatedCart && updatedCart.cart) {
                setCartItems(updatedCart.cart.cartItems);
                await fetchRecommendedProducts(updatedCart.cart.cartItems);
            }
        }
    };

    // Handle remove item
    const handleRemoveItem = async (id: number) => {
        try {
            await cartService.removeCartItem(id);

            // Update local state immediately for better UX
            setCartItems(prev => prev.filter(item => item.id !== id));

            const updatedCart = await cartService.getCart();
            if (updatedCart && updatedCart.cart) {
                setCartItems(updatedCart.cart.cartItems);
                await fetchRecommendedProducts(updatedCart.cart.cartItems);
            }
        } catch (err) {
            console.error('Error removing cart item:', err);
            // Reload cart to ensure consistency
            const updatedCart = await cartService.getCart();
            if (updatedCart && updatedCart.cart) {
                setCartItems(updatedCart.cart.cartItems);
                await fetchRecommendedProducts(updatedCart.cart.cartItems);
            }
        }
    };

    // Handle adding recommended product to cart
    const handleAddRecommendedProduct = async (product: RecommendedProduct) => {
        try {
            // Mark the product as added immediately for better UX
            setAddedRecommendedProducts(prev => ({
                ...prev,
                [product.id]: true
            }));


            // Add to cart
            console.log('Adding recommended product to cart:', product.id, product.name);
            await cartService.addToCart({
                productId: parseInt(product.id, 10),
                quantity: 1
            });

            // Reload cart with enriched data
            const updatedCart = await cartService.getCart();
            if (updatedCart && updatedCart.cart) {
                setCartItems(updatedCart.cart.cartItems);
                await fetchRecommendedProducts(updatedCart.cart.cartItems);
            }

            // Show feedback with timeout to reset button state
            setTimeout(() => {
                setAddedRecommendedProducts(prev => ({
                    ...prev,
                    [product.id]: false
                }));
            }, 2000);
        } catch (err) {
            console.error('Error adding product to cart:', err);
            // Reset button state on error
            setAddedRecommendedProducts(prev => ({
                ...prev,
                [product.id]: false
            }));
        }
    };

    // Calculate totals using the cartService utility
    const calculateTotals = () => {
        if (!cartItems.length) return { subtotal: 0, discount: 0, total: 0 };

        const cart = {
            id: 0,
            customerId: 0,
            sessionId: null,
            createdAt: '',
            updatedAt: '',
            cartItems: cartItems
        };

        return cartService.calculateTotal(cart as any);
    };

    const { subtotal, total } = calculateTotals();
    const shipping = 0; // Could be calculated based on delivery method and address
    const checkoutSteps = [
        { id: 1, label: 'Giỏ hàng' },
        { id: 2, label: 'Thông tin nhận hàng' },
        { id: 3, label: 'Thanh toán' },
    ];

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    };

    // Handle form input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCustomerInfo(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateShippingInfo = () => {
        const errors: Record<string, string> = {};
        let isValid = true;

        if (!customerInfo.name.trim()) {
            errors.name = 'Vui lòng nhập họ tên';
            isValid = false;
        }

        if (!customerInfo.phone.trim()) {
            errors.phone = 'Vui lòng nhập số điện thoại';
            isValid = false;
        }

        if (deliveryMethod === 'delivery') {
            if (!customerInfo.province || !selectedProvinceCode) {
                errors.province = 'Vui lòng chọn tỉnh/thành phố';
                isValid = false;
            }

            if (!customerInfo.ward || !selectedWardCode) {
                errors.ward = 'Vui lòng chọn phường/xã';
                isValid = false;
            }

            if (!customerInfo.address.trim()) {
                errors.address = 'Vui lòng nhập địa chỉ cụ thể';
                isValid = false;
            }
        }

        setValidationErrors(errors);
        return isValid;
    };

    useEffect(() => {
        const prefillCustomerInfo = async () => {
            try {
                const profile = await profileService.getUserProfile();
                if (profile) {
                    setCustomerInfo(prev => ({
                        ...prev,
                        name: prev.name || profile.fullName || '',
                        phone: prev.phone || profile.phone || '',
                        email: prev.email || profile.email || '',
                    }));
                }
            } catch (err) {
                console.error('Error pre-filling customer info:', err);
            }
        };

        prefillCustomerInfo();
    }, []);

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                setLocationError(null);
                const data = await locationService.getNewProvinces();
                setProvinceOptions(data);
            } catch (err) {
                console.error('Error fetching provinces:', err);
                setLocationError('Không thể tải danh sách tỉnh/thành phố. Vui lòng thử lại sau.');
            }
        };

        fetchProvinces();
    }, []);

    const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        setSelectedProvinceCode(code);
        setSelectedWardCode('');
        setWardOptions([]);

        const selectedProvince = provinceOptions.find(province => province.code === code);
        setCustomerInfo(prev => ({
            ...prev,
            province: selectedProvince?.name || '',
            district: '',
            ward: ''
        }));

        // Clear province and ward errors when user selects a province
        if (validationErrors.province || validationErrors.ward) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.province;
                delete newErrors.ward;
                return newErrors;
            });
        }

        if (!code) {
            return;
        }

        try {
            setIsLoadingWards(true);
            setLocationError(null);
            const wards = await locationService.getWardsByProvince(code);
            setWardOptions(wards);
        } catch (err) {
            console.error('Error fetching wards:', err);
            setLocationError('Không thể tải danh sách phường/xã. Vui lòng thử lại sau.');
        } finally {
            setIsLoadingWards(false);
        }
    };

    const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        setSelectedWardCode(code);
        const ward = wardOptions.find(item => item.code === code);

        setCustomerInfo(prev => ({
            ...prev,
            ward: ward?.name || '',
            district: ward?.district_name || ward?.district?.name || ''
        }));

        // Clear ward error when user selects a ward
        if (validationErrors.ward) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.ward;
                return newErrors;
            });
        }
    };

    const goToPaymentStep = () => {
        if (!validateShippingInfo()) {
            return;
        }
        setStep(3);
        window.scrollTo(0, 0);
    };

    const backToShippingInfo = () => {
        setStep(2);
        window.scrollTo(0, 0);
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateShippingInfo()) {
            return;
        }

        try {
            setLoading(true);
            setError(null); // Reset any previous errors

            // 1. Get the cart item IDs to create the order
            const itemIds = cartItems.map(item => item.id);

            if (itemIds.length === 0) {
                setError('Giỏ hàng của bạn đang trống');
                setLoading(false);
                return;
            }

            // 2. Create a new order with the cart items
            const createOrderParams: CreateOrderParams = {
                itemIds: itemIds
            };

            console.log('Creating order with params:', createOrderParams);
            const orderResponse = await orderService.createOrder(createOrderParams);
            console.log('Order created response:', orderResponse);

            // Response format: { message: string, data: { id, ... } }
            if (!orderResponse || !orderResponse.data || !orderResponse.data.id) {
                console.error('Invalid order response format:', orderResponse);
                throw new Error('Không thể tạo đơn hàng: Định dạng phản hồi không hợp lệ');
            }

            const orderId = orderResponse.data.id;
            console.log('Order ID:', orderId);

            // 3. Prepare shipping information
            let shippingAddress = '';
            if (deliveryMethod === 'store') {
                shippingAddress = 'Nhận tại cửa hàng';
            } else {
                // Combine address components - đảm bảo tất cả các phần đều có giá trị
                const addressParts = [
                    customerInfo.address?.trim(),
                    customerInfo.ward?.trim(),
                    customerInfo.district?.trim(),
                    customerInfo.province?.trim()
                ].filter(part => part && part.length > 0);

                if (addressParts.length === 0) {
                    throw new Error('Địa chỉ giao hàng không hợp lệ');
                }

                shippingAddress = addressParts.join(', ');
            }

            // Validate shippingAddress không được rỗng
            if (!shippingAddress || shippingAddress.trim().length === 0) {
                throw new Error('Địa chỉ giao hàng không được để trống');
            }

            // 4. Create params for order confirmation
            const confirmOrderParams: ConfirmOrderParams = {
                name: customerInfo.name.trim(),
                email: customerInfo.email?.trim() || '',
                phone: customerInfo.phone.trim(),
                shippingAddress: shippingAddress.trim(),
                paymentMethod: paymentMethod // Using the selected payment method
            };

            // Validate tất cả các trường bắt buộc
            if (!confirmOrderParams.name || confirmOrderParams.name.length === 0) {
                throw new Error('Họ tên không được để trống');
            }
            if (!confirmOrderParams.phone || confirmOrderParams.phone.length === 0) {
                throw new Error('Số điện thoại không được để trống');
            }
            if (!confirmOrderParams.shippingAddress || confirmOrderParams.shippingAddress.length === 0) {
                throw new Error('Địa chỉ giao hàng không được để trống');
            }
            if (!confirmOrderParams.paymentMethod || confirmOrderParams.paymentMethod.length === 0) {
                throw new Error('Phương thức thanh toán không được để trống');
            }

            console.log('Confirm order params:', confirmOrderParams);

            // 5. Confirm the order with shipping and payment details
            console.log('Confirming order with params:', confirmOrderParams);
            await orderService.confirmOrder(orderId, confirmOrderParams);
            console.log('Order confirmed successfully');

            // 6. Handle payment method specific actions
            if (paymentMethod === 'QR') {
                // Redirect to payment page with QR code
                navigate(`/payment/${orderId}`);
            } else {
                // 7. For COD, navigate to the order details page
                navigate(`/orders/${orderId}`);
            }

        } catch (error: any) {
            console.error('Error during order submission:', error);

            // Hiển thị thông báo lỗi chi tiết hơn
            let errorMessage = 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.';

            if (error.response) {
                // Lỗi từ server
                const status = error.response.status;
                const data = error.response.data;

                console.error('Error response:', { status, data });

                if (data?.message) {
                    errorMessage = data.message;
                    // Nếu lỗi về stock, thêm hướng dẫn
                    if (data.message.includes('không đủ hàng') || data.message.includes('stock')) {
                        errorMessage += ' Vui lòng kiểm tra lại giỏ hàng và điều chỉnh số lượng.';
                    }
                } else if (status === 400) {
                    errorMessage = 'Dữ liệu đơn hàng không hợp lệ. Vui lòng kiểm tra lại.';
                } else if (status === 401) {
                    errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                } else if (status === 403) {
                    errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
                } else if (status === 404) {
                    errorMessage = 'Không tìm thấy giỏ hàng hoặc sản phẩm. Vui lòng thử lại.';
                } else if (status === 500) {
                    errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
                }
            } else if (error.message) {
                errorMessage = error.message;
                // Nếu lỗi về stock, thêm hướng dẫn
                if (error.message.includes('không đủ hàng') || error.message.includes('stock')) {
                    errorMessage += ' Vui lòng kiểm tra lại giỏ hàng và điều chỉnh số lượng.';
                }
            }

            setError(errorMessage);

            // Nếu lỗi về stock, tự động reload giỏ hàng để cập nhật số lượng
            if (errorMessage.includes('không đủ hàng') || errorMessage.includes('stock')) {
                setTimeout(async () => {
                    try {
                        const updatedCart = await cartService.getCart();
                        if (updatedCart && updatedCart.cart) {
                            setCartItems(updatedCart.cart.cartItems);
                            await fetchRecommendedProducts(updatedCart.cart.cartItems);
                        }
                    } catch (reloadError) {
                        console.error('Error reloading cart:', reloadError);
                    }
                }, 1000);
            }
        } finally {
            setLoading(false);
        }
    };

    // Proceed to checkout
    const proceedToCheckout = () => {
        if (cartItems.length > 0) {
            setStep(2);
            window.scrollTo(0, 0);
        }
    };

    // Back to cart
    const backToCart = () => {
        setStep(1);
        window.scrollTo(0, 0);
    };

    const renderSummarySidebar = () => (
        <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6 border border-gray-100">
                <h2 className="text-lg font-bold mb-4 flex items-center justify-between text-gray-900">
                    <span>Đơn hàng của bạn</span>
                    <span className="text-gray-500 text-sm font-normal">{cartItems.length} sản phẩm</span>
                </h2>

                <div className="max-h-64 overflow-y-auto mb-4">
                    {cartItems.map(item => (
                        <div key={item.id} className="flex py-3 border-b border-gray-100 last:border-b-0">
                            <div className="w-16 h-16 flex-shrink-0">
                                {item.product?.productImages && item.product.productImages.length > 0 ? (
                                    <img
                                        src={item.product.productImages[0].imageUrl}
                                        alt={item.product.name || "Product image"}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="w-16 h-16 bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-500 text-xs">No image</span>
                                    </div>
                                )}
                            </div>
                            <div className="ml-3 flex-grow">
                                <div className="text-sm text-gray-800 line-clamp-2">
                                    {item.product?.name || 'Sản phẩm không xác định'}
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-sm text-gray-500">SL: {item.quantity}</span>
                                    <span className="text-sm font-medium">
                                        {formatCurrency(item.product ?
                                            parseFloat(item.product.price) * item.quantity
                                            : 0
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-100 pt-4 mb-4">
                    <div className="flex justify-between mb-2">
                        <span className="text-gray-700">Tạm tính</span>
                        <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                    </div>

                    {deliveryMethod === 'delivery' && (
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-700">Phí vận chuyển</span>
                            <span className="font-medium text-gray-900">{formatCurrency(shipping)}</span>
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                        <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                        <span className="text-xl font-bold text-[#5bbb46]">{formatCurrency(total)}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStepContent = () => {
        if (step === 1) {
            return (
                <div>
                    {/* Cart header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Giỏ hàng của bạn</h1>
                        <span className="text-gray-500">{cartItems.length} sản phẩm</span>
                    </div>

                    {/* Cart items */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6 border border-gray-100">
                        {cartItems.map(item => (
                            <div key={item.id} className="border-b border-gray-100 last:border-b-0">
                                {/* Product item */}
                                <div className="p-4 md:p-6">
                                    <div className="flex flex-col md:flex-row">
                                        {/* Product image */}
                                        <div className="w-full md:w-1/5 mb-4 md:mb-0 flex-shrink-0">
                                            {item.product?.productImages && item.product.productImages.length > 0 ? (
                                                <img
                                                    src={item.product.productImages[0].imageUrl}
                                                    alt={item.product?.name || "Product image"}
                                                    className="w-24 h-24 object-contain mx-auto"
                                                />
                                            ) : (
                                                <div className="w-24 h-24 bg-gray-200 flex items-center justify-center mx-auto rounded">
                                                    <span className="text-gray-500 text-sm">No image</span>
                                                </div>
                                            )}
                                        </div>
                                        {/* Product details */}
                                        <div className="w-full md:w-3/5 md:px-4">
                                            <Link
                                                to={`/product/${item.product?.slug || ''}`}
                                                className="text-lg font-semibold text-gray-800 hover:text-[#5bbb46] transition-colors"
                                            >
                                                {item.product?.name || 'Sản phẩm không xác định'}
                                            </Link>

                                            <div className="mt-4 flex items-center space-x-4">
                                                <div className="flex items-center border border-gray-300 rounded-md">
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                        className={`px-3 py-1 ${item.quantity <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-[#5bbb46]'}`}
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="px-3 py-1 border-x border-gray-300 text-center w-12">{item.quantity}</span>
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                        disabled={!item.product || item.quantity >= item.product.stock}
                                                        className={`px-3 py-1 ${!item.product || item.quantity >= item.product.stock ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-[#5bbb46]'}`}
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="text-red-500 hover:text-red-600 transition-colors flex items-center"
                                                >
                                                    <Trash2 size={16} className="mr-1" />
                                                    <span>Xóa</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="w-full md:w-1/5 mt-4 md:mt-0 text-right">
                                            <div className="text-lg font-bold text-[#5bbb46]">
                                                {formatCurrency(item.product ?
                                                    parseFloat(item.product.price) * item.quantity
                                                    : 0
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                </div>
                                {/* Recommended products */}
                                {item.product && recommendedProductsMap[item.product.id] && recommendedProductsMap[item.product.id].length > 0 && (
                                    <div className="bg-gray-50 p-4 border-t border-gray-100">
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Sản phẩm thường được mua cùng</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {recommendedProductsMap[item.product.id].map((product: RecommendedProduct) => (
                                                <div key={product.id} className="bg-white rounded-lg shadow-sm p-3 flex items-center">
                                                    <div className="w-16 h-16 flex-shrink-0">
                                                        <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                                                    </div>
                                                    <div className="ml-3 flex-grow">
                                                        <div className="text-sm font-medium text-gray-800 line-clamp-2">{product.name}</div>
                                                        <div className="flex items-center justify-between mt-1">
                                                            <div>
                                                                <span className="text-sm font-bold text-[#5bbb46]">{formatCurrency(product.price)}</span>
                                                                <span className="text-xs text-gray-400 line-through ml-1">{formatCurrency(product.originalPrice)}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => handleAddRecommendedProduct(product)}
                                                                className={`text-sm font-medium flex items-center transition-all duration-150 ${addedRecommendedProducts[product.id]
                                                                    ? 'text-[#5bbb46]'
                                                                    : 'text-[#5bbb46] hover:text-[#43a32d]'
                                                                    }`}
                                                            >
                                                                {addedRecommendedProducts[product.id] ? (
                                                                    <>
                                                                        <Check size={16} className="mr-1" />
                                                                        <span>Đã thêm</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Plus size={16} className="mr-1" />
                                                                        <span>Thêm</span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Order summary */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6 p-6 border border-gray-100">
                        <h2 className="text-lg font-bold mb-4 text-gray-900">Tổng tiền tạm tính</h2>
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tạm tính</span>
                                <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                            </div>

                        </div>
                        <div className="flex justify-between pt-4 border-t border-gray-200">
                            <span className="text-lg font-bold text-gray-900">Tổng tiền</span>
                            <span className="text-xl font-bold text-[#5bbb46]">{formatCurrency(total)}</span>
                        </div>
                        <div className="mt-6">
                            <button
                                onClick={proceedToCheckout}
                                className="w-full bg-[#5bbb46] text-white py-3 px-6 rounded-md font-medium hover:bg-[#43a32d] transition-colors"
                            >
                                Tiếp tục nhập thông tin
                            </button>
                            <Link
                                to="/"
                                className="w-full block text-center text-[#5bbb46] mt-4 py-2 hover:text-[#43a32d] hover:underline"
                            >
                                Tiếp tục mua sắm
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        if (step === 2) {
            return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
                            <h2 className="text-xl font-bold mb-4 text-gray-900">Thông tin khách hàng</h2>
                            <form>
                                <div className="mb-4">
                                    <label htmlFor="name" className="block text-gray-700 mb-1 font-medium">Họ và tên</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={customerInfo.name}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#5bbb46] transition-colors ${validationErrors.name
                                            ? 'border-red-500 focus:border-red-500'
                                            : 'border-gray-300 focus:border-[#5bbb46]'
                                            }`}
                                        placeholder="Nhập họ và tên"
                                        required
                                    />
                                    {validationErrors.name && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                                    )}
                                </div>
                                <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="phone" className="block text-gray-700 mb-1 font-medium">Số điện thoại</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={customerInfo.phone}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#5bbb46] transition-colors ${validationErrors.phone
                                                ? 'border-red-500 focus:border-red-500'
                                                : 'border-gray-300 focus:border-[#5bbb46]'
                                                }`}
                                            placeholder="Nhập số điện thoại"
                                            required
                                        />
                                        {validationErrors.phone && (
                                            <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
                            <h2 className="text-xl font-bold mb-4 text-gray-900">Thông tin nhận hàng</h2>

                            <div className="mb-6">
                                <div className="flex items-center space-x-4 mb-4">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={deliveryMethod === 'store'}
                                            onChange={() => {
                                                setDeliveryMethod('store');
                                                // Clear delivery-related errors when switching to store pickup
                                                setValidationErrors(prev => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.province;
                                                    delete newErrors.ward;
                                                    delete newErrors.address;
                                                    return newErrors;
                                                });
                                            }}
                                            className="h-5 w-5 text-[#5bbb46] border-gray-300 focus:ring-[#5bbb46]"
                                        />
                                        <span className="ml-2 text-gray-700">Nhận tại cửa hàng</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={deliveryMethod === 'delivery'}
                                            onChange={() => setDeliveryMethod('delivery')}
                                            className="h-5 w-5 text-[#5bbb46] border-gray-300 focus:ring-[#5bbb46]"
                                        />
                                        <span className="ml-2 text-gray-700">Giao hàng tận nơi</span>
                                    </label>
                                </div>

                                {deliveryMethod === 'store' ? (
                                    <div>
                                        {/* Chọn cửa hàng nếu cần */}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="md:col-span-1">
                                                <label htmlFor="province" className="block text-gray-700 mb-1 font-medium">Tỉnh/Thành phố</label>
                                                <select
                                                    id="province"
                                                    value={selectedProvinceCode}
                                                    onChange={handleProvinceChange}
                                                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#5bbb46] transition-colors bg-white ${validationErrors.province
                                                        ? 'border-red-500 focus:border-red-500'
                                                        : 'border-gray-300 focus:border-[#5bbb46]'
                                                        }`}
                                                    required
                                                >
                                                    <option value="">{provinceOptions.length ? 'Chọn tỉnh/thành phố' : 'Đang tải...'}</option>
                                                    {provinceOptions.map(province => (
                                                        <option key={province.code} value={province.code}>
                                                            {province.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {validationErrors.province && (
                                                    <p className="mt-1 text-sm text-red-600">{validationErrors.province}</p>
                                                )}
                                            </div>
                                            <div className="md:col-span-1">
                                                <label htmlFor="ward" className="block text-gray-700 mb-1 font-medium">Phường/Xã</label>
                                                <select
                                                    id="ward"
                                                    value={selectedWardCode}
                                                    onChange={handleWardChange}
                                                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#5bbb46] transition-colors bg-white ${validationErrors.ward
                                                        ? 'border-red-500 focus:border-red-500'
                                                        : 'border-gray-300 focus:border-[#5bbb46]'
                                                        }`}
                                                    disabled={!selectedProvinceCode || isLoadingWards}
                                                    required
                                                >
                                                    <option value="">
                                                        {selectedProvinceCode ? (isLoadingWards ? 'Đang tải...' : 'Chọn phường/xã') : 'Chọn tỉnh trước'}
                                                    </option>
                                                    {wardOptions.map(ward => (
                                                        <option key={ward.code} value={ward.code}>
                                                            {ward.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {validationErrors.ward && (
                                                    <p className="mt-1 text-sm text-red-600">{validationErrors.ward}</p>
                                                )}
                                            </div>
                                        </div>

                                        {locationError && (
                                            <p className="text-sm text-red-600">{locationError}</p>
                                        )}

                                        <div>
                                            <label htmlFor="address" className="block text-gray-700 mb-1 font-medium">Địa chỉ cụ thể</label>
                                            <input
                                                type="text"
                                                id="address"
                                                name="address"
                                                value={customerInfo.address}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#5bbb46] transition-colors ${validationErrors.address
                                                    ? 'border-red-500 focus:border-red-500'
                                                    : 'border-gray-300 focus:border-[#5bbb46]'
                                                    }`}
                                                placeholder="Nhập địa chỉ cụ thể (số nhà, tên đường)"
                                                required
                                            />
                                            {validationErrors.address && (
                                                <p className="mt-1 text-sm text-red-600">{validationErrors.address}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between mb-6">
                            <button
                                onClick={backToCart}
                                className="flex items-center text-[#5bbb46] hover:text-[#43a32d] font-medium"
                            >
                                <ChevronLeft size={20} />
                                <span>Quay lại giỏ hàng</span>
                            </button>
                            <button
                                onClick={goToPaymentStep}
                                className="bg-[#5bbb46] text-white py-2 px-6 rounded-md font-medium hover:bg-[#43a32d] transition-colors"
                            >
                                Tiếp tục thanh toán
                            </button>
                        </div>
                    </div>

                    {renderSummarySidebar()}
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Phương thức thanh toán</h2>
                        <div className="space-y-3">
                            <label className="flex items-center p-4 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={paymentMethod === 'COD'}
                                    onChange={() => setPaymentMethod('COD')}
                                    className="h-5 w-5 text-[#5bbb46] border-gray-300 focus:ring-[#5bbb46]"
                                />
                                <div className="ml-3">
                                    <div className="font-medium text-gray-900">Thanh toán khi nhận hàng (COD)</div>
                                    <div className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</div>
                                </div>
                            </label>

                            <label className="flex items-center p-4 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={paymentMethod === 'QR'}
                                    onChange={() => setPaymentMethod('QR')}
                                    className="h-5 w-5 text-[#5bbb46] border-gray-300 focus:ring-[#5bbb46]"
                                />
                                <div className="ml-3">
                                    <div className="font-medium text-gray-900">Chuyển khoản ngân hàng</div>
                                    <div className="text-sm text-gray-500">Thanh toán qua QR</div>
                                </div>
                            </label>
                        </div>

                        {error && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between mb-6">
                        <button
                            onClick={backToShippingInfo}
                            className="flex items-center text-[#5bbb46] hover:text-[#43a32d] font-medium"
                        >
                            <ChevronLeft size={20} />
                            <span>Quay lại thông tin nhận hàng</span>
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-[#5bbb46] text-white py-2 px-6 rounded-md font-medium hover:bg-[#43a32d] transition-colors disabled:bg-[#5bbb46]/50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang xử lý...' : 'Đặt hàng'}
                        </button>
                    </div>
                </div>

                {renderSummarySidebar()}
            </div>
        );
    };
    if (loading && cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-100">
                    <div className="flex justify-center mb-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5bbb46]"></div>
                    </div>
                    <p className="text-lg text-gray-600">Đang tải thông tin giỏ hàng...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="text-center py-16">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Đã xảy ra lỗi</h2>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <Link to="/" className="bg-[#5bbb46] text-white px-6 py-3 rounded-md font-medium hover:bg-[#43a32d] transition-colors">
                        Quay lại trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    // Empty cart message
    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-6xl h-screen">
                <div className="text-center py-16">
                    <div className="mb-6 flex justify-center">
                        <ShoppingBag size={64} className="text-gray-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Giỏ hàng của bạn đang trống</h2>
                    <p className="text-gray-500 mb-6">Hãy thêm sản phẩm hữu cơ vào giỏ hàng để tiếp tục mua sắm</p>
                    <Link to="/" className="bg-[#5bbb46] text-white px-6 py-3 rounded-md font-medium hover:bg-[#43a32d] transition-colors">
                        Tiếp tục mua sắm
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Progress steps */}
            <div className="mb-8">
                <div className="flex items-center justify-center">
                    {checkoutSteps.map((item, index) => (
                        <React.Fragment key={item.id}>
                            <div className={`flex items-center ${step === item.id ? 'text-[#5bbb46] font-bold' : 'text-gray-500'}`}>
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${step >= item.id ? 'bg-[#5bbb46] text-white' : 'bg-gray-200'
                                        }`}
                                >
                                    {item.id}
                                </div>
                                <span>{item.label}</span>
                            </div>
                            {index < checkoutSteps.length - 1 && (
                                <div className={`h-1 w-16 mx-3 ${step > item.id ? 'bg-[#5bbb46]' : 'bg-gray-200'}`}></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {renderStepContent()}

        </div>
    );
};

export default ShoppingCart;
