import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';

const API_BASE_URL = 'https://cnweb-kf4r.onrender.com/api';

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true, // Cho phép gửi cookie trong các yêu cầu
        });
    }    // Phương thức GET
    async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.get(endpoint, config);
        return response.data;
    }

    // Phương thức POST
    async post<T>(endpoint: string, data: any, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.post(endpoint, data, config);
        return response.data;
    }

    // Phương thức PUT
    async put<T>(endpoint: string, data: any, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.put(endpoint, data, config);
        return response.data;
    }

    // Phương thức DELETE
    async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.delete(endpoint, config);
        return response.data;
    }
}

// Export một instance mặc định để dùng trong ứng dụng
export const apiClient = new ApiClient();
export default apiClient;