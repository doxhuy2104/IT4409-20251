const BASE_URL = 'https://tinhthanhpho.com/api/v1';
const PAGE_SIZE = 200;

export interface Province {
    code: string;
    name: string;
    type?: string;
}

export interface Ward {
    code: string;
    name: string;
    type?: string;
    province_code?: string;
    district_code?: string;
    district_name?: string;
    full_name?: string;
    district?: {
        code?: string;
        name?: string;
        type?: string;
    };
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    metadata?: {
        total?: number;
        page?: number;
        limit?: number;
    };
}

const fetchAllPages = async <T>(buildUrl: (page: number, limit: number) => string) => {
    const results: T[] = [];
    let page = 1;
    let total = Infinity;

    while (results.length < total) {
        const response = await fetch(buildUrl(page, PAGE_SIZE));
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const result: ApiResponse<T[]> = await response.json();
        const data = Array.isArray(result?.data) ? result.data : [];
        results.push(...data);

        const metadata = result?.metadata;
        if (metadata?.total) {
            total = metadata.total;
        }

        if (!data.length || data.length < (metadata?.limit ?? PAGE_SIZE)) {
            break;
        }

        page += 1;
    }

    return results;
};

const locationService = {
    async getNewProvinces(): Promise<Province[]> {
        return fetchAllPages<Province>((page, limit) => {
            const searchParams = new URLSearchParams({
                page: String(page),
                limit: String(limit),
            });
            return `${BASE_URL}/new-provinces?${searchParams.toString()}`;
        });
    },

    async getWardsByProvince(provinceCode: string): Promise<Ward[]> {
        if (!provinceCode) {
            return [];
        }

        return fetchAllPages<Ward>((page, limit) => {
            const searchParams = new URLSearchParams({
                page: String(page),
                limit: String(limit),
            });
            return `${BASE_URL}/new-provinces/${provinceCode}/wards?${searchParams.toString()}`;
        });
    },
};

export default locationService;

