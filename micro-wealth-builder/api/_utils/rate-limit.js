// micro-wealth-builder/api/_utils/rate-limit.js
const BUCKET = {}

export function rateLimit({ id, limit = 60, windowMs = 60_000 }) {
  const now = Date.now()
  const slot = Math.floor(now / windowMs)
  const key = `${id}:${slot}`
  BUCKET[key] = (BUCKET[key] || 0) + 1
  const remaining = Math.max(0, limit - BUCKET[key])
  const ok = BUCKET[key] <= limit
  return { ok, remaining, reset: (slot + 1) * windowMs }
}

export function setCommonRateHeaders(res, remaining, reset) {
  res.setHeader('X-RateLimit-Remaining', remaining)
  res.setHeader('X-RateLimit-Reset', reset)
}
