// micro-wealth-builder/src/hooks/useTelemetry.js
import { useCallback } from 'react'
import { supabase } from '../lib/supabase'

const TELEMETRY_ENDPOINT = '/api/telemetry'

// Event queue for batching
let eventQueue = []
let flushTimer = null

export function useTelemetry() {
  const track = useCallback(async (eventType, metadata = {}) => {
    // Add to queue
    eventQueue.push({
      type: eventType,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        url: window.location.pathname
      }
    })

    // Flush queue after 5 seconds or when it reaches 10 events
    if (eventQueue.length >= 10) {
      await flushEvents()
    } else {
      if (flushTimer) clearTimeout(flushTimer)
      flushTimer = setTimeout(flushEvents, 5000)
    }
  }, [])

  return { track }
}

async function flushEvents() {
  if (eventQueue.length === 0) return

  const events = [...eventQueue]
  eventQueue = []

  try {
    // Get auth token if available
    const session = supabase ? await supabase.auth.getSession() : null
    const token = session?.data?.session?.access_token

    const headers = {
      'Content-Type': 'application/json'
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    await fetch(TELEMETRY_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({ events })
    })
  } catch (error) {
    console.error('Failed to send telemetry:', error)
    // Don't throw - telemetry failures should be silent
  }
}

// Flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (eventQueue.length > 0) {
      // Use sendBeacon for reliable delivery on page unload
      const session = supabase?.auth?.getSession()
      const token = session?.data?.session?.access_token

      const headers = {
        type: 'application/json'
      }

      const blob = new Blob([JSON.stringify({ events: eventQueue })], headers)
      
      navigator.sendBeacon(TELEMETRY_ENDPOINT, blob)
      eventQueue = []
    }
  })
}

// Common event types (for consistency)
export const TelemetryEvents = {
  APP_OPENED: 'app_opened',
  PAGE_VIEW: 'page_view',
  PLAN_GENERATED: 'plan_generated',
  HOLDINGS_IMPORTED: 'holdings_imported',
  WITHDRAW_PLANNED: 'withdraw_planned',
  SETTINGS_UPDATED: 'settings_updated',
  SUBSCRIPTION_STARTED: 'subscription_started',
  LOSS_GUARD_TRIGGERED: 'loss_guard_triggered',
  RADAR_TILT_APPLIED: 'radar_tilt_applied',
  EXPORT_CSV: 'export_csv',
  EXPORT_PDF: 'export_pdf'
}

