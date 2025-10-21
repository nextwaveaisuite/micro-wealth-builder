import React from 'react'
import { Layout } from '../components/Layout'

const menu = [
  { to: '/', label: 'Overview', end: true },
  { to: '/providers', label: 'Providers' },
  { to: '/offers', label: 'Offers' },
  { to: '/users', label: 'Users' },
  { to: '/settings', label: 'Settings' }
]

export default function Settings(){
  return (
    <Layout title="Settings" menu={menu}>
      <div className="card">
        <div className="h2">Environment</div>
        <p className="small">Set real API keys in Vercel → Settings → Environment Variables.</p>
        <button className="btn" onClick={()=>alert('Saved (placeholder)')}>Save</button>
      </div>
    </Layout>
  )
}
