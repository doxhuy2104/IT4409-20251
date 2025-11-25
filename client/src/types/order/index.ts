export interface Order {
    id: number;
    customerId: number;
    warehouseId: number | null;
    totalAmount: string;
    status: OrderStatus;
    createdAt: string;
    updatedAt: string;
    orderItems: OrderItem[];
    payments: Payment[];
    shipping: Shipping | null;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
    id: number;
    orderId: number;
    variantId: number;
    quantity: number;
    priceAtTime: string;
    createdAt: string;
    updatedAt: string;
    productVariant?: ProductVariant;
}

interface ProductVariant {
    id: number;
    name: string;
    productId: number;
    slug: string;
    sku: string;
    price: string;
    discountPrice: string | null;
    stock: number;
    createdAt: string;
    updatedAt: string;
}

export interface Payment {
    id: number;
    orderId: number;
    amount: string;
    paymentMethod: string;
    status: string;
    transactionId: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Shipping {
    id: number;
    orderId: number;
    name: string;
    email: string;
    phone: string;
    shippingAddress: string;
    shippingProvider: string;
    trackingNumber: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface OrderSummary {
    totalOrders: number;
    totalSpent: number;
}