// filepath: d:\User2\project\cnw\CNWEB_BTL\client\src\services\order.service.ts
import apiClient from './api.client';
import { Order, OrderStatus } from '../types/order';

// Response types based on the API response
export interface CreateOrderResponse {
    message: string;
    data: {
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
    };
}

export interface OrderItem {
    id: number;
    orderId: number;
    variantId: number;
    quantity: number;
    priceAtTime: string;
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

export interface CreateOrderParams {
    itemIds: number[]; // IDs of cart items to create the order from
}

export interface OrderFilterParams {
    id?: number;
    status?: OrderStatus;
    startDate?: string;
    endDate?: string;
    minTotalAmount?: number;
    maxTotalAmount?: number;
}

export interface ConfirmOrderParams {
    name: string;
    email: string;
    phone: string;
    shippingAddress: string;
    paymentMethod: string;
}

/**
 * Service for handling order-related API requests
 */
const orderService = {
    /**
     * Creates a new order from selected cart items
     * @param params - Object containing the cart item IDs to include in the order
     * @returns A promise that resolves to the created order
     */
    async createOrder(params: CreateOrderParams): Promise<CreateOrderResponse> {
        try {
            // API trả về { statusCode, message, data: CreateOrderResponse }
            const response = await apiClient.post<{ statusCode: number; message: string; data: CreateOrderResponse['data'] }>('/orders', params);
            // Trả về format đúng với interface
            return {
                message: response.message || 'Order created successfully',
                data: response.data
            };
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    },

    /**
     * Gets a list of all orders for the current user
     * @param filters - Optional filter parameters (status, date range, amount range, etc.)
     * @returns A promise that resolves to an array of orders
     */
    async getOrders(filters?: OrderFilterParams): Promise<Order[]> {
        try {
            const response = await apiClient.get<{ message: string, data: Order[] }>('/orders/customer', { params: filters });
            return response.data;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    },

    /**
     * Cancels an order
     * @param orderId - The ID of the order to cancel
     * @returns A promise that resolves to the canceled order
     */
    async cancelOrder(orderId: number): Promise<Order> {
        try {
            return (await apiClient.put<{ data: Order }>(`/orders/cancel/${orderId}`, {})).data;
        } catch (error) {
            console.error(`Error canceling order ${orderId}:`, error);
            throw error;
        }
    },

    /**
     * Confirms an order with shipping and payment details
     * @param orderId - The ID of the order to confirm
     * @param params - Shipping and payment details for the order
     * @returns A promise that resolves to the confirmed order
     */
    async confirmOrder(orderId: number, params: ConfirmOrderParams): Promise<Order> {
        try {
            // API trả về { statusCode, message, data: Order }
            const response = await apiClient.post<{ statusCode: number; message: string; data: Order }>(`/orders/confirm/${orderId}`, params);
            return response.data;
        } catch (error) {
            console.error(`Error confirming order ${orderId}:`, error);
            throw error;
        }
    },

    /**
     * Calculates the total value of an order (useful for client-side calculations)
     * @param order - The order to calculate the total for
     * @returns The total value of the order
     */
    calculateOrderTotal(order: CreateOrderResponse['data']): number {
        return parseFloat(order.totalAmount);
    }
};

export default orderService;