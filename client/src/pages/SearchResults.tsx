import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import productService from '../services/product.service';
import { Product } from '../types/product';

const SearchResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const limit = 12; // Number of products per page

  // Get search query from URL
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('query') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const normalizedQuery = query.trim().toLowerCase();
        const response = await productService.getProducts({
          name: normalizedQuery,
          page: page,
          limit: limit
        });

        console.log('Search results:', response);
        setProducts(response.data);
        setTotalPages(Math.ceil((response.meta?.total || 0) / limit));
        setCurrentPage(page);
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Không thể tải kết quả tìm kiếm. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, page]);
  const handlePageChange = (newPage: number) => {
    // Update URL with new page number
    const params = new URLSearchParams(location.search);
    params.set('page', newPage.toString());
    navigate({
      pathname: location.pathname,
      search: params.toString()
    });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-8 gap-2">
        {currentPage > 1 && (
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-4 py-2 border rounded-md hover:bg-gray-100 transition-colors"
          >
            Trước
          </button>
        )}

        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          // Show current page and 2 pages before and after
          let pageToShow;
          if (totalPages <= 5) {
            pageToShow = i + 1;
          } else if (currentPage <= 3) {
            pageToShow = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageToShow = totalPages - 4 + i;
          } else {
            pageToShow = currentPage - 2 + i;
          }

          return (
            <button
              key={pageToShow}
              onClick={() => handlePageChange(pageToShow)}
              className={`px-4 py-2 border rounded-md transition-colors ${currentPage === pageToShow
                ? 'bg-green-600 text-white'
                : 'hover:bg-gray-100'
                }`}
            >
              {pageToShow}
            </button>
          );
        })}

        {currentPage < totalPages && (
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-4 py-2 border rounded-md hover:bg-gray-100 transition-colors"
          >
            Tiếp
          </button>
        )}
      </div>
    );
  };
  return (
    <>
      <div className="bg-gray-50 py-3 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-500">
            <Link to="/" className="hover:text-green-600">Trang chủ</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700">Tìm kiếm</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-1">
          Có 1 kết quả tìm kiếm phù hợp
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-4">Không tìm thấy sản phẩm phù hợp</p>
            <p className="text-gray-500">Vui lòng thử lại với từ khóa khác</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {renderPagination()}
          </>
        )}
      </div>
    </>
  );
};

export default SearchResults;
