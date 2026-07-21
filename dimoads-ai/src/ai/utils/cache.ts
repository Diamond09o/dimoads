/**
 * Intelligent In-Memory Cache with TTL support
 * Designed for plugging in Redis or other durable caches in the future.
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

export class AICacheService {
  private static cache = new Map<string, CacheEntry<any>>();
  private static DEFAULT_TTL = 1000 * 60 * 15; // 15 Minutes default TTL

  /**
   * Generates a deterministic cache key from a namespace and payload
   */
  public static generateKey(namespace: string, payload: any): string {
    const serializedPayload = JSON.stringify(payload || {});
    return `${namespace}:${serializedPayload}`;
  }

  /**
   * Retrieves an item from the cache. Prunes expired items.
   */
  public static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Stores an item in the cache with a specified TTL
   */
  public static set<T>(key: string, data: T, ttlMs: number = this.DEFAULT_TTL): void {
    const expiry = Date.now() + ttlMs;
    this.cache.set(key, { data, expiry });
  }

  /**
   * Clears a specific cache entry
   */
  public static delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clears all cached items
   */
  public static clear(): void {
    this.cache.clear();
  }
}
