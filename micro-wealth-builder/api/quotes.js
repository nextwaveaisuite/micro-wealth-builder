// micro-wealth-builder/api/quotes.js
// Vercel Serverless Function - Live ETF Quotes

import { createClient } from '@supabase/supabase-js'

// Yahoo Finance API helper (free, delayed 15min)
async function fetchYahooQuote(ticker) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1y`
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    
    if (!response.ok) throw new Error(`Yahoo API error: ${response.status}`)
    
    const json = await response.json()
    const result = json.chart?.result?.[0]
    
    if (!result) throw new Error('No data returned')
    
    const meta = result.meta
    const timestamps = result.timestamp || []
    const quotes = result.indicators?.quote?.[0] || {}
    const closes = quotes.close || []
    
    // Get latest close price
    const latestPrice = meta.regularMarketPrice || closes[closes.length - 1]
    const previousClose = meta.previousClose || closes[closes.length - 2] || latestPrice
    const change = latestPrice - previousClose
    const changePct = (change / previousClose) * 100
    
    // Build historical series (last 12 months, monthly closes)
    const monthlyData = []
    if (timestamps.length > 0) {
      const now = Date.now() / 1000
      const oneMonth = 30 * 24 * 60 * 60
      
      for (let i = 11; i >= 0; i--) {
        const targetTime = now - (i * oneMonth)
        // Find closest timestamp
        let closestIdx = 0
        let closestDiff = Math.abs(timestamps[0] - targetTime)
        
        for (let j = 1; j < timestamps.length; j++) {
          const diff = Math.abs(timestamps[j] - targetTime)
          if (diff < closestDiff) {
            closestDiff = diff
            closestIdx = j
          }
        }
        
        const price = closes[closestIdx]
        if (price) monthlyData.push(Number(price.toFixed(2)))
      }
    }
    
    return {
      ticker,
      price: Number(latestPrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePct: Number(changePct.toFixed(2)),
      currency: meta.currency || 'AUD',
      series: monthlyData,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error(`Error fetching ${ticker}:`, error.message)
    return null
  }
}

// Cache quotes in Supabase for 15 minutes
async function getCachedQuote(supabase, ticker) {
  const { data, error } = await supabase
    .from('quote_cache')
    .select('*')
    .eq('ticker', ticker)
    .single()
  
  if (error || !data) return null
  
  const age = Date.now() - new Date(data.updated_at).getTime()
  const fifteenMinutes = 15 * 60 * 1000
  
  if (age < fifteenMinutes) {
    return data
  }
  
  return null
}

async function setCachedQuote(supabase, quote) {
  await supabase
    .from('quote_cache')
    .upsert({
      ticker: quote.ticker,
      price: quote.price,
      change_pct: quote.changePct,
      volume: 0,
      updated_at: new Date().toISOString()
    })
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get tickers from query param (comma-separated)
    const tickers = req.query.tickers?.split(',') || ['VAS.AX', 'VGS.AX', 'IVV.AX', 'VAF.AX', 'GOLD.AX']
    
    // Initialize Supabase (for caching)
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY
    const supabase = supabaseUrl && supabaseKey 
      ? createClient(supabaseUrl, supabaseKey)
      : null

    const quotes = []
    
    for (const ticker of tickers) {
      // Try cache first
      if (supabase) {
        const cached = await getCachedQuote(supabase, ticker)
        if (cached) {
          quotes.push({
            ticker: cached.ticker,
            price: Number(cached.price),
            changePct: Number(cached.change_pct),
            cached: true
          })
          continue
        }
      }
      
      // Fetch fresh data
      const quote = await fetchYahooQuote(ticker)
      if (quote) {
        quotes.push(quote)
        
        // Cache it
        if (supabase) {
          await setCachedQuote(supabase, quote)
        }
      }
    }

    return res.status(200).json({
      success: true,
      quotes,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Quotes API error:', error)
    return res.status(500).json({
      error: 'Failed to fetch quotes',
      message: error.message
    })
  }
}

