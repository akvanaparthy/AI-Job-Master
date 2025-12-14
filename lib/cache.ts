/**
 * Simple in-memory cache with TTL (time-to-live)
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number;

  constructor(defaultTTLMs: number = 5 * 60 * 1000) { // 5 minutes default
    this.defaultTTL = defaultTTLMs;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs?: number): void {
    const expiry = Date.now() + (ttlMs ?? this.defaultTTL);
    this.cache.set(key, { data, expiry });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clear expired entries (call periodically if needed)
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Model cache - 10 minute TTL (models don't change often)
export const modelCache = new MemoryCache(10 * 60 * 1000);

// Shared models cache - 5 minute TTL
export const sharedModelsCache = new MemoryCache(5 * 60 * 1000);

// Generic cache for other use cases
export const appCache = new MemoryCache();
