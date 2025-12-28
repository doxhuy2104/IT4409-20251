import { Category } from '../types/category';
import apiClient from './api.client';

interface CategoryResponse {
    data: Category[];
}

/**
 * Service for handling category-related API requests
 */
const categoryService = {
    /**
     * Fetches all categories with subcategories from the API
     */
    async getAllCategories(): Promise<Category[]> {
        try {
            const response = await apiClient.get<CategoryResponse>('/public/categories');
            return response.data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }
};

export default categoryService;

