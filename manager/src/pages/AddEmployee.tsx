import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import BackButton from "../components/BackButton";

export default function AddEmployee() {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await api.post("/account/admin", {
        username,
        password,
        fullName,
        email,
        phone,
        role
      });
      setSuccess("Thêm nhân viên thành công!");
      setTimeout(() => navigate("/employees"), 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    }
    setLoading(false);
  };

  return (
    <div className="p-8 w-full min-h-screen bg-white">
      <BackButton onClick={() => navigate("/employees")} label="Quay lại" />
      <h1 className="text-2xl font-bold mb-8 text-center">Thêm Nhân Viên</h1>
      <form
        onSubmit={handleSubmit}
        className="mt-6 bg-white shadow-md rounded-lg p-10 space-y-8 max-w-2xl mx-auto"
      >
        <div>
          <label className="block font-semibold mb-2 text-lg">Tên đăng nhập <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="Nhập tên đăng nhập"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full p-3 border rounded focus:outline-green-400 text-lg"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-lg">Mật khẩu <span className="text-red-500">*</span></label>
          <input
            type="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-3 border rounded focus:outline-green-400 text-lg"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-lg">Họ tên <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="Nhập họ tên"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full p-3 border rounded focus:outline-green-400 text-lg"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-lg">Email <span className="text-red-500">*</span></label>
          <input
            type="email"
            placeholder="Nhập email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-3 border rounded focus:outline-green-400 text-lg"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-lg">Số điện thoại <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="Nhập số điện thoại"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full p-3 border rounded focus:outline-green-400 text-lg"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-lg">Vai trò</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full p-3 border rounded focus:outline-green-400 text-lg"
            required
          >
            <option value="">Chọn vai trò</option>
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
          {loading ? "Đang thêm..." : "Thêm nhân viên"}
        </button>
      </form>
    </div>
  );
}
