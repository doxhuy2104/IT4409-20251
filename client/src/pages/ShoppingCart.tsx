import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ChevronLeft, Plus, Minus, ShoppingBag, Check } from 'lucide-react';
import { RecommendedProduct } from '../types/cart';
import cartService, { UpdateCartItemParams } from '../services/cart.service';
import { CartItem, RecommendedProduct } from '../types/cart';

const ShoppingCart: React.FC = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [addedRecommendedProducts, setAddedRecommendedProducts] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [recommendedProductsMap, setRecommendedProductsMap] = useState<Record<string, RecommendedProduct[]>>({});

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

            // But also fetch from server to ensure consistency
            const updatedCart = await cartService.getCart();
            if (updatedCart && updatedCart.cart) {
                const enrichedItems = await enrichCartItems(updatedCart.cart.cartItems);
                setCartItems(enrichedItems);
                await fetchRecommendedProducts(enrichedItems);
            }
        } catch (err) {
            console.error('Error removing cart item:', err);
            // Reload cart to ensure consistency
            const updatedCart = await cartService.getCart();
            if (updatedCart && updatedCart.cart) {
                const enrichedItems = await enrichCartItems(updatedCart.cart.cartItems);
                setCartItems(enrichedItems);
                await fetchRecommendedProducts(enrichedItems);
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
                variantId: parseInt(product.id, 10),
                quantity: 1
            });

            // Reload cart with enriched data
            const updatedCart = await cartService.getCart();
            if (updatedCart && updatedCart.cart) {
                const enrichedItems = await enrichCartItems(updatedCart.cart.cartItems);
                setCartItems(enrichedItems);
                await fetchRecommendedProducts(enrichedItems);
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

        // Create a Cart object to pass to cartService.calculateTotal
        const cart = {
            id: 0, // These values don't matter for calculation
            customerId: 0,
            sessionId: null,
            createdAt: '',
            updatedAt: '',
            cartItems: cartItems
        };

        return cartService.calculateTotal(cart);
    };

    const { subtotal, discount, total } = calculateTotals();
    const shipping = 0; // Could be calculated based on delivery method and address

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    };

    // Handle form input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCustomerInfo(prev => ({ ...prev, [name]: value }));
    };



    // Back to cart
    const backToCart = () => {
        window.scrollTo(0, 0);
    };    // Show loading state
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
            <div className="container mx-auto px-4 py-8 max-w-6xl">
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
                                        {item.productVariant?.productImages && item.productVariant.productImages.length > 0 ? (
                                            <img
                                                src={item.productVariant.productImages[0].imageUrl}
                                                alt={item.productVariant.product?.name || "Product image"}
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
                                            to={`/product/${item.productVariant?.product?.slug || ''}`}
                                            className="text-lg font-semibold text-gray-800 hover:text-[#5bbb46] transition-colors"
                                        >
                                            {item.productVariant?.product?.name || 'Sản phẩm không xác định'}
                                        </Link>
                                        {/* <div className="text-sm text-gray-500 mt-1">
                                                {item.productVariant?.variantAttributes?.map(attr =>
                                                    `${attr.name}: ${attr.attributeValue.value}`
                                                ).join(', ')}
                                            </div> */}

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
                                                    disabled={!item.productVariant || item.quantity >= item.productVariant.stock}
                                                    className={`px-3 py-1 ${!item.productVariant || item.quantity >= item.productVariant.stock ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-[#5bbb46]'}`}
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
                                            {formatCurrency(item.productVariant ?
                                                parseFloat(item.productVariant.discountPrice || item.productVariant.price) * item.quantity
                                                : 0
                                            )}
                                        </div>
                                        {item.productVariant && item.productVariant.discountPrice && (
                                            <div className="text-sm text-gray-500 line-through">
                                                {formatCurrency(parseFloat(item.productVariant.price) * item.quantity)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Recommended products */}
                            {item.productVariant && item.productVariant.product && recommendedProductsMap[item.productVariant.product.id] && recommendedProductsMap[item.productVariant.product.id].length > 0 && (
                                <div className="bg-gray-50 p-4 border-t border-gray-100">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Sản phẩm thường được mua cùng</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {recommendedProductsMap[item.productVariant.product.id].map((product: RecommendedProduct) => (
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
                        {discount > 0 && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Giảm giá</span>
                                <span className="font-medium text-[#5bbb46]">-{formatCurrency(discount)}</span>
                            </div>
                        )}
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
                            Tiến hành đặt hàng
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
        </div>
    );
};

export default ShoppingCart;
