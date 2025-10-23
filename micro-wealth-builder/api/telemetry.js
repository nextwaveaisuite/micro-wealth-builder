// micro-wealth-builder/api/telemetry.js
// Vercel Serverless Function - Telemetry & Analytics

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { events } = req.body

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: 'Events array required' })
    }

    // Get user if authenticated (optional for telemetry)
    let userId = null
    const authHeader = req.headers.authorization
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)
      userId = user?.id || null
    }

    // Prepare events for insertion
    const telemetryEvents = events.map(event => ({
      event_type: event.type,
      user_id: userId,
      metadata: event.metadata || {},
      created_at: new Date().toISOString()
    }))

    // Insert events
    const { error } = await supabase
      .from('telemetry_events')
      .insert(telemetryEvents)

    if (error) throw error

    return res.status(200).json({
      success: true,
      recorded: telemetryEvents.length
    })

  } catch (error) {
    console.error('Telemetry API error:', error)
    return res.status(500).json({
      error: 'Failed to record telemetry',
      message: error.message
    })
  }
}

