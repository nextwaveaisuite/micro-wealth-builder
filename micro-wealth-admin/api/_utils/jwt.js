import jwt from 'jsonwebtoken'

export function signJwt(payload, ttlSec = 86400) {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET not configured')
  return jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn: ttlSec })
}

export function verifyJwt(token) {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET not configured')
  return jwt.verify(token, secret, { algorithms: ['HS256'] })
}
