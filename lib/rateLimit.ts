import type { NextRequest } from 'next/server'

type Counter = {
  count: number
  resetAt: number
}

const counters = new Map<string, Counter>()

function nowMs() {
  return Date.now()
}

export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  const xri = req.headers.get('x-real-ip')
  if (xri) return xri.trim()
  return 'unknown'
}

export function checkRateLimit(params: {
  key: string
  limit: number
  windowMs: number
}): { ok: true; remaining: number; resetAt: number } | { ok: false; retryAfterSeconds: number; resetAt: number } {
  const t = nowMs()

  const existing = counters.get(params.key)
  if (!existing || existing.resetAt <= t) {
    const resetAt = t + params.windowMs
    counters.set(params.key, { count: 1, resetAt })
    return { ok: true, remaining: Math.max(0, params.limit - 1), resetAt }
  }

  if (existing.count >= params.limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - t) / 1000))
    return { ok: false, retryAfterSeconds, resetAt: existing.resetAt }
  }

  existing.count += 1
  counters.set(params.key, existing)
  return { ok: true, remaining: Math.max(0, params.limit - existing.count), resetAt: existing.resetAt }
}

export function buildRateLimitHeaders(result: { ok: true; remaining: number; resetAt: number } | { ok: false; retryAfterSeconds: number; resetAt: number }) {
  const resetSeconds = Math.ceil(result.resetAt / 1000)

  if (result.ok) {
    return {
      'X-RateLimit-Remaining': String(result.remaining),
      'X-RateLimit-Reset': String(resetSeconds),
    }
  }

  if (!('retryAfterSeconds' in result)) {
    return {
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': String(resetSeconds),
    }
  }

  return {
    'Retry-After': String(result.retryAfterSeconds),
    'X-RateLimit-Remaining': '0',
    'X-RateLimit-Reset': String(resetSeconds),
  }
}
