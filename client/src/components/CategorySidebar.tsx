import { useState, useEffect } from 'react';
import { priceRanges } from '../data/price';
import categoryService from '../services/category.service';
import { Category } from '../types/category';

interface CategorySidebarProps {
    categoryId?: number;
    selectedPriceRanges: string[];
    onPriceRangeChange: (ranges: string[]) => void;
    selectedTypes: number[];
    onTypeChange: (types: number[]) => void;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
    categoryId,
    selectedPriceRanges,
    onPriceRangeChange,
    selectedTypes,
    onTypeChange
}) => {
    const [subCategories, setSubCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchSubCategories = async () => {
            if (categoryId) {
                try {
                    const allCategories = await categoryService.getAllCategories();
                    
                    // Find current category and get its subcategories
                    const findCategory = (categories: Category[]): Category | null => {
                        for (const cat of categories) {
                            if (cat.id === categoryId) {
                                return cat;
                            }
                            if (cat.subCategories && cat.subCategories.length > 0) {
                                const found = findCategory(cat.subCategories);
                                if (found) return found;
                            }
                        }
                        return null;
                    };

                    const currentCategory = findCategory(allCategories);
                    if (currentCategory && currentCategory.subCategories) {
                        setSubCategories(currentCategory.subCategories);
                    }
                } catch (error) {
                    console.error('Error fetching subcategories:', error);
                }
            }
        };

        fetchSubCategories();
    }, [categoryId]);

    const handlePriceRangeToggle = (value: string) => {
        if (selectedPriceRanges.includes(value)) {
            onPriceRangeChange(selectedPriceRanges.filter(r => r !== value));
        } else {
            onPriceRangeChange([...selectedPriceRanges, value]);
        }
    };

    const handleTypeToggle = (typeId: number) => {
        if (selectedTypes.includes(typeId)) {
            onTypeChange(selectedTypes.filter(t => t !== typeId));
        } else {
            onTypeChange([...selectedTypes, typeId]);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
            {/* MỨC GIÁ */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">MỨC GIÁ</h3>
                <div className="space-y-2">
                    {priceRanges.map((range) => (
                        <label key={range.value} className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedPriceRanges.includes(range.value)}
                                onChange={() => handlePriceRangeToggle(range.value)}
                                className="w-4 h-4 text-[#5bbb46] border-gray-300 rounded focus:ring-[#5bbb46]"
                            />
                            <span className="ml-2 text-sm text-gray-700">{range.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* LOẠI */}
            {subCategories.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">LOẠI</h3>
                    <div className="space-y-2">
                        {subCategories.map((subCat) => (
                            <label key={subCat.id} className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedTypes.includes(subCat.id)}
                                    onChange={() => handleTypeToggle(subCat.id)}
                                    className="w-4 h-4 text-[#5bbb46] border-gray-300 rounded focus:ring-[#5bbb46]"
                                />
                                <span className="ml-2 text-sm text-gray-700">{subCat.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategorySidebar;

