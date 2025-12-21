import { useEffect, useState, ChangeEvent, FormEvent, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import ImageUploader from "../components/ImageUploader";
import BackButton from "../components/BackButton";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { uploadImageToCloudinary } from "../services/cloudinary";
import "../utils/quillSetup";

interface ProductImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  brandId: number;
  description: string;
  price: string;
  stock: number;
  productImages?: ProductImage[];
}

interface Category {
  id: number;
  name: string;
  subCategories?: Category[];
}

interface Brand {
  id: number;
  name: string;
}

const ProductEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [form, setForm] = useState<any>({});
  const [images, setImages] = useState<File[]>([]);
  const [oldImages, setOldImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const quillRef = useRef<ReactQuill | null>(null);

  // Hàm đệ quy lấy leaf categories
  const getLeafCategories = (categories: Category[]): Category[] => {
    let leafCategories: Category[] = [];
    categories.forEach(category => {
      const subCategories = category.subCategories ?? [];
      if (subCategories.length === 0) {
        leafCategories.push(category);
      } else {
        leafCategories = [...leafCategories, ...getLeafCategories(subCategories)];
      }
    });
    return leafCategories;
  };

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products?id=${id}`);
        const prod = res.data.data[0];
        setProduct(prod);
        setForm({
          name: prod.name,
          categoryId: prod.categoryId,
          brandId: prod.brandId,
          description: prod.description,
          price: prod.price || '',
          stock: prod.stock || 0,
        });
        setOldImages(prod.productImages || []);
        const [catRes, brandRes] = await Promise.all([
          api.get("/public/categories"),
          api.get("/public/brands"),
        ]);
        // Lọc chỉ lấy leaf categories
        const allCategories = catRes.data.data || [];
        const leafCategories = getLeafCategories(allCategories);
        setCategories(leafCategories);
        setBrands(brandRes.data.data || []);
      } catch (err) {
        setError("Không tìm thấy sản phẩm hoặc có lỗi xảy ra.");
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (images.length > 0) {
      const urls = images.map(file => URL.createObjectURL(file));
      setImagePreviews(urls);
      return () => urls.forEach(url => URL.revokeObjectURL(url));
    } else {
      setImagePreviews([]);
    }
  }, [images]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDescriptionChange = (value: string) => {
    setForm((prev: any) => ({ ...prev, description: value }));
  };

  const handleImageChange = (newFiles: File[]) => {
    setImages(prev => [...prev, ...newFiles]);
  };

  const handleRemoveOldImage = (imgId: number) => {
    setOldImages(oldImages.filter(img => img.id !== imgId));
    setDeletedImageIds(prev => [...prev, imgId]);
  };

  const handleRemoveNewImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const plainDescription = form.description?.replace(/<(.|\n)*?>/g, "").trim() || "";
    if (!form.name || !form.categoryId || !form.brandId || !plainDescription || !form.price || !form.stock) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      setLoading(false);
      return;
    }

    try {
      // Xóa ảnh cũ đã chọn xóa
      if (deletedImageIds.length > 0) {
        await Promise.all(deletedImageIds.map(id => api.delete(`/images/${id}`)));
      }

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("categoryId", String(form.categoryId));
      formData.append("brandId", String(form.brandId));
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("stock", String(form.stock));

      // Chỉ thêm ảnh mới khi có ảnh được chọn
      if (images.length > 0) {
        images.forEach((file, idx) => {
          formData.append(`image[${idx}]`, file);
        });
      }

      await api.put(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/products");
    } catch (err: any) {
      setError(err.response?.data?.message || "Cập nhật thất bại");
    }
    setLoading(false);
  };

  if (loading && !product) return <div className="p-4">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!product) return null;

  return (
    <div className="pt-8 w-full min-h-screen bg-white">
      <BackButton className="ml-8" onClick={() => navigate(-1)} />
      <h1 className="text-3xl font-bold mb-8 text-green-700 text-center">Chỉnh sửa sản phẩm</h1>
      <form className="w-full mx-auto bg-white shadow-lg rounded-xl p-8 space-y-6" onSubmit={handleSubmit} encType="multipart/form-data">
        <div>
          <label className="block font-semibold mb-1">Tên sản phẩm</label>
          <input name="name" value={form.name || ""} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Danh mục</label>
          <select name="categoryId" value={form.categoryId || ""} onChange={handleChange} className="w-full border rounded px-3 py-2" required>
            <option value="">Chọn danh mục</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Thương hiệu</label>
          <select name="brandId" value={form.brandId || ""} onChange={handleChange} className="w-full border rounded px-3 py-2" required>
            <option value="">Chọn thương hiệu</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Giá</label>
            <input type="number" name="price" value={form.price || ""} onChange={handleChange} className="w-full border rounded px-3 py-2" min={0} required />
          </div>
          <div>
            <label className="block font-semibold mb-1">Số lượng</label>
            <input type="number" name="stock" value={form.stock || ""} onChange={handleChange} className="w-full border rounded px-3 py-2" min={0} required />
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-1">Ảnh sản phẩm mới (có thể chọn nhiều)</label>
          <ImageUploader
            onImageChange={handleImageChange}
            imagePreviews={imagePreviews}
            onRemoveImage={handleRemoveNewImage}
          />
        </div>
        {oldImages.length > 0 && (
          <div>
            <label className="block font-semibold mb-1">Ảnh hiện tại</label>
            <div className="flex flex-wrap gap-4">
              {oldImages.map(img => (
                <div key={img.id} className="relative">
                  <img src={`${img.imageUrl}`} alt="old" className="w-24 h-24 object-cover rounded border" />
                  <button type="button" onClick={() => handleRemoveOldImage(img.id)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">×</button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mb-6 relative">
          <label className="block font-semibold mb-1">Mô tả</label>
          <div className="mb-4 relative" style={{ minHeight: '200px' }}>
            <ReactQuill
              theme="snow"
              value={form.description || ""}
              onChange={handleDescriptionChange}
              modules={quillModules}
              formats={quillFormats}
              ref={quillRef}
              placeholder="Mô tả chi tiết về sản phẩm, nguồn gốc, hướng dẫn sử dụng..."
              style={{ height: 600, marginBottom: '64px' }}
            />
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <button type="button" className="px-4 py-2 rounded bg-gray-300 cursor-pointer hover:bg-gray-400 transition-colors duration-300 ease-in-out" onClick={() => navigate(-1)}>Hủy</button>
          <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white cursor-pointer hover:bg-green-700 transition-colors duration-300 ease-in-out" disabled={loading}>{loading ? "Đang lưu..." : "Lưu thay đổi"}</button>
        </div>
      </form>
    </div>
  );
};

export default ProductEdit; 