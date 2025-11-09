import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

/**
 * Custom hook to use the authentication context
 * @returns Authentication context
 */
export const useAuth = () => useContext(AuthContext);

export default useAuth;
