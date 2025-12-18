/**
 * Map từ slug của danh mục sang ID trong database
 * Được sử dụng để chuyển đổi từ URL path sang ID cần thiết cho API call
 */
export const slugToIdMap: Record<string, number> = {
    // Danh mục chính (parentId = null)
    'qua-tang-trai-cay': 1,      
    'qua-tang-tet': 2,           
    'trai-cay-theo-mua': 3,        
    'bep-o-ready-to-eat': 4,       
    'rau-cu-qua': 5,              
    'tuoi-song': 6,              
    'bep-o-ready-to-cook': 7,     
    'thuc-pham-kho': 8,          
    'gia-vi-phu-lieu': 9,         
    'do-uong-tot-suc-khoe': 10,   
    'bo-sua': 11,                  
    'me-be': 12,                
    'superfood': 13,               

    // Danh mục con - Trái Cây Theo Mùa (parentId = 3)
    'trai-cay-viet': 14,          
    'trai-cay-nhap-khau': 15,      
    'trai-cay-say-dong-lanh': 16,  
    'nuoc-ep-trai-cay-tuoi': 17,   

    // Danh mục con - Rau Củ Quả (parentId = 5)
    'rau-la-huu-co': 18,           
    'cu-qua-huu-co': 19,           
    'nam': 20,                     

    // Danh mục con - Tươi Sống (parentId = 6)
    'thit-heo-huu-co': 21,        
    'thit-bo-huu-co': 22,          
    'thit-bo-to-tay-ninh': 23,     
    'thit-bo-obe': 24,             
    'thit-gia-cam-trung': 25,    
    'thuy-hai-san': 26,          
    'thuy-san': 27,                
    'hai-san-kho-mot-nang': 28,   

    // Danh mục con - Thực Phẩm Khô (parentId = 8)
    'cac-loai-hat-huu-co': 29,    
    'ngu-coc-huu-co': 30,         
    'gao-huu-co': 31,            
    'mi-nui-huu-co': 32,           
    'banh-keo-socola': 33,        
    'do-kho-khac': 34,             
    'nguyen-lieu-lam-banh': 35,    
    'snack-organic': 36,           

    // Danh mục con - Gia Vị & Phụ Liệu (parentId = 9)
    'gia-vi-nguyen-phu-lieu': 37,  
    'mat-ong': 38,                

    // Danh mục con - Đồ Uống Tốt Sức Khỏe (parentId = 10)
    'tra-huu-co': 39,            
    'ca-phe-huu-co': 40,        
    'nuoc-ep-huu-co': 41,        
    'do-uong-co-con': 42,       

    // Danh mục con - Bơ - Sữa (parentId = 11)
    'sua-hat': 43,                
    'sua-tuoi': 44,                
    'sua-chua': 45,                
    'bo-phomai': 46,              
    'sua-dac': 47,               

    // Danh mục con - Superfood (parentId = 13)
    'cham-soc-tieu-hoa': 48,       
    'bo-sung-suc-khoe': 49,       
    'protein-thuc-vat-huu-co': 50, 

    // Aliases để tương thích với code cũ
    'trai-cay-cat-san': 16,       
    'rau-an-la': 18,               
    'rau-cu': 19,                  
    'nam-tuoi': 20,                
    'thit-heo': 21,                
    'thit-bo': 22,                
    'thit-ga': 25,                
    'hai-san': 26,                 
    'trung': 25,                   
    'hat-dinh-duong': 29,         
    'trai-cay-kho': 16,          
    'hat-ngu-coc': 30,             
    'bot': 35,                     
    'gia-vi': 37,                 
    'dau-an': 37,                  
    'nuoc-tuong-nuoc-mam': 37,     
    'duong-muoi': 37,              
    'ready-to-eat': 4,             
    'com-hop': 4,                 
    'banh-mi': 4,                  
    'salad': 4,                    
    'do-an-nhanh': 4,              
    'ready-to-cook': 7,            
    'rau-cu-sach': 7,              
    'thit-uop-san': 7,             
    'ca-sach': 7,                  
    'do-chay': 7,                  
};

/* Map từ ID danh mục sang slug để sử dụng trong việc tạo URL*/
export const idToSlugMap: Record<number, string> = Object.entries(slugToIdMap).reduce(
    (acc, [slug, id]) => {
        // Chỉ lưu mapping đầu tiên cho mỗi ID (không lưu aliases)
        if (!acc[id]) {
            acc[id] = slug;
        }
        return acc;
    },
    {} as Record<number, string>
);

/**
 * Chuyển đổi từ slug sang ID danh mục
 * @param slug Slug của danh mục trong URL
 * @returns ID của danh mục nếu tồn tại, undefined nếu không tìm thấy
 */
export function getIdFromSlug(slug: string): number | undefined {
    if (Number.parseInt(slug)) {
        return Number.parseInt(slug);
    }
    return slugToIdMap[slug];
}

/**
 * Chuyển đổi từ ID sang slug danh mục
 * @param id ID của danh mục 
 * @returns Slug của danh mục nếu tồn tại, undefined nếu không tìm thấy
 */
export function getSlugFromId(id: number): string | undefined {
    return idToSlugMap[id];
}

/**
 * Lấy ra đường dẫn URL đầy đủ cho một danh mục dựa trên ID
 * @param id ID của danh mục
 * @returns URL path đầy đủ cho danh mục, hoặc '/' nếu không tìm thấy
 */
export function getCategoryUrl(id: number): string {
    const slug = getSlugFromId(id);
    return slug ? `/${slug}` : '/';
}
