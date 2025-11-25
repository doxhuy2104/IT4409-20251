import { ProductVariant } from "../product";

export interface CartItem {
    id: string;
    productId: string;
    name: string;
    image: string;
    price: number;
    originalPrice: number;
    quantity: number;
    stock: number;
    specifications: string;
}

export interface CartItemV2 {
    id: number;
    cartId: number;
    variantId: number;
    quantity: number;
    createdAt: string;
    updatedAt: string;
    productVariant?: ProductVariant;
}

export interface Cart {
    id: number;
    customerId: number;
    sessionId: string | null;
    createdAt: string;
    updatedAt: string;
    cartItems: CartItemV2[];
}

export interface CartResponse {
    cart: Cart;
}

export interface RecommendedProduct {
    id: string;
    name: string;
    image: string;
    price: number;
    originalPrice: number;
    discount: number;
}