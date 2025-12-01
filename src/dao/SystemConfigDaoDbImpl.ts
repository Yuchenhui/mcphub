import { SystemConfigDao } from './index.js';
import { SystemConfig } from '../types/index.js';
import { SystemConfigRepository } from '../db/repositories/SystemConfigRepository.js';

/**
 * Database-backed implementation of SystemConfigDao
 * Includes caching for synchronous access to frequently used configuration
 */
export class SystemConfigDaoDbImpl implements SystemConfigDao {
  private repository: SystemConfigRepository;
  private cachedConfig: SystemConfig | null = null;
  private cacheTimestamp: number = 0;
  private static readonly CACHE_TTL_MS = 10000; // 10 seconds cache TTL

  constructor() {
    this.repository = new SystemConfigRepository();
  }

  /**
   * Convert repository config to SystemConfig type
   */
  private toSystemConfig(config: any): SystemConfig {
    return {
      routing: config.routing as any,
      install: config.install as any,
      smartRouting: config.smartRouting as any,
      mcpRouter: config.mcpRouter as any,
      nameSeparator: config.nameSeparator,
      oauth: config.oauth as any,
      oauthServer: config.oauthServer as any,
      enableSessionRebuild: config.enableSessionRebuild,
    };
  }

  /**
   * Get cached system configuration synchronously
   * Returns null if cache is not available or expired
   * Used by synchronous functions like getSmartRoutingConfig()
   */
  getCached(): SystemConfig | null {
    const now = Date.now();
    if (this.cachedConfig && now - this.cacheTimestamp < SystemConfigDaoDbImpl.CACHE_TTL_MS) {
      return this.cachedConfig;
    }
    return null;
  }

  /**
   * Clear the configuration cache
   */
  clearCache(): void {
    this.cachedConfig = null;
    this.cacheTimestamp = 0;
  }

  async get(): Promise<SystemConfig> {
    const config = await this.repository.get();
    const systemConfig = this.toSystemConfig(config);

    // Update cache
    this.cachedConfig = systemConfig;
    this.cacheTimestamp = Date.now();

    return systemConfig;
  }

  async update(config: Partial<SystemConfig>): Promise<SystemConfig> {
    const updated = await this.repository.update(config as any);
    const systemConfig = this.toSystemConfig(updated);

    // Update cache
    this.cachedConfig = systemConfig;
    this.cacheTimestamp = Date.now();

    return systemConfig;
  }

  async reset(): Promise<SystemConfig> {
    const config = await this.repository.reset();
    const systemConfig = this.toSystemConfig(config);

    // Update cache
    this.cachedConfig = systemConfig;
    this.cacheTimestamp = Date.now();

    return systemConfig;
  }

  async getSection<K extends keyof SystemConfig>(section: K): Promise<SystemConfig[K]> {
    return (await this.repository.getSection(section)) as any;
  }

  async updateSection<K extends keyof SystemConfig>(
    section: K,
    value: SystemConfig[K],
  ): Promise<boolean> {
    await this.repository.updateSection(section, value as any);
    return true;
  }
}
