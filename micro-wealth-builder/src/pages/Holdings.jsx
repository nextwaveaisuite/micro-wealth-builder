// micro-wealth-builder/src/pages/Holdings.jsx
import React, { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useTelemetry, TelemetryEvents } from '../hooks/useTelemetry'

const menu = [
  { to: '/', label: 'Overview', end: true },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/holdings', label: 'Holdings' },
  { to: '/planner', label: 'Planner' },
]

export default function Holdings() {
  const { user, isPro } = useAuth()
  const { track } = useTelemetry()
  const [holdings, setHoldings] = useState([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [csvText, setCsvText] = useState('')
  const [provider, setProvider] = useState('commsec')

  useEffect(() => {
    if (user && isPro) {
      loadHoldings()
    } else {
      setLoading(false)
    }
  }, [user, isPro])

  async function loadHoldings() {
    try {
      const session = await supabase.auth.getSession()
      const token = session?.data?.session?.access_token

      const response = await fetch('/api/holdings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (data.success) {
        setHoldings(data.holdings || [])
      }
    } catch (err) {
      console.error('Error loading holdings:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleImport(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setImporting(true)

    try {
      const session = await supabase.auth.getSession()
      const token = session?.data?.session?.access_token

      const response = await fetch('/api/holdings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          csv: csvText,
          provider
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(`Successfully imported ${data.imported} holdings!`)
        setHoldings(data.holdings)
        setCsvText('')
        track(TelemetryEvents.HOLDINGS_IMPORTED, { count: data.imported, provider })
      } else {
        setError(data.error || 'Import failed')
      }
    } catch (err) {
      setError(err.message || 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  async function handleClear() {
    if (!confirm('Clear all holdings? This cannot be undone.')) return

    try {
      const session = await supabase.auth.getSession()
      const token = session?.data?.session?.access_token

      const response = await fetch('/api/holdings', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setHoldings([])
        setSuccess('Holdings cleared')
      }
    } catch (err) {
      setError(err.message || 'Failed to clear holdings')
    }
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setCsvText(event.target.result)
    }
    reader.readAsText(file)
  }

  function downloadTemplate() {
    const template = `ticker,units,cost_base
VAS.AX,100,85.50
VGS.AX,50,95.20
IVV.AX,75,42.30
VAF.AX,200,55.10
GOLD.AX,150,18.75`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'holdings-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!user) {
    return (
      <Layout title="Holdings" menu={menu}>
        <div className="card">
          <div className="h2">Sign in required</div>
          <p>Please sign in to import and manage your holdings.</p>
          <a href="/auth" className="btn">Sign In</a>
        </div>
      </Layout>
    )
  }

  if (!isPro) {
    return (
      <Layout title="Holdings" menu={menu}>
        <div className="card">
          <div className="h2">Pro Feature</div>
          <p>Holdings import and tracking is available for Pro subscribers.</p>
          <a href="/billing" className="btn">Upgrade to Pro</a>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Holdings" menu={menu}>
      <div className="grid">
        {/* Import Form */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="h2">Import Holdings</div>
          <p className="small">Upload a CSV from your broker to track your actual portfolio.</p>

          <div style={{ marginTop: 20, marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#9fb0d0' }}>
              Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              style={{
                padding: '10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                color: '#f2f6ff',
                fontSize: 14
              }}
            >
              <option value="commsec">CommSec</option>
              <option value="selfwealth">SelfWealth</option>
              <option value="pearler">Pearler</option>
              <option value="raiz">Raiz</option>
              <option value="generic">Generic CSV</option>
            </select>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#9fb0d0' }}>
              Upload CSV or paste below
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{
                padding: '10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                color: '#f2f6ff',
                fontSize: 14,
                marginBottom: 10
              }}
            />
            <button onClick={downloadTemplate} className="btn" style={{ marginLeft: 10 }}>
              Download Template
            </button>
          </div>

          <form onSubmit={handleImport}>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="ticker,units,cost_base&#10;VAS.AX,100,85.50&#10;VGS.AX,50,95.20"
              rows={8}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                color: '#f2f6ff',
                fontSize: 13,
                fontFamily: 'monospace',
                marginBottom: 16
              }}
            />

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

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn" disabled={importing || !csvText}>
                {importing ? 'Importing...' : 'Import Holdings'}
              </button>
              {holdings.length > 0 && (
                <button type="button" onClick={handleClear} className="btn" style={{ background: '#ff6b6b' }}>
                  Clear All
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Holdings List */}
        {holdings.length > 0 && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="h2">Your Holdings ({holdings.length})</div>
            <div style={{ overflowX: 'auto', marginTop: 16 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: 12, textAlign: 'left', color: '#9fb0d0', fontSize: 13 }}>Ticker</th>
                    <th style={{ padding: 12, textAlign: 'right', color: '#9fb0d0', fontSize: 13 }}>Units</th>
                    <th style={{ padding: 12, textAlign: 'right', color: '#9fb0d0', fontSize: 13 }}>Cost Base</th>
                    <th style={{ padding: 12, textAlign: 'right', color: '#9fb0d0', fontSize: 13 }}>Total Cost</th>
                    <th style={{ padding: 12, textAlign: 'left', color: '#9fb0d0', fontSize: 13 }}>Provider</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h) => (
                    <tr key={h.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: 12, color: '#f2f6ff', fontSize: 14, fontWeight: 600 }}>{h.ticker}</td>
                      <td style={{ padding: 12, color: '#f2f6ff', fontSize: 14, textAlign: 'right' }}>{h.units.toFixed(2)}</td>
                      <td style={{ padding: 12, color: '#f2f6ff', fontSize: 14, textAlign: 'right' }}>${h.cost_base.toFixed(2)}</td>
                      <td style={{ padding: 12, color: '#f2f6ff', fontSize: 14, textAlign: 'right' }}>${(h.units * h.cost_base).toFixed(2)}</td>
                      <td style={{ padding: 12, color: '#9fb0d0', fontSize: 13 }}>{h.provider || 'Unknown'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

