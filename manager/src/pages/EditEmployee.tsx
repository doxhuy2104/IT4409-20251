import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import BackButton from "../components/BackButton";

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

export default function EditEmployee() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [original, setOriginal] = useState<Employee | null>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/account/admin`, { params: { id } });
        const emp: Employee = res.data.data[0];
        setUsername(emp.username);
        setFullName(emp.fullName);
        setEmail(emp.email);
        setPhone(emp.phone);
        setRole(emp.role);
        setOriginal(emp);
      } catch (err) {
        setError("Không tìm thấy nhân viên hoặc có lỗi xảy ra.");
      }
      setLoading(false);
    };
    fetchEmployee();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const updateData: any = {};
      if (original) {
        if (username !== original.username) updateData.username = username;
        if (fullName !== original.fullName) updateData.fullName = fullName;
        if (email !== original.email) updateData.email = email;
        if (phone !== original.phone) updateData.phone = phone;
        if (role !== original.role) updateData.role = role;
      }
      if (password) updateData.password = password;
      await api.put(`/account/admin/${id}`, updateData);
      setSuccess("Cập nhật nhân viên thành công!");
      setTimeout(() => navigate("/employees"), 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    }
    setLoading(false);
  };

  return (
    <div className="p-8 w-full min-h-screen bg-white">
      <BackButton onClick={() => navigate(-1)} />
      <h1 className="text-2xl font-bold mb-8 text-center">Chỉnh sửa nhân viên</h1>
      <form
        onSubmit={handleSubmit}
        className="mt-6 bg-white shadow-md rounded-lg p-10 space-y-8 max-w-2xl mx-auto"
      >
        <div>
          <label className="block font-semibold mb-2 text-lg">Tên đăng nhập</label>
          <input
            type="text"
            placeholder="Nhập tên đăng nhập"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full p-3 border rounded focus:outline-green-400 text-lg"
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-lg">Mật khẩu mới</label>
          <input
            type="password"
            placeholder="Để trống nếu không đổi"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-3 border rounded focus:outline-green-400 text-lg"
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-lg">Họ tên</label>
          <input
            type="text"
            placeholder="Nhập họ tên"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full p-3 border rounded focus:outline-green-400 text-lg"
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-lg">Email</label>
          <input
            type="email"
            placeholder="Nhập email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-3 border rounded focus:outline-green-400 text-lg"
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-lg">Số điện thoại</label>
          <input
            type="text"
            placeholder="Nhập số điện thoại"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full p-3 border rounded focus:outline-green-400 text-lg"
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-lg">Vai trò</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full p-3 border rounded focus:outline-green-400 text-lg"
          >
            <option value="staff">Nhân viên</option>
            <option value="manager">Quản lý</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
        {error && <div className="text-red-500 font-semibold text-lg">{error}</div>}
        {success && <div className="text-green-600 font-semibold text-lg">{success}</div>}
        <button
          type="submit"
          className="bg-green-500 text-white px-8 py-3 rounded hover:bg-green-600 font-semibold w-full text-lg shadow"
          disabled={loading}
        >
          {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
}
