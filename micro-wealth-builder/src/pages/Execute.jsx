import React from 'react'
import { Layout } from '../components/Layout'

const menu = [
  { to: '/', label: 'Overview', end: true },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/planner', label: 'Planner' },
  { to: '/calculator', label: 'Calculator' },
  { to: '/learn', label: 'Learn' }
]

const providers = [
  {
    key: 'raiz',
    name: 'Raiz',
    accent: '#1aa7ec',
    tagline: 'Round-ups into diversified portfolios.',
    openUrl: 'https://raizinvest.com.au/',
    howUrl: 'https://raizinvest.com.au/how-it-works/'
  },
  {
    key: 'spaceship',
    name: 'Spaceship Voyager',
    accent: '#6b5bff',
    tagline: 'Micro-investing in tech & global themes.',
    openUrl: 'https://www.spaceship.com.au/voyager/',
    howUrl: 'https://www.spaceship.com.au/voyager/how-it-works/'
  },
  {
    key: 'commsec',
    name: 'CommSec Pocket',
    accent: '#fdb913',
    tagline: 'ASX ETF micro-buys via CommSec.',
    openUrl: 'https://www.commsec.com.au/products/commsec-pocket.html',
    howUrl: 'https://www.commbank.com.au/articles/investing/commsec-pocket.html'
  },
  {
    key: 'stockspot',
    name: 'Stockspot',
    accent: '#00a2ae',
    tagline: 'Automated ETF portfolios & rebalancing.',
    openUrl: 'https://www.stockspot.com.au/',
    howUrl: 'https://www.stockspot.com.au/how-it-works'
  },
  {
    key: 'quietgrowth',
    name: 'QuietGrowth',
    accent: '#2bb673',
    tagline: 'Robo-advice & diversified portfolio automation.',
    openUrl: 'https://www.quietgrowth.com.au/',
    howUrl: 'https://www.quietgrowth.com.au/how-it-works'
  }
]

export default function Execute(){
  return (
    <Layout title="Execute (Choose your provider)" menu={menu}>
      <div className="grid">
        {providers.map(p => (
          <div key={p.key} className="card" style={{borderColor:'var(--border)'}}>
            <div className="h1" style={{display:'flex', alignItems:'center', gap:10}}>
              <span style={{
                width:12, height:12, borderRadius:'50%',
                background:p.accent, boxShadow:`0 0 14px ${p.accent}`
              }} />
              {p.name}
            </div>
            <div className="small" style={{marginTop:6}}>{p.tagline}</div>
            <div style={{display:'flex', gap:10, marginTop:14}}>
              <a className="btn" href={p.openUrl} target="_blank" rel="noreferrer">Open {p.name}</a>
              <a className="btn secondary" href={p.howUrl} target="_blank" rel="noreferrer">How it works</a>
            </div>
            <div className="small" style={{marginTop:10, opacity:.9}}>
              Note: We don’t hold funds or place orders. Execute at your provider.
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
