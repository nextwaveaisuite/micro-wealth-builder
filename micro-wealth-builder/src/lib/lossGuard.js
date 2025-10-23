// micro-wealth-builder/src/lib/lossGuard.js
// Loss Guard & Radar v2 Logic

/**
 * Calculate if weekly brake should trigger
 * @param {Array} historicalPrices - Array of {date, price} for the last 2 weeks
 * @returns {Object} { triggered: boolean, dropPct: number, reason: string }
 */
export function checkWeeklyBrake(historicalPrices) {
  if (!historicalPrices || historicalPrices.length < 2) {
    return { triggered: false, dropPct: 0, reason: 'Insufficient data' }
  }

  // Compare latest price to price from 7 days ago
  const latest = historicalPrices[historicalPrices.length - 1]
  const weekAgo = historicalPrices[Math.max(0, historicalPrices.length - 8)]

  const dropPct = ((latest.price - weekAgo.price) / weekAgo.price) * 100

  const triggered = dropPct <= -5 // Weekly brake threshold: -5%

  return {
    triggered,
    dropPct: Number(dropPct.toFixed(2)),
    reason: triggered 
      ? `Portfolio down ${Math.abs(dropPct).toFixed(1)}% this week → routing to Safety`
      : 'No significant drop detected'
  }
}

/**
 * Calculate if safety floor is breached
 * @param {number} safetyPct - Current safety allocation percentage
 * @param {number} floorPct - Minimum safety percentage (default 30%)
 * @returns {Object} { triggered: boolean, currentPct: number, reason: string }
 */
export function checkSafetyFloor(safetyPct, floorPct = 30) {
  const triggered = safetyPct < floorPct

  return {
    triggered,
    currentPct: Number(safetyPct.toFixed(1)),
    floorPct,
    reason: triggered
      ? `Safety allocation ${safetyPct.toFixed(1)}% < floor ${floorPct}% → redirect to Safety`
      : 'Safety floor maintained'
  }
}

/**
 * Calculate if growth cap is exceeded
 * @param {number} growthPct - Current growth allocation percentage
 * @param {number} targetPct - Target growth percentage (e.g., 70%)
 * @param {number} capPct - Maximum deviation above target (default 7%)
 * @returns {Object} { triggered: boolean, currentPct: number, reason: string }
 */
export function checkGrowthCap(growthPct, targetPct = 70, capPct = 7) {
  const maxAllowed = targetPct + capPct
  const triggered = growthPct > maxAllowed

  return {
    triggered,
    currentPct: Number(growthPct.toFixed(1)),
    maxAllowed,
    reason: triggered
      ? `Growth allocation ${growthPct.toFixed(1)}% > cap ${maxAllowed}% → redirect to Safety`
      : 'Growth cap not exceeded'
  }
}

/**
 * Calculate portfolio allocation percentages
 * @param {Array} holdings - Array of {ticker, units, cost_base}
 * @param {Array} quotes - Array of {ticker, price}
 * @param {Object} etfMap - Map of ticker to sleeve (growth/safety)
 * @returns {Object} { growthPct, safetyPct, growthValue, safetyValue, totalValue }
 */
export function calculateAllocation(holdings, quotes, etfMap = DEFAULT_ETF_MAP) {
  let growthValue = 0
  let safetyValue = 0

  holdings.forEach(holding => {
    const quote = quotes.find(q => q.ticker === holding.ticker)
    const price = quote?.price || holding.cost_base
    const value = holding.units * price

    const sleeve = etfMap[holding.ticker] || 'growth'
    if (sleeve === 'safety') {
      safetyValue += value
    } else {
      growthValue += value
    }
  })

  const totalValue = growthValue + safetyValue

  return {
    growthValue,
    safetyValue,
    totalValue,
    growthPct: totalValue > 0 ? (growthValue / totalValue) * 100 : 0,
    safetyPct: totalValue > 0 ? (safetyValue / totalValue) * 100 : 0
  }
}

/**
 * Run all Loss Guard checks
 * @param {Object} params - { holdings, quotes, historicalPrices, config }
 * @returns {Array} Array of triggered events
 */
export function runLossGuard({ holdings, quotes, historicalPrices, config = {} }) {
  const {
    safetyFloor = 30,
    growthTarget = 70,
    growthCap = 7
  } = config

  const events = []

  // Check weekly brake
  if (historicalPrices) {
    const brake = checkWeeklyBrake(historicalPrices)
    if (brake.triggered) {
      events.push({
        type: 'loss_guard_brake',
        severity: 'high',
        ...brake
      })
    }
  }

  // Check allocation if we have holdings
  if (holdings && holdings.length > 0 && quotes) {
    const allocation = calculateAllocation(holdings, quotes)

    // Check safety floor
    const floor = checkSafetyFloor(allocation.safetyPct, safetyFloor)
    if (floor.triggered) {
      events.push({
        type: 'loss_guard_floor',
        severity: 'medium',
        ...floor
      })
    }

    // Check growth cap
    const cap = checkGrowthCap(allocation.growthPct, growthTarget, growthCap)
    if (cap.triggered) {
      events.push({
        type: 'loss_guard_cap',
        severity: 'medium',
        ...cap
      })
    }
  }

  return events
}

// Default ETF sleeve mapping
export const DEFAULT_ETF_MAP = {
  'VAS.AX': 'growth',
  'VGS.AX': 'growth',
  'IVV.AX': 'growth',
  'VAF.AX': 'safety',
  'GOLD.AX': 'safety'
}

/**
 * Generate recommendation based on Loss Guard events
 * @param {Array} events - Array of Loss Guard events
 * @returns {string} Human-readable recommendation
 */
export function getLossGuardRecommendation(events) {
  if (events.length === 0) {
    return 'All systems normal. Continue with your planned allocation.'
  }

  const highSeverity = events.filter(e => e.severity === 'high')
  
  if (highSeverity.length > 0) {
    return 'ALERT: Route this week\'s contribution to Safety ETFs (VAF, GOLD) until conditions improve.'
  }

  return 'NOTICE: Consider adjusting your next contribution to rebalance toward Safety.'
}

