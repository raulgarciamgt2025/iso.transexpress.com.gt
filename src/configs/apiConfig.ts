import { config } from './environment';

// Export the API URL for backward compatibility
export const API_URL: string = config.API_URL;

// Export other API-related configurations
export const API_TIMEOUT = 30000; // 30 seconds
export const API_RETRY_COUNT = 3;
export const API_RETRY_DELAY = 1000; // 1 second

// Export the full config for advanced usage
export default config;