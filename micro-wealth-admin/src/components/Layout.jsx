import React from 'react'
import { NavLink } from 'react-router-dom'
import { logout } from '../lib/auth'

export function Layout({ title, children, menu }) {
  return (
    <div className="container">
      <aside className="sidebar">
        <div className="brand"><span className="dot"></span> Micro Wealth</div>
        <nav className="menu">
          {menu.map(m => (
            <NavLink key={m.to} to={m.to} end={m.end ?? false}>{m.label}</NavLink>
          ))}
        </nav>
      </aside>
      <section className="content">
        <header className="header">
          <div className="title">{title}</div>
          <div className="user">
            <button className="btn secondary" onClick={async()=>{ await logout(); location.href='/login' }}>Logout</button>
          </div>
        </header>
        <main className="main">{children}</main>
        <div className="footer">© {new Date().getFullYear()} Micro Wealth Suite — Admin</div>
      </section>
    </div>
  )
}
