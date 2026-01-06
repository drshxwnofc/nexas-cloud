// lib/rateLimit.ts
const limits = new Map<string, { count: number; time: number }>();

export function rateLimit(
  key: string,
  limit = 60,
  windowMs = 60000
) {
  const now = Date.now();
  const record = limits.get(key);

  if (!record) {
    limits.set(key, { count: 1, time: now });
    return true;
  }

  if (now - record.time > windowMs) {
    limits.set(key, { count: 1, time: now });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}
