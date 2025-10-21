import React from 'react'
import { Layout } from '../components/Layout'

const menu = [
  { to: '/', label: 'Overview', end: true },
  { to: '/offers', label: 'Offers' },
  { to: '/users', label: 'Users' },
  { to: '/settings', label: 'Settings' }
]

export default function Overview(){
  return (
    <Layout title="Admin Dashboard" menu={menu}>
      <div className="grid">
        <div className="card"><div className="h2">Offers</div><div className="kpi">3</div></div>
        <div className="card"><div className="h2">Total Clicks</div><div className="kpi">251</div></div>
        <div className="card"><div className="h2">Status</div><span className="badge green">Healthy</span></div>
      </div>
    </Layout>
  )
}
