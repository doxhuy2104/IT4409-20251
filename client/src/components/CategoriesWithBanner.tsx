import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Category } from '../types/category';
import categoryService from '../services/category.service';
import { getCategoryUrl } from '../data/categoryMapping';

// Helper function to create slug from category name
const createSlugFromName = (name: string): string => {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

//get category link
const getCategoryLink = (category: Category): string => {

    if (category.slug) {
        return `/${category.slug}`;
    }

    const mappedUrl = getCategoryUrl(category.id);
    if (mappedUrl && mappedUrl !== '/') {
        return mappedUrl;
    }

    const nameSlug = createSlugFromName(category.name);
    if (nameSlug) {
        return `/${nameSlug}`;
    }

    const fallbackUrl = `/${category.id}`;
    console.log(`Category ${category.name} (ID: ${category.id}) - Using fallback URL: ${fallbackUrl}`);
    return fallbackUrl;
};

const CategoriesWithBanner = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [autoPlay] = useState(true);
    const [bannersLoaded, setBannersLoaded] = useState<boolean[]>([]);

    const banners = [
        {
            url: 'https://www.shutterstock.com/shutterstock/photos/750940981/display_1500/stock-vector-organic-word-on-natural-green-banner-organic-product-sale-vector-illustration-eps-750940981.jpg',
            alt: 'Banner 1',
            link: '/new'
        },
        {
            url: 'https://file.hstatic.net/200000452921/article/banh_trung_thu_huu_co_mon_qua_suc_khoe_cho_mua_doan_vien-01_765322974b0347a5ad2ad59e3afe2d64.png',
            alt: 'Banner 2',
            link: '/banh-keo-socola'
        },
        {
            url: 'https://luckybrand.vn/uploads/PROJECT%20NEW%202022/VINASAMEX/NEW/thiet-ke-bao-bi-gia-vi-huu-co-31.jpg',
            alt: 'Banner 3',
            link: '/gia-vi-nguyen-phu-lieu'
        },
        {
            url: 'https://afamilycdn.com/2017/photo-4-1511416214867.jpg',
            alt: 'Banner 4',
            link: '/do-uong-tot-suc-koe'
        },
        {
            url: 'https://khoruou-gourmet.com/wp-content/uploads/2021/10/Thiet-ke-khong-ten-27.jpg',
            alt: 'Banner 4',
            link: '/thit-heo-huu-co'
        },
        {
            url: 'https://cdn.tgdd.vn/Files/2020/07/20/1272186/rau-huu-co-rau-organic-la-gi-tai-sao-rau-organic-lai-co-gia-dat-hon-rau-thong-thuong-202107311521595995.jpg',
            alt: 'Banner 5',
            link: '/rau-cu-qua'
        },
    ];

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            const data = await categoryService.getAllCategories();
            setCategories(data);
        };
        fetchCategories();
    }, []);

    // Initialize banner loading states
    useEffect(() => {
        setBannersLoaded(new Array(banners.length).fill(false));
    }, [banners.length]);

    // Handle banner image load
    const handleBannerLoad = (index: number) => {
        setBannersLoaded(prev => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
        });
    };

    // Auto play banners
    useEffect(() => {
        let interval: any = null;
        if (autoPlay) {
            interval = setInterval(() => {
                setCurrentSlide((prevSlide) => (prevSlide + 1) % banners.length);
            }, 5000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoPlay, banners.length]);

    const nextSlide = () => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % banners.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prevSlide) => (prevSlide - 1 + banners.length) % banners.length);
    };

    const setSlide = (index: number) => {
        setCurrentSlide(index);
    };

    return (
        <section className="container mx-auto px-4 mb-4">
            <div className="flex gap-0 relative h-[400px]">
                {/* Wrapper for Categories and Submenu to handle hover properly */}
                <div
                    className="relative w-80 flex-shrink-0 h-full z-30"
                    onMouseLeave={() => setHoveredCategory(null)}
                >
                    {/* Categories Sidebar */}
                    <div className="w-full bg-white rounded-l-lg shadow-sm overflow-hidden h-full flex flex-col">
                        <div className="bg-gradient-to-r from-[#5bbb46] to-[#43a32d] text-white px-4 py-3 flex-shrink-0">
                            <h2 className="text-base font-semibold">DANH MỤC SẢN PHẨM</h2>
                        </div>
                        <ul className="py-1 flex-1 overflow-y-auto">
                            {categories.map((category) => (
                                <li
                                    key={category.id}
                                    className="relative group"
                                    onMouseEnter={() => category.subCategories && category.subCategories.length > 0 ? setHoveredCategory(category) : setHoveredCategory(null)}
                                >
                                    <Link
                                        to={getCategoryLink(category)}
                                        className={`flex items-center justify-between px-4 py-2.5 hover:bg-green-50 transition-colors ${hoveredCategory?.id === category.id ? 'bg-green-50 text-green-600' : 'text-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* <span className="text-xl">{getCategoryIcon(category.name)}</span> */}
                                            <span className="text-sm font-medium">{category.name}</span>
                                        </div>
                                        {category.subCategories && category.subCategories.length > 0 && (
                                            <ChevronRight size={16} className="text-gray-400" />
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>

                {/* Subcategories Dropdown - positioned over banner */}
                {hoveredCategory && hoveredCategory.subCategories && hoveredCategory.subCategories.length > 0 && (
                    <div
                        className="absolute left-80 top-0 right-0 h-full bg-white shadow-2xl rounded-r-lg z-30 border-l border-gray-100 overflow-y-auto"
                        onMouseEnter={() => setHoveredCategory(hoveredCategory)}
                        onMouseLeave={() => setHoveredCategory(null)}
                    >
                        <div className="p-6 h-full">
                            <h2 className="text-lg font-bold text-green-600 mb-4">{hoveredCategory.name}</h2>
                            <div className="grid grid-cols-3 gap-6">
                                {hoveredCategory.subCategories.map((subCategory) => (
                                    <div key={subCategory.id}>
                                        <Link
                                            to={getCategoryLink(subCategory)}
                                            className="block"
                                        >
                                            <h3 className="text-sm font-semibold text-gray-800 hover:text-green-600 transition-colors mb-2 pb-2 border-b border-gray-200">
                                                {subCategory.name}
                                            </h3>
                                        </Link>
                                        {subCategory.subCategories && subCategory.subCategories.length > 0 && (
                                            <ul className="space-y-1.5 mt-2">
                                                {subCategory.subCategories.map((subSubCategory) => (
                                                    <li key={subSubCategory.id}>
                                                        <Link
                                                            to={getCategoryLink(subSubCategory)}
                                                            className="text-xs text-gray-600 hover:text-green-600 transition-colors block py-0.5"
                                                        >
                                                            • {subSubCategory.name}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Banner Slider */}
                <div className="flex-1 relative overflow-hidden rounded-r-lg shadow-md h-full">
                    <div
                        className="flex transition-transform duration-500 ease-in-out h-full"
                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                        {banners.map((banner, index) => (
                            <div key={index} className="min-w-full relative h-full">
                                <Link to={banner.link} className="block h-full">
                                    {!bannersLoaded[index] && (
                                        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                                            <span className="sr-only">Loading banner image</span>
                                            <div className="w-8 h-8 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                    <img
                                        src={banner.url}
                                        alt={banner.alt}
                                        className={`w-full h-full object-cover transition-opacity duration-300 ${bannersLoaded[index] ? 'opacity-100' : 'opacity-0'
                                            }`}
                                        onLoad={() => handleBannerLoad(index)}
                                        loading={index === 0 ? "eager" : "lazy"}
                                    />
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Banner Controls */}
                    <button
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full hover:bg-white/90 transition-colors z-10"
                        onClick={prevSlide}
                        aria-label="Previous banner"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full hover:bg-white/90 transition-colors z-10"
                        onClick={nextSlide}
                        aria-label="Next banner"
                    >
                        <ChevronRight size={20} />
                    </button>

                    {/* Dots Navigation */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {banners.map((banner, index) => (
                            <button
                                key={index}
                                onClick={() => setSlide(index)}
                                aria-label={`Go to slide ${index + 1}: ${banner.alt}`}
                                aria-current={currentSlide === index ? "true" : "false"}
                                className={`w-2.5 h-2.5 rounded-full transition-colors ${currentSlide === index ? 'bg-yellow-500' : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CategoriesWithBanner;

