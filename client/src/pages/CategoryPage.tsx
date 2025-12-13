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
    
    const currentPath = location.pathname.substring(1);
    const categoryId = getIdFromSlug(currentPath);

    useEffect(() => {
        console.log('Current path:', currentPath);
        console.log('Category ID:', categoryId);

        switch (currentPath) {
            // DANH MỤC
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
            case "bep-o-ready-to-eat":
                setCategoryName("Bếp O - Ready To Eat");
                break;

            case "rau-cu-qua":
                setCategoryName("Rau Củ Quả");
                break;

            case "tuoi-song":
                setCategoryName("Tươi Sống");
                break;

            case "ready-to-cook":
            case "bep-o-ready-to-cook":
                setCategoryName("Bếp O - Ready To Cook");
                break;

            case "thuc-pham-kho":
                setCategoryName("Thực Phẩm Khô");
                break;

            case "gia-vi-phu-lieu":
                setCategoryName("Gia Vị & Phụ Liệu");
                break;

            case "do-uong-tot-suc-khoe":
                setCategoryName("Đồ Uống Tốt Sức Khỏe");
                break;

            case "bo-sua":
                setCategoryName("Bơ - Sữa");
                break;

            case "me-be":
                setCategoryName("Mẹ & Bé");
                break;

            case "superfood":
                setCategoryName("Superfood");
                break;

            // TRÁI CÂY THEO MÙA
            case "trai-cay-viet":
                setCategoryName("Trái Cây Việt");
                break;

            case "trai-cay-nhap-khau":
                setCategoryName("Trái Cây Nhập Khẩu");
                break;

            case "trai-cay-say-dong-lanh":
                setCategoryName("Trái Cây Sấy - Đông Lạnh");
                break;

            case "nuoc-ep-trai-cay-tuoi":
                setCategoryName("Nước Ép Trái Cây Tươi");
                break;

            // RAU CỦ QUẢ 
            case "rau-la-huu-co":
            case "rau-an-la":
                setCategoryName("Rau Lá Hữu Cơ");
                break;

            case "cu-qua-huu-co":
            case "rau-cu":
                setCategoryName("Củ Quả Hữu Cơ");
                break;

            case "nam":
            case "nam-tuoi":
                setCategoryName("Nấm");
                break;
            case "thit-heo-huu-co":
            case "thit-heo":
                setCategoryName("Thịt Heo Hữu Cơ");
                break;
            case "thit-bo-huu-co":
            case "thit-bo":
                setCategoryName("Thịt Bò Hữu Cơ");
                break;
            case "thit-bo-to-tay-ninh":
                setCategoryName("Thịt Bò Tơ Tây Ninh");
                break;
            case "thit-bo-obe":
                setCategoryName("Thịt Bò Obe");
                break;
            case "thit-gia-cam-trung":
            case "thit-ga":
                setCategoryName("Thịt Gia Cầm - Trứng");
                break;
            case "thuy-hai-san":
            case "hai-san":
                setCategoryName("Thủy & Hải Sản");
                break;
            case "thuy-san":
                setCategoryName("Thuỷ Sản");
                break;
            case "hai-san-kho-mot-nang":
                setCategoryName("Hải Sản Khô & Một Nắng");
                break;
            case "trung":
                setCategoryName("Trứng");
                break;

            //  THỰC PHẨM KHÔ  
            case "cac-loai-hat-huu-co":
            case "hat-dinh-duong":
                setCategoryName("Các Loại Hạt Hữu Cơ");
                break;

            case "ngu-coc-huu-co":
            case "hat-ngu-coc":
                setCategoryName("Ngũ Cốc Hữu Cơ");
                break;

            case "gao-huu-co":
                setCategoryName("Gạo Hữu Cơ");
                break;

            case "mi-nui-huu-co":
                setCategoryName("Mì & Nui Hữu Cơ");
                break;

            case "banh-keo-socola":
                setCategoryName("Bánh Kẹo & Socola");
                break;

            case "do-kho-khac":
            case "trai-cay-kho":
                setCategoryName("Đồ Khô Khác");
                break;

            case "nguyen-lieu-lam-banh":
            case "bot":
                setCategoryName("Nguyên Liệu Làm Bánh");
                break;

            case "snack-organic":
                setCategoryName("Snack Organic");
                break;

            // GIA VỊ & PHỤ LIỆU 
            case "gia-vi-nguyen-phu-lieu":
            case "gia-vi":
                setCategoryName("Gia Vị Nguyên - Phụ Liệu");
                break;

            case "mat-ong":
                setCategoryName("Mật Ong");
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

            // ĐỒ UỐNG TỐT SỨC KHỎE
            case "tra-huu-co":
                setCategoryName("Trà Hữu Cơ");
                break;

            case "ca-phe-huu-co":
                setCategoryName("Cà Phê Hữu Cơ");
                break;

            case "nuoc-ep-huu-co":
                setCategoryName("Nước Ép Hữu Cơ");
                break;

            case "do-uong-co-con":
                setCategoryName("Đồ Uống Có Cồn");
                break;

            //  BƠ SỮA 
            case "sua-hat":
                setCategoryName("Sữa Hạt");
                break;

            case "sua-tuoi":
                setCategoryName("Sữa Tươi");
                break;

            case "sua-chua":
                setCategoryName("Sữa Chua");
                break;

            case "bo-phomai":
                setCategoryName("Bơ & Phomai");
                break;

            case "sua-dac":
                setCategoryName("Sữa Đặc");
                break;

            //SUPERFOOD
            case "cham-soc-tieu-hoa":
                setCategoryName("Chăm Sóc Tiêu Hoá");
                break;

            case "bo-sung-suc-khoe":
                setCategoryName("Bổ Sung Sức Khoẻ");
                break;

            case "protein-thuc-vat-huu-co":
                setCategoryName("Protein Thực Vật Hữu Cơ");
                break;

            //READY TO EAT
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

            // === READY TO COOK (Subcategories) ===
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