// Environment configuration
interface EnvironmentConfig {
  API_URL: string;
  APP_ENV: 'development' | 'staging' | 'production';
  DEBUG: boolean;
  VERSION: string;
  BUILD_DATE: string;
}

// Get environment variables with fallbacks
const getEnvVar = (key: string, fallback: string = ''): string => {
  return import.meta.env[key] || fallback;
};

// Create configuration object
export const config: EnvironmentConfig = {
  API_URL: getEnvVar('VITE_API_URL', 'https://iso.transexpress.com.gt/webservice/api/'),
  APP_ENV: getEnvVar('VITE_APP_ENV', 'development') as EnvironmentConfig['APP_ENV'],
  DEBUG: getEnvVar('VITE_DEBUG', 'false') === 'true',
  VERSION: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  BUILD_DATE: getEnvVar('VITE_BUILD_DATE', new Date().toISOString()),
};

// Export individual values for backward compatibility
export const API_URL = config.API_URL;
export const IS_DEVELOPMENT = config.APP_ENV === 'development';
export const IS_PRODUCTION = config.APP_ENV === 'production';

// Validate required environment variables
const validateConfig = () => {
  const requiredVars = ['API_URL'] as const;
  const missing = requiredVars.filter(key => !config[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Run validation
validateConfig();

export default config;
