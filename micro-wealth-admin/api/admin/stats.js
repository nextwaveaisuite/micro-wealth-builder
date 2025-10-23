// micro-wealth-admin/api/admin/stats.js
// Admin Dashboard Statistics

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Verify admin token from cookie or header
function verifyAdmin(req) {
  const token = req.cookies?.admin_token || req.headers['x-admin-token']
  return token === process.env.ADMIN_TOKEN
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify admin access
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Get Pro users
    const { count: proUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .in('subscription_status', ['active', 'trialing'])
      .in('plan', ['pro', 'premium'])

    // Get new users this week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const { count: newUsersThisWeek } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneWeekAgo.toISOString())

    // Calculate MRR (assuming $12/month per Pro user)
    const mrr = (proUsers || 0) * 12

    // Get holdings import count
    const { count: holdingsImported } = await supabase
      .from('user_holdings')
      .select('user_id', { count: 'exact', head: true })

    // Get recent telemetry events (last 24 hours, grouped)
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const { data: recentEvents } = await supabase
      .from('telemetry_events')
      .select('event_type, created_at')
      .gte('created_at', oneDayAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(1000)

    // Group events by type
    const eventCounts = {}
    const eventLastSeen = {}
    
    recentEvents?.forEach(event => {
      eventCounts[event.event_type] = (eventCounts[event.event_type] || 0) + 1
      if (!eventLastSeen[event.event_type] || event.created_at > eventLastSeen[event.event_type]) {
        eventLastSeen[event.event_type] = event.created_at
      }
    })

    const recentEventsGrouped = Object.keys(eventCounts).map(type => ({
      event_type: type,
      count: eventCounts[type],
      last_seen: eventLastSeen[type]
    })).sort((a, b) => b.count - a.count).slice(0, 10)

    // Get Loss Guard events (last 7 days, grouped)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: lossGuardEvents } = await supabase
      .from('guardrail_events')
      .select('event_type, created_at')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })

    // Group Loss Guard events
    const lgEventCounts = {}
    const lgEventLastTrigger = {}
    
    lossGuardEvents?.forEach(event => {
      lgEventCounts[event.event_type] = (lgEventCounts[event.event_type] || 0) + 1
      if (!lgEventLastTrigger[event.event_type] || event.created_at > lgEventLastTrigger[event.event_type]) {
        lgEventLastTrigger[event.event_type] = event.created_at
      }
    })

    const lossGuardEventsGrouped = Object.keys(lgEventCounts).map(type => ({
      event_type: type,
      count: lgEventCounts[type],
      last_trigger: lgEventLastTrigger[type]
    })).sort((a, b) => b.count - a.count)

    return res.status(200).json({
      totalUsers: totalUsers || 0,
      proUsers: proUsers || 0,
      newUsersThisWeek: newUsersThisWeek || 0,
      mrr,
      holdingsImported: holdingsImported || 0,
      recentEvents: recentEventsGrouped,
      lossGuardEvents: lossGuardEventsGrouped,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Admin stats error:', error)
    return res.status(500).json({
      error: 'Failed to load stats',
      message: error.message
    })
  }
}

