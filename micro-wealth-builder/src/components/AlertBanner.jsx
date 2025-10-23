// micro-wealth-builder/src/components/AlertBanner.jsx
import React, { useState, useEffect } from 'react'

export function AlertBanner({ alerts = [], onDismiss }) {
  const [visible, setVisible] = useState({})

  useEffect(() => {
    // Show all alerts by default
    const initialVisible = {}
    alerts.forEach((alert, idx) => {
      initialVisible[idx] = true
    })
    setVisible(initialVisible)
  }, [alerts])

  function handleDismiss(idx) {
    setVisible(prev => ({ ...prev, [idx]: false }))
    if (onDismiss) {
      onDismiss(alerts[idx])
    }
  }

  const visibleAlerts = alerts.filter((_, idx) => visible[idx])

  if (visibleAlerts.length === 0) return null

  return (
    <div style={{ marginBottom: 20 }}>
      {visibleAlerts.map((alert, idx) => {
        const originalIdx = alerts.indexOf(alert)
        const severity = alert.severity || 'info'
        
        const colors = {
          high: { bg: 'rgba(255,107,107,0.1)', border: 'rgba(255,107,107,0.3)', text: '#ff6b6b' },
          medium: { bg: 'rgba(255,209,102,0.1)', border: 'rgba(255,209,102,0.3)', text: '#ffd166' },
          low: { bg: 'rgba(77,181,255,0.1)', border: 'rgba(77,181,255,0.3)', text: '#4db5ff' },
          info: { bg: 'rgba(159,176,208,0.1)', border: 'rgba(159,176,208,0.3)', text: '#9fb0d0' }
        }

        const color = colors[severity] || colors.info

        return (
          <div
            key={originalIdx}
            style={{
              padding: '16px',
              background: color.bg,
              border: `1px solid ${color.border}`,
              borderRadius: '8px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: color.text,
                marginBottom: '6px'
              }}>
                {alert.type === 'loss_guard_brake' && '🛡️ Loss Guard: Weekly Brake Triggered'}
                {alert.type === 'loss_guard_floor' && '⚠️ Loss Guard: Safety Floor Breach'}
                {alert.type === 'loss_guard_cap' && '📊 Loss Guard: Growth Cap Exceeded'}
                {alert.type === 'radar_tilt' && '🎯 Radar: Tilt Recommended'}
                {!alert.type && '📢 Alert'}
              </div>
              <div style={{
                fontSize: '13px',
                color: '#f2f6ff',
                lineHeight: '1.5'
              }}>
                {alert.reason || alert.message || 'No details available'}
              </div>
              {alert.dropPct !== undefined && (
                <div style={{
                  fontSize: '12px',
                  color: '#9fb0d0',
                  marginTop: '6px'
                }}>
                  Drop: {alert.dropPct.toFixed(1)}%
                </div>
              )}
              {alert.currentPct !== undefined && (
                <div style={{
                  fontSize: '12px',
                  color: '#9fb0d0',
                  marginTop: '6px'
                }}>
                  Current: {alert.currentPct.toFixed(1)}%
                </div>
              )}
            </div>
            <button
              onClick={() => handleDismiss(originalIdx)}
              style={{
                background: 'none',
                border: 'none',
                color: color.text,
                fontSize: '18px',
                cursor: 'pointer',
                padding: '0 8px',
                opacity: 0.6,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.opacity = 1}
              onMouseLeave={(e) => e.target.style.opacity = 0.6}
            >
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}

