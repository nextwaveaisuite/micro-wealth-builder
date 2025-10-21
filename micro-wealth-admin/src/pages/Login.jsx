import React, { useState } from 'react'
import { Auth } from '../lib/auth'

export default function Login(){
  const [email,setEmail] = useState('')
  const [pass,setPass] = useState('')
  function onSubmit(e){
    e.preventDefault()
    if(email && pass){ Auth.login(email); location.href='/' }
  }
  return (
    <div className="loginWrap card">
      <h1 className="h1">Admin Sign in</h1>
      <p className="small">Use any email & password for now (placeholder auth).</p>
      <form onSubmit={onSubmit} style={{display:'grid', gap:12}}>
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} />
        <button className="btn" type="submit">Continue</button>
      </form>
      <hr className="sep" />
      <p className="small">Wire to real auth later.</p>
    </div>
  )
}
