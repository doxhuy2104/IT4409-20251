import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { ProductV2 } from '../types/product';
import ProductCard from '../components/ProductCard';

function Home() {
  // State for products data

  const [loading, setLoading] = useState<boolean>(true);

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {

    } catch (error) {
      console.error('Error fetching products for home page:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch products when component mounts
  useEffect(() => {
    console.log('Fetching products...');
    fetchProducts();
  }, [fetchProducts]);

  // Function to render product sections
  const renderProductSection = (title: string, link: string, products: ProductV2[], isLoading: boolean) => {
    return (
      <div className="container mx-auto px-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{title}</h2>
            <Link to={link} className="text-blue-600 text-sm">Xem tất cả &gt;</Link>
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
      {/* Hero Banner Slider */}
      {/* <Banner /> */}

      {/* Flash Sale / Promotion */}
      <div className="container mx-auto px-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">            <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-red-600">FLASH SALE</h2>
          </div>
            <Link to="/promotions" className="text-blue-600 text-sm">Xem tất cả &gt;</Link>
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
              <div></div>
            )}
          </div>
        </div>
      </div>


    </div>
  );
}

export default Home;
