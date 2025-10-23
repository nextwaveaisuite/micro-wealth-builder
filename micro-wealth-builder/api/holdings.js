// micro-wealth-builder/api/holdings.js
// Vercel Serverless Function - Holdings Import & Management

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Parse CSV content
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) throw new Error('CSV must have headers and at least one row')
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  const rows = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    const row = {}
    headers.forEach((h, idx) => {
      row[h] = values[idx] || ''
    })
    rows.push(row)
  }
  
  return rows
}

// Normalize different broker CSV formats
function normalizeHoldings(rows, provider = 'unknown') {
  const holdings = []
  
  for (const row of rows) {
    let ticker, units, costBase
    
    // CommSec format
    if (row.code || row.ticker || row.symbol) {
      ticker = row.code || row.ticker || row.symbol
      units = parseFloat(row.units || row.quantity || row.shares || 0)
      costBase = parseFloat(row['cost base'] || row.costbase || row['average price'] || row.cost || 0)
    }
    // SelfWealth format
    else if (row.stock || row.security) {
      ticker = row.stock || row.security
      units = parseFloat(row.quantity || row.units || 0)
      costBase = parseFloat(row['avg cost'] || row['average cost'] || row.cost || 0)
    }
    // Generic format
    else {
      // Try to find ticker in first column
      const firstCol = Object.values(row)[0]
      if (firstCol && firstCol.match(/^[A-Z]{3,5}(\.AX)?$/)) {
        ticker = firstCol
        units = parseFloat(Object.values(row)[1] || 0)
        costBase = parseFloat(Object.values(row)[2] || 0)
      } else {
        continue // Skip invalid rows
      }
    }
    
    // Normalize ticker (add .AX if missing for ASX stocks)
    if (ticker && !ticker.includes('.')) {
      ticker = `${ticker}.AX`
    }
    
    if (ticker && units > 0 && costBase > 0) {
      holdings.push({
        ticker: ticker.toUpperCase(),
        units: Number(units.toFixed(6)),
        cost_base: Number(costBase.toFixed(2)),
        provider
      })
    }
  }
  
  return holdings
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    // Get user from auth header
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing authorization header' })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // GET - Fetch user's holdings
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('user_holdings')
        .select('*')
        .eq('user_id', user.id)
        .order('ticker', { ascending: true })

      if (error) throw error

      return res.status(200).json({
        success: true,
        holdings: data || []
      })
    }

    // POST - Import holdings from CSV
    if (req.method === 'POST') {
      const { csv, provider = 'unknown' } = req.body

      if (!csv) {
        return res.status(400).json({ error: 'CSV content required' })
      }

      // Parse and normalize
      const rows = parseCSV(csv)
      const holdings = normalizeHoldings(rows, provider)

      if (holdings.length === 0) {
        return res.status(400).json({ 
          error: 'No valid holdings found in CSV',
          hint: 'CSV should have columns: ticker/code, units/quantity, cost_base/cost'
        })
      }

      // Delete existing holdings for this user
      await supabase
        .from('user_holdings')
        .delete()
        .eq('user_id', user.id)

      // Insert new holdings
      const holdingsWithUser = holdings.map(h => ({
        ...h,
        user_id: user.id
      }))

      const { data, error } = await supabase
        .from('user_holdings')
        .insert(holdingsWithUser)
        .select()

      if (error) throw error

      return res.status(200).json({
        success: true,
        imported: data.length,
        holdings: data
      })
    }

    // DELETE - Clear all holdings
    if (req.method === 'DELETE') {
      const { error } = await supabase
        .from('user_holdings')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error

      return res.status(200).json({
        success: true,
        message: 'Holdings cleared'
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    console.error('Holdings API error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
}

