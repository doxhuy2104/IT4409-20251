import React from "react";
import { Link } from "react-router-dom";
import { Product } from "../types/product";
// import { useAuth } from "../hooks/useAuth";

// Helper function to extract product information from ProductV2
const extractProductInfo = (product: Product) => {


    const mainImage = product.productImages && product.productImages.length > 0
        ? product.productImages.find(img => img.isPrimary)?.imageUrl || product.productImages[0].imageUrl
        : '';


    // Calculate discount percentage if discountPrice exists
    const price = parseFloat(product.price);




    // Check if product is new (less than 30 days old)
    const isNew = new Date(product.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Extract brand name from product if available
    const brandId = product.brandId;

    return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        brand: brandId.toString(),
        image: mainImage,
        price: price,
        isNew,
        hasComparison: true
    };
};

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const productInfo = extractProductInfo(product)
        ;
    return (
        <Link to={`/product/${productInfo.slug || productInfo.id}`} className="block">
            <div className="bg-white rounded-lg shadow hover:shadow-md transition-all overflow-hidden">
                <div className="relative">

                    {productInfo.isNew && (
                        <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-md z-10">
                            Mới
                        </div>
                    )}

                    <div className="flex items-center justify-center h-48 p-2 overflow-hidden">
                        <img
                            src={productInfo.image}
                            alt={productInfo.name}
                            className="h-full w-auto max-w-full object-contain hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                </div>

                <div className="p-3">
                    <h3 className="font-medium text-gray-900 mb-2 text-sm line-clamp-2 h-10 hover:text-green-500">
                        {productInfo.name}
                    </h3>
                    <div className="text-green-400 font-semibold text-lg">
                        {productInfo.price.toLocaleString()}₫
                    </div>



                </div>
            </div>
        </Link>
    );
};

export default ProductCard;