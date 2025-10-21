import React from 'react'
import { Layout } from '../components/Layout'

const menu = [
  { to: '/', label: 'Overview', end: true },
  { to: '/offers', label: 'Offers' },
  { to: '/users', label: 'Users' },
  { to: '/settings', label: 'Settings' }
]

export default function Users(){
  const list = [
    { id: 1, email: 'alice@example.com', plan: 'Pro' },
    { id: 2, email: 'bob@example.com', plan: 'Free' },
    { id: 3, email: 'sam@example.com', plan: 'Elite' }
  ]
  return (
    <Layout title="Users" menu={menu}>
      <div className="card">
        <table className="table">
          <thead><tr><th>Email</th><th>Plan</th></tr></thead>
          <tbody>{list.map(u=> <tr key={u.id}><td>{u.email}</td><td>{u.plan}</td></tr>)}</tbody>
        </table>
      </div>
    </Layout>
  )
}
