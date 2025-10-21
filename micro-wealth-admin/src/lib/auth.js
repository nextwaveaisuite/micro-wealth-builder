export const Auth = {
  key: 'mw_token',
  isAuthed() { return !!localStorage.getItem(this.key) },
  login(email) { localStorage.setItem(this.key, JSON.stringify({ email, at: Date.now() })) },
  logout() { localStorage.removeItem(this.key) },
  user() { try { return JSON.parse(localStorage.getItem(this.key)) } catch { return null } }
}
