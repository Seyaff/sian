import { RetrievedChunk } from "./query.service";

interface CacheEntry {
  chunks: RetrievedChunk[];
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const DEFAULT_TTL_MS = 60 * 60 * 1000;

function cacheKey(restaurantId: string, query: string): string {
  return `${restaurantId}:${query.trim().toLowerCase()}`;
}

export function getCachedRag(restaurantId: string, query: string): RetrievedChunk[] | null {
  const key = cacheKey(restaurantId, query);
  const entry = cache.get(key);

  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.chunks;
}

export function setCachedRag(
  restaurantId: string,
  query: string,
  chunks: RetrievedChunk[],
  ttlMs = DEFAULT_TTL_MS
): void {
  const key = cacheKey(restaurantId, query);
  cache.set(key, { chunks, expiresAt: Date.now() + ttlMs });
}

export function clearRagCache(restaurantId?: string): void {
  if (!restaurantId) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (key.startsWith(`${restaurantId}:`)) {
      cache.delete(key);
    }
  }
}
