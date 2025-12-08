import axios, { AxiosInstance } from 'axios';
import env from '../../../env';

export interface CassoTransaction {
    id: number;
    tid: string;
    description: string;
    amount: number;
    cusum_balance: number;
    when: string;
    bankSubAccId: string;
    paymentChannel: string;
    virtualAccount: string;
    virtualAccountName: string;
    corresponsiveName: string;
    corresponsiveAccount: string;
    corresponsiveBankId: string;
    corresponsiveBankName: string;
    accountId: number;
    bankCodeName: string;
}

export interface CassoTransactionResponse {
    error: number;
    message: string;
    data: {
        page: number;
        pageSize: number;
        nextPage: number | null;
        prevPage: number | null;
        totalPages: number;
        totalRecords: number;
        records: CassoTransaction[];
    };
}

export class CassoService {
    private static client: AxiosInstance;
    private static apiKey: string;
    private static accessToken: string;
    private static baseURL: string;

    static initialize() {
        this.baseURL = env.payment.CASSO_API_URL || 'https://oauth.casso.vn/v2';
        this.apiKey = env.payment.CASSO_API_KEY || '';
        // this.accessToken = env.payment.CASSO_ACCESS_TOKEN || '';

        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    /**
     * Lấy danh sách giao dịch ngân hàng
     * @param params - Tham số query: page, pageSize, fromDate, toDate, sort
     * @returns Danh sách giao dịch
     */
    static async getTransactions(params?: {
        page?: number;
        pageSize?: number;
        fromDate?: string; // YYYY-MM-DD
        toDate?: string; // YYYY-MM-DD
        sort?: 'ASC' | 'DESC';
    }): Promise<CassoTransactionResponse> {
        if (!this.client) {
            this.initialize();
        }

        const queryParams: any = {};

        if (params?.page) {
            queryParams.page = params.page.toString();
        }
        if (params?.pageSize) {
            queryParams.pageSize = params.pageSize.toString();
        }
        if (params?.fromDate) {
            queryParams.fromDate = params.fromDate;
        }
        if (params?.toDate) {
            queryParams.toDate = params.toDate;
        }
        if (params?.sort) {
            queryParams.sort = params.sort;
        }

        // Sử dụng API Key hoặc Access Token
        const authHeader = this.accessToken
            ? `Bearer ${this.accessToken}`
            : `Apikey ${this.apiKey}`;

        try {
            const response = await this.client.get<CassoTransactionResponse>(
                '/transactions',
                {
                    params: queryParams,
                    headers: {
                        Authorization: authHeader,
                    },
                },
            );

            return response.data;
        } catch (error: any) {
            console.error('Casso API Error:', error.response?.data || error.message);
            throw new Error(
                `Failed to fetch transactions from Casso: ${error.response?.data?.message || error.message}`,
            );
        }
    }

    /**
     * Tìm giao dịch theo nội dung chuyển khoản (description)
     * @param description - Nội dung cần tìm (ví dụ: "DH123")
     * @param amount - Số tiền cần match (optional)
     * @param fromDate - Ngày bắt đầu tìm (YYYY-MM-DD)
     * @returns Giao dịch khớp hoặc null
     */
    static async findTransactionByDescription(
        description: string,
        amount?: number,
        fromDate?: string,
    ): Promise<CassoTransaction | null> {
        try {
            // Tính ngày bắt đầu (mặc định 7 ngày gần nhất)
            const defaultFromDate = new Date();
            defaultFromDate.setDate(defaultFromDate.getDate() - 7);
            const searchFromDate =
                fromDate || defaultFromDate.toISOString().split('T')[0];

            // Lấy tất cả transactions (có thể cần pagination nếu nhiều)
            let page = 1;
            const pageSize = 100;
            let hasMore = true;
            let foundTransaction: CassoTransaction | null = null;

            while (hasMore && !foundTransaction) {
                const response = await this.getTransactions({
                    page,
                    pageSize,
                    fromDate: searchFromDate,
                    sort: 'DESC', // Mới nhất trước
                });

                if (response.error !== 0 || !response.data?.records) {
                    break;
                }

                // Tìm transaction khớp với description
                foundTransaction =
                    response.data.records.find((transaction) => {
                        // Kiểm tra description có chứa chuỗi cần tìm
                        const descriptionMatch =
                            transaction.description
                                ?.toLowerCase()
                                .includes(description.toLowerCase()) || false;

                        // Nếu có amount, kiểm tra amount khớp (cho phép sai số nhỏ)
                        if (amount !== undefined) {
                            const amountMatch =
                                Math.abs(transaction.amount - amount) < 1000; // Cho phép sai số 1000đ
                            return descriptionMatch && amountMatch;
                        }

                        return descriptionMatch;
                    }) || null;

                // Kiểm tra còn trang tiếp theo không
                hasMore = response.data.nextPage !== null && page < response.data.totalPages;
                page++;
            }

            return foundTransaction;
        } catch (error: any) {
            console.error('Error finding transaction:', error);
            throw error;
        }
    }
}

// Initialize service khi import
CassoService.initialize();

