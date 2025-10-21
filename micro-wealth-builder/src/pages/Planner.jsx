import React, { useState } from 'react'
import { Layout } from '../components/Layout'

const menu = [
  { to: '/', label: 'Overview', end: true },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/planner', label: 'Planner' },
  { to: '/calculator', label: 'Calculator' },
  { to: '/learn', label: 'Learn' },
]

export default function Planner(){
  const [weekly, setWeekly] = useState(50)
  const [rate, setRate] = useState(6)
  const [months, setMonths] = useState(12)
  const monthly = weekly * 4.33
  const future = (() => {
    const r = (rate/100)/12
    let total = 0
    for (let i=0; i<months; i++) total = (total + monthly) * (1+r)
    return total.toFixed(2)
  })()
  return (
    <Layout title="Planner" menu={menu}>
      <div className="grid">
        <div className="card"><div className="h2">Weekly contribution</div><input className="input" value={weekly} onChange={e=>setWeekly(+e.target.value)} /></div>
        <div className="card"><div className="h2">Annual rate (%)</div><input className="input" value={rate} onChange={e=>setRate(+e.target.value)} /></div>
        <div className="card"><div className="h2">Months</div><input className="input" value={months} onChange={e=>setMonths(+e.target.value)} /></div>
      </div>
      <div style={{marginTop:16}} className="kpi">$ {future}</div>
      <div className="small">Projected balance</div>
    </Layout>
  )
}
