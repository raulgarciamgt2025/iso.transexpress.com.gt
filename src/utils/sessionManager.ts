import { getCookie } from 'cookies-next';
import { isTokenExpired, getTimeUntilExpiration, isTokenExpiringsoon } from '@/utils/tokenUtils';

export type SessionState = 'valid' | 'expired' | 'expiring-soon' | 'invalid';

export interface SessionInfo {
  state: SessionState;
  timeUntilExpiration?: number;
  isAuthenticated: boolean;
}

export interface SessionWarningOptions {
  warningTimeMs?: number; // Default: 5 minutes
  onExpired?: () => void;
  onExpiringSoon?: (timeLeft: number) => void;
  onSessionRenewed?: () => void;
}

class SessionManager {
  private readonly authSessionKey = '_FLACTO_AUTH_KEY_';
  private warningTimer: NodeJS.Timeout | null = null;
  private expirationTimer: NodeJS.Timeout | null = null;
  private options: SessionWarningOptions = {};

  /**
   * Initialize session monitoring
   */
  public initialize(options: SessionWarningOptions = {}): void {
    this.options = {
      warningTimeMs: 5 * 60 * 1000, // 5 minutes default
      ...options,
    };

    this.setupTokenMonitoring();
  }

  /**
   * Get current session information
   */
  public getSessionInfo(): SessionInfo {
    const token = this.getCurrentToken();
    
    if (!token) {
      return {
        state: 'invalid',
        isAuthenticated: false,
      };
    }

    if (isTokenExpired(token)) {
      return {
        state: 'expired',
        isAuthenticated: false,
        timeUntilExpiration: 0,
      };
    }

    const timeUntilExpiration = getTimeUntilExpiration(token);
    const isExpiringSoon = isTokenExpiringsoon(token, this.options.warningTimeMs);

    return {
      state: isExpiringSoon ? 'expiring-soon' : 'valid',
      isAuthenticated: true,
      timeUntilExpiration,
    };
  }

  /**
   * Check if current session is valid
   */
  public isSessionValid(): boolean {
    const { state } = this.getSessionInfo();
    return state === 'valid' || state === 'expiring-soon';
  }

  /**
   * Get current authentication token
   */
  public getCurrentToken(): string | null {
    try {
      const sessionData = getCookie(this.authSessionKey)?.toString();
      if (!sessionData) return null;

      const parsedData = JSON.parse(sessionData);
      return parsedData.token || null;
    } catch (error) {
      console.warn('Failed to get current token:', error);
      return null;
    }
  }

  /**
   * Setup automatic token monitoring
   */
  private setupTokenMonitoring(): void {
    this.clearTimers();

    const sessionInfo = this.getSessionInfo();
    
    if (!sessionInfo.isAuthenticated) {
      return;
    }

    if (sessionInfo.state === 'expired') {
      this.handleSessionExpired();
      return;
    }

    const { timeUntilExpiration } = sessionInfo;
    if (!timeUntilExpiration) return;

    // Set warning timer
    const warningTime = timeUntilExpiration - (this.options.warningTimeMs || 0);
    if (warningTime > 0) {
      this.warningTimer = setTimeout(() => {
        this.handleSessionExpiringSoon();
      }, warningTime);
    } else {
      // Already in warning period
      this.handleSessionExpiringSoon();
    }

    // Set expiration timer
    this.expirationTimer = setTimeout(() => {
      this.handleSessionExpired();
    }, timeUntilExpiration);
  }

  /**
   * Handle session expiring soon
   */
  private handleSessionExpiringSoon(): void {
    const timeLeft = getTimeUntilExpiration(this.getCurrentToken());
    console.warn('Session expiring soon:', timeLeft);
    
    if (this.options.onExpiringSoon) {
      this.options.onExpiringSoon(timeLeft);
    }
  }

  /**
   * Handle session expired
   */
  private handleSessionExpired(): void {
    console.warn('Session expired, logging out...');
    this.clearTimers();
    
    if (this.options.onExpired) {
      this.options.onExpired();
    }
  }

  /**
   * Refresh token monitoring (call after token renewal)
   */
  public refreshMonitoring(): void {
    this.setupTokenMonitoring();
    
    if (this.options.onSessionRenewed) {
      this.options.onSessionRenewed();
    }
  }

  /**
   * Stop all monitoring timers
   */
  public stopMonitoring(): void {
    this.clearTimers();
  }

  /**
   * Clear all active timers
   */
  private clearTimers(): void {
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    
    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
      this.expirationTimer = null;
    }
  }

  /**
   * Manually validate current session
   */
  public validateSession(): boolean {
    const sessionInfo = this.getSessionInfo();
    
    if (sessionInfo.state === 'expired' || !sessionInfo.isAuthenticated) {
      this.handleSessionExpired();
      return false;
    }
    
    return true;
  }
}

// Create singleton instance
export const sessionManager = new SessionManager();

export default sessionManager;
