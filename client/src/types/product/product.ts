export interface ProductImage {
    id: number;
    productId: number;
    publicId: string;
    imageUrl: string;
    isPrimary: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    categoryId: number;
    brandId: number;
    description: string;
    price: string;
    sku: string;
    stock: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    productImages: ProductImage[];
    reviews: number;
    isNew?: boolean;
    rating: number;
    brand: string;
    category: string;
}


