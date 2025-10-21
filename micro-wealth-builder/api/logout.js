// micro-wealth-builder/api/logout.js
import { clearSessionCookie, setJson } from './_utils/http.js'

export default async function handler(_req, res) {
  clearSessionCookie(res)
  return setJson(res, 200, { ok: true })
}
