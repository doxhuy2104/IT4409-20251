import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import BackButton from "../components/BackButton";
import ManagementTable from "../components/ManagementTable";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  priceAtTime: string;
  createdAt: string;
  updatedAt: string;
  product: Product;
}

interface Payment {
  id: number;
  orderId: number;
  amount: string;
  paymentMethod: string;
  transactionId: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Shipping {
  id: number;
  orderId: number;
  name: string;
  email: string;
  phone: string;
  shippingAddress: string;
  shippingProvider: string;
  trackingNumber: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: number;
  customerId: number;
  warehouseId: number | null;
  totalAmount: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  payments: Payment[];
  shipping: Shipping;
}

const formatCurrency = (amount: string | number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(Number(amount));
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/orders?id=${id}`);
        setOrder(res.data.data[0]);
        setStatus(res.data.data[0]?.status || "");
      } catch (err: any) {
        setError("Không tìm thấy đơn hàng hoặc có lỗi xảy ra.");
      }
      setLoading(false);
    };
    fetchOrder();
  }, [id]);

  const handleBack = () => {
    navigate("/orders");
  };

  const handleUpdateStatus = async () => {
    if (!order) return;
    setUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);
    try {
      await api.put(`/orders/${order.id}`, { status });
      setUpdateSuccess(true);
      // Reload order data
      const res = await api.get(`/orders?id=${order.id}`);
      setOrder(res.data.data[0]);
      setStatus(res.data.data[0]?.status || "");
    } catch (err: any) {
      setUpdateError("Cập nhật trạng thái thất bại.");
    }
    setUpdating(false);
  };

  if (loading) return <div className="p-4">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!order) return null;

  // Chuẩn bị dữ liệu cho bảng sản phẩm
  const orderItemHeaders = ["ID", "Tên sản phẩm", "Số lượng", "Đơn giá", "Thành tiền"];
  const orderItemColumns = ["id", "name", "quantity", "price", "total"];
  const orderItemData = order.orderItems.map(item => ({
    id: item.id,
    name: item.product?.name || 'Sản phẩm không xác định',
    quantity: item.quantity,
    price: formatCurrency(item.priceAtTime),
    total: formatCurrency(Number(item.priceAtTime) * item.quantity),
  }));

  // Chuẩn bị dữ liệu cho bảng thanh toán
  const paymentHeaders = ["ID", "Phương thức", "Số tiền", "Trạng thái", "Thời gian"];
  const paymentColumns = ["id", "method", "amount", "status", "time"];
  const paymentData = order.payments.map(payment => ({
    id: payment.id,
    method: payment.paymentMethod,
    amount: formatCurrency(payment.amount),
    status: payment.status,
    time: formatDate(payment.createdAt),
  }));

  return (
    <div className="p-8 w-full min-h-screen bg-white">
      <BackButton onClick={handleBack} label="Quay lại" />
      <h1 className="text-2xl font-bold mb-8 text-center">Chi tiết đơn hàng #{order.id}</h1>

      <div className="bg-white p-10 space-y-8 w-full mx-auto">
        {/* Thông tin cơ bản */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-green-700">Thông tin đơn hàng</h2>
          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <span className="font-semibold">Mã đơn hàng: </span>
              #{order.id}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Trạng thái: </span>
              <select
                className="border rounded px-2 py-1"
                value={status}
                onChange={e => setStatus(e.target.value)}
                disabled={updating || order.status === "cancelled"}
              >
                <option value="pending">Chờ xử lý</option>
                <option value="processing">Đang xử lý</option>
                <option value="shipped">Đã gửi hàng</option>
                <option value="delivered">Đã giao hàng</option>
                <option value="cancelled">Đã hủy</option>
              </select>
              <button
                className="ml-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                onClick={handleUpdateStatus}
                disabled={updating || status === order.status || order.status === "cancelled"}
              >
                {updating ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
            <div>
              <span className="font-semibold">Tổng tiền: </span>
              {formatCurrency(order.totalAmount)}
            </div>
            <div>
              <span className="font-semibold">Ngày đặt: </span>
              {formatDate(order.createdAt)}
            </div>
          </div>
          {updateError && <div className="text-red-500 mt-2">{updateError}</div>}
          {updateSuccess && <div className="text-green-600 mt-2">Cập nhật trạng thái thành công!</div>}
        </div>

        {/* Thông tin giao hàng */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-green-700">Thông tin giao hàng</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-semibold">Người nhận: </span>
              {order.shipping.name}
            </div>
            <div>
              <span className="font-semibold">Email: </span>
              {order.shipping.email}
            </div>
            <div>
              <span className="font-semibold">Số điện thoại: </span>
              {order.shipping.phone}
            </div>
            <div>
              <span className="font-semibold">Địa chỉ: </span>
              {order.shipping.shippingAddress}
            </div>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-green-700">Sản phẩm đã đặt</h2>
          <ManagementTable
            headers={orderItemHeaders}
            columns={orderItemColumns}
            data={orderItemData}
            showActions={false}
          />
        </div>

        {/* Thông tin thanh toán */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-green-700">Thông tin thanh toán</h2>
          <ManagementTable
            headers={paymentHeaders}
            columns={paymentColumns}
            data={paymentData}
            showActions={false}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderDetail; 