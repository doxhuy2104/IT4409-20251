import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ProductListing from "../components/ProductListing";
import CategorySidebar from "../components/CategorySidebar";
import { ChevronRight } from "lucide-react";
import { getIdFromSlug } from "../data/categoryMapping";

function CategoryPage() {
    const location = useLocation();
    const [categoryName, setCategoryName] = useState<string>("");
    const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
    const [sortOption, setSortOption] = useState<string>('name-asc');
    
    // Get the current path without leading slash (this will be the slug)
    const currentPath = location.pathname.substring(1);

    // Get category ID from slug (for API calls)
    const categoryId = getIdFromSlug(currentPath);
    console.log('Category ID:', categoryId);

    useEffect(() => {
        console.log('Current path:', currentPath);
        console.log('Category ID:', categoryId);

        // Ideally, you would fetch category details from API using categoryId
        // Example: fetchCategoryDetails(categoryId);

        // For now, set category details manually based on path
        switch (currentPath) {
            case "qua-tang-trai-cay":
                setCategoryName("Quà Tặng Trái Cây");
                break;

            case "qua-tang-tet":
                setCategoryName("Quà Tặng Tết");
                break;

            case "trai-cay-theo-mua":
                setCategoryName("Trái Cây Theo Mùa");
                break;

            case "ready-to-eat":
                setCategoryName("Ready To Eat");
                break;

            case "rau-cu-qua":
                setCategoryName("Rau Củ Quả");
                break;

            case "tuoi-song":
                setCategoryName("Tươi Sống");
                break;

            case "ready-to-cook":
                setCategoryName("Ready To Cook");
                break;

            case "thuc-pham-kho":
                setCategoryName("Thực Phẩm Khô");
                break;

            case "gia-vi-phu-lieu":
                setCategoryName("Gia Vị & Phụ Liệu");
                break;
            // TRÁI CÂY
            case "trai-cay-viet":
                setCategoryName("Trái Cây Việt");
                break;

            case "trai-cay-nhap-khau":
                setCategoryName("Trái Cây Nhập Khẩu");
                break;

            case "trai-cay-cat-san":
                setCategoryName("Trái Cây Cắt Sẵn");
                break;
            // RAU CỦ QUẢ
            case "rau-an-la":
                setCategoryName("Rau Ăn Lá");
                break;

            case "rau-cu":
                setCategoryName("Rau Củ");
                break;

            case "qua-tuoi":
                setCategoryName("Quả Tươi");
                break;

            case "nam-tuoi":
                setCategoryName("Nấm Tươi");
                break;
            // TƯƠI SỐNG
            case "thit-heo":
                setCategoryName("Thịt Heo");
                break;

            case "thit-bo":
                setCategoryName("Thịt Bò");
                break;

            case "thit-ga":
                setCategoryName("Thịt Gà");
                break;

            case "hai-san":
                setCategoryName("Hải Sản");
                break;

            case "trung":
                setCategoryName("Trứng");
                break;
            // THỰC PHẨM KHÔ
            case "hat-dinh-duong":
                setCategoryName("Hạt Dinh Dưỡng");
                break;

            case "trai-cay-kho":
                setCategoryName("Trái Cây Khô");
                break;

            case "hat-ngu-coc":
                setCategoryName("Hạt Ngũ Cốc");
                break;

            case "bot":
                setCategoryName("Bột");
                break;
            // GIA VỊ – PHỤ LIỆU
            case "gia-vi":
                setCategoryName("Gia Vị");
                break;

            case "dau-an":
                setCategoryName("Dầu Ăn");
                break;

            case "nuoc-tuong-nuoc-mam":
                setCategoryName("Nước Tương - Nước Mắm");
                break;

            case "duong-muoi":
                setCategoryName("Đường - Muối");
                break;

            // READY TO EAT
            case "com-hop":
                setCategoryName("Cơm Hộp");
                break;

            case "banh-mi":
                setCategoryName("Bánh Mì");
                break;

            case "salad":
                setCategoryName("Salad");
                break;

            case "do-an-nhanh":
                setCategoryName("Đồ Ăn Nhanh");
                break;
            // READY TO COOK
            case "rau-cu-sach":
                setCategoryName("Rau Củ Sạch");
                break;

            case "thit-uop-san":
                setCategoryName("Thịt Ướp Sẵn");
                break;

            case "ca-sach":
                setCategoryName("Cá Sạch");
                break;

            case "do-chay":
                setCategoryName("Đồ Chay");
                break;

            // DEFAULT
            default:
                setCategoryName("Sản phẩm");
                break;
        }
    }, [currentPath, categoryId]);

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-3">
                    <nav className="flex items-center text-sm text-gray-600">
                        <Link to="/" className="hover:text-[#5bbb46] transition-colors duration-200">
                            Trang chủ
                        </Link>
                        <ChevronRight className="mx-2 text-gray-400" size={16} />
                        <span className="text-gray-900 font-medium">{categoryName}</span>
                    </nav>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                {/* Category Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">{categoryName}</h1>
                    <div className="h-1 w-24 bg-[#5bbb46] rounded-full"></div>
                </div>

                {/* Main Content with Sidebar */}
                <div className="flex gap-6">
                    {/* Left Sidebar - Filters */}
                    <div className="w-64 flex-shrink-0">
                        <CategorySidebar
                            categoryId={categoryId}
                            selectedPriceRanges={selectedPriceRanges}
                            onPriceRangeChange={setSelectedPriceRanges}
                            selectedTypes={selectedTypes}
                            onTypeChange={setSelectedTypes}
                        />
                    </div>

                    {/* Right Content - Products with Sort */}
                    <div className="flex-1">
                        <ProductListing 
                            categoryId={categoryId}
                            selectedPriceRanges={selectedPriceRanges}
                            selectedTypes={selectedTypes}
                            sortOption={sortOption}
                            onSortChange={setSortOption}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CategoryPage;
