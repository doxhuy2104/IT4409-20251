import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Award, Gift, Users, CheckCircle, Leaf, Shield, Heart, Star } from "lucide-react";

function InfoPage() {
    const location = useLocation();
    const [pageData, setPageData] = useState<{
        title: string;
        subtitle?: string;
        content: React.ReactNode;
    } | null>(null);

    const currentPath = location.pathname.substring(1);

    useEffect(() => {
        switch (currentPath) {
            case "chung-nhan-huu-co":
                setPageData({
                    title: "Chứng Nhận Hữu Cơ",
                    subtitle: "Cam kết chất lượng và an toàn thực phẩm",
                    content: (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <div className="flex items-center mb-4">
                                    <Award className="text-[#5bbb46] mr-3" size={32} />
                                    <h2 className="text-2xl font-bold text-gray-900">Chứng Nhận Hữu Cơ USDA/EU</h2>
                                </div>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    Tất cả sản phẩm của chúng tôi đều được chứng nhận hữu cơ bởi các tổ chức uy tín quốc tế như USDA (Mỹ) và EU Organic.
                                    Chứng nhận này đảm bảo rằng sản phẩm được sản xuất theo các tiêu chuẩn nghiêm ngặt về:
                                </p>
                                <ul className="space-y-3 mb-6">
                                    <li className="flex items-start">
                                        <CheckCircle className="text-[#5bbb46] mr-3 mt-1 flex-shrink-0" size={20} />
                                        <span className="text-gray-700">Không sử dụng thuốc trừ sâu, phân bón hóa học</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="text-[#5bbb46] mr-3 mt-1 flex-shrink-0" size={20} />
                                        <span className="text-gray-700">Không có biến đổi gen (GMO)</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="text-[#5bbb46] mr-3 mt-1 flex-shrink-0" size={20} />
                                        <span className="text-gray-700">Quy trình sản xuất tự nhiên, bền vững</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="text-[#5bbb46] mr-3 mt-1 flex-shrink-0" size={20} />
                                        <span className="text-gray-700">Bảo vệ môi trường và đa dạng sinh học</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6">
                                    <Shield className="text-[#5bbb46] mb-3" size={32} />
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Tiêu Chuẩn USDA</h3>
                                    <p className="text-gray-700">
                                        Chứng nhận hữu cơ của Bộ Nông nghiệp Hoa Kỳ, đảm bảo sản phẩm đáp ứng các tiêu chuẩn nghiêm ngặt về canh tác hữu cơ.
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-cyan-50 rounded-lg p-6">
                                    <Leaf className="text-[#5bbb46] mb-3" size={32} />
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Tiêu Chuẩn EU Organic</h3>
                                    <p className="text-gray-700">
                                        Chứng nhận hữu cơ của Liên minh Châu Âu, tuân thủ các quy định nghiêm ngặt về sản xuất và chế biến thực phẩm hữu cơ.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Lợi Ích Của Sản Phẩm Hữu Cơ</h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <Heart className="text-[#5bbb46] mx-auto mb-2" size={24} />
                                        <p className="text-sm font-medium text-gray-700">Tốt cho sức khỏe</p>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <Leaf className="text-[#5bbb46] mx-auto mb-2" size={24} />
                                        <p className="text-sm font-medium text-gray-700">Thân thiện môi trường</p>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <Star className="text-[#5bbb46] mx-auto mb-2" size={24} />
                                        <p className="text-sm font-medium text-gray-700">Chất lượng cao</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                });
                break;

            case "hang-si-huu-co-gia-tot":
                setPageData({
                    title: "Hàng Sỉ Hữu Cơ Giá Tốt",
                    subtitle: "Chương trình bán sỉ với giá ưu đãi đặc biệt",
                    content: (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <div className="flex items-center mb-4">
                                    <Gift className="text-[#5bbb46] mr-3" size={32} />
                                    <h2 className="text-2xl font-bold text-gray-900">Chương Trình Bán Sỉ</h2>
                                </div>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    Chúng tôi cung cấp chương trình bán sỉ đặc biệt cho các đối tác, cửa hàng, nhà hàng và các tổ chức
                                    muốn mua số lượng lớn sản phẩm hữu cơ với mức giá ưu đãi.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Ưu Đãi Đặc Biệt</h3>
                                    <ul className="space-y-2 text-gray-700">
                                        <li className="flex items-start">
                                            <CheckCircle className="text-[#5bbb46] mr-2 mt-1 flex-shrink-0" size={18} />
                                            <span>Giảm giá từ 10-30% tùy theo số lượng</span>
                                        </li>
                                        <li className="flex items-start">
                                            <CheckCircle className="text-[#5bbb46] mr-2 mt-1 flex-shrink-0" size={18} />
                                            <span>Giao hàng miễn phí cho đơn hàng lớn</span>
                                        </li>
                                        <li className="flex items-start">
                                            <CheckCircle className="text-[#5bbb46] mr-2 mt-1 flex-shrink-0" size={18} />
                                            <span>Hỗ trợ thanh toán linh hoạt</span>
                                        </li>
                                        <li className="flex items-start">
                                            <CheckCircle className="text-[#5bbb46] mr-2 mt-1 flex-shrink-0" size={18} />
                                            <span>Chính sách đổi trả linh hoạt</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Điều Kiện Tham Gia</h3>
                                    <ul className="space-y-2 text-gray-700">
                                        <li className="flex items-start">
                                            <CheckCircle className="text-[#5bbb46] mr-2 mt-1 flex-shrink-0" size={18} />
                                            <span>Đơn hàng tối thiểu từ 5 triệu đồng</span>
                                        </li>
                                        <li className="flex items-start">
                                            <CheckCircle className="text-[#5bbb46] mr-2 mt-1 flex-shrink-0" size={18} />
                                            <span>Có giấy phép kinh doanh (nếu là doanh nghiệp)</span>
                                        </li>
                                        <li className="flex items-start">
                                            <CheckCircle className="text-[#5bbb46] mr-2 mt-1 flex-shrink-0" size={18} />
                                            <span>Cam kết hợp tác lâu dài</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Liên Hệ Để Được Tư Vấn</h3>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <p className="text-gray-700 mb-2">
                                        <strong>Hotline:</strong> 1900 232 460
                                    </p>
                                    <p className="text-gray-700 mb-2">
                                        <strong>Email:</strong> sales@organicfood.vn
                                    </p>
                                    <p className="text-gray-700">
                                        <strong>Thời gian:</strong> 8:00 - 21:30 (Tất cả các ngày trong tuần)
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                });
                break;

            case "tu-hao-doanh-nghiep-phu-nu-lam-chu":
                setPageData({
                    title: "Tự Hào Là Doanh Nghiệp Do Phụ Nữ Làm Chủ",
                    subtitle: "Sứ mệnh và giá trị của chúng tôi",
                    content: (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <div className="flex items-center mb-4">
                                    <Users className="text-[#5bbb46] mr-3" size={32} />
                                    <h2 className="text-2xl font-bold text-gray-900">Về Chúng Tôi</h2>
                                </div>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    Chúng tôi tự hào là một doanh nghiệp do phụ nữ làm chủ, với sứ mệnh mang đến những sản phẩm hữu cơ
                                    chất lượng cao cho người tiêu dùng Việt Nam. Với tầm nhìn về một tương lai xanh và bền vững,
                                    chúng tôi cam kết:
                                </p>
                                <ul className="space-y-3 mb-6">
                                    <li className="flex items-start">
                                        <CheckCircle className="text-[#5bbb46] mr-3 mt-1 flex-shrink-0" size={20} />
                                        <span className="text-gray-700">Cung cấp sản phẩm hữu cơ chất lượng cao, được chứng nhận quốc tế</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="text-[#5bbb46] mr-3 mt-1 flex-shrink-0" size={20} />
                                        <span className="text-gray-700">Hỗ trợ và tạo cơ hội cho phụ nữ trong nông nghiệp và kinh doanh</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="text-[#5bbb46] mr-3 mt-1 flex-shrink-0" size={20} />
                                        <span className="text-gray-700">Thúc đẩy phát triển bền vững và bảo vệ môi trường</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="text-[#5bbb46] mr-3 mt-1 flex-shrink-0" size={20} />
                                        <span className="text-gray-700">Xây dựng cộng đồng khỏe mạnh và hạnh phúc</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg p-6 text-center">
                                    <Heart className="text-[#5bbb46] mx-auto mb-3" size={32} />
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Trao Quyền</h3>
                                    <p className="text-gray-700 text-sm">
                                        Hỗ trợ phụ nữ phát triển sự nghiệp và đóng góp vào nền kinh tế
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 text-center">
                                    <Leaf className="text-[#5bbb46] mx-auto mb-3" size={32} />
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Bền Vững</h3>
                                    <p className="text-gray-700 text-sm">
                                        Cam kết với môi trường và phát triển bền vững
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-cyan-50 rounded-lg p-6 text-center">
                                    <Star className="text-[#5bbb46] mx-auto mb-3" size={32} />
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Chất Lượng</h3>
                                    <p className="text-gray-700 text-sm">
                                        Đảm bảo chất lượng sản phẩm và dịch vụ tốt nhất
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Câu Chuyện Của Chúng Tôi</h3>
                                <div className="prose max-w-none text-gray-700">
                                    <p className="mb-4">
                                        Bắt đầu từ niềm đam mê với thực phẩm hữu cơ và mong muốn mang đến những sản phẩm tốt nhất
                                        cho gia đình Việt Nam, chúng tôi đã xây dựng một doanh nghiệp với tầm nhìn rõ ràng về tương lai
                                        xanh và bền vững.
                                    </p>
                                    <p className="mb-4">
                                        Với đội ngũ chủ yếu là phụ nữ, chúng tôi hiểu rõ giá trị của việc chăm sóc sức khỏe gia đình
                                        và mong muốn chia sẻ điều đó với cộng đồng. Mỗi sản phẩm chúng tôi cung cấp đều được lựa chọn
                                        kỹ lưỡng, đảm bảo chất lượng và an toàn.
                                    </p>
                                    <p>
                                        Chúng tôi tự hào được đồng hành cùng bạn trên hành trình hướng tới một cuộc sống khỏe mạnh và
                                        bền vững hơn.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                });
                break;

            default:
                setPageData({
                    title: "Trang Thông Tin",
                    content: <div className="text-gray-600">Trang không tồn tại</div>
                });
                break;
        }
    }, [currentPath]);

    if (!pageData) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5bbb46] mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

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
                        <span className="text-gray-900 font-medium">{pageData.title}</span>
                    </nav>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">{pageData.title}</h1>
                    {pageData.subtitle && (
                        <p className="text-xl text-gray-600 mb-4">{pageData.subtitle}</p>
                    )}
                    <div className="h-1 w-24 bg-[#5bbb46] rounded-full"></div>
                </div>

                {/* Page Content */}
                <div className="max-w-5xl">
                    {pageData.content}
                </div>
            </div>
        </div>
    );
}

export default InfoPage;

