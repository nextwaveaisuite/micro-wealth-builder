export async function getSession() {
  try {
    const res = await fetch('/api/session', { credentials: 'include' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function login(email, password) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || 'Login failed')
  }
  return res.json()
}

export async function logout() {
  await fetch('/api/logout', { method: 'POST', credentials: 'include' })
}
