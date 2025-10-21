import React from 'react'
import { Layout } from '../components/Layout'

const menu = [
  { to: '/', label: 'Overview', end: true },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/planner', label: 'Planner' },
  { to: '/calculator', label: 'Calculator' },
  { to: '/learn', label: 'Learn' },
]

export default function Overview() {
  return (
    <Layout title="Dashboard" menu={menu}>
      <div className="grid">

        {/* Summary cards */}
        <div className="card">
          <div className="h2">Balance (est)</div>
          <div className="kpi">$12,450</div>
          <div className="small">12 months projection</div>
        </div>

        <div className="card">
          <div className="h2">Monthly Avg</div>
          <div className="kpi">$1,038</div>
          <div className="small">Contributions + returns</div>
        </div>

        <div className="card">
          <div className="h2">Risk</div>
          <div className="badge blue">Low / Moderate</div>
        </div>

        {/* Execution Section */}
        <div className="card">
          <div className="h2">Ready to place your plan?</div>
          <div className="small">
            Pick your micro-investing provider to execute outside the app.
          </div>

          <div style={{ marginTop: 10 }}>
            <a className="btn" href="/execute">Go to Execute →</a>
          </div>

          <div className="small" style={{ marginTop: 8 }}>
            We don’t hold funds or place orders.
          </div>
        </div>

        {/* Guidance / next steps */}
        <div className="card">
          <div className="h2">Next Steps</div>
          <ul className="small" style={{ marginTop: 6 }}>
            <li>Review your Portfolio targets.</li>
            <li>Check Autopilot schedule.</li>
            <li>Choose a provider to execute your plan.</li>
            <li>Track progress weekly.</li>
          </ul>
        </div>

        {/* Legal reminder */}
        <div className="card" style={{ background: '#f7f9fb' }}>
          <div className="h2">General Notice</div>
          <div className="small">
            This tool provides general information only and does not offer
            personal financial advice. Execution occurs at your own provider.
          </div>
        </div>

      </div>
    </Layout>
  )
}
