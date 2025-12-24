import { useState, useEffect, ChangeEvent, FormEvent, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import ImageUploader from "../components/ImageUploader";
import api from "../services/api";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { uploadImageToCloudinary } from "../services/cloudinary";
import "../utils/quillSetup";

interface Category {
  id: number;
  name: string;
  subCategories: Category[];
}

interface Brand {
  id: number;
  name: string;
}

const formatCurrency = (amount: string | number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(Number(amount));
};

const AddProduct = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    brandId: "",
    description: "",
    price: "",
    stock: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const quillRef = useRef<ReactQuill | null>(null);

  const handleQuillImageUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      if (!input.files?.length) {
        return;
      }

      const file = input.files[0];
      try {
        const imageUrl = await uploadImageToCloudinary(file);
        const editor = quillRef.current?.getEditor();
        if (!editor) return;
        const range = editor.getSelection(true);
        const insertIndex = range ? range.index : editor.getLength();
        editor.insertEmbed(insertIndex, "image", imageUrl, "user");
        editor.setSelection(insertIndex + 1);
      } catch (err) {
        console.error(err);
        setError("Không thể tải ảnh lên Cloudinary. Vui lòng thử lại.");
      }
    };
    input.click();
  }, []);

  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }, { color: [] }, { background: [] }],
        ["link", "blockquote", "code-block", "image"],
        ["clean"],
      ],
      handlers: {
        image: handleQuillImageUpload,
      },
    },
    resize: {
      locale: {},
    },
  }), [handleQuillImageUpload]);

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "indent",
    "align",
    "color",
    "background",
    "link",
    "blockquote",
    "code-block",
    "image",
  ];

  // Function to recursively get all categories (both parent and child)
  const getAllCategories = (categories: Category[], level: number = 0): Category[] => {
    let allCategories: Category[] = [];
    categories.forEach(category => {
      // Thêm category hiện tại với prefix để phân biệt cấp độ
      allCategories.push(
        // {
        // ...
        category,
        // name: level > 0 ? '  '.repeat(level) + '├─ ' + category.name : category.name
        // }
      );
      // Nếu có subCategories, đệ quy để lấy tất cả
      const subCategories = category.subCategories ?? [];
      if (subCategories.length > 0) {
        allCategories = [...allCategories, ...getAllCategories(subCategories, level + 1)];
      }
    });
    return allCategories;
  };

  useEffect(() => {
    api.get("/public/categories").then(res => {
      const allCategories = res.data.data || [];
      const flattenedCategories = getAllCategories(allCategories);
      setCategories(flattenedCategories);
    });
    api.get("/public/brands").then(res => setBrands(res.data.data || []));
  }, []);

  useEffect(() => {
    if (images.length > 0) {
      const urls = images.map(file => URL.createObjectURL(file));
      setImagePreviews(urls);
      return () => urls.forEach(url => URL.revokeObjectURL(url));
    } else {
      setImagePreviews([]);
    }
  }, [images]);

  const handleBack = () => navigate("/products");

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDescriptionChange = (value: string) => {
    setForm((prev) => ({ ...prev, description: value }));
  };

  const handleImageChange = (newFiles: File[]) => {
    setImages(prev => [...prev, ...newFiles]);
  };

  const handleRemoveImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const plainDescription = form.description.replace(/<(.|\n)*?>/g, "").trim();

    if (!form.name || !form.categoryId || !form.brandId || !plainDescription || !form.price || !form.stock) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (isNaN(Number(form.price)) || Number(form.price) <= 0) {
      setError("Giá phải là số dương!");
      return;
    }
    if (isNaN(Number(form.stock)) || Number(form.stock) < 0) {
      setError("Số lượng phải là số không âm!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("categoryId", form.categoryId);
      formData.append("brandId", form.brandId);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      images.forEach((file) => {
        formData.append("image", file);
      });
      await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("Thêm sản phẩm thành công!");
      setTimeout(() => navigate("/products"), 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || "Đã có lỗi xảy ra!");
    }
    setLoading(false);
  };

  return (
    <div className="p-8 w-full min-h-screen bg-white">
      <BackButton onClick={handleBack} />
      <h1 className="text-2xl font-bold mb-8 text-center">Thêm sản phẩm</h1>
      <form
        onSubmit={handleSubmit}
        className="mt-6 bg-white p-10 space-y-8 mx-auto"
        encType="multipart/form-data"
      >
        <div>
          <label className="block font-semibold mb-2 text-lg">Tên sản phẩm <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="name"
            placeholder="Nhập tên sản phẩm"
            value={form.name}
            onChange={handleChange}
            className="w-full p-3 border rounded focus:outline-green-400 text-lg"
            required
          />
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <label className="block font-semibold mb-2 text-lg">Danh mục <span className="text-red-500">*</span></label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="w-full p-3 border rounded text-lg"
              required
            >
              <option value="">Chọn danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block font-semibold mb-2 text-lg">Thương hiệu <span className="text-red-500">*</span></label>
            <select
              name="brandId"
              value={form.brandId}
              onChange={handleChange}
              className="w-full p-3 border rounded text-lg"
              required
            >
              <option value="">Chọn thương hiệu</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <label className="block font-semibold mb-2 text-lg">Giá <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="price"
              placeholder="Nhập giá"
              value={form.price}
              onChange={handleChange}
              className="w-full p-3 border rounded text-lg"
              min={0}
              required
            />
            {form.price && (
              <div className="text-sm text-gray-500 mt-1">
                {formatCurrency(form.price)}
              </div>
            )}
          </div>
          <div className="flex-1">
            <label className="block font-semibold mb-2 text-lg">Số lượng <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="stock"
              placeholder="Nhập số lượng"
              value={form.stock}
              onChange={handleChange}
              className="w-full p-3 border rounded text-lg"
              min={0}
              required
            />
          </div>
        </div>
        <label className="block font-semibold mb-2 text-lg">Ảnh sản phẩm</label>
        <ImageUploader
          onImageChange={handleImageChange}
          imagePreviews={imagePreviews}
          onRemoveImage={handleRemoveImage}
        />
        <div className="mb-6 relative">
          <label className="block font-semibold mb-2 text-lg">Mô tả <span className="text-red-500">*</span></label>
          <div className="mb-4 relative" style={{ minHeight: '200px' }}>
            <ReactQuill
              theme="snow"
              value={form.description}
              onChange={handleDescriptionChange}
              modules={quillModules}
              formats={quillFormats}
              ref={quillRef}
              placeholder="Mô tả chi tiết về sản phẩm, nguồn gốc, hướng dẫn sử dụng..."
              style={{ height: 600, marginBottom: '64px' }}
            />
          </div>
        </div>
        {error && <div className="text-red-500 font-semibold text-lg">{error}</div>}
        {success && <div className="text-green-600 font-semibold text-lg">{success}</div>}
        <button
          type="submit"
          className="bg-green-500 text-white px-8 py-3 rounded hover:bg-green-600 font-semibold w-full text-lg shadow"
          disabled={loading}
        >
          {loading ? "Đang thêm..." : "Thêm sản phẩm"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
