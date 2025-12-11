import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ChevronLeft, Heart, X, AlertCircle } from 'lucide-react';
import wishlistService, { WishlistItem } from '../services/wishlist.service';
import productService from '../services/product.service';
import { useAuth } from '../hooks/useAuth';
import { ProductV2 } from '../types/product';

interface EnhancedWishlistItem extends WishlistItem {
    fullProduct?: ProductV2;
}

const WishlistPage: React.FC = () => {
    const [wishlistItems, setWishlistItems] = useState<EnhancedWishlistItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated } = useAuth();

    // Fetch wishlist items when component mounts
    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Get basic wishlist items
                const items = await wishlistService.getWishlist();

                // Use Promise.all to fetch full product details for each wishlist item
                const enhancedItems = await Promise.all(
                    items.map(async (item) => {
                        try {
                            if (item.productId) {
                                const productResponse = await productService.getProductById(item.productId);
                                if (productResponse && productResponse.data && productResponse.data.length > 0) {
                                    return {
                                        ...item,
                                        fullProduct: productResponse.data[0]
                                    };
                                }
                            }
                            return item as EnhancedWishlistItem;
                        } catch (err) {
                            console.error(`Error fetching product ${item.productId}:`, err);
                            return item as EnhancedWishlistItem;
                        }
                    })
                );

                setWishlistItems(enhancedItems);
            } catch (err) {
                console.error('Error fetching wishlist:', err);
                setError('Không thể tải danh sách sản phẩm yêu thích. Vui lòng thử lại sau.');
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchWishlist();
        } else {
            setError('Vui lòng đăng nhập để xem danh sách yêu thích của bạn.');
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    // Handle remove item from wishlist
    const handleRemoveItem = async (wishlistId: number) => {
        try {
            await wishlistService.removeFromWishlist(wishlistId);
            // Remove the item from local state after successful API call
            setWishlistItems(prev => prev.filter(item => item.id !== wishlistId));
        } catch (err) {
            console.error('Error removing item from wishlist:', err);
            setError('Không thể xóa sản phẩm khỏi danh sách yêu thích. Vui lòng thử lại sau.');
        }
    };

    // Format currency
    const formatCurrency = (amount: string | number) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('vi-VN').format(numAmount) + 'đ';
    };

    // Empty wishlist message
    if (!isLoading && wishlistItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="text-center py-16">
                    <div className="mb-6 flex justify-center">
                        <Heart size={64} className="text-gray-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Danh sách yêu thích của bạn đang trống</h2>
                    <p className="text-gray-500 mb-6">Hãy thêm sản phẩm vào danh sách yêu thích để dễ dàng theo dõi và mua sau này</p>
                    <Link to="/" className="bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 transition-colors">
                        Tiếp tục mua sắm
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <Link to="/" className="text-green-600 hover:text-green-700 transition-colors flex items-center mr-4">
                        <ChevronLeft size={20} />
                        <span>Trang chủ</span>
                    </Link>
                    <h1 className="text-2xl font-bold">Danh sách yêu thích của bạn</h1>
                </div>
                <span className="text-gray-500">{wishlistItems.length} sản phẩm</span>
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                    <AlertCircle size={20} className="mr-2 flex-shrink-0" />
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Loading state */}
            {isLoading ? (
                <div className="flex justify-center items-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
            ) : (
                /* Wishlist items */
                <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                    {wishlistItems.map(item => (
                        <div key={item.id} className="border-b border-gray-100 last:border-b-0">
                            {/* Product item */}
                            <div className="p-4 md:p-6">
                                <div className="flex flex-col md:flex-row">
                                    {/* Product image */}
                                    <div className="w-full md:w-1/5 mb-4 md:mb-0 flex-shrink-0">
                                        <img
                                            src={item.fullProduct && item.fullProduct.productImages && item.fullProduct.productImages.length > 0
                                                ? item.fullProduct.productImages[0].imageUrl
                                                : `https://cnweb-kf4r.onrender.com/images/products/${item.product?.slug}.jpg`}
                                            alt={item.fullProduct?.name || item.product?.name}
                                            className="w-24 h-24 object-contain mx-auto"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = "https://cdn.tgdd.vn/Products/Images/42/299033/iphone-15-pro-max-green-titanium-600x600.jpg";
                                            }}
                                        />
                                    </div>

                                    {/* Product details */}
                                    <div className="w-full md:w-3/5 md:px-4">
                                        <Link
                                            to={`/product/${item.fullProduct?.slug || item.product?.slug}`}
                                            className="text-lg font-semibold text-gray-800 hover:text-green-600 transition-colors"
                                        >
                                            {item.fullProduct?.name || item.product?.name}
                                        </Link>
                                        <div className="text-sm text-gray-500 mt-1">
                                            {item.fullProduct?.description || item.product?.description}
                                        </div>

                                        <div className="mt-4 flex items-center space-x-4">
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
                                        <div className="text-lg font-bold text-red-600">
                                            {formatCurrency(
                                                parseFloat(item.fullProduct?.price || item.product?.price || '0')
                                            )}
                                        </div>
                                        <div className="flex justify-end mt-4">
                                            <Link
                                                to={`/product/${item.fullProduct?.slug || item.product?.slug}`}
                                                className="bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                                            >
                                                Xem chi tiết
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;
