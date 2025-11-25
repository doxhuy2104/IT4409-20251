import apiClient from './api.client';
import { Cart, CartItemV2, CartResponse } from '../types/cart';

export interface AddToCartParams {
    variantId: number;
    quantity: number;
}

export interface UpdateCartItemParams {
    quantity: number;
}

const cartService = {
    /**
     * Lấy thông tin giỏ hàng hiện tại của người dùng
     * @returns Thông tin giỏ hàng
     */
    async getCart(): Promise<CartResponse> {
        return (await apiClient.get<{ data: CartResponse }>('/carts')).data;
    },

    /**
     * Thêm sản phẩm vào giỏ hàng
     * @param params Thông tin sản phẩm cần thêm (variantId và quantity)
     * @returns Thông tin giỏ hàng sau khi cập nhật
     */
    async addToCart(params: AddToCartParams): Promise<CartItemV2> {
        return (await apiClient.post<{ data: CartItemV2 }>('/carts', params)).data;
    },

    /**
     * Cập nhật số lượng của một sản phẩm trong giỏ hàng
     * @param cartItemId ID của item trong giỏ hàng
     * @param params Thông tin cần cập nhật (số lượng mới)
     * @returns Thông tin giỏ hàng sau khi cập nhật
     */
    async updateCartItem(cartItemId: number, params: UpdateCartItemParams): Promise<CartResponse> {
        return apiClient.put<CartResponse>(`/carts/${cartItemId}`, params);
    },

    /**
     * Xóa một sản phẩm khỏi giỏ hàng
     * @param cartItemId ID của item trong giỏ hàng
     * @returns Thông tin giỏ hàng sau khi cập nhật
     */
    async removeCartItem(cartItemId: number): Promise<{ message: string }> {
        return apiClient.delete<{ message: string }>(`/carts/${cartItemId}`);
    },

    /**
     * Xóa toàn bộ giỏ hàng
     * @returns Kết quả của thao tác
     */
    async clearCart(): Promise<{ message: string }> {
        return apiClient.delete<{ message: string }>('/carts/clear');
    },

    /**
     * Tính toán tổng giá trị giỏ hàng
     * @param cart Giỏ hàng
     * @returns Tổng giá trị
     */
    calculateTotal(cart: Cart): { subtotal: number; discount: number; total: number } {
        let subtotal = 0;
        let discount = 0;

        cart.cartItems.forEach(item => {
            if (item.productVariant) {
                const price = parseFloat(item.productVariant.price);
                const discountPrice = item.productVariant.discountPrice
                    ? parseFloat(item.productVariant.discountPrice)
                    : 0;

                subtotal += price * item.quantity;
                discount += discountPrice * item.quantity;
            }
        });

        return {
            subtotal,
            discount,
            total: subtotal - discount
        };
    }
};

export default cartService;