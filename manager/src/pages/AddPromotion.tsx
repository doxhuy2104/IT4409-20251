import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import api from "../services/api";

const formatCurrency = (amount: string | number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(Number(amount));
};

const AddPromotion = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    discountPercent: "",
    discountAmount: "",
    minimumPurchaseAmount: "",
    maximumDiscountAmount: "",
    discountCode: "",
    usageLimit: "",
    usageLimitPerCustomer: "",
    startDate: "",
    endDate: "",
    productIds: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleBack = () => navigate("/promotions");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    // Validate required fields
    if (!form.name || !form.discountPercent || !form.discountAmount || !form.minimumPurchaseAmount || !form.maximumDiscountAmount || !form.discountCode || !form.usageLimit || !form.usageLimitPerCustomer || !form.startDate || !form.endDate || !form.productIds) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    // Validate numbers
    const numberFields = ["discountPercent", "discountAmount", "minimumPurchaseAmount", "maximumDiscountAmount", "usageLimit", "usageLimitPerCustomer"];
    for (const field of numberFields) {
      if (isNaN(Number(form[field as keyof typeof form]))) {
        setError(`Trường ${field} phải là số!`);
        return;
      }
    }
    // Validate productIds
    const productIdsArr = form.productIds.split(",").map(s => s.trim()).filter(Boolean).map(Number);
    if (productIdsArr.some(isNaN)) {
      setError("Danh sách sản phẩm phải là các số, cách nhau bởi dấu phẩy!");
      return;
    }
    setLoading(true);
    try {
      const body = {
        name: form.name,
        discountPercent: Number(form.discountPercent),
        discountAmount: Number(form.discountAmount),
        minimumPurchaseAmount: Number(form.minimumPurchaseAmount),
        maximumDiscountAmount: Number(form.maximumDiscountAmount),
        discountCode: form.discountCode,
        usageLimit: Number(form.usageLimit),
        usageLimitPerCustomer: Number(form.usageLimitPerCustomer),
        startDate: form.startDate,
        endDate: form.endDate,
        productIds: productIdsArr,
      };
      await api.post("/promotions", body);
      setSuccess("Thêm chương trình khuyến mại thành công!");
      setTimeout(() => navigate("/promotions"), 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || "Đã có lỗi xảy ra!");
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <BackButton onClick={handleBack} />
      <h1 className="text-2xl font-bold mb-6">Thêm chương trình khuyến mại</h1>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-2 text-lg">Tên chương trình <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="name"
            placeholder="Nhập tên chương trình"
            value={form.name}
            onChange={handleChange}
            className="w-full p-3 border rounded text-lg"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block font-semibold mb-2 text-lg">% giảm giá <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="discountPercent"
              placeholder="Nhập % giảm giá"
              value={form.discountPercent}
              onChange={handleChange}
              className="w-full p-3 border rounded text-lg"
              min={0}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-2 text-lg">Số tiền giảm <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="discountAmount"
              placeholder="Nhập số tiền giảm"
              value={form.discountAmount}
              onChange={handleChange}
              className="w-full p-3 border rounded text-lg"
              min={0}
              required
            />
            {form.discountAmount && (
              <div className="text-sm text-gray-500 mt-1">
                {formatCurrency(form.discountAmount)}
              </div>
            )}
          </div>
          <div>
            <label className="block font-semibold mb-2 text-lg">Giá trị đơn tối thiểu <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="minimumPurchaseAmount"
              placeholder="Nhập giá trị đơn tối thiểu"
              value={form.minimumPurchaseAmount}
              onChange={handleChange}
              className="w-full p-3 border rounded text-lg"
              min={0}
              required
            />
            {form.minimumPurchaseAmount && (
              <div className="text-sm text-gray-500 mt-1">
                {formatCurrency(form.minimumPurchaseAmount)}
              </div>
            )}
          </div>
          <div>
            <label className="block font-semibold mb-2 text-lg">Giảm tối đa <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="maximumDiscountAmount"
              placeholder="Nhập giảm tối đa"
              value={form.maximumDiscountAmount}
              onChange={handleChange}
              className="w-full p-3 border rounded text-lg"
              min={0}
              required
            />
            {form.maximumDiscountAmount && (
              <div className="text-sm text-gray-500 mt-1">
                {formatCurrency(form.maximumDiscountAmount)}
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block font-semibold mb-2 text-lg">Mã giảm giá <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="discountCode"
              placeholder="Nhập mã giảm giá"
              value={form.discountCode}
              onChange={handleChange}
              className="w-full p-3 border rounded text-lg"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-2 text-lg">Số lượt sử dụng <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="usageLimit"
              placeholder="Nhập số lượt sử dụng"
              value={form.usageLimit}
              onChange={handleChange}
              className="w-full p-3 border rounded text-lg"
              min={1}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-2 text-lg">Số lượt mỗi khách <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="usageLimitPerCustomer"
              placeholder="Nhập số lượt mỗi khách"
              value={form.usageLimitPerCustomer}
              onChange={handleChange}
              className="w-full p-3 border rounded text-lg"
              min={1}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block font-semibold mb-2 text-lg">Ngày bắt đầu <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="w-full p-3 border rounded text-lg"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-2 text-lg">Ngày kết thúc <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              className="w-full p-3 border rounded text-lg"
              required
            />
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-2 text-lg">Danh sách sản phẩm áp dụng (ID, cách nhau bởi dấu phẩy) <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="productIds"
            placeholder="VD: 1,3,14,15"
            value={form.productIds}
            onChange={handleChange}
            className="w-full p-3 border rounded text-lg"
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:bg-green-300"
          >
            {loading ? "Đang xử lý..." : "Thêm"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPromotion;