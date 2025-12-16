import { useState, useEffect, ChangeEvent } from "react";
import { FaUserPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AddButton from "../components/AddButton";
import ManagementTable from "../components/ManagementTable";
import api from "../services/api";

const headers = ["ID", "Tên sản phẩm", "Loại sản phẩm", "Thương hiệu"];
const columns = ["id", "name", "categoryName", "brandName"];

interface Product {
  id: number;
  name: string;
  categoryId: number;
  brandId: number;
  categoryName?: string;
  brandName?: string;
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

interface Filters {
  id: string;
  name: string;
  categoryId: string;
  brandId: string;
  min: string;
  max: string;
  page: number;
  limit: number;
  [key: string]: string | number;
}

// Flatten all categories and subCategories into a flat array
function flattenCategories(categories: any[]): any[] {
  let result: any[] = [];
  categories.forEach(cat => {
    result.push({ id: cat.id, name: cat.name });
    if (cat.subCategories && cat.subCategories.length > 0) {
      result = result.concat(flattenCategories(cat.subCategories));
    }
  });
  return result;
}

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filters, setFilters] = useState<Filters>({
    id: "",
    name: "",
    categoryId: "",
    brandId: "",
    min: "",
    max: "",
    page: 1,
    limit: 10,
  });
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/public/categories");
        const allCategories = flattenCategories(res.data.data || []);
        setCategories(allCategories);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    const fetchBrands = async () => {
      try {
        const res = await api.get("/public/brands");
        setBrands(res.data.data || []);
      } catch (err) {
        console.error("Error fetching brands:", err);
      }
    };

    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: { [key: string]: string | number } = {};
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== "" && value !== null) params[key] = value;
        });
        const res = await api.get("/products", { params });
        const productsWithNames = (res.data.data || []).map((product: Product) => {
          const category = categories.find(c => c.id === product.categoryId);
          const brand = brands.find(b => b.id === product.brandId);
          return {
            ...product,
            categoryName: category?.name || '',
            brandName: brand?.name || ''
          };
        });
        setProducts(productsWithNames);
        setTotal(res.data.meta?.total || 0);
      } catch (err) {
        setProducts([]);
        setTotal(0);
      }
      setLoading(false);
    };
    fetchProducts();
  }, [filters, categories, brands]);

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const handleDetail = (id: number) => navigate(`/products/detail/${id}`);
  const handleAdd = () => navigate("/products/add");
  const handleEdit = (id: number) => navigate(`/products/edit/${id}`);
  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await api.delete(`/products/${id}`);
        setProducts(products.filter(p => p.id !== id));
      } catch (err) {
        console.error("Error deleting product:", err);
      }
    }
  };

  const paginate = (pageNumber: number) => setFilters({ ...filters, page: pageNumber });

  const totalPages = Math.ceil(total / filters.limit);

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, filters.page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    pages.push(
      <button
        key="prev"
        className={`mx-1 px-3 py-1 border rounded flex items-center ${filters.page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-green-500 hover:bg-green-50'}`}
        onClick={() => filters.page > 1 && paginate(filters.page - 1)}
        disabled={filters.page === 1}
      >
        <FaChevronLeft className="w-3 h-3" />
      </button>
    );

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`mx-1 px-3 py-1 border rounded ${filters.page === i ? "bg-green-500 text-white" : "bg-white text-green-500 hover:bg-green-50"}`}
          onClick={() => paginate(i)}
        >
          {i}
        </button>
      );
    }

    pages.push(
      <button
        key="next"
        className={`mx-1 px-3 py-1 border rounded flex items-center ${filters.page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-green-500 hover:bg-green-50'}`}
        onClick={() => filters.page < totalPages && paginate(filters.page + 1)}
        disabled={filters.page === totalPages}
      >
        <FaChevronRight className="w-3 h-3" />
      </button>
    );

    return pages;
  };

  return (
    <div className="p-2">
      <h1 className="text-2xl font-bold mb-4">Quản lý sản phẩm</h1>
      <AddButton onClick={handleAdd} label="Thêm sản phẩm" icon={FaUserPlus} />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="id">ID sản phẩm</label>
          <input
            type="text"
            name="id"
            id="id"
            placeholder="Nhập ID..."
            value={filters.id}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg w-full shadow-sm focus:border-green-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="name">Tên sản phẩm</label>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Nhập tên..."
            value={filters.name}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg w-full shadow-sm focus:border-green-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="categoryId">Thể loại</label>
          <select
            name="categoryId"
            id="categoryId"
            value={filters.categoryId}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg w-full shadow-sm focus:border-green-400 cursor-pointer"
          >
            <option value="">Tất cả thể loại</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="brandId">Thương hiệu</label>
          <select
            name="brandId"
            id="brandId"
            value={filters.brandId}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg w-full shadow-sm focus:border-green-400 cursor-pointer"
          >
            <option value="">Tất cả thương hiệu</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id} >
                {brand.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="p-4">
        <ManagementTable
          headers={headers}
          columns={columns}
          data={products}
          onDetail={handleDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        {loading && <div>Đang tải dữ liệu...</div>}
      </div>
      <div className="flex justify-center mt-4">
        {renderPagination()}
      </div>
    </div>
  );
};

export default ProductManagement;
