export async function readJson(req) {
  return await new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}) }
      catch (e) { reject(e) }
    })
    req.on('error', reject)
  })
}

export function setJson(res, code, obj) {
  res.statusCode = code
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(obj))
}

export function parseCookies(req) {
  const header = req.headers.cookie || ''
  const out = {}
  header.split(/; */).forEach(pair => {
    const idx = pair.indexOf('=')
    if (idx < 0) return
    const k = decodeURIComponent(pair.slice(0, idx).trim())
    const v = decodeURIComponent(pair.slice(idx + 1).trim())
    out[k] = v
  })
  return out
}

export function setSessionCookie(res, token, maxAgeSec = 86400) {
  const secure = true
  const cookie = [
    `mw_session=${encodeURIComponent(token)}`,
    `HttpOnly`,
    `Secure=${secure ? 'true':'false'}`,
    `SameSite=Strict`,
    `Path=/`,
    `Max-Age=${maxAgeSec}`
  ].join('; ')
  res.setHeader('Set-Cookie', cookie)
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `mw_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict; Secure=true`)
}
