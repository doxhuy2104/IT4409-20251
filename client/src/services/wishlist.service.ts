import apiClient from './api.client';

// Interface cho item trong danh sách yêu thích
export interface WishlistItem {
    id: number;
    customerId: number;
    productId: number;
    createdAt: string;
    updatedAt: string;
    product?: Product;
}

interface Product {
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
}

const wishlistService = {
    /**
     * Lấy danh sách sản phẩm yêu thích của người dùng
     * @returns Danh sách sản phẩm trong wishlist
     */
    async getWishlist(): Promise<WishlistItem[]> {
        const response = await apiClient.get<{ data: WishlistItem[] }>('/products/wishlist');
        return response.data;
    },

    /**
     * Thêm sản phẩm vào danh sách yêu thích
     * @param productId ID của sản phẩm cần thêm vào wishlist
     * @returns Thông tin item đã thêm vào wishlist
     */
    async addToWishlist(productId: number): Promise<WishlistItem> {
        const response = await apiClient.post<{ data: WishlistItem }>(`/products/wishlist/${productId}`, {});
        return response.data;
    },

    /**
     * Xóa sản phẩm khỏi danh sách yêu thích
     * @param productId ID của sản phẩm cần xóa khỏi wishlist
     * @returns Kết quả xóa
     */    async removeFromWishlist(wishlistId: number): Promise<any> {
        return apiClient.delete<any>(`/products/wishlist/${wishlistId}`);
    },

    /**
     * Kiểm tra xem sản phẩm có trong danh sách yêu thích không
     * @param productId ID của sản phẩm cần kiểm tra
     * @returns Object chứa trạng thái và id của item trong wishlist (nếu có)
     */
    async checkInWishlist(productId: number): Promise<{ inWishlist: boolean, wishlistId?: number }> {
        try {
            const wishlistItems = await this.getWishlist();
            const wishlistItem = wishlistItems.find(item => item.productId === productId);
            return {
                inWishlist: !!wishlistItem,
                wishlistId: wishlistItem?.id
            };
        } catch (error) {
            console.error('Error checking product in wishlist:', error);
            return { inWishlist: false };
        }
    }
};

export default wishlistService;