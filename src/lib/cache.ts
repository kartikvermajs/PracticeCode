import { unstable_cache, revalidateTag } from "next/cache";

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  tags: string[];
}

// Global in-memory cache store (persists across warm serverless requests / local dev server)
const memoryCache = new Map<string, CacheEntry<unknown>>();
const inFlightPromises = new Map<string, Promise<unknown>>();
const tagToKeys = new Map<string, Set<string>>();

export const CACHE_TAGS = {
  DASHBOARD: "dashboard",
  PROBLEMS_LIBRARY: "problems-library",
  DUE_REVISION: "due-revision",
  PROBLEM_SLUG: (slug: string) => `problem-${slug}`,
} as const;

export interface CacheOptions {
  /** Time to live in seconds. Default is 60 seconds */
  ttlSeconds?: number;
  /** Cache tags for targeted invalidation */
  tags?: string[];
}

/**
 * Advanced multi-tier cached query executor:
 * Tier 1: In-memory store (0ms latency, zero database hit)
 * Tier 2: In-flight request deduplication (protects against thundering herd)
 * Tier 3: Next.js unstable_cache (cross-request & edge data cache)
 */
export async function cachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const { ttlSeconds = 60, tags = [] } = options;
  const now = Date.now();

  // 1. Check in-memory cache
  const cached = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  // 2. Request deduplication: if identical query is already in-flight, await the same promise
  if (inFlightPromises.has(key)) {
    return inFlightPromises.get(key) as Promise<T>;
  }

  // 3. Next.js unstable_cache wrapper for cross-request caching
  const nextCachedFetcher = unstable_cache(
    async () => {
      return await fetcher();
    },
    [key],
    {
      revalidate: ttlSeconds,
      tags: tags.length > 0 ? tags : undefined,
    }
  );

  const executePromise = (async () => {
    try {
      let result: T;
      try {
        result = (await nextCachedFetcher()) as T;
      } catch {
        // Fallback to direct fetcher if Next cache is unavailable or outside context
        result = await fetcher();
      }

      // Store in memory cache
      memoryCache.set(key, {
        data: result,
        expiresAt: Date.now() + ttlSeconds * 1000,
        tags,
      });

      // Track tags to keys for fast invalidation
      for (const tag of tags) {
        if (!tagToKeys.has(tag)) {
          tagToKeys.set(tag, new Set());
        }
        tagToKeys.get(tag)!.add(key);
      }

      return result;
    } finally {
      inFlightPromises.delete(key);
    }
  })();

  inFlightPromises.set(key, executePromise);
  return executePromise;
}

/**
 * Invalidates cache by tag(s). Evicts from both the in-memory cache
 * and notifies Next.js data cache.
 */
export function invalidateCacheTags(tags: string | string[]): void {
  const tagList = Array.isArray(tags) ? tags : [tags];

  for (const tag of tagList) {
    // 1. Invalidate in-memory entries associated with this tag
    const keys = tagToKeys.get(tag);
    if (keys) {
      for (const key of keys) {
        memoryCache.delete(key);
      }
      tagToKeys.delete(tag);
    }

    // 2. Notify Next.js revalidateTag
    try {
      // In Next.js 16+, second arg "max" or undefined
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (revalidateTag as any)(tag, "max");
    } catch {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (revalidateTag as any)(tag);
      } catch {
        // Ignored if called in an environment without Next static store
      }
    }
  }
}

/**
 * Clears all in-memory cached entries immediately
 */
export function clearAllMemoryCache(): void {
  memoryCache.clear();
  inFlightPromises.clear();
  tagToKeys.clear();
}
