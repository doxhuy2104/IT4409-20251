import apiClient from './api.client';
import { ApiResponse } from './product.service';

// Interface cho Review
export interface Review {
    id: number;
    productId: number;
    customerId: number;
    rating: number;
    comment: string;
    isApproved: boolean;
    createdAt: string;
    updatedAt: string;
    product?: {
        id: number;
        name: string;
        slug: string;
        categoryId: number;
        brandId: number;
        description: string;
        price: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    };
    customer?: {
        id: number;
        fullName: string;
        email: string;
        avatar?: string;
    };
}

// Interface cho tham số tạo review mới
export interface CreateReviewParams {
    productId: number;
    rating: number;
    comment: string;
}

export interface UpdateReviewParams {
    rating?: number;
    comment?: string;
}


const reviewService = {
    /**
     * Lấy reviews theo ID sản phẩm
     * @param productId ID của sản phẩm
     * @param params Tham số truy vấn phụ (phân trang, lọc)
     * @returns Danh sách reviews của sản phẩm
     */
    async getReviewsByProductId(productId: number): Promise<ApiResponse<Review[]>> {
        return apiClient.get<ApiResponse<Review[]>>(`/reviews/${productId}`);
    },

    /**
     * Tạo một review mới
     * @param reviewData Dữ liệu của review mới
     * @returns Thông tin review đã tạo
     */
    async createReview(reviewData: CreateReviewParams): Promise<ApiResponse<Review>> {
        return apiClient.post<ApiResponse<Review>>('/reviews', reviewData);
    },

    /**
     * Cập nhật một review
     * @param id ID của review
     * @param reviewData Dữ liệu cập nhật
     * @returns Thông tin review đã cập nhật
     */
    async updateReview(id: number, reviewData: UpdateReviewParams): Promise<ApiResponse<Review>> {
        return apiClient.put<ApiResponse<Review>>(`/reviews/${id}`, reviewData);
    },

    /**
     * Xóa một review
     * @param id ID của review cần xóa
     * @returns Kết quả xóa
     */
    async deleteReview(id: number): Promise<ApiResponse<any>> {
        return apiClient.delete<ApiResponse<any>>(`/reviews/customer/${id}`);
    }
};

export default reviewService;