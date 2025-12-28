import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import BackButton from "../components/BackButton";
import { FaEdit } from "react-icons/fa";

interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  categoryId: number;
  brandId: number;
  productImages?: ProductImage[];
  [key: string]: any;
}

interface Category {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
}

const formatCurrency = (amount: string | number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(Number(amount));
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        // Lấy chi tiết sản phẩm
        const res = await api.get(`/products?id=${id}`);
        setProduct(res.data.data[0]);
        // Lấy danh sách danh mục và brand
        const [catRes, brandRes] = await Promise.all([
          api.get("/public/categories"),
          api.get("/public/brands"),
        ]);
        setCategories(catRes.data.data || []);
        setBrands(brandRes.data.data || []);
      } catch (err: any) {
        setError("Không tìm thấy sản phẩm hoặc có lỗi xảy ra.");
      }
      setLoading(false);
    };
    fetchAll();
  }, [id]);

  const handleBack = () => {
    navigate("/products");
  };

  if (loading) return <div className="p-4">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!product) return null;

  // Tìm tên danh mục và tên nhà cung cấp
  const categoryName = categories.find(c => c.id === product.categoryId)?.name || product.categoryId;
  const brandName = brands.find(b => b.id === product.brandId)?.name || product.brandId;

  return (
    <div className="pt-8 w-full min-h-screen bg-white">
      <div className="flex justify-between">
        <BackButton className="ml-8" onClick={handleBack} label="Quay lại" />
        <button
          className={`mr-8 bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 cursor-pointer hover:bg-green-700 active:scale-90 transition-all duration-300 ease-in-out`}
          onClick={() => navigate(`/products/edit/${id}`)}
        >
          <FaEdit /> Chỉnh sửa
        </button></div>
      <h1 className="text-2xl font-bold mb-8 text-center">Chi tiết sản phẩm</h1>
      <div className="bg-white p-10 space-y-8 w-full mx-auto">
        <div className="flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1 space-y-4 text-lg">
            <div>
              <span className="font-semibold">Tên sản phẩm: </span>
              {product.name}
            </div>
            <div>
              <span className="font-semibold">Giá: </span>
              {formatCurrency(product.price || '0')}
            </div>
            <div>
              <span className="font-semibold">Số lượng: </span>
              {product.stock || 0}
            </div>
            <div>
              <span className="font-semibold">Danh mục: </span>
              {categoryName}
            </div>
            <div>
              <span className="font-semibold">Thương hiệu: </span>
              {brandName}
            </div>
          </div>
        </div>

        {product.productImages && product.productImages.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4 text-green-700">Hình ảnh sản phẩm</h2>
            <div className="flex flex-row gap-4 flex-wrap justify-center">
              {product.productImages.map((img: ProductImage) => (
                <img
                  key={img.id}
                  src={`${img.imageUrl}`}
                  alt={`product-img-${img.id}`}
                  className="w-40 h-40 object-cover rounded-lg border shadow cursor-pointer hover:scale-105 transition"
                  onClick={() => setPreviewImg(img.imageUrl)}
                />
              ))}
            </div>
          </div>
        )}

        {product.description && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4 text-green-700">Mô tả sản phẩm</h2>
            <div
              className="ql-editor-content   rounded-lg"
              style={{
                lineHeight: '1.6',
              }}
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}

      </div>
      {/* Overlay xem ảnh lớn */}
      {previewImg && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setPreviewImg(null)}
        >
          <img
            src={previewImg}
            alt="preview"
            className="max-w-3xl max-h-[80vh] rounded-lg shadow-lg border-4 border-white"
            onClick={e => e.stopPropagation()}
          />
          <button
            className="absolute top-8 right-8 text-white text-3xl font-bold"
            onClick={() => setPreviewImg(null)}
            title="Đóng"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
