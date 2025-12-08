import { Brand, BrandResponse } from '../types/brand';
import apiClient from './api.client';

/**
 * Service for handling brand-related API requests
 */
const brandService = {
    /**
     * Fetches brands by category ID from the API
     * @param categoryId - The ID of the category
     * @returns Promise containing an array of Brand objects
     */
    async getBrandsByCategoryId(categoryId: number): Promise<Brand[]> {
        try {
            const response = await apiClient.get<BrandResponse>(`/public/brands/${categoryId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching brands:', error);
            return [];
        }
    },

    /**
     * Fetches all brands from the API
     * @returns Promise containing an array of Brand objects
     */
    async getAllBrands(): Promise<Brand[]> {
        try {
            const response = await apiClient.get<BrandResponse>('/public/brands');
            return response.data;
        } catch (error) {
            console.error('Error fetching all brands:', error);
            return [];
        }
    }
};

export default brandService;