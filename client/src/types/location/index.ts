export interface Province {
    id: string;
    name: string;
};

export interface District {
    id: string;
    name: string;
    provinceId: string;
};

export interface Ward {
    id: string;
    name: string;
    districtId: string;
};