// micro-wealth-builder/api/session.js
import { parseCookies, setJson } from './_utils/http.js'
import { rateLimit, setCommonRateHeaders } from './_utils/rate-limit.js'
import { verifyJwt } from './_utils/jwt.js'

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
  const { ok, remaining, reset } = rateLimit({ id: `session:${ip}`, limit: 120, windowMs: 60_000 })
  setCommonRateHeaders(res, remaining, reset)
  if (!ok) return setJson(res, 429, { ok: false, error: 'rate_limited' })

  try {
    const cookies = parseCookies(req)
    const token = cookies['mw_session']
    if (!token) return setJson(res, 200, { ok: false })
    const data = verifyJwt(token)
    return setJson(res, 200, { ok: true, sub: data.sub, role: data.role, exp: data.exp })
  } catch {
    return setJson(res, 200, { ok: false })
  }
}
