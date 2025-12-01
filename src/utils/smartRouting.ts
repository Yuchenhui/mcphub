import { loadSettings, expandEnvVars } from '../config/index.js';
import { getSystemConfigDao } from '../dao/DaoFactory.js';

/**
 * Smart routing configuration interface
 */
export interface SmartRoutingConfig {
  enabled: boolean;
  dbUrl: string;
  openaiApiBaseUrl: string;
  openaiApiKey: string;
  openaiApiEmbeddingModel: string;
}

// Cache for smart routing settings from database
let smartRoutingSettingsCache: Partial<SmartRoutingConfig> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 5000; // 5 seconds cache TTL

/**
 * Determines if database mode is enabled
 */
function isDatabaseMode(): boolean {
  return process.env.USE_DB === 'true' || !!process.env.DB_URL;
}

/**
 * Gets smart routing settings from the appropriate source (database or file)
 * Uses caching to avoid frequent database queries
 */
function getSmartRoutingSettings(): Partial<SmartRoutingConfig> {
  const now = Date.now();

  // If using database mode and cache is valid, return cached value
  if (isDatabaseMode()) {
    if (smartRoutingSettingsCache && now - cacheTimestamp < CACHE_TTL_MS) {
      return smartRoutingSettingsCache;
    }

    // Try to get from database synchronously via cached DAO
    // Note: The DAO layer caches the system config, so this should be fast
    try {
      const systemConfigDao = getSystemConfigDao();
      // Use the synchronous getCached method if available, otherwise fall back to cached value
      const systemConfig = (systemConfigDao as any).getCached?.() || null;
      if (systemConfig?.smartRouting) {
        const routingSettings = systemConfig.smartRouting as Partial<SmartRoutingConfig>;
        smartRoutingSettingsCache = routingSettings;
        cacheTimestamp = now;
        return routingSettings;
      }
    } catch (error) {
      // Fall through to file-based settings
    }
  }

  // Fall back to file-based settings
  const settings = loadSettings();
  return settings.systemConfig?.smartRouting || {};
}

/**
 * Updates the smart routing settings cache (called after database updates)
 */
export function updateSmartRoutingCache(settings: Partial<SmartRoutingConfig>): void {
  smartRoutingSettingsCache = settings;
  cacheTimestamp = Date.now();
}

/**
 * Clears the smart routing settings cache
 */
export function clearSmartRoutingCache(): void {
  smartRoutingSettingsCache = null;
  cacheTimestamp = 0;
}

/**
 * Gets the complete smart routing configuration from environment variables and settings.
 *
 * Priority order for each setting:
 * 1. Specific environment variables (ENABLE_SMART_ROUTING, SMART_ROUTING_ENABLED, etc.)
 * 2. Generic environment variables (OPENAI_API_KEY, DATABASE_URL, etc.)
 * 3. Settings configuration (systemConfig.smartRouting)
 * 4. Default values
 *
 * @returns {SmartRoutingConfig} Complete smart routing configuration
 */
export function getSmartRoutingConfig(): SmartRoutingConfig {
  const smartRoutingSettings = getSmartRoutingSettings();

  return {
    // Enabled status - check multiple environment variables
    enabled: getConfigValue(
      [process.env.SMART_ROUTING_ENABLED],
      smartRoutingSettings.enabled,
      false,
      parseBooleanEnvVar,
    ),

    // Database configuration
    dbUrl: getConfigValue([process.env.DB_URL], smartRoutingSettings.dbUrl, '', expandEnvVars),

    // OpenAI API configuration
    openaiApiBaseUrl: getConfigValue(
      [process.env.OPENAI_API_BASE_URL],
      smartRoutingSettings.openaiApiBaseUrl,
      'https://api.openai.com/v1',
      expandEnvVars,
    ),

    openaiApiKey: getConfigValue(
      [process.env.OPENAI_API_KEY],
      smartRoutingSettings.openaiApiKey,
      '',
      expandEnvVars,
    ),

    openaiApiEmbeddingModel: getConfigValue(
      [process.env.OPENAI_API_EMBEDDING_MODEL],
      smartRoutingSettings.openaiApiEmbeddingModel,
      'text-embedding-3-small',
      expandEnvVars,
    ),
  };
}

/**
 * Gets a configuration value with priority order: environment variables > settings > default.
 *
 * @param {(string | undefined)[]} envVars - Array of environment variable names to check in order
 * @param {any} settingsValue - Value from settings configuration
 * @param {any} defaultValue - Default value to use if no other value is found
 * @param {Function} transformer - Function to transform the final value to the correct type
 * @returns {any} The configuration value with the appropriate transformation applied
 */
function getConfigValue<T>(
  envVars: (string | undefined)[],
  settingsValue: any,
  defaultValue: T,
  transformer: (value: any) => T,
): T {
  // Check environment variables in order
  for (const envVar of envVars) {
    if (envVar !== undefined && envVar !== null && envVar !== '') {
      try {
        return transformer(envVar);
      } catch (error) {
        console.warn(`Failed to transform environment variable "${envVar}":`, error);
        continue;
      }
    }
  }

  // Check settings value
  if (settingsValue !== undefined && settingsValue !== null) {
    try {
      return transformer(settingsValue);
    } catch (error) {
      console.warn('Failed to transform settings value:', error);
    }
  }

  // Return default value
  return defaultValue;
}

/**
 * Parses a string environment variable value to a boolean.
 * Supports common boolean representations: true/false, 1/0, yes/no, on/off
 *
 * @param {string} value - The environment variable value to parse
 * @returns {boolean} The parsed boolean value
 */
function parseBooleanEnvVar(value: string): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value !== 'string') {
    return false;
  }

  const normalized = value.toLowerCase().trim();

  // Handle common truthy values
  if (normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on') {
    return true;
  }

  // Handle common falsy values
  if (
    normalized === 'false' ||
    normalized === '0' ||
    normalized === 'no' ||
    normalized === 'off' ||
    normalized === ''
  ) {
    return false;
  }

  // Default to false for unrecognized values
  console.warn(`Unrecognized boolean value for smart routing: "${value}", defaulting to false`);
  return false;
}
