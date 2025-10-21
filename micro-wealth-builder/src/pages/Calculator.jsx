import React, { useState } from 'react'
import { Layout } from '../components/Layout'

const menu = [
  { to: '/', label: 'Overview', end: true },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/planner', label: 'Planner' },
  { to: '/calculator', label: 'Calculator' },
  { to: '/learn', label: 'Learn' }
]

export default function Calculator(){
  const [principal, setPrincipal] = useState(1000)
  const [rate, setRate] = useState(6)
  const [years, setYears] = useState(5)
  const result = (principal * Math.pow(1 + rate/100, years)).toFixed(2)
  return (
    <Layout title="Calculator" menu={menu}>
      <div className="grid">
        <div className="card"><div className="h2">Principal</div><input className="input" value={principal} onChange={e=>setPrincipal(+e.target.value)} /></div>
        <div className="card"><div className="h2">Rate (%)</div><input className="input" value={rate} onChange={e=>setRate(+e.target.value)} /></div>
        <div className="card"><div className="h2">Years</div><input className="input" value={years} onChange={e=>setYears(+e.target.value)} /></div>
      </div>
      <div style={{marginTop:16}} className="kpi">$ {result}</div>
      <div className="small">Future value</div>
    </Layout>
  )
}
