import React from 'react'
import { Layout } from '../components/Layout'

const menu = [
  { to: '/', label: 'Overview', end: true },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/planner', label: 'Planner' },
  { to: '/calculator', label: 'Calculator' },
  { to: '/learn', label: 'Learn' },
]

export default function Learn(){
  return (
    <Layout title="Learn" menu={menu}>
      <div className="card">
        <div className="h2">Helpful links</div>
        <ul>
          <li><a href="/portfolio">View Portfolio</a></li>
          <li><a href="/planner">Open Planner</a></li>
          <li><a href="/calculator">Compound Calculator</a></li>
        </ul>
      </div>
    </Layout>
  )
}
