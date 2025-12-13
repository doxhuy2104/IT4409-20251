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

        // Thêm interceptor để tự động gắn token xác thực
        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Xử lý các phản hồi lỗi và refresh token
        this.client.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                // Kiểm tra status code 401 hoặc status code 500 với message 'jwt expired'
                if (error.response?.status === 401 ||
                    (error.response?.status === 500 && error.response?.data?.message === 'jwt expired')) {

                    // Tránh vòng lặp vô hạn nếu token refresh cũng lỗi
                    if (originalRequest._retry) {
                        localStorage.removeItem('accessToken');
                        return Promise.reject(error);
                    }

                    originalRequest._retry = true;

                    try {
                        // lấy token mới
                        const refreshResponse = await this.client.post(
                            '/auth/refresh',
                            {},
                        );

                        const accessToken = refreshResponse.data.accessToken;
                        localStorage.setItem('accessToken', accessToken);

                        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                        return this.client(originalRequest);
                    } catch (refreshError) {
                        localStorage.removeItem('accessToken');
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );
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