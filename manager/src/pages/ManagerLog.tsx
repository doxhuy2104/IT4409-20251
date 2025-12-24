import { useState, useEffect, ChangeEvent } from "react";
import ManagementTable from "../components/ManagementTable";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import LoadingSpinner from "../components/Loading";

const headers = ["ID", "Admin ID", "Hành động", "Đối tượng", "Ngày tạo"];
const columns = ["id", "adminId", "action", "entityType", "createdAt"];

interface AdminLog {
  id: number;
  adminId: number;
  action: string;
  entityType: string;
  entityId: number;
  details: string;
  createdAt: string;
  updatedAt: string;
}

interface Filters {
  id: string;
  adminId: string;
  action: string;
  entityType: string;
  fromDate: string;
  toDate: string;
  page: number;
  limit: number;
  [key: string]: string | number;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

const ManagerLog = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [filters, setFilters] = useState<Filters>({
    id: "",
    adminId: "",
    action: "",
    entityType: "",
    fromDate: "",
    toDate: "",
    page: 1,
    limit: 10
  });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const params: { [key: string]: string | number } = {};
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== "" && value !== null) params[key] = value;
        });
        const res = await api.get("/manager/admin-log", { params });
        setLogs(res.data.data || []);
        setTotal(res.data.meta?.total || 0);
      } catch (err) {
        setLogs([]);
        setTotal(0);
      }
      setLoading(false);
    };
    fetchLogs();
  }, [filters]);

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const handleDetail = (id: number) => {
    navigate(`/history/detail/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lịch sử này?")) {
      try {
        await api.delete(`/manager/admin-log/${id}`);
        setLogs(logs.filter((log) => log.id !== id));
      } catch (err) {
        alert("Xóa thất bại!");
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
        <span className="sr-only">Trang trước</span>
        &#60;
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
        <span className="sr-only">Trang sau</span>
        &#62;
      </button>
    );

    return pages;
  };

  const formatData = (data: AdminLog[]) => {
    return data.map(log => ({
      ...log,
      createdAt: formatDate(log.createdAt)
    }));
  };

  return (
    <div className="p-2">
      <h1 className="text-xl font-bold mb-4">Quản lý truy cập</h1>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4 items-end">
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
          <label className="block text-sm font-medium mb-1" htmlFor="adminId">Admin ID</label>
          <input
            type="text"
            name="adminId"
            id="adminId"
            placeholder="Nhập Admin ID..."
            value={filters.adminId}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg w-full shadow-sm focus:border-green-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="action">Hành động</label>
          <input
            type="text"
            name="action"
            id="action"
            placeholder="Nhập hành động..."
            value={filters.action}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg w-full shadow-sm focus:border-green-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="entityType">Đối tượng</label>
          <input
            type="text"
            name="entityType"
            id="entityType"
            placeholder="Nhập đối tượng..."
            value={filters.entityType}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg w-full shadow-sm focus:border-green-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="fromDate">Từ ngày</label>
          <input
            type="date"
            name="fromDate"
            id="fromDate"
            value={filters.fromDate}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg w-full shadow-sm focus:border-green-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="toDate">Đến ngày</label>
          <input
            type="date"
            name="toDate"
            id="toDate"
            value={filters.toDate}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg w-full shadow-sm focus:border-green-400"
          />
        </div>
      </div>
      <div className="p-4">
        {loading ? (
          <LoadingSpinner message="Đang tải lịch sử..." />
        ) : (
          <ManagementTable
            headers={headers}
            columns={columns}
            data={formatData(logs)}
            onDetail={handleDetail}
            onDelete={handleDelete}
          />
        )}
      </div>
      <div className="flex justify-center mt-4">{renderPagination()}</div>
    </div>
  );
};

export default ManagerLog;
