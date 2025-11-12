/**
 * Utility functions for JWT token handling
 */
import { jwtDecode } from 'jwt-decode';

/**
 * Parse a JWT token and extract the payload data
 * @param token The JWT token string or object
 * @returns The decoded payload object or null if parsing fails
 */
export const parseJwt = (token: any): any => {
    try {
        // Check if token is valid
        if (!token || typeof token !== 'string' || token.trim() === '') {
            console.error('Invalid token provided:', token);
            return null;
        }

        return jwtDecode(token);
    } catch (error) {
        console.error('Error parsing JWT token:', error);
        return null;
    }
};

/**
 * Checks if a token is expired
 * @param token The JWT token string
 * @returns true if the token is expired, false otherwise
 */
export const isTokenExpired = (token: string | null): boolean => {
    if (!token) return true;

    try {
        const decoded = parseJwt(token);
        if (!decoded || !decoded.exp) return true;

        // Compare expiration time with current time
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch (error) {
        console.error('Error checking token expiration:', error);
        return true;
    }
};
