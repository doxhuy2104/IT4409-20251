import { Product } from "../product";

export interface CartItem {
    id: number;
    cartId: number;
    productId: number;
    quantity: number;
    createdAt: string;
    updatedAt: string;
    product: Product;
}

export interface Cart {
    id: number;
    customerId: number;
    sessionId: string | null;
    createdAt: string;
    updatedAt: string;
    cartItems: CartItem[];
}

export interface RecommendedProduct {
    id: string;
    name: string;
    image: string;
    price: number;
    originalPrice: number;
    discount: number;
}

export interface CartResponse {
    cart: Cart;
}
