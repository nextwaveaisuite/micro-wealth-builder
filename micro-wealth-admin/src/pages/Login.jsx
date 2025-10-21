import React, { useState } from 'react'
import { login } from '../lib/auth'

export default function Login(){
  const [email,setEmail] = useState('')
  const [pass,setPass] = useState('')
  const [err,setErr] = useState('')

  async function onSubmit(e){
    e.preventDefault()
    setErr('')
    try {
      await login(email, pass)
      location.href = '/'
    } catch (e) {
      setErr(e.message || 'Login failed')
    }
  }

  return (
    <div className="loginWrap card">
      <h1 className="h1">Admin Sign in</h1>
      <p className="small">Enter admin email and password.</p>
      {err && <div className="badge red" style={{marginBottom:10}}>{err}</div>}
      <form onSubmit={onSubmit} style={{display:'grid', gap:12}}>
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} />
        <button className="btn" type="submit">Continue</button>
      </form>
      <hr className="sep" />
      <p className="small">Protected admin console.</p>
    </div>
  )
}
