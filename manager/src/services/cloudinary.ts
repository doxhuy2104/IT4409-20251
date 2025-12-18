const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadImageToCloudinary = async (file: File): Promise<string> => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error("Thiếu cấu hình Cloudinary. Vui lòng bổ sung biến môi trường.");
    }

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
    });



    const data = await response.json();
    if (!response.ok || !data.secure_url) {
        console.error("Cloudinary error:", data);
        throw new Error(data.error?.message || "Upload ảnh lên Cloudinary thất bại.");
    }
    return data.secure_url as string;
};

