// micro-wealth-builder/src/lib/radar.js
// Radar v2 - Macro Stress & Opportunity Tilts

/**
 * Calculate macro stress score based on market indicators
 * @param {Object} indicators - { vix, equityDrop, bondYield }
 * @returns {Object} { score: number, level: string, reason: string }
 */
export function calculateMacroStress(indicators = {}) {
  const {
    vix = 15, // VIX index (volatility)
    equityDrop = 0, // % drop in major index over last week
    bondYield = 4 // 10Y treasury yield
  } = indicators

  let score = 0
  const reasons = []

  // VIX scoring (0-100)
  if (vix > 30) {
    score += 40
    reasons.push(`High volatility (VIX ${vix.toFixed(1)})`)
  } else if (vix > 20) {
    score += 20
    reasons.push(`Elevated volatility (VIX ${vix.toFixed(1)})`)
  }

  // Equity drop scoring
  if (equityDrop < -5) {
    score += 30
    reasons.push(`Significant equity drop (${equityDrop.toFixed(1)}%)`)
  } else if (equityDrop < -2) {
    score += 15
    reasons.push(`Moderate equity drop (${equityDrop.toFixed(1)}%)`)
  }

  // Bond yield inversion or spike
  if (bondYield > 5) {
    score += 20
    reasons.push(`High bond yields (${bondYield.toFixed(1)}%)`)
  }

  // Determine stress level
  let level = 'low'
  if (score >= 60) level = 'high'
  else if (score >= 30) level = 'medium'

  return {
    score: Math.min(100, score),
    level,
    reason: reasons.length > 0 ? reasons.join('; ') : 'Markets stable',
    indicators: { vix, equityDrop, bondYield }
  }
}

/**
 * Calculate recommended tilt based on macro stress
 * @param {Object} stress - Output from calculateMacroStress
 * @param {Object} config - { btdEnabled, maxTiltAmount, monthlyCapUsed }
 * @returns {Object} { amount: number, direction: string, reason: string }
 */
export function calculateTilt(stress, config = {}) {
  const {
    btdEnabled = false,
    maxTiltAmount = 10,
    monthlyCapUsed = 0,
    monthlyCap = 80
  } = config

  // Check if we've hit monthly cap
  if (monthlyCapUsed >= monthlyCap) {
    return {
      amount: 0,
      direction: 'none',
      reason: `Monthly tilt cap reached ($${monthlyCapUsed}/$${monthlyCap})`
    }
  }

  // High stress → tilt to safety
  if (stress.level === 'high') {
    const amount = Math.min(maxTiltAmount, monthlyCap - monthlyCapUsed)
    return {
      amount,
      direction: 'safety',
      reason: `High macro stress detected → add $${amount} to Safety`,
      stressScore: stress.score
    }
  }

  // Medium stress + BTD enabled → small tilt to growth (buy the dip)
  if (stress.level === 'medium' && btdEnabled && stress.indicators.equityDrop < -3) {
    const amount = Math.min(maxTiltAmount, monthlyCap - monthlyCapUsed)
    return {
      amount,
      direction: 'growth',
      reason: `BTD active: Market dip detected → add $${amount} to Growth`,
      stressScore: stress.score
    }
  }

  // Low stress → no tilt
  return {
    amount: 0,
    direction: 'none',
    reason: 'No tilt recommended (markets stable)',
    stressScore: stress.score
  }
}

/**
 * Get simulated market indicators (for demo)
 * In production, fetch from a real API
 * @returns {Object} { vix, equityDrop, bondYield }
 */
export function getMarketIndicators() {
  // Demo values - replace with real API calls
  // Example: fetch from Yahoo Finance, Alpha Vantage, or FRED API
  
  // Simulate some variability
  const baseVix = 15
  const vixVariation = (Math.random() - 0.5) * 10
  
  return {
    vix: Math.max(10, baseVix + vixVariation),
    equityDrop: (Math.random() - 0.7) * 5, // Slight negative bias
    bondYield: 4 + (Math.random() - 0.5) * 0.5,
    timestamp: new Date().toISOString()
  }
}

/**
 * Run complete Radar analysis
 * @param {Object} config - { btdEnabled, maxTiltAmount, monthlyCapUsed }
 * @returns {Object} { stress, tilt, timestamp }
 */
export async function runRadar(config = {}) {
  // Get market indicators
  const indicators = getMarketIndicators()
  
  // Calculate macro stress
  const stress = calculateMacroStress(indicators)
  
  // Calculate recommended tilt
  const tilt = calculateTilt(stress, config)
  
  return {
    stress,
    tilt,
    timestamp: new Date().toISOString()
  }
}

/**
 * Format Radar output for display
 * @param {Object} radar - Output from runRadar
 * @returns {string} Human-readable summary
 */
export function formatRadarSummary(radar) {
  const { stress, tilt } = radar
  
  let summary = `Macro Stress: ${stress.level.toUpperCase()} (${stress.score}/100)\n`
  summary += `Reason: ${stress.reason}\n\n`
  
  if (tilt.amount > 0) {
    summary += `💡 Recommendation: ${tilt.reason}`
  } else {
    summary += `✓ ${tilt.reason}`
  }
  
  return summary
}

