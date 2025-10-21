// micro-wealth-builder/src/pages/Overview.jsx
import React, { useMemo } from 'react'
import { Layout } from '../components/Layout'
import PortfolioPie from '../components/charts/PortfolioPie'
import GrowthLine from '../components/charts/GrowthLine'

const menu = [
  { to: '/', label: 'Overview', end: true },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/planner', label: 'Planner' },
  { to: '/calculator', label: 'Calculator' },
  { to: '/learn', label: 'Learn' }
]

function buildMonthLabels(n = 12) {
  const arr = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    arr.push(d.toLocaleString('en-AU', { month: 'short' }))
  }
  return arr
}
function seriesFrom(start = 100, stepsPct = []) {
  let v = start
  const out = []
  for (let i = 0; i < 12; i++) {
    const pct = stepsPct[i % stepsPct.length] / 100
    v = v * (1 + pct)
    out.push(Number(v.toFixed(2)))
  }
  return out
}

export default function Overview(){
  const allocation = useMemo(() => ({
    labels: ['VAS.AX', 'VGS.AX', 'IVV.AX', 'VAF.AX', 'GOLD.AX'],
    values: [30, 20, 25, 15, 10]
  }), [])

  const months = useMemo(() => buildMonthLabels(12), [])
  const growth = useMemo(() => ([
    { name: 'VAS.AX',  data: seriesFrom(100, [1.2,-0.6,0.4,0.8,-0.3,1.0,0.5,0.7,-0.4,0.9,0.3,0.6]) },
    { name: 'VGS.AX',  data: seriesFrom(100, [1.0, 0.2,-0.5,0.9, 0.4,0.6,-0.2,0.8, 0.3,0.5,-0.1,0.7]) },
    { name: 'IVV.AX',  data: seriesFrom(100, [1.4,-0.3,0.7,1.1,-0.4,1.0, 0.6,0.5,-0.2,1.0, 0.2,0.9]) },
    { name: 'VAF.AX',  data: seriesFrom(100, [0.2, 0.1,0.2,0.1, 0.1,0.2, 0.1,0.2, 0.1,0.2, 0.1,0.2]) },
    { name: 'GOLD.AX', data: seriesFrom(100, [0.6, 0.4,-0.2,0.8, 0.5,-0.3,1.0,-0.2, 0.9,0.4,-0.1,0.7]) }
  ]), [])

  return (
    <Layout title="Dashboard" menu={menu}>
      <div className="grid">
        <div className="card"><div className="h2">Balance (est)</div><div className="kpi">$12,450</div><div className="small">12 months proj.</div></div>
        <div className="card"><div className="h2">Monthly Avg</div><div className="kpi">$1,038</div><div className="small">Contrib + returns</div></div>
        <div className="card"><div className="h2">Risk</div><div className="badge blue">Low/Moderate</div></div>

        <div className="card">
          <div className="h2">Ready to place your plan?</div>
          <div className="small">Pick your micro-investing provider to execute outside the app.</div>
          <div style={{marginTop:10}}>
            <a className="btn" href="/execute">Go to Execute →</a>
          </div>
          <div className="small" style={{marginTop:8}}>We don’t hold funds or place orders.</div>
        </div>

        <div className="card">
          <PortfolioPie labels={allocation.labels} values={allocation.values} />
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <GrowthLine labels={months} series={growth} />
          <div className="small" style={{marginTop:8}}>
            Demo data, indexed to 100. Phase 2 will connect live quotes.
          </div>
        </div>
      </div>
    </Layout>
  )
}
