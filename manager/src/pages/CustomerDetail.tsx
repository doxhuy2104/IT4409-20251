import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import BackButton from "../components/BackButton";

interface Customer {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  address?: string | null;
  googleId?: string | null;
  createdAt: string;
  updatedAt: string;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/account/customers/?id=${id}`);
        setCustomer(res.data.data[0]);
      } catch (err: any) {
        setError("Không tìm thấy khách hàng hoặc có lỗi xảy ra.");
      }
      setLoading(false);
    };
    fetchCustomer();
  }, [id]);

  const handleBack = () => {
    navigate("/customers");
  };

  if (loading) return <div className="p-4">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!customer) return null;

  return (
    <div className="p-8 w-full min-h-screen bg-white">
      <BackButton onClick={handleBack} label="Quay lại" />
      <h1 className="text-2xl font-bold mb-8 text-center">Chi tiết khách hàng</h1>
      <div className="bg-white shadow-lg rounded-xl p-10 space-y-8 max-w-2xl mx-auto">
        <div className="space-y-4 text-lg">
          <div>
            <span className="font-semibold">ID: </span>
            {customer.id}
          </div>
          <div>
            <span className="font-semibold">Tên khách hàng: </span>
            {customer.fullName}
          </div>
          <div>
            <span className="font-semibold">Email: </span>
            {customer.email}
          </div>
          <div>
            <span className="font-semibold">Số điện thoại: </span>
            {customer.phone}
          </div>
          <div>
            <span className="font-semibold">Địa chỉ: </span>
            {customer.address}
          </div>
          <div>
            <span className="font-semibold">Ngày tạo: </span>
            {formatDate(customer.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail; 