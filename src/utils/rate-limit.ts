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

const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
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
  buckets.set(options.key, bucket);

  return {
    success: true,
    remaining: Math.max(options.limit - bucket.count, 0),
    retryAfterSeconds: Math.max(Math.ceil((bucket.resetAt - now) / 1000), 1),
  };
}

export function getRequestIdentifier(ipHeader: string | null | undefined, fallback: string): string {
  if (!ipHeader) {
    return fallback;
  }

  return ipHeader.split(",")[0]?.trim() || fallback;
}
