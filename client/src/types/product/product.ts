export interface Product {
    id: number;
    name: string;
    brand: string;
    category: 'laptop' | 'smartphone' | 'smartwatch' | 'audio' | 'tablet' | 'other';
    specs: {
        processor: string;
        ram: string;
        storage: string;
        other?: string[];
    };
    price: number;
    originalPrice: number;
    discountPercentage: number;
    rating: number;
    reviews: number;
    giftValue?: number;
    image: string;
    isPromotion?: boolean;
    isNew?: boolean;
    hasComparison?: boolean;
}

export interface ProductImage {
    id: number;
    variantId: number | null;
    productId: number;
    publicId: string;
    imageUrl: string;
    isPrimary: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AttributeValue {
    id: number;
    attributeTypeId: number;
    value: string;
    createdAt: string;
    updatedAt: string;
}

export interface VariantAttribute {
    id: number;
    productId: number;
    variantId: number;
    attributeValueId: number;
    attributeTypeId: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    attributeValue: AttributeValue;
}

export interface ProductVariant {
    id: number;
    productId: number;
    name: string;
    slug: string;
    sku: string;
    price: string;
    discountPrice: string | null;
    stock: number;
    createdAt: string;
    updatedAt: string;
    productImages?: ProductImage[];
    variantAttributes?: VariantAttribute[];
    product?: ProductV2;
}

export interface Promotion {
    id: number;
    name: string;
    discountPercent: string;
    discountAmount: string;
    minimumPurchaseAmount: string;
    maximumDiscountAmount: string;
    discountCode: string;
    usageLimit: number;
    usageCount: number;
    usageLimitPerCustomer: number;
    isActive: boolean;
    isDeleted: boolean;
    isExpired: boolean;
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProductPromotion {
    productId: number;
    promotionId: number;
    createdAt: string;
    updatedAt: string;
    promotion: Promotion;
}

export interface ProductV2 {
    id: number;
    name: string;
    slug: string;
    categoryId: number;
    brandId: number;
    description: string;
    basePrice: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    productVariants: ProductVariant[];
    productImages: ProductImage[];
    productPromotions?: ProductPromotion[];
}

export interface SubAttribute {
    id: number;
    categoryId: number | null;
    parentId: number;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface AttributeType {
    id: number;
    categoryId: number;
    parentId: number | null;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
    subAttributes: SubAttribute[];
}