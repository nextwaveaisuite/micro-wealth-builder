// micro-wealth-builder/src/hooks/useQuotes.js
import { useState, useEffect } from 'react'

const QUOTES_ENDPOINT = '/api/quotes'
const DEFAULT_TICKERS = ['VAS.AX', 'VGS.AX', 'IVV.AX', 'VAF.AX', 'GOLD.AX']

export function useQuotes(tickers = DEFAULT_TICKERS) {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchQuotes()
    
    // Refresh every 15 minutes
    const interval = setInterval(fetchQuotes, 15 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [tickers.join(',')])

  async function fetchQuotes() {
    try {
      setLoading(true)
      setError(null)

      const tickersParam = tickers.join(',')
      const response = await fetch(`${QUOTES_ENDPOINT}?tickers=${tickersParam}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setQuotes(data.quotes || [])
      } else {
        throw new Error(data.error || 'Failed to fetch quotes')
      }
    } catch (err) {
      console.error('Error fetching quotes:', err)
      setError(err.message)
      // Use demo data as fallback
      setQuotes(generateDemoQuotes(tickers))
    } finally {
      setLoading(false)
    }
  }

  return { quotes, loading, error, refresh: fetchQuotes }
}

// Fallback demo data generator
function generateDemoQuotes(tickers) {
  return tickers.map(ticker => ({
    ticker,
    price: 100 + Math.random() * 50,
    changePct: (Math.random() - 0.5) * 5,
    cached: false,
    demo: true
  }))
}

// Helper to get quote by ticker
export function getQuoteByTicker(quotes, ticker) {
  return quotes.find(q => q.ticker === ticker)
}

// Helper to calculate portfolio value
export function calculatePortfolioValue(holdings, quotes) {
  return holdings.reduce((total, holding) => {
    const quote = getQuoteByTicker(quotes, holding.ticker)
    if (quote) {
      return total + (holding.units * quote.price)
    }
    return total + (holding.units * holding.cost_base) // Fallback to cost base
  }, 0)
}

// Helper to calculate P/L
export function calculatePL(holdings, quotes) {
  let totalCost = 0
  let totalValue = 0

  holdings.forEach(holding => {
    const cost = holding.units * holding.cost_base
    totalCost += cost

    const quote = getQuoteByTicker(quotes, holding.ticker)
    const value = quote ? holding.units * quote.price : cost
    totalValue += value
  })

  const pl = totalValue - totalCost
  const plPct = totalCost > 0 ? (pl / totalCost) * 100 : 0

  return {
    totalCost,
    totalValue,
    pl,
    plPct
  }
}

