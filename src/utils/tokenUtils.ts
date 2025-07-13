// Token utility functions for session management
export interface TokenPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: any;
}

/**
 * Decode JWT token without verification (client-side)
 * @param token JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    if (!token || token.split('.').length !== 3) {
      return null;
    }

    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.warn('Failed to decode token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 * @param token JWT token string
 * @returns True if expired, false if valid
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  // exp is in seconds, Date.now() is in milliseconds
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

/**
 * Get token expiration time
 * @param token JWT token string
 * @returns Expiration timestamp or null
 */
export function getTokenExpiration(token: string | null): number | null {
  if (!token) return null;

  const decoded = decodeToken(token);
  return decoded?.exp ? decoded.exp * 1000 : null; // Convert to milliseconds
}

/**
 * Calculate time until token expires
 * @param token JWT token string
 * @returns Time in milliseconds until expiration, or 0 if expired
 */
export function getTimeUntilExpiration(token: string | null): number {
  const expiration = getTokenExpiration(token);
  if (!expiration) return 0;

  const timeUntilExpiration = expiration - Date.now();
  return Math.max(0, timeUntilExpiration);
}

/**
 * Check if token expires within a given time window
 * @param token JWT token string
 * @param windowMs Time window in milliseconds (default: 5 minutes)
 * @returns True if token expires within the window
 */
export function isTokenExpiringsoon(token: string | null, windowMs: number = 5 * 60 * 1000): boolean {
  const timeUntilExpiration = getTimeUntilExpiration(token);
  return timeUntilExpiration > 0 && timeUntilExpiration <= windowMs;
}

/**
 * Format time until expiration in human-readable format
 * @param token JWT token string
 * @returns Formatted string or null if expired/invalid
 */
export function formatTimeUntilExpiration(token: string | null): string | null {
  const timeMs = getTimeUntilExpiration(token);
  if (timeMs <= 0) return null;

  const hours = Math.floor(timeMs / (1000 * 60 * 60));
  const minutes = Math.floor((timeMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeMs % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}
