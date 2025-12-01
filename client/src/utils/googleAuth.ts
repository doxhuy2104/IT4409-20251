/**
 * Check if Google login is taking too long and potentially stuck
 * @param timeoutMs Maximum time in milliseconds before considering login as stuck
 * @returns True if login is considered stuck, false otherwise
 */
export const isGoogleLoginStuck = (timeoutMs = 30000): boolean => {
    try {
        const inProgress = sessionStorage.getItem('googleLoginInProgress');
        if (!inProgress) return false;
        
        const startTimeStr = sessionStorage.getItem('googleLoginStartTime');
        if (!startTimeStr) return false;
        
        const startTime = parseInt(startTimeStr, 10);
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;
        
        return elapsedTime > timeoutMs;
    } catch (err) {
        console.error('Error checking Google login status:', err);
        return false;
    }
};

/**
 * Reset Google login tracking information
 */
export const resetGoogleLoginStatus = (): void => {
    try {
        sessionStorage.removeItem('googleLoginInProgress');
        sessionStorage.removeItem('googleLoginStartTime');
    } catch (err) {
        console.error('Error resetting Google login status:', err);
    }
};

/**
 * Start tracking Google login process
 */
export const trackGoogleLogin = (): void => {
    try {
        sessionStorage.setItem('googleLoginInProgress', 'true');
        sessionStorage.setItem('googleLoginStartTime', Date.now().toString());
    } catch (err) {
        console.error('Error tracking Google login:', err);
    }
};

/**
 * Check on application load if there's a stuck Google login from a previous session
 * and reset it if necessary
 */
export const checkAndResetStuckGoogleLogin = (): void => {
    if (isGoogleLoginStuck()) {
        console.warn('Detected stuck Google login from previous session, resetting');
        resetGoogleLoginStatus();
    }
};
