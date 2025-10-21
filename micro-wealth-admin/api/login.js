import bcrypt from 'bcryptjs'
import { readJson, setJson, setSessionCookie } from './_utils/http.js'
import { rateLimit, setCommonRateHeaders } from './_utils/rate-limit.js'
import { signJwt } from './_utils/jwt.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    return res.end('Method Not Allowed')
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
  const { ok, remaining, reset } = rateLimit({ id: `login:${ip}`, limit: 10, windowMs: 60_000 })
  setCommonRateHeaders(res, remaining, reset)
  if (!ok) {
    res.statusCode = 429
    return res.end('Too Many Requests')
  }

  let body
  try { body = await readJson(req) }
  catch { return setJson(res, 400, { ok: false, error: 'Invalid JSON' }) }

  const { email, password } = body || {}
  if (!email || !password) return setJson(res, 400, { ok: false, error: 'Email and password required' })

  const allowedEmail = process.env.ADMIN_EMAIL
  const passHash = process.env.ADMIN_PASS_HASH
  if (!allowedEmail || !passHash) return setJson(res, 500, { ok: false, error: 'Auth not configured' })

  if (String(email).toLowerCase() !== String(allowedEmail).toLowerCase()) {
    return setJson(res, 401, { ok: false, error: 'Invalid credentials' })
  }
  const passOk = await bcrypt.compare(password, passHash)
  if (!passOk) return setJson(res, 401, { ok: false, error: 'Invalid credentials' })

  const token = signJwt({ sub: email, role: 'admin' }, 86400)
  setSessionCookie(res, token, 86400)
  return setJson(res, 200, { ok: true })
}
