import apiClient from './api.client';
import type { UserProfile } from '../types/user';

/**
 * Interface cho tham số cập nhật hồ sơ người dùng
 */
export interface UpdateUserProfileParams {
    fullName?: string;
    phone?: string;
    address?: string;
}

const profileService = {

    async getUserProfile(): Promise<UserProfile> {
        const response = await apiClient.get<{ data: UserProfile }>('/customer/me');
        return response.data;
    },


    async updateUserProfile(data: UpdateUserProfileParams): Promise<UserProfile> {
        const response = await apiClient.put<{ data: UserProfile }>('/customer/me', data);
        return response.data;
    },
};

export default profileService;