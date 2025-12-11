import apiClient from './api.client';

/**
 * Interface cho tham số tạo phản hồi
 */
export interface CreateFeedbackParams {
    name: string;
    description: string;
}

/**
 * Interface cho dữ liệu phản hồi
 */
export interface Feedback {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

const feedbackService = {
    /**
     * Tạo phản hồi mới
     * @param data Dữ liệu phản hồi
     * @returns Thông tin phản hồi đã được tạo
     */
    async createFeedback(data: CreateFeedbackParams): Promise<Feedback> {
        const response = await apiClient.post<{ data: Feedback }>('/feedbacks', data);
        return response.data;
    }
};

export default feedbackService;