import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from './ProductCard';
import brandService from '../services/brand.service';
import productService from '../services/product.service';
import { priceRanges } from '../data/price';
import { sortOptions } from '../data/sort';
import { Product } from '../types/product';

// Brand filter button component
const BrandButton: React.FC<{ brand: string; logo: string; isActive: boolean; onClick: () => void }> = ({
    brand,
    logo,
    isActive,
    onClick
}) => {
    console.log('Brand button clicked:', logo);
    return (
        <button
            className={`flex items-center px-3 py-2 rounded-full border transition-colors ${isActive ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-300 hover:border-green-300'
                }`}
            onClick={onClick}
        >
            {/* {logo && <img src={logo} alt={`${brand} logo`} className="h-5 w-auto mr-1" />} */}
            {<span className="text-sm">{brand}</span>}
        </button>
    );
};

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
    // Brand filtering state
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
    const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);

    // Internal sorting state (if not controlled from parent)
    const [internalSortOption, setInternalSortOption] = useState<string>('name-asc');
    const sortOption = onSortChange ? externalSortOption : internalSortOption;
    const setSortOption = onSortChange || setInternalSortOption;
    const [visibleProducts, setVisibleProducts] = useState<number>(10);
    const [brands, setBrands] = useState<Array<{ id: number, name: string, logo: string }>>([]);

    // Products state
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [totalProducts, setTotalProducts] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limit] = useState<number>(10);

    // Fetch products based on filters
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            console.log('Fetching products with parameters:', {
                categoryId,
                brandId: selectedBrandId,
                selectedPriceRanges,
                selectedTypes,
                page: currentPage,
                limit
            });

            const params: any = {
                page: currentPage,
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
                    params.min = selectedPriceRange.min;
                    params.max = selectedPriceRange.max;
                    console.log('Price range:', selectedPriceRange.min, '-', selectedPriceRange.max);
                }
            }

            // Add type filters (subcategory IDs)
            if (selectedTypes.length > 0) {
                // Filter by subcategory IDs - this might need API support
                // For now, we'll filter client-side if needed
            }

            console.log('API Request parameters:', params);
            const response = await productService.getProducts(params);
            console.log('API Response:', response);

            if (response && response.data) {
                // For subsequent pages, add to existing products
                if (currentPage > 1) {
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

                    // Map API data to the format expected by our components
                    const formattedBrands = brandsData.map(brand => ({
                        id: brand.id,
                        name: brand.name,
                        // Use logoUrl from API, if it doesn't start with http, assume it's a relative path
                        logo: brand.logoUrl
                    }));
                    setBrands(formattedBrands);
                } catch (error) {
                    console.error('Error fetching brands:', error);
                    // Fallback to default brands if API fails
                    setBrands([]);
                }
            } else {
                // Default brands when no categoryId is provided
                setBrands([]);
            }
        };

        fetchBrands();

        // Reset products, filters and pagination when category changes
        setProducts([]);
        setSelectedBrand(null);
        setSelectedBrandId(null);
        setCurrentPage(1);
        setVisibleProducts(10);

        // Fetch products with the initial parameters
        fetchProducts();
    }, [categoryId]);  // Remove fetchProducts dependency to avoid double fetching    

    // Fetch products when filters change
    useEffect(() => {
        console.log('Filter changed, fetching products again');
        if (selectedBrandId !== null || selectedPriceRanges.length > 0 || selectedTypes.length > 0) {
            setProducts([]);
            setCurrentPage(1);
        }
        fetchProducts();
    }, [selectedBrandId, selectedPriceRanges, selectedTypes, fetchProducts]);

    // Handle brand selection
    const handleBrandSelect = (brandName: string, brandId: number) => {
        if (selectedBrand === brandName) {
            setSelectedBrand(null);
            setSelectedBrandId(null);
        } else {
            setSelectedBrand(brandName);
            setSelectedBrandId(brandId);
        }
    };


    // Handle "Xem thêm" button click
    const handleLoadMore = () => {
        setCurrentPage(prev => prev + 1);
    };    // Sort products based on selected option
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
