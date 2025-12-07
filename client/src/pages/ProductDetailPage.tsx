import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ChevronRight, Check,
    ShoppingCart, ShoppingBag, Gift, Shield, Truck
} from 'lucide-react';
import productService from '../services/product.service';
import { Product } from '../types/product';
import ProductReviews from '../components/ProductReviews';
import cartService from '../services/cart.service';
import brandService from '../services/brand.service';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import apiClient from '../services/api.client';


const ProductDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [apiProduct, setApiProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<'mô tả' | 'đánh giá'>('mô tả');
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [relatedProductsLoading, setRelatedProductsLoading] = useState<boolean>(false);
    const [quantity, setQuantity] = useState<number>(1);
    const [brandName, setBrandName] = useState<string>('');
    const [categoryName, setCategoryName] = useState<string>('');
    const { isAuthenticated } = useAuth();

    // Scroll to top when component mounts or slug changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [slug]);

    // Fetch product from API based on slug
    useEffect(() => {
        const fetchProduct = async () => {
            if (slug) {
                try {
                    setLoading(true);
                    const response = await productService.getProductBySlug(slug);
                    console.log('API response:', response);

                    if (response.data && response.data.length > 0) {
                        const productData = response.data[0];
                        setApiProduct(productData);

                        // Fetch brand and category names
                        if (productData.brandId) {
                            try {
                                const brands = await brandService.getAllBrands();
                                const brand = brands.find(b => b.id === productData.brandId);
                                if (brand) {
                                    setBrandName(brand.name);
                                }
                            } catch (err) {
                                console.error('Error fetching brand:', err);
                            }
                        }

                        // Fetch category name
                        if (productData.categoryId) {
                            try {
                                const categoryData = await apiClient.get<{ name?: string }>(`/public/categories/${productData.categoryId}`);
                                if (categoryData) {
                                    setCategoryName(categoryData.name || '');
                                }
                            } catch (err) {
                                console.error('Error fetching category:', err);
                            }
                        }

                    } else {
                        setError('Không tìm thấy sản phẩm');
                    }
                } catch (err) {
                    console.error('Error fetching product:', err);
                    setError('Có lỗi xảy ra khi tải sản phẩm');

                } finally {
                    setLoading(false);
                }
            }
        };

        fetchProduct();
    }, [slug]);

    // Fetch related products with the same category
    useEffect(() => {
        const fetchRelatedProducts = async (categoryId: number, currentProductId: number) => {
            try {
                setRelatedProductsLoading(true);
                const response = await productService.getProducts({
                    categoryId: categoryId,
                    limit: 5
                });

                if (response.data) {
                    // Filter out the current product and limit to 5 items
                    const filteredProducts = response.data
                        .filter(p => p.id !== currentProductId)
                        .slice(0, 5);

                    setRelatedProducts(filteredProducts);
                }
            } catch (err) {
                console.error('Error fetching related products:', err);
                // Fallback to empty array
                setRelatedProducts([]);
            } finally {
                setRelatedProductsLoading(false);
            }
        };

        fetchRelatedProducts(apiProduct?.categoryId || 0, apiProduct?.id || 0);
    }, [apiProduct?.categoryId, apiProduct?.id]);

    const formatCurrency = (amount: number | string): string => {
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('vi-VN').format(numericAmount) + '₫';
    };

    // Add to cart function
    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng', {
                position: 'top-right',
                autoClose: 3000
            });
            return;
        }

        if (!apiProduct?.id) {
            toast.error('Không tìm thấy sản phẩm', {
                position: 'top-right',
                autoClose: 3000
            });
            return;
        }

        try {
            const response = await cartService.addToCart({
                productId: apiProduct.id,
                quantity: quantity
            });

            console.log('Added to cart:', response);
            toast.success('Đã thêm sản phẩm vào giỏ hàng', {
                position: 'top-right',
                autoClose: 2000
            });
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng', {
                position: 'top-right',
                autoClose: 3000
            });
        }
    };

    // Handle checkout
    const handleCheckout = async () => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để thanh toán', {
                position: 'top-right',
                autoClose: 3000
            });
            return;
        }

        if (!apiProduct?.id) {
            toast.error('Không tìm thấy sản phẩm', {
                position: 'top-right',
                autoClose: 3000
            });
            return;
        }

        try {
            await cartService.addToCart({
                productId: apiProduct.id,
                quantity: quantity
            });
            // Redirect to checkout page
            window.location.href = '/cart';
        } catch (error) {
            console.error('Error adding to cart for checkout:', error);
            toast.error('Có lỗi xảy ra, vui lòng thử lại sau', {
                position: 'top-right',
                autoClose: 3000
            });
        }
    };

    // State for related products    
    // Fetch related products when the apiProduct changes
    useEffect(() => {
        const getRelatedProducts = async () => {
            if (apiProduct?.categoryId && apiProduct.id) {
                try {
                    setRelatedProductsLoading(true);
                    const response = await productService.getProducts({
                        categoryId: apiProduct.categoryId,
                        limit: 10 // Fetch more to allow filtering
                    });

                    if (response.data) {
                        // Filter out the current product and limit to 5 items
                        const filteredProducts = response.data
                            .filter(p => p.id !== apiProduct.id)
                            .slice(0, 5);

                        setRelatedProducts(filteredProducts);
                    }
                } catch (err) {
                    console.error('Error fetching related products:', err);
                    // Fallback to empty array
                    setRelatedProducts([]);
                } finally {
                    setRelatedProductsLoading(false);
                }
            }
        };

        getRelatedProducts();
    }, [apiProduct?.categoryId, apiProduct?.id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-red-500 text-xl">{error}</div>
            </div>
        );
    }

    if (!apiProduct) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-gray-500 text-xl">Không tìm thấy sản phẩm</div>
            </div>
        );
    }

    // Extract API data
    const productName = apiProduct.name || '';
    const productPrice = apiProduct.price ? parseFloat(apiProduct.price) : 0;
    const productDescription = apiProduct.description || '';
    const productImages = apiProduct.productImages?.length ?
        apiProduct.productImages.map((img, index) => ({
            id: img.id,
            url: img.imageUrl,
            alt: `${productName} - Hình ${index + 1}`
        })) : [];

    return (
        <div className="bg-gray-100 pb-10">
            {/* Breadcrumb */}
            <div className="bg-white py-2 shadow-sm mb-4">
                <div className="container mx-auto px-4">
                    <nav className="flex items-center text-sm text-gray-500">
                        <Link to="/" className="hover:text-green-600">Trang chủ</Link>
                        <ChevronRight className="mx-1" size={14} />
                        <Link to={`/category/${apiProduct?.categoryId}`} className="hover:text-green-600">
                            {categoryName || 'Danh mục'}
                        </Link>
                        <ChevronRight className="mx-1" size={14} />
                        <span className="text-gray-900 truncate max-w-xs">{productName}</span>
                    </nav>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-7xl">
                {/* Product title - Mobile view */}
                <h1 className="text-xl font-bold text-gray-900 mb-2 md:hidden">{productName}</h1>

                <div className="lg:grid lg:grid-cols-12 lg:gap-x-6">
                    {/* Left column - Image gallery - 4/12 */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-lg p-4 mb-4">
                            <div className="relative bg-white rounded-lg overflow-hidden mb-4">
                                <div className="aspect-w-1 aspect-h-1">
                                    <img
                                        src={productImages[selectedImageIndex].url}
                                        alt={productImages[selectedImageIndex].alt}
                                        className="w-full h-auto object-contain"
                                    />
                                </div>
                                {/* Badges */}
                                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                                    <div className="bg-red-600 text-white text-xs px-3 py-1 rounded font-medium">
                                        HÀNG NHẬP KHẨU CHÍNH NGẠCH
                                    </div>
                                </div>
                            </div>

                            {/* Image thumbnails */}
                            <div className="grid grid-cols-4 gap-2">
                                {productImages.map((image, idx) => (
                                    <button
                                        key={image.id}
                                        onClick={() => setSelectedImageIndex(idx)}
                                        className={`border-2 rounded-md p-1 transition-all ${selectedImageIndex === idx ? 'border-green-500' : 'border-gray-200 hover:border-gray-300'}`}
                                    >
                                        <img
                                            src={image.url}
                                            alt={image.alt}
                                            className="w-full h-auto object-contain aspect-square"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Center column - Product info - 5/12 */}
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-lg p-4 mb-4">
                            {/* Product Title */}
                            <h1 className="text-2xl font-bold text-gray-900 mb-3">{productName}</h1>

                            {/* Brand */}
                            {brandName && (
                                <div className="mb-2">
                                    <span className="text-sm text-gray-600">Thương hiệu: </span>
                                    <span className="text-sm font-medium text-gray-900">{brandName}</span>
                                </div>
                            )}

                            {/* Status */}
                            <div className="mb-4">
                                <span className="text-sm text-gray-600">Tình trạng: </span>
                                <span className="text-sm font-medium text-green-600">Còn hàng</span>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                <h2 className="text-4xl font-bold text-green-600">{formatCurrency(productPrice)}</h2>
                            </div>

                            {/* Quantity Selector */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng:</label>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-20 h-10 border border-gray-300 rounded-lg text-center"
                                        min="1"
                                    />
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Color options */}
                            {/* {(apiProduct.categoryId === 1 || apiProduct.categoryId === 2) && (
                                <div className="mb-6">
                                    <h3 className="font-medium text-gray-700 mb-2">Màu sắc</h3>
                                    <div className="flex space-x-2">
                                        <button className="border-2 border-green-500 p-1 rounded-full">
                                            <div className="w-8 h-8 bg-black rounded-full"></div>
                                        </button>
                                        <button className="border-2 border-transparent p-1 rounded-full">
                                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                        </button>
                                        <button className="border-2 border-transparent p-1 rounded-full">
                                            <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                                        </button>
                                    </div>
                                </div>
                            )} */}

                            {/* Call to action */}
                            <div className="grid grid-cols-1 gap-3 mb-6">
                                <button
                                    onClick={handleCheckout}
                                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-4 rounded-lg transition-all shadow-md flex items-center justify-center text-lg"
                                >
                                    <ShoppingBag size={20} className="mr-2" />
                                    THANH TOÁN
                                </button>
                                <button
                                    onClick={handleAddToCart}
                                    className="bg-green-500 hover:bg-green-600 text-white font-medium py-4 rounded-lg transition-all shadow-md flex items-center justify-center text-lg"
                                >
                                    <ShoppingCart size={20} className="mr-2" />
                                    THÊM VÀO GIỎ HÀNG
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right column - Delivery info - 3/12 */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg p-4 mb-4">
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                        <Check className="text-green-600" size={14} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Duy nhất tại Organicfood.vn</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                        <Truck className="text-green-600" size={14} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Free ship 5km cho đơn hàng từ 499k</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                        <Truck className="text-green-600" size={14} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Giao hàng trong 2h</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                        <Gift className="text-green-600" size={14} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Tích điểm tất cả sản phẩm</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                        <Shield className="text-green-600" size={14} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Thực Phẩm Hữu Cơ Tốt cho Sức Khỏe</p>
                                    </div>
                                </div>
                            </div>

                            {/* NO MORE PLASTIC Banner */}
                            <div className="mt-6 bg-green-600 text-white p-4 rounded-lg text-center">
                                <p className="font-bold text-lg mb-2">NO MORE PLASTIC</p>
                                <p className="text-xs">Đổi túi nilon lấy túi vải thân thiện môi trường</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content tabs - Description and Reviews */}
                <div className="bg-white rounded-lg overflow-hidden mb-6">                    {/* Tab headers */}
                    <div className="flex border-b">
                        <button
                            className={`px-6 py-3 font-medium text-sm ${activeTab === 'mô tả' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-green-600'}`}
                            onClick={() => setActiveTab('mô tả')}
                        >
                            Mô tả sản phẩm
                        </button>
                        <button
                            className={`px-6 py-3 font-medium text-sm ${activeTab === 'đánh giá' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-green-600'}`}
                            onClick={() => setActiveTab('đánh giá')}
                        >
                            Đánh giá
                        </button>
                    </div>                    {/* Tab content */}
                    <div className="p-4">
                        {/* Description tab */}
                        {activeTab === 'mô tả' && (
                            <div className="prose max-w-none">
                                {productDescription ? (
                                    <div dangerouslySetInnerHTML={{ __html: productDescription }} />
                                ) : (
                                    <div dangerouslySetInnerHTML={{ __html: '' }} />
                                )}
                            </div>
                        )}

                        {/* Reviews tab */}
                        {activeTab === 'đánh giá' && (
                            <div>
                                {apiProduct && <ProductReviews productId={apiProduct.id} />}
                            </div>
                        )}
                    </div>
                </div>

                {/* Related products */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Sản phẩm cùng loại</h2>
                        <Link to={`/category/${apiProduct.categoryId}`} className="text-green-600 text-sm hover:underline">
                            Xem tất cả
                        </Link>
                    </div>
                    {relatedProductsLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {relatedProducts.length > 0 ? (
                                relatedProducts.map((relatedProduct) => (
                                    <Link
                                        key={relatedProduct.id}
                                        to={`/product/${relatedProduct.slug}`}
                                        className="bg-white p-3 rounded-lg hover:shadow-md transition-shadow group"
                                    >
                                        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100 mb-3">
                                            {relatedProduct.productImages && relatedProduct.productImages.length > 0 ? (
                                                <img
                                                    src={relatedProduct.productImages[0].imageUrl}
                                                    alt={relatedProduct.name}
                                                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                    <span className="text-gray-400">No image</span>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-sm text-gray-700 font-medium truncate">{relatedProduct.name}</h3>
                                        <div className="mt-1 text-sm font-bold text-green-600">
                                            {formatCurrency(parseFloat(relatedProduct.price || '0'))}
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-5 py-8 text-center text-gray-500">
                                    Không tìm thấy sản phẩm tương tự
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
