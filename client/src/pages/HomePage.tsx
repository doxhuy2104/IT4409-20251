import { useState, useEffect, useCallback } from 'react';
import ProductCard from '../components/ProductCard';
import productService from '../services/product.service';
import { Product } from '../types/product';
import { Link } from 'react-router-dom';
import { slugToIdMap } from '../data/categoryMapping';
import CategoriesWithBanner from '../components/CategoriesWithBanner';

function Home() {
  // State for products data
  const [vegetables, setvVegetables] = useState<Product[]>([]);
  const [fruits, setFruits] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fruitsLoading, setFruitsLoading] = useState<boolean>(false);
  const [selectedFruitCategory, setSelectedFruitCategory] = useState<string>('trai-cay-viet'); // Mặc định chọn "Trái cây Việt"

  // Fetch initial products (vegetables and new products) - chỉ chạy 1 lần khi mount
  const fetchInitialProducts = useCallback(async () => {
    setLoading(true);
    try {
      const vegetablesResponse = await productService.getProducts({
        categoryId: slugToIdMap['rau-cu-qua'], // ID 5 - Rau Củ Quả
        limit: 5
      });

      const newResponse = await productService.getProducts({
        limit: 10
      });

      if (vegetablesResponse && vegetablesResponse.data) {
        setvVegetables(vegetablesResponse.data);
      }

      if (newResponse && newResponse.data) {
        // Sắp xếp sản phẩm theo thời gian thêm (mới nhất trước)
        const sortedNewProducts = [...newResponse.data].sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // Sắp xếp giảm dần (mới nhất trước)
        });
        setNewProducts(sortedNewProducts);
      }
    } catch (error) {
      console.error('Error fetching initial products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch fruits separately - chạy khi selectedFruitCategory thay đổi
  const fetchFruits = useCallback(async () => {
    setFruitsLoading(true);
    try {
      const fruitCategoryId = slugToIdMap[selectedFruitCategory] || slugToIdMap['trai-cay-viet'];
      const fruitsResponse = await productService.getProducts({
        categoryId: fruitCategoryId,
        limit: 5
      });

      if (fruitsResponse && fruitsResponse.data) {
        setFruits(fruitsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching fruits:', error);
    } finally {
      setFruitsLoading(false);
    }
  }, [selectedFruitCategory]);

  // Fetch initial products when component mounts
  useEffect(() => {
    console.log('Fetching initial products...');
    fetchInitialProducts();
  }, [fetchInitialProducts]);

  // Fetch fruits when component mounts and when fruit category changes
  useEffect(() => {
    console.log('Fetching fruits for category:', selectedFruitCategory);
    fetchFruits();
  }, [fetchFruits]);

  // Function to render product sections
  const renderProductSection = (title: string, link: string, products: Product[], isLoading: boolean) => {
    return (
      <div className="container mx-auto px-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{title}</h2>
            <Link to={link} className="text-green-500 text-sm">Xem tất cả &gt;</Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {isLoading ? (
              // Loading placeholders
              Array(5).fill(0).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                  <div className="bg-gray-200 h-40 mb-2 rounded"></div>
                  <div className="bg-gray-200 h-4 w-3/4 mb-2 rounded"></div>
                  <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
                </div>
              ))
            ) : (
              products.map((product, index) => (
                <ProductCard key={`${product.id}-${index}`} product={product} />
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-10 mt-1">
      {/* Categories Sidebar with Banner */}
      <CategoriesWithBanner />

      {/* Flash Sale / Promotion */}
      <div className="container mx-auto px-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">            <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-green-500">Hàng Organic Mới Về</h2>
          </div>
            <Link to="/promotions" className="text-green-500 text-sm">Xem tất cả &gt;</Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {loading ? (
              // Loading placeholders
              Array(5).fill(0).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                  <div className="bg-gray-200 h-40 mb-2 rounded"></div>
                  <div className="bg-gray-200 h-4 w-3/4 mb-2 rounded"></div>
                  <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
                </div>
              ))
            ) : (
              newProducts.map((product, index) => (
                <ProductCard key={`${product.id}-${index}`} product={product} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Smartphone Section */}
      {renderProductSection('Rau Củ Quả Organic', '/rau-cu-qua', vegetables, loading)}

      {/* Trái cây hữu cơ Section with category filters */}
      <div className="container mx-auto px-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Trái cây hữu cơ</h2>
            <Link to="/trai-cay-huu-co" className="text-green-500 text-sm">Xem tất cả &gt;</Link>
          </div>

          {/* Category filter buttons */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setSelectedFruitCategory('trai-cay-viet')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedFruitCategory === 'trai-cay-viet'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Trái cây việt hữu cơ
            </button>
            <button
              onClick={() => setSelectedFruitCategory('trai-cay-nhap-khau')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedFruitCategory === 'trai-cay-nhap-khau'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Trái cây nhập khẩu
            </button>
            <button
              onClick={() => setSelectedFruitCategory('trai-cay-cat-san')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedFruitCategory === 'trai-cay-cat-san'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Trái cây sấy và đông lạnh
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {fruitsLoading ? (
              // Loading placeholders
              Array(5).fill(0).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                  <div className="bg-gray-200 h-40 mb-2 rounded"></div>
                  <div className="bg-gray-200 h-4 w-3/4 mb-2 rounded"></div>
                  <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
                </div>
              ))
            ) : (
              fruits.map((product, index) => (
                <ProductCard key={`${product.id}-${index}`} product={product} />
              ))
            )}
          </div>
        </div>
      </div>
      {/* News and Tips - Enhanced with semantic HTML */}
      {/* <section aria-label="Tech News" className="container mx-auto px-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">TIN TỨC CÔNG NGHỆ</h2>
            <Link to="/news" className="text-green-500 text-sm hover:underline">Xem tất cả &gt;</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array(3).fill(0).map((_, index) => (
              <article key={index} className="group">
                <Link to={`/news/${index + 1}`} className="block">
                  <figure className="rounded-lg overflow-hidden mb-2">
                    <img
                      src={`https://via.placeholder.com/400x200/2196F3/ffffff?text=Tin+tức+${index + 1}`}
                      alt={`Tin tức ${index + 1}`}
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </figure>
                  <h3 className="font-medium text-gray-900 group-hover:text-green-500 transition-colors">
                    {index === 0 ? 'So sánh Galaxy S24 Ultra với iPhone 15 Pro Max: Đâu là lựa chọn tốt nhất?' :
                      index === 1 ? 'Top 5 laptop gaming giá rẻ đáng mua nhất năm 2025' :
                        'Cách chọn phụ kiện phù hợp cho thiết bị của bạn'}
                  </h3>
                  <time dateTime={new Date().toISOString()} className="text-sm text-gray-500 mt-1 block">
                    {new Date().toLocaleDateString('vi-VN')}
                  </time>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section> */}
    </div>
  );
}

export default Home;
