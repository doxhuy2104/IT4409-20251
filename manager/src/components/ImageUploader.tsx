import { ChangeEvent } from "react";
import { FaUpload } from "react-icons/fa";

interface ImageUploaderProps {
  onImageChange: (files: File[]) => void;
  imagePreviews: string[];
  onRemoveImage: (index: number) => void;
}

const ImageUploader = ({ onImageChange, imagePreviews, onRemoveImage }: ImageUploaderProps) => {
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImageChange(Array.from(e.target.files));
    }
  };

  return (
    <div>
      <label className="flex items-center gap-2 cursor-pointer">
        <FaUpload className="text-green-500" />
        <span className="text-green-600 underline">Chọn ảnh</span>
        <input
          type="file"
          name="image"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </label>
      {imagePreviews.length > 0 && (
        <div className="flex gap-4 mt-4 flex-wrap">
          {imagePreviews.map((url, idx) => (
            <div key={idx} className="relative group">
              <img
                src={url}
                alt={`preview-${idx}`}
                className="w-40 h-40 object-cover rounded border shadow"
              />
              <button
                type="button"
                onClick={() => onRemoveImage(idx)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-lg opacity-80 group-hover:opacity-100 hover:bg-red-700 shadow"
                title="Xóa ảnh"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader; 