import { useState, useEffect, ChangeEvent } from "react";
import ManagementTable from "../components/ManagementTable";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const headers = ["ID", "Tên khách hàng", "Email", "Số điện thoại", "Trạng thái"];
const columns = ["id", "fullName", "email", "phone", "status"];

interface Customer {
  id: number;
  fullName: string;
  email: string;
  phone: string;
}

interface Filters {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  page: number;
  limit: number;
  [key: string]: string | number;
}

const CustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filters, setFilters] = useState<Filters>({
    id: "",
    fullName: "",
    email: "",
    phone: "",
    page: 1,
    limit: 10,
  });
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const params: { [key: string]: string | number } = {};
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== "" && value !== null) params[key] = value;
        });
        const res = await api.get("/account/customers", { params });
        setCustomers(res.data.data || []);
        setTotal(res.data.meta?.total || 0);
      } catch (err) {
        setCustomers([]);
        setTotal(0);
      }
      setLoading(false);
    };
    fetchCustomers();
  }, [filters]);

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const handleDetail = (id: number) => {
    navigate(`/customers/detail/${id}`);
  };

  const paginate = (pageNumber: number) => setFilters({ ...filters, page: pageNumber });
  const totalPages = Math.ceil(total / filters.limit);

  return (
    <div className="p-2">
      <h1 className="text-xl font-bold mb-4">Quản lý khách hàng</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="id">ID khách hàng</label>
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
          <label className="block text-sm font-medium mb-1" htmlFor="fullName">Tên khách hàng</label>
          <input
            type="text"
            name="fullName"
            id="fullName"
            placeholder="Nhập tên..."
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
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="phone">Số điện thoại</label>
          <input
            type="text"
            name="phone"
            id="phone"
            placeholder="Nhập số điện thoại..."
            value={filters.phone}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg w-full shadow-sm focus:border-green-400"
          />
        </div>
      </div>
      <div className="p-4">
        <ManagementTable
          headers={headers}
          columns={columns}
          data={customers}
          onDetail={handleDetail}
          showActions={true}
        />
        {loading && <div>Đang tải dữ liệu...</div>}
      </div>
      <div className="flex justify-center mt-4">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            className={`mx-1 px-3 py-1 border rounded ${filters.page === index + 1 ? "bg-green-500 text-white" : "bg-white text-green-500"}`}
            onClick={() => paginate(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CustomerManagement;
