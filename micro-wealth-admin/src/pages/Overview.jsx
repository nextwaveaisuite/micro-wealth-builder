// micro-wealth-admin/src/pages/Overview.jsx
import React, { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'

const menu = [
  { to: '/', label: 'Overview', end: true },
  { to: '/users', label: 'Users' },
  { to: '/settings', label: 'Settings' },
]

export default function Overview() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      const response = await fetch('/api/admin/stats', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to load stats')
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout title="Admin Dashboard" menu={menu}>
        <div className="card">
          <div>Loading...</div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout title="Admin Dashboard" menu={menu}>
        <div className="card">
          <div style={{ color: '#ff6b6b' }}>Error: {error}</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Admin Dashboard" menu={menu}>
      <div className="grid">
        {/* KPI Cards */}
        <div className="card">
          <div className="h2">Total Users</div>
          <div className="kpi">{stats?.totalUsers || 0}</div>
          <div className="small">{stats?.newUsersThisWeek || 0} new this week</div>
        </div>

        <div className="card">
          <div className="h2">Pro Subscribers</div>
          <div className="kpi">{stats?.proUsers || 0}</div>
          <div className="small">{((stats?.proUsers / Math.max(stats?.totalUsers, 1)) * 100).toFixed(1)}% conversion</div>
        </div>

        <div className="card">
          <div className="h2">MRR</div>
          <div className="kpi">${stats?.mrr || 0}</div>
          <div className="small">Monthly Recurring Revenue</div>
        </div>

        <div className="card">
          <div className="h2">Holdings Imported</div>
          <div className="kpi">{stats?.holdingsImported || 0}</div>
          <div className="small">Total CSV imports</div>
        </div>

        {/* Recent Activity */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="h2">Recent Telemetry Events</div>
          <div style={{ overflowX: 'auto', marginTop: 16 }}>
            {stats?.recentEvents && stats.recentEvents.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: 12, textAlign: 'left', color: '#9fb0d0', fontSize: 13 }}>Event Type</th>
                    <th style={{ padding: 12, textAlign: 'left', color: '#9fb0d0', fontSize: 13 }}>Count</th>
                    <th style={{ padding: 12, textAlign: 'left', color: '#9fb0d0', fontSize: 13 }}>Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentEvents.map((event, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: 12, color: '#f2f6ff' }}>{event.event_type}</td>
                      <td style={{ padding: 12, color: '#9fb0d0' }}>{event.count}</td>
                      <td style={{ padding: 12, color: '#9fb0d0', fontSize: 12 }}>
                        {new Date(event.last_seen).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ color: '#6b7a99', padding: 20, textAlign: 'center' }}>
                No telemetry events yet
              </div>
            )}
          </div>
        </div>

        {/* Loss Guard Events */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="h2">Loss Guard Triggers (Last 7 Days)</div>
          <div style={{ overflowX: 'auto', marginTop: 16 }}>
            {stats?.lossGuardEvents && stats.lossGuardEvents.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: 12, textAlign: 'left', color: '#9fb0d0', fontSize: 13 }}>Type</th>
                    <th style={{ padding: 12, textAlign: 'left', color: '#9fb0d0', fontSize: 13 }}>Count</th>
                    <th style={{ padding: 12, textAlign: 'left', color: '#9fb0d0', fontSize: 13 }}>Last Trigger</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.lossGuardEvents.map((event, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: 12, color: '#f2f6ff' }}>
                        {event.event_type.replace('loss_guard_', '').replace('_', ' ').toUpperCase()}
                      </td>
                      <td style={{ padding: 12, color: '#9fb0d0' }}>{event.count}</td>
                      <td style={{ padding: 12, color: '#9fb0d0', fontSize: 12 }}>
                        {new Date(event.last_trigger).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ color: '#6b7a99', padding: 20, textAlign: 'center' }}>
                No Loss Guard events in the last 7 days
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="card">
          <div className="h2">System Status</div>
          <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#9fb0d0', fontSize: 14 }}>Database</span>
              <span className="badge blue">Healthy</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#9fb0d0', fontSize: 14 }}>Quotes API</span>
              <span className="badge blue">Operational</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#9fb0d0', fontSize: 14 }}>Stripe</span>
              <span className="badge blue">Connected</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="h2">Quick Actions</div>
          <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
            <a href="/users" className="btn">Manage Users</a>
            <a href="/settings" className="btn">Edit Config</a>
            <button onClick={loadStats} className="btn">Refresh Stats</button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

