// src/pages/Home.tsx
import { FC, useEffect, useState } from "react";
import { FaBox, FaComment, FaShoppingCart, FaUsers, FaUserTie } from "react-icons/fa";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../services/api";



const Home: FC = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/dashboard");
        setDashboard(res.data.data);
      } catch (err) {
        setError("Không thể tải dữ liệu dashboard");
      }
      setLoading(false);
    };
    fetchDashboard();
  }, []);

  const stats = [
    { icon: <FaUserTie size={28} />, label: "Nhân viên", value: dashboard?.admins ?? "-" },
    { icon: <FaUsers size={28} />, label: "Khách hàng", value: dashboard?.customers ?? "-" },
    { icon: <FaBox size={28} />, label: "Sản phẩm", value: dashboard?.products ?? "-" },
    { icon: <FaShoppingCart size={28} />, label: "Đơn hàng", value: dashboard?.orders ?? "-" },
    { icon: <FaComment size={28} />, label: "Phản hồi", value: dashboard?.feedbacks ?? "-" },
  ];

  const chartData = dashboard?.revenueStats?.map((item: any) => ({
    name: new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    doanhThu: Number(item.totalRevenue),
    orders: item.totalOrders
  })) || [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Chào mừng đến với hệ thống quản lý
      </h1>
      {loading ? (
        <div>Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            {stats.map((item, index) => (
              <div
                key={index}
                className="bg-white shadow-md rounded-2xl p-5 flex items-center gap-4 hover:shadow-lg transition"
              >
                <div className="text-green-600">{item.icon}</div>
                <div>
                  <p className="text-lg font-bold text-gray-800">{item.value}</p>
                  <p className="text-sm text-gray-500">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white p-4 rounded-2xl shadow border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Doanh thu 7 ngày gần nhất</h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value))} />
                  <Line type="monotone" dataKey="doanhThu" name="Doanh thu" stroke="#00a63e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                Chưa có dữ liệu doanh thu
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
