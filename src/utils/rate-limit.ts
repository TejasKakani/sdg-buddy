import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  success: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

/**
 * Shared Upstash-backed rate limiting with a hardened in-memory fallback.
 *
 * On Vercel's serverless runtime, a plain in-process Map does NOT provide
 * reliable rate limiting: each instance has its own memory and instances are
 * recycled, so counters reset constantly. When the UPSTASH_REDIS_REST_* env
 * vars are configured we use a durable sliding-window limiter shared across
 * all instances. Without them (e.g. local dev) we fall back to an in-memory
 * limiter that at least evicts expired buckets to avoid an unbounded leak.
 */

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis =
  upstashUrl && upstashToken
    ? new Redis({ url: upstashUrl, token: upstashToken })
    : null;

// One limiter per (limit, windowMs) pair, cached so we don't rebuild them.
const limiterCache = new Map<string, Ratelimit>();

function getUpstashLimiter(limit: number, windowMs: number): Ratelimit {
  const cacheKey = `${limit}:${windowMs}`;
  const existing = limiterCache.get(cacheKey);
  if (existing) {
    return existing;
  }

  const limiter = new Ratelimit({
    redis: redis!,
    // Sliding window keeps limits accurate across the boundary between windows.
    limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
    prefix: "sdg-buddy/rl",
    analytics: false,
  });

  limiterCache.set(cacheKey, limiter);
  return limiter;
}

// ---- In-memory fallback ----
const buckets = new Map<string, { count: number; resetAt: number }>();

function evictExpired(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

function checkInMemory(options: RateLimitOptions): RateLimitResult {
  const now = Date.now();

  // Opportunistically clear out expired buckets so the Map can't grow forever.
  if (buckets.size > 5000) {
    evictExpired(now);
  }

  const bucket = buckets.get(options.key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(options.key, { count: 1, resetAt: now + options.windowMs });
    return {
      success: true,
      remaining: Math.max(options.limit - 1, 0),
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
    };
  }

  if (bucket.count >= options.limit) {
    return {
      success: false,
      remaining: 0,
      retryAfterSeconds: Math.max(Math.ceil((bucket.resetAt - now) / 1000), 1),
    };
  }

  bucket.count += 1;

  return {
    success: true,
    remaining: Math.max(options.limit - bucket.count, 0),
    retryAfterSeconds: Math.max(Math.ceil((bucket.resetAt - now) / 1000), 1),
  };
}

export async function checkRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  if (redis) {
    try {
      const limiter = getUpstashLimiter(options.limit, options.windowMs);
      const { success, remaining, reset } = await limiter.limit(options.key);
      const retryAfterSeconds = Math.max(Math.ceil((reset - Date.now()) / 1000), 1);
      return {
        success,
        remaining: Math.max(remaining, 0),
        retryAfterSeconds,
      };
    } catch (err) {
      // If Redis is briefly unreachable, degrade to the in-memory limiter
      // rather than failing the request outright.
      console.error(
        "Upstash rate limit error, falling back to in-memory",
        err instanceof Error ? err.message : err
      );
      return checkInMemory(options);
    }
  }

  return checkInMemory(options);
}

export function getRequestIdentifier(ipHeader: string | null | undefined, fallback: string): string {
  if (!ipHeader) {
    return fallback;
  }

  return ipHeader.split(",")[0]?.trim() || fallback;
}
