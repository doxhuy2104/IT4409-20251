export interface Brand {
    id: number;
    name: string;
    logoUrl: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    categoryId: number | null;
}

export interface BrandResponse {
    data: Brand[];
}