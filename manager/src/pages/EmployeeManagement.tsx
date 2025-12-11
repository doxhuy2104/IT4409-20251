import { useState, useEffect, ChangeEvent } from "react";
import { FaUserPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AddButton from "../components/AddButton";
import ManagementTable from "../components/ManagementTable";
import api from "../services/api";

const headers = [
  "ID",
  "Tên đăng nhập",
  "Họ tên",
  "Email",
  "Số điện thoại",
  "Vai trò"
];
const columns = [
  "id",
  "username",
  "fullName",
  "email",
  "phone",
  "role"
];

interface Employee {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Filters {
  id: string;
  username: string;
  fullName: string;
  email: string;
  page: number;
  limit: number;
  [key: string]: string | number;
}

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filters, setFilters] = useState<Filters>({
    id: "",
    username: "",
    fullName: "",
    email: "",
    page: 1,
    limit: 10,
  });
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const params: { [key: string]: string | number } = {};
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== "" && value !== null) params[key] = value;
        });
        const res = await api.get("/account/admin", { params });
        setEmployees(res.data.data || []);
        setTotal(res.data.meta?.total || 0);
      } catch (err) {
        setEmployees([]);
        setTotal(0);
      }
      setLoading(false);
    };
    fetchEmployees();
  }, [filters]);

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const handleAdd = () => navigate("/employees/add");
  const handleEdit = (id: number) => navigate(`/employees/edit/${id}`);
  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      try {
        await api.delete(`/account/admin/${id}`);
        setEmployees(employees.filter(e => e.id !== id));
      } catch (err) {
        // Xử lý lỗi nếu cần
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
        onClick={() => filters.page > 1 && paginate(Number(filters.page) - 1)}
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
        onClick={() => filters.page < totalPages && paginate(Number(filters.page) + 1)}
        disabled={filters.page === totalPages}
      >
        <FaChevronRight className="w-3 h-3" />
      </button>
    );
    return pages;
  };

  return (
    <div className="p-2">
      <h1 className="text-2xl font-bold mb-4">Quản lý nhân viên</h1>
      <AddButton onClick={handleAdd} label="Thêm nhân viên" icon={FaUserPlus} />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="id">ID</label>
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
          <label className="block text-sm font-medium mb-1" htmlFor="username">Tên đăng nhập</label>
          <input
            type="text"
            name="username"
            id="username"
            placeholder="Nhập username..."
            value={filters.username}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg w-full shadow-sm focus:border-green-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="fullName">Họ tên</label>
          <input
            type="text"
            name="fullName"
            id="fullName"
            placeholder="Nhập họ tên..."
            value={filters.fullName}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg w-full shadow-sm focus:border-green-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
          <input
            type="text"
            name="email"
            id="email"
            placeholder="Nhập email..."
            value={filters.email}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg w-full shadow-sm focus:border-green-400"
          />
        </div>
      </div>
      <div className="p-4">
        <ManagementTable
          headers={headers}
          columns={columns}
          data={employees}
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

export default EmployeeManagement;
