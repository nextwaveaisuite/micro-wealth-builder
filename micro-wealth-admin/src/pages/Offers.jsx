import React, { useState } from 'react'
import { Layout } from '../components/Layout'

const menu = [
  { to: '/', label: 'Overview', end: true },
  { to: '/providers', label: 'Providers' },
  { to: '/offers', label: 'Offers' },
  { to: '/users', label: 'Users' },
  { to: '/settings', label: 'Settings' }
]

export default function Offers(){
  const [offers, setOffers] = useState([
    { id: 1, name: 'ETF: VAS', status: 'Active', clicks: 124 },
    { id: 2, name: 'ETF: VGS', status: 'Paused', clicks: 76 },
    { id: 3, name: 'Bond: VAF', status: 'Active', clicks: 51 }
  ])
  return (
    <Layout title="Offers" menu={menu}>
      <div className="card">
        <table className="table">
          <thead><tr><th>Name</th><th>Status</th><th>Clicks</th><th></th></tr></thead>
          <tbody>
            {offers.map(o => (
              <tr key={o.id}>
                <td>{o.name}</td>
                <td><span className={`badge ${o.status==='Active'?'green':'blue'}`}>{o.status}</span></td>
                <td>{o.clicks}</td>
                <td style={{textAlign:'right'}}>
                  <button className="btn secondary" onClick={()=>alert('Edit placeholder')}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
