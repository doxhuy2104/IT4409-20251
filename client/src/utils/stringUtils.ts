/**
 * Utility functions for string manipulation, especially for Vietnamese text
 */

/**
 * Removes Vietnamese diacritics (accents) from a string
 * Example: "hồng" -> "hong", "Hà Nội" -> "Ha Noi"
 */
export const removeVietnameseDiacritics = (str: string): string => {
    if (!str) return '';

    return str
        .normalize('NFD') // Decompose characters into base + combining marks
        .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
};

/**
 * Normalizes a search query by removing diacritics and converting to lowercase
 */
export const normalizeSearchQuery = (query: string): string => {
    return removeVietnameseDiacritics(query.trim().toLowerCase());
};

/**
 * Checks if a text matches a search query (supports both with and without diacritics)
 */
export const matchesSearchQuery = (text: string, query: string): boolean => {
    if (!text || !query) return false;

    const normalizedText = normalizeSearchQuery(text);
    const normalizedQuery = normalizeSearchQuery(query);

    return normalizedText.includes(normalizedQuery);
};

export const createSlug = (str: string): string => {
    return removeVietnameseDiacritics(str)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
        .replace(/[^a-z0-9-]/g, '') // Loại bỏ ký tự đặc biệt (chỉ giữ a-z, 0-9 và -)
        .replace(/-+/g, '-') // Gộp nhiều dấu "-" liên tiếp thành một
        .replace(/^-+|-+$/g, ''); // Loại bỏ dấu "-" ở đầu và cuối
};