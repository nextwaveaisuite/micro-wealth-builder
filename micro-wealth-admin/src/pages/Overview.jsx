import React, { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'

const menu = [
  { to: '/', label: 'Overview', end: true },
  { to: '/providers', label: 'Providers' },
  { to: '/offers', label: 'Offers' },
  { to: '/users', label: 'Users' },
  { to: '/settings', label: 'Settings' }
]

function countProviders(){
  try {
    const raw = localStorage.getItem('mw_admin_providers_v1')
    if (!raw) return 5
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.length : 5
  } catch { return 5 }
}

export default function Overview(){
  const [prov, setProv] = useState(5)
  useEffect(()=>{ setProv(countProviders()) },[])
  return (
    <Layout title="Admin Dashboard" menu={menu}>
      <div className="grid">
        <div className="card"><div className="h2">Providers</div><div className="kpi">{prov}</div></div>
        <div className="card"><div className="h2">Offers</div><div className="kpi">3</div></div>
        <div className="card"><div className="h2">Status</div><span className="badge green">Healthy</span></div>
        <div className="card">
          <div className="h2">Quick Links</div>
          <div style={{display:'flex', gap:10, flexWrap:'wrap', marginTop:8}}>
            <a className="btn" href="/providers">Manage Providers</a>
            <a className="btn secondary" href="/offers">Offers</a>
            <a className="btn secondary" href="/users">Users</a>
          </div>
        </div>
      </div>
    </Layout>
  )
}
