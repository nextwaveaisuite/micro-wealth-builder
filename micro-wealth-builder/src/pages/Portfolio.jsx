import React from 'react'
import { Layout } from '../components/Layout'

const menu = [
  { to: '/', label: 'Overview', end: true },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/planner', label: 'Planner' },
  { to: '/calculator', label: 'Calculator' },
  { to: '/learn', label: 'Learn' },
]

const rows = [
  { ticker: 'IVV.AX', change: '+15%', weight: '25%' },
  { ticker: 'GOLD.AX', change: '+11%', weight: '15%' },
  { ticker: 'VAS.AX', change: '+10%', weight: '30%' },
  { ticker: 'VGS.AX', change: '+8%',  weight: '20%' },
  { ticker: 'VAF.AX', change: '+4%',  weight: '10%' },
]

const plannedBuys = [
  { ticker: 'VAS.AX', type: 'Growth', fee: '0.10%' },
  { ticker: 'VGS.AX', type: 'Growth', fee: '0.18%' },
]

export default function Portfolio(){
  return (
    <Layout title="Portfolio" menu={menu}>
      <div className="card">
        <table className="table">
          <thead><tr><th>Ticker</th><th>P/L</th><th>Weight</th></tr></thead>
          <tbody>{rows.map(r=> <tr key={r.ticker}><td>{r.ticker}</td><td>{r.change}</td><td>{r.weight}</td></tr>)}</tbody>
        </table>
        <div style={{height:12}}></div>
        <div className="h2">Planned Buys</div>
        <table className="table">
          <thead><tr><th>Ticker</th><th>Type</th><th>Fee</th></tr></thead>
          <tbody>{plannedBuys.map(p=> <tr key={p.ticker}><td>{p.ticker}</td><td>{p.type}</td><td>{p.fee}</td></tr>)}</tbody>
        </table>
      </div>
    </Layout>
  )
}
