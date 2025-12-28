import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from './ProductCard';
import brandService from '../services/brand.service';
import productService from '../services/product.service';
import { priceRanges } from '../data/price';
import { sortOptions } from '../data/sort';
import { Product } from '../types/product';

// Sort option component
const SortOption: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({
    label,
    isActive,
    onClick
}) => {
    return (
        <button
            className={`px-3 py-1 text-sm rounded-md transition-colors ${isActive ? 'bg-green-600 text-white' : 'hover:bg-gray-100'
                }`}
            onClick={onClick}
        >
            {label}
        </button>
    );
};

interface ProductListingProps {
    categoryId?: number;
    selectedPriceRanges?: string[];
    selectedTypes?: number[];
    sortOption?: string;
    onSortChange?: (option: string) => void;
}

const ProductListing: React.FC<ProductListingProps> = ({
    categoryId,
    selectedPriceRanges = [],
    selectedTypes = [],
    sortOption: externalSortOption = 'name-asc',
    onSortChange
}) => {
    
    const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);

   
    const [internalSortOption, setInternalSortOption] = useState<string>('name-asc');
    const sortOption = onSortChange ? externalSortOption : internalSortOption;
    const setSortOption = onSortChange || setInternalSortOption;
    const [visibleProducts, setVisibleProducts] = useState<number>(10);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [totalProducts, setTotalProducts] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limit] = useState<number>(10);

    // Fetch products based on filters
    const fetchProducts = useCallback(async (pageOverride?: number) => {
        setLoading(true);
        try {
            const pageToUse = pageOverride !== undefined ? pageOverride : currentPage;
            console.log('Fetching products with parameters:', {
                categoryId,
                brandId: selectedBrandId,
                selectedPriceRanges,
                selectedTypes,
                page: pageToUse,
                limit
            });

            const params: any = {
                page: pageToUse,
                limit,
            };

            // Add category filter if provided
            if (categoryId) {
                params.categoryId = categoryId;
            }

            // Add brand filter if selected
            if (selectedBrandId) {
                params.brandId = selectedBrandId;
                console.log('Selected brand ID:', selectedBrandId);
            }

            // Add price ranges if selected (support multiple ranges)
            if (selectedPriceRanges.length > 0) {
                // For now, use the first selected range. In future, can combine multiple ranges
                const selectedPriceRange = priceRanges.find(range => range.value === selectedPriceRanges[0]);
                if (selectedPriceRange) {
                    // Set min price (always 0 or the minimum value)
                    params.min = selectedPriceRange.min;
                    // Only set max if it's defined (not undefined for "over-1000" range)
                    if (selectedPriceRange.max !== undefined) {
                        params.max = selectedPriceRange.max;
                    }
                    // If max is undefined, don't send it - backend will handle it as "no upper limit"
                    console.log('Price range:', selectedPriceRange.min, '-', selectedPriceRange.max !== undefined ? selectedPriceRange.max : 'unlimited');
                }
            }

            console.log('API Request parameters:', params);
            const response = await productService.getProducts(params);
            console.log('API Response:', response);

            if (response && response.data) {
                // For subsequent pages, add to existing products
                if (pageToUse > 1) {
                    setProducts(prev => {
                        // Get existing product IDs
                        const existingIds = new Set(prev.map(p => p.id));
                        // Filter out new products that already exist in the list
                        const newProducts = response.data.filter(p => !existingIds.has(p.id));
                        // Return combined list
                        return [...prev, ...newProducts];
                    });
                } else {
                    // For first page or filter changes, replace products
                    setProducts(response.data);
                }
                setTotalProducts(response.meta?.total || 0);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    }, [categoryId, currentPage, limit, selectedPriceRanges, selectedTypes, selectedBrandId]);

    // Fetch brands by category ID when the component mounts or categoryId changes
    useEffect(() => {
        const fetchBrands = async () => {
            if (categoryId) {
                try {
                    const brandsData = await brandService.getBrandsByCategoryId(categoryId);
                    console.log('Fetched brands:', brandsData);
                } catch (error) {
                    console.error('Error fetching brands:', error);
                }
            } 
        };

        fetchBrands();
        setProducts([]);
        setSelectedBrandId(null);
        setCurrentPage(1);
        setVisibleProducts(10);

        fetchProducts();
    }, [categoryId]);  // Remove fetchProducts dependency to avoid double fetching    

    // Fetch products when filters change
    useEffect(() => {
        console.log('Filter changed, fetching products again');
        setCurrentPage(1);
        setProducts([]);
        fetchProducts(1);
    }, [selectedBrandId, selectedPriceRanges, selectedTypes, fetchProducts]);

    // Handle "Xem thêm" button click
    const handleLoadMore = () => {
        setCurrentPage(prev => prev + 1);
    };    
    const getSortedProducts = () => {
        if (!products.length) return [];

        console.log('Sorting products with option:', sortOption);
        console.log('Number of products before sorting:', products.length);

        return [...products].sort((a, b) => {
            switch (sortOption) {
                case 'name-asc':
                    return a.name.localeCompare(b.name, 'vi');
                case 'name-desc':
                    return b.name.localeCompare(a.name, 'vi');
                case 'price-desc':
                    return Number(b.price) - Number(a.price);
                case 'price-asc':
                    return Number(a.price) - Number(b.price);
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                default:
                    return 0;
            }
        });
    };

    const sortedProducts = getSortedProducts();
    const displayedProducts = sortedProducts.slice(0, visibleProducts);

    return (
        <div className="bg-transparent">
            <div className="container mx-auto px-4">
                {/* Sort options - Top of content area */}
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-3 font-medium">Sắp xếp:</span>
                        <div className="flex gap-2">
                            {sortOptions.map(option => (
                                <SortOption
                                    key={option.value}
                                    label={option.label}
                                    isActive={sortOption === option.value}
                                    onClick={() => setSortOption(option.value)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Loading state */}
                {loading && products.length === 0 && (
                    <div className="flex justify-center items-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
                    </div>
                )}

                {/* No products found */}
                {!loading && products.length === 0 && (
                    <div className="bg-white p-10 rounded-lg shadow-sm text-center">
                        <p className="text-gray-600">Không tìm thấy sản phẩm nào phù hợp với bộ lọc</p>
                    </div>
                )}                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {displayedProducts.map((product, index) => (
                        <ProductCard key={`${product.id}-${index}`} product={product} />
                    ))}
                </div>

                {/* Load More Button - show only if there are more products to display */}
                {!loading && products.length > 0 && products.length < totalProducts && (
                    <div className="flex justify-center mt-8">
                        <button
                            className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors font-medium shadow-md hover:shadow-lg"
                            onClick={handleLoadMore}
                        >
                            Xem thêm
                        </button>
                    </div>
                )}

                {/* Loading more indicator */}
                {loading && products.length > 0 && (
                    <div className="flex justify-center mt-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductListing;
