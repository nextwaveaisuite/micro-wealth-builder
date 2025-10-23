// micro-wealth-builder/src/pages/Billing.jsx
import React, { useState } from 'react'
import { Layout } from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useTelemetry, TelemetryEvents } from '../hooks/useTelemetry'

const menu = [
  { to: '/', label: 'Overview', end: true },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/billing', label: 'Billing' },
]

export default function Billing() {
  const { user, subscription, isPro, refreshSubscription } = useAuth()
  const { track } = useTelemetry()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCheckout() {
    setLoading(true)
    setError('')

    try {
      const session = await supabase.auth.getSession()
      const token = session?.data?.session?.access_token

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success && data.url) {
        track(TelemetryEvents.SUBSCRIPTION_STARTED)
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to create checkout session')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handlePortal() {
    setLoading(true)
    setError('')

    try {
      const session = await supabase.auth.getSession()
      const token = session?.data?.session?.access_token

      const response = await fetch('/api/portal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success && data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to open billing portal')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Layout title="Billing" menu={menu}>
        <div className="card">
          <div className="h2">Sign in required</div>
          <p>Please sign in to manage your subscription.</p>
          <a href="/auth" className="btn">Sign In</a>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Billing" menu={menu}>
      <div className="grid">
        {/* Current Plan */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="h2">Current Plan</div>
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div className={`badge ${isPro ? 'blue' : 'gray'}`}>
                {subscription.plan.toUpperCase()}
              </div>
              <div style={{ fontSize: 14, color: '#9fb0d0' }}>
                Status: <span style={{ color: '#f2f6ff', fontWeight: 600 }}>
                  {subscription.status === 'active' ? 'Active' :
                   subscription.status === 'trialing' ? 'Trial' :
                   subscription.status === 'past_due' ? 'Payment Due' :
                   subscription.status === 'canceled' ? 'Canceled' :
                   'Free'}
                </span>
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

            {!isPro ? (
              <div>
                <p style={{ color: '#9fb0d0', marginBottom: 20 }}>
                  Upgrade to Pro to unlock advanced features including live data, holdings import, Loss Guard alerts, and more.
                </p>
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="btn"
                  style={{ background: 'linear-gradient(135deg, #4db5ff 0%, #7af0b2 100%)' }}
                >
                  {loading ? 'Loading...' : 'Upgrade to Pro - $12/month'}
                </button>
                <div style={{ fontSize: 12, color: '#6b7a99', marginTop: 12 }}>
                  14-day free trial • Cancel anytime
                </div>
              </div>
            ) : (
              <div>
                <p style={{ color: '#7af0b2', marginBottom: 20 }}>
                  ✓ You have access to all Pro features
                </p>
                <button
                  onClick={handlePortal}
                  disabled={loading}
                  className="btn"
                >
                  {loading ? 'Loading...' : 'Manage Subscription'}
                </button>
                <div style={{ fontSize: 12, color: '#6b7a99', marginTop: 12 }}>
                  Update payment method, view invoices, or cancel subscription
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="h2">Feature Comparison</div>
          <div style={{ overflowX: 'auto', marginTop: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: 12, textAlign: 'left', color: '#9fb0d0', fontSize: 13 }}>Feature</th>
                  <th style={{ padding: 12, textAlign: 'center', color: '#9fb0d0', fontSize: 13 }}>Free</th>
                  <th style={{ padding: 12, textAlign: 'center', color: '#4db5ff', fontSize: 13 }}>Pro</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: 12, color: '#f2f6ff' }}>Basic Planning</td>
                  <td style={{ padding: 12, textAlign: 'center', color: '#7af0b2' }}>✓</td>
                  <td style={{ padding: 12, textAlign: 'center', color: '#7af0b2' }}>✓</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: 12, color: '#f2f6ff' }}>Demo Data</td>
                  <td style={{ padding: 12, textAlign: 'center', color: '#7af0b2' }}>✓</td>
                  <td style={{ padding: 12, textAlign: 'center', color: '#7af0b2' }}>✓</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: 12, color: '#f2f6ff' }}>Live ETF Quotes</td>
                  <td style={{ padding: 12, textAlign: 'center', color: '#6b7a99' }}>—</td>
                  <td style={{ padding: 12, textAlign: 'center', color: '#7af0b2' }}>✓</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: 12, color: '#f2f6ff' }}>Holdings Import (CSV)</td>
                  <td style={{ padding: 12, textAlign: 'center', color: '#6b7a99' }}>—</td>
                  <td style={{ padding: 12, textAlign: 'center', color: '#7af0b2' }}>✓</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: 12, color: '#f2f6ff' }}>Loss Guard Alerts</td>
                  <td style={{ padding: 12, textAlign: 'center', color: '#6b7a99' }}>—</td>
                  <td style={{ padding: 12, textAlign: 'center', color: '#7af0b2' }}>✓</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: 12, color: '#f2f6ff' }}>Radar v2 (Macro Tilts)</td>
                  <td style={{ padding: 12, textAlign: 'center', color: '#6b7a99' }}>—</td>
                  <td style={{ padding: 12, textAlign: 'center', color: '#7af0b2' }}>✓</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: 12, color: '#f2f6ff' }}>PDF Exports</td>
                  <td style={{ padding: 12, textAlign: 'center', color: '#6b7a99' }}>—</td>
                  <td style={{ padding: 12, textAlign: 'center', color: '#7af0b2' }}>✓</td>
                </tr>
                <tr>
                  <td style={{ padding: 12, color: '#f2f6ff' }}>Priority Support</td>
                  <td style={{ padding: 12, textAlign: 'center', color: '#6b7a99' }}>—</td>
                  <td style={{ padding: 12, textAlign: 'center', color: '#7af0b2' }}>✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="card" style={{ gridColumn: '1 / -1', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ fontSize: 12, color: '#6b7a99', lineHeight: 1.6 }}>
            <strong style={{ color: '#9fb0d0' }}>Important:</strong> Wealth Builder provides general information only and is not financial advice. 
            We do not hold funds, place orders, or provide personal financial advice. All investment decisions are your own responsibility. 
            Subscriptions can be canceled anytime through the billing portal.
          </div>
        </div>
      </div>
    </Layout>
  )
}

