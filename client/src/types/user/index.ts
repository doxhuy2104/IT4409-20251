export interface UserProfile {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    address: string | null;
    googleId: string | null;
    createdAt: string;
    updatedAt: string;
}