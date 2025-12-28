import apiClient from './api.client';
import { Product } from '../types/product';

// Interface cho tham số truy vấn sản phẩm
export interface ProductQueryParams {
    id?: number;
    slug?: string;
    name?: string;
    brandId?: number;
    categoryId?: number;
    min?: number;
    max?: number;
    page?: number;
    limit?: number;
}

// Interface cho kết quả trả về từ API
export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
    meta?: {
        limit: number;
        page: number;
        total: number;
    };
}

const productService = {
    /**
     * Lấy danh sách sản phẩm với các tham số lọc, phân trang
     */
    async getProducts(params: ProductQueryParams = {}): Promise<ApiResponse<Product[]>> {
        console.log('params', params);
        return apiClient.get<ApiResponse<Product[]>>('/products', { params });
    },

    /**
   * Lấy chi tiết sản phẩm theo ID
   */
    async getProductById(id: number): Promise<ApiResponse<Product[]>> {
        return apiClient.get<ApiResponse<Product[]>>('/products', {
            params: { id }
        });
    },

    /**
     * Lấy chi tiết sản phẩm theo slug
     */
    async getProductBySlug(slug: string): Promise<ApiResponse<Product[]>> {
        return apiClient.get<ApiResponse<Product[]>>('/products', {
            params: { slug }
        });
    },
}

export default productService;