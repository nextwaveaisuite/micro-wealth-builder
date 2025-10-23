// micro-wealth-admin/api/admin/config.js
// Admin Configuration Management

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Verify admin token
function verifyAdmin(req) {
  const token = req.cookies?.admin_token || req.headers['x-admin-token']
  return token === process.env.ADMIN_TOKEN
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Verify admin access
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // GET - Fetch current config
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('config')
        .select('*')
        .order('key', { ascending: true })

      if (error) throw error

      return res.status(200).json({
        success: true,
        config: data || []
      })
    }

    // PUT - Update config
    if (req.method === 'PUT') {
      const { config } = req.body

      if (!config || typeof config !== 'object') {
        return res.status(400).json({ error: 'Invalid config object' })
      }

      // Update each config key
      const updates = []
      for (const [key, value] of Object.entries(config)) {
        // Increment version
        const { data: current } = await supabase
          .from('config')
          .select('version')
          .eq('key', key)
          .single()

        const newVersion = (current?.version || 0) + 1

        updates.push(
          supabase
            .from('config')
            .update({
              value: String(value),
              version: newVersion,
              updated_at: new Date().toISOString(),
              updated_by: 'admin'
            })
            .eq('key', key)
        )
      }

      await Promise.all(updates)

      return res.status(200).json({
        success: true,
        message: 'Configuration updated'
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    console.error('Admin config error:', error)
    return res.status(500).json({
      error: 'Failed to manage config',
      message: error.message
    })
  }
}

