import React from 'react'
import { Layout } from '../components/Layout'

const menu = [
  { to: '/', label: 'Overview', end: true },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/planner', label: 'Planner' },
  { to: '/calculator', label: 'Calculator' },
  { to: '/learn', label: 'Learn' },
]

export default function Overview(){
  return (
    <Layout title="Dashboard" menu={menu}>
      <div className="grid">
        <div className="card"><div className="h2">Balance (est)</div><div className="kpi">$12,450</div><div className="small">12 months proj.</div></div>
        <div className="card"><div className="h2">Monthly Avg</div><div className="kpi">$1,038</div><div className="small">Contrib + returns</div></div>
        <div className="card"><div className="h2">Risk</div><div className="badge blue">Low/Moderate</div></div>
      </div>
    </Layout>
  )
}
