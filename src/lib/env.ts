/**
 * Centralized environment variable configuration
 *
 * Provides type-safe access to environment variables with consistent validation
 * and fallback handling across the application.
 */

/**
 * Get required environment variable or throw error
 * Used for critical configuration that must be present in production
 */
function getRequiredEnvVar(key: string, description?: string): string {
  const value = process.env[key];

  if (!value) {
    const errorMsg = description
      ? `Missing required environment variable: ${key} (${description})`
      : `Missing required environment variable: ${key}`;

    // In production, this should fail loudly
    if (process.env.NODE_ENV === 'production') {
      throw new Error(errorMsg);
    }

    // In development, log warning but don't crash
    console.warn(`[env] ${errorMsg}`);
  }

  return value || '';
}

/**
 * Get optional environment variable with fallback
 * Used for configuration that has sensible defaults
 */
function getOptionalEnvVar(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Centralized environment configuration
 * All environment variables should be accessed through this object
 */
export const ENV = {
  // Node environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',

  // PocketBase configuration
  POCKETBASE_URL: getOptionalEnvVar('POCKETBASE_URL', 'http://127.0.0.1:8090'),
  POCKETBASE_ADMIN_EMAIL: process.env.POCKETBASE_ADMIN_EMAIL,
  POCKETBASE_ADMIN_PASSWORD: process.env.POCKETBASE_ADMIN_PASSWORD,

  // Multi-tenant configuration
  BASE_DOMAIN: getOptionalEnvVar('BASE_DOMAIN', 'loidolt.space'),

  // Contact form configuration (optional)
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  CONTACT_EMAIL_TO: process.env.CONTACT_EMAIL_TO,
  CONTACT_EMAIL_FROM: process.env.CONTACT_EMAIL_FROM,

  // Caching configuration
  CACHE_TTL_MS: parseInt(getOptionalEnvVar('CACHE_TTL_SECONDS', '300'), 10) * 1000,

  // Logging configuration
  LOG_LEVEL: getOptionalEnvVar('LOG_LEVEL', 'info') as 'debug' | 'info' | 'warn' | 'error',
  ENABLE_DEBUG_LOGGING: process.env.LOG_LEVEL === 'debug' || process.env.NODE_ENV === 'development',
} as const;

/**
 * Validate required environment variables on startup
 * Call this in server initialization to fail fast if config is missing
 */
export function validateEnvironment(): void {
  const errors: string[] = [];

  // Check PocketBase URL is valid
  try {
    new URL(ENV.POCKETBASE_URL);
  } catch {
    errors.push(`POCKETBASE_URL is not a valid URL: ${ENV.POCKETBASE_URL}`);
  }

  // In production, require admin credentials for initialization scripts
  if (ENV.IS_PRODUCTION) {
    if (!ENV.POCKETBASE_ADMIN_EMAIL) {
      console.warn('[env] POCKETBASE_ADMIN_EMAIL not set (required for admin operations)');
    }
    if (!ENV.POCKETBASE_ADMIN_PASSWORD) {
      console.warn('[env] POCKETBASE_ADMIN_PASSWORD not set (required for admin operations)');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
  }

  // Log configuration in development
  if (ENV.IS_DEVELOPMENT) {
    console.log('[env] Environment configuration loaded:');
    console.log(`  NODE_ENV: ${ENV.NODE_ENV}`);
    console.log(`  POCKETBASE_URL: ${ENV.POCKETBASE_URL}`);
    console.log(`  BASE_DOMAIN: ${ENV.BASE_DOMAIN}`);
    console.log(`  CACHE_TTL_MS: ${ENV.CACHE_TTL_MS}ms`);
    console.log(`  LOG_LEVEL: ${ENV.LOG_LEVEL}`);
  }
}

/**
 * Helper for conditional debug logging
 */
export function debugLog(message: string, ...args: any[]): void {
  if (ENV.ENABLE_DEBUG_LOGGING) {
    console.log(`[debug] ${message}`, ...args);
  }
}

/**
 * Export for backward compatibility
 * @deprecated Use ENV object instead
 */
export function getEnvVar(key: string): string {
  console.warn(`[env] getEnvVar is deprecated. Use ENV.${key} instead`);
  return process.env[key] || '';
}
