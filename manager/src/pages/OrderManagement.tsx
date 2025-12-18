import { useEffect, useState } from "react";
import ManagementTable from "../components/ManagementTable";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import LoadingSpinner from "../components/Loading";

interface Order {
    id: number;
    customerId: number;
    totalAmount: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface Filters {
    id: string;
    customerId: string;
    minTotalAmount: string;
    maxTotalAmount: string;
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

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

const OrderManagement = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<Filters>({
        id: "",
        customerId: "",
        minTotalAmount: "",
        maxTotalAmount: "",
        page: 1,
        limit: 10
    });
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const params: { [key: string]: string | number } = {};
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== "" && value !== null) params[key] = value;
            });
            const res = await api.get("/orders", { params });
            setOrders(res.data.data || []);
            setTotal(res.data.meta?.total || 0);
        } catch (err: any) {
            setError("Không thể tải danh sách đơn hàng");
            setOrders([]);
            setTotal(0);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, [filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
    };

    const handleDetail = (id: number) => {
        navigate(`/orders/detail/${id}`);
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

        // Nút prev
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

        // Các nút số trang
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

        // Nút next
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

    const formatData = (data: Order[]) => {
        return data.map(order => ({
            ...order,
            totalAmount: formatCurrency(order.totalAmount),
            createdAt: formatDate(order.createdAt),
            status: ({
                "draft": "Chưa thanh toán",
                "pending": "Chờ xử lý",
                "processing": "Đang xử lý",
                "shipping": "Đang vận chuyển",
                "delivered": "Đã giao hàng",
                "canceled": "Đã huỷ"
            })[order.status]
        }));
    };

    return (
        <div className="p-2">
            <h1 className="text-xl font-bold mb-4">Quản lý đơn hàng</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 items-end">
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="id">ID đơn hàng</label>
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
                    <label className="block text-sm font-medium mb-1" htmlFor="customerId">ID khách hàng</label>
                    <input
                        type="text"
                        name="customerId"
                        id="customerId"
                        placeholder="Nhập ID khách hàng..."
                        value={filters.customerId}
                        onChange={handleFilterChange}
                        className="p-2 border rounded-lg w-full shadow-sm focus:border-green-400"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="minTotalAmount">Tổng tiền từ</label>
                    <input
                        type="number"
                        name="minTotalAmount"
                        id="minTotalAmount"
                        placeholder="Nhập số tiền..."
                        value={filters.minTotalAmount}
                        onChange={handleFilterChange}
                        className="p-2 border rounded-lg w-full shadow-sm focus:border-green-400"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="maxTotalAmount">Tổng tiền đến</label>
                    <input
                        type="number"
                        name="maxTotalAmount"
                        id="maxTotalAmount"
                        placeholder="Nhập số tiền..."
                        value={filters.maxTotalAmount}
                        onChange={handleFilterChange}
                        className="p-2 border rounded-lg w-full shadow-sm focus:border-green-400"
                    />
                </div>
            </div>
            <div className="p-4">
                {loading ? (
                    <LoadingSpinner message="Đang tải đơn hàng..." />
                ) : error ? (
                    <div className="text-red-500 font-semibold">{error}</div>
                ) : (
                    <ManagementTable
                        headers={["ID", "Khách hàng", "Tổng tiền", "Trạng thái", "Ngày tạo"]}
                        columns={["id", "customerId", "totalAmount", "status", "createdAt"]}
                        data={formatData(orders)}
                        onDetail={handleDetail}
                    />
                )}
            </div>
            <div className="flex justify-center mt-4">
                {renderPagination()}
            </div>
        </div>
    );
};

export default OrderManagement;
