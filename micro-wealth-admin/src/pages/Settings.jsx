// micro-wealth-admin/src/pages/Settings.jsx
import React, { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'

const menu = [
  { to: '/', label: 'Overview', end: true },
  { to: '/users', label: 'Users' },
  { to: '/settings', label: 'Settings' },
]

export default function Settings() {
  const [config, setConfig] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadConfig()
  }, [])

  async function loadConfig() {
    try {
      const response = await fetch('/api/admin/config', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to load config')
      }

      const data = await response.json()
      
      // Convert array to object for easier editing
      const configObj = {}
      data.config?.forEach(item => {
        configObj[item.key] = item.value
      })
      
      setConfig(configObj)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ config })
      })

      if (!response.ok) {
        throw new Error('Failed to save config')
      }

      setSuccess('Configuration saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function updateConfig(key, value) {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }))
  }

  if (loading) {
    return (
      <Layout title="Settings" menu={menu}>
        <div className="card">
          <div>Loading...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Settings" menu={menu}>
      <div className="grid">
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="h2">System Configuration</div>
          <p className="small">Edit global settings for Loss Guard and Radar. Changes apply to all users.</p>

          <form onSubmit={handleSave} style={{ marginTop: 24 }}>
            {/* Loss Guard Settings */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ color: '#f2f6ff', fontSize: 18, marginBottom: 16 }}>Loss Guard</h3>
              
              <div style={{ display: 'grid', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#9fb0d0', marginBottom: 8 }}>
                    Safety Floor (%)
                  </label>
                  <input
                    type="number"
                    value={config.safety_floor_pct || 30}
                    onChange={(e) => updateConfig('safety_floor_pct', e.target.value)}
                    style={{
                      width: '200px',
                      padding: '10px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#f2f6ff',
                      fontSize: 14
                    }}
                  />
                  <div style={{ fontSize: 12, color: '#6b7a99', marginTop: 6 }}>
                    Minimum safety allocation before redirecting contributions
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#9fb0d0', marginBottom: 8 }}>
                    Growth Cap (%)
                  </label>
                  <input
                    type="number"
                    value={config.growth_cap_pct || 7}
                    onChange={(e) => updateConfig('growth_cap_pct', e.target.value)}
                    style={{
                      width: '200px',
                      padding: '10px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#f2f6ff',
                      fontSize: 14
                    }}
                  />
                  <div style={{ fontSize: 12, color: '#6b7a99', marginTop: 6 }}>
                    Maximum deviation above target growth allocation
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#9fb0d0', marginBottom: 8 }}>
                    Weekly Brake Threshold (%)
                  </label>
                  <input
                    type="number"
                    value={config.weekly_brake_pct || -5}
                    onChange={(e) => updateConfig('weekly_brake_pct', e.target.value)}
                    style={{
                      width: '200px',
                      padding: '10px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#f2f6ff',
                      fontSize: 14
                    }}
                  />
                  <div style={{ fontSize: 12, color: '#6b7a99', marginTop: 6 }}>
                    Portfolio drop % to trigger safety routing (negative value)
                  </div>
                </div>
              </div>
            </div>

            {/* Radar Settings */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ color: '#f2f6ff', fontSize: 18, marginBottom: 16 }}>Radar (Tilts)</h3>
              
              <div style={{ display: 'grid', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#9fb0d0', marginBottom: 8 }}>
                    Max Actions Per Week
                  </label>
                  <input
                    type="number"
                    value={config.radar_max_actions_per_week || 2}
                    onChange={(e) => updateConfig('radar_max_actions_per_week', e.target.value)}
                    style={{
                      width: '200px',
                      padding: '10px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#f2f6ff',
                      fontSize: 14
                    }}
                  />
                  <div style={{ fontSize: 12, color: '#6b7a99', marginTop: 6 }}>
                    Maximum number of tilt actions per week
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#9fb0d0', marginBottom: 8 }}>
                    Monthly Cap ($)
                  </label>
                  <input
                    type="number"
                    value={config.radar_max_monthly_cap || 80}
                    onChange={(e) => updateConfig('radar_max_monthly_cap', e.target.value)}
                    style={{
                      width: '200px',
                      padding: '10px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#f2f6ff',
                      fontSize: 14
                    }}
                  />
                  <div style={{ fontSize: 12, color: '#6b7a99', marginTop: 6 }}>
                    Maximum total tilt amount per month
                  </div>
                </div>
              </div>
            </div>

            {/* Trade Settings */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ color: '#f2f6ff', fontSize: 18, marginBottom: 16 }}>Trade Settings</h3>
              
              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#9fb0d0', marginBottom: 8 }}>
                  Minimum Trade Size ($)
                </label>
                <input
                  type="number"
                  value={config.min_trade_size || 50}
                  onChange={(e) => updateConfig('min_trade_size', e.target.value)}
                  style={{
                    width: '200px',
                    padding: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#f2f6ff',
                    fontSize: 14
                  }}
                />
                <div style={{ fontSize: 12, color: '#6b7a99', marginTop: 6 }}>
                  Minimum trade size for fee efficiency
                </div>
              </div>
            </div>

            {error && (
              <div style={{
                padding: 12,
                background: 'rgba(255,107,107,0.1)',
                border: '1px solid rgba(255,107,107,0.3)',
                borderRadius: 6,
                color: '#ff6b6b',
                fontSize: 13,
                marginBottom: 16
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                padding: 12,
                background: 'rgba(122,240,178,0.1)',
                border: '1px solid rgba(122,240,178,0.3)',
                borderRadius: 6,
                color: '#7af0b2',
                fontSize: 13,
                marginBottom: 16
              }}>
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="btn"
              style={{ background: 'linear-gradient(135deg, #4db5ff 0%, #7af0b2 100%)' }}
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </form>
        </div>

        {/* Warning */}
        <div className="card" style={{ gridColumn: '1 / -1', background: 'rgba(255,107,107,0.05)', borderColor: 'rgba(255,107,107,0.2)' }}>
          <div style={{ fontSize: 13, color: '#ff6b6b', lineHeight: 1.6 }}>
            <strong>⚠️ Warning:</strong> Changes to these settings affect all users immediately. 
            Test changes carefully and monitor the impact on user behavior and system performance.
          </div>
        </div>
      </div>
    </Layout>
  )
}

