import universe from '../data/universe.json';
import rules from '../data/rules.json';

/**
 * Score assets based on rules and user's risk profile
 */
export function scoreAssets(assets, riskBand) {
  const config = rules.risk_bands[riskBand];
  const weights = config.weights;

  // Normalize values for scoring
  const maxFee = Math.max(...assets.map(a => a.mgmt_fee_bps));
  const maxVol = Math.max(...assets.map(a => a.volatility_3y));
  const maxDD = Math.max(...assets.map(a => Math.abs(a.max_drawdown_10y)));
  const maxYield = Math.max(...assets.map(a => a.dividend_yield_12m));
  const maxAUM = Math.max(...assets.map(a => a.aum));

  return assets.map(asset => {
    // Calculate individual component scores (0-1, higher is better)
    const diversificationScore = 0.7; // Simplified - would calculate correlation in real version
    const feeScore = 1 - (asset.mgmt_fee_bps / maxFee);
    const volatilityScore = 1 - (asset.volatility_3y / maxVol);
    const drawdownScore = 1 - (Math.abs(asset.max_drawdown_10y) / maxDD);
    const incomeScore = asset.dividend_yield_12m / maxYield;
    const qualityScore = asset.aum / maxAUM;

    // Weighted composite score
    const score = 
      weights.diversification * diversificationScore +
      weights.fee * feeScore +
      weights.volatility * volatilityScore +
      weights.drawdown * drawdownScore +
      weights.income * incomeScore +
      weights.quality * qualityScore;

    return {
      ...asset,
      score: score,
      components: {
        diversification: diversificationScore,
        fee: feeScore,
        volatility: volatilityScore,
        drawdown: drawdownScore,
        income: incomeScore,
        quality: qualityScore
      }
    };
  }).sort((a, b) => b.score - a.score);
}

/**
 * Calculate current portfolio allocation
 */
export function calculateAllocation(holdings) {
  const total = holdings.reduce((sum, h) => sum + h.value, 0);
  if (total === 0) return { growth: 0, safety: 0 };

  let growthValue = 0;
  let safetyValue = 0;

  holdings.forEach(holding => {
    const asset = universe.find(a => a.ticker === holding.ticker);
    if (!asset) return;

    if (asset.category === 'growth') {
      growthValue += holding.value;
    } else if (asset.category === 'safety') {
      safetyValue += holding.value;
    } else if (asset.category === 'bundle') {
      // Bundles are treated as mixed (70% growth, 30% safety assumption)
      growthValue += holding.value * 0.7;
      safetyValue += holding.value * 0.3;
    }
  });

  return {
    growth: growthValue / total,
    safety: safetyValue / total,
    total: total
  };
}

/**
 * Generate order plan for next contribution
 */
export function generateOrderPlan(userSettings, holdings) {
  const { riskBand, contribution, buyTheDip } = userSettings;
  const config = rules.risk_bands[riskBand];
  
  // Calculate current allocation
  const currentAlloc = calculateAllocation(holdings);
  const targetAlloc = config.target;
  
  // Calculate drift
  const drift = {
    growth: currentAlloc.growth - targetAlloc.growth,
    safety: currentAlloc.safety - targetAlloc.safety
  };

  // Base contribution amount
  let totalAmount = contribution.amount;
  
  // Add buy-the-dip extra if enabled and triggered
  let dipExtra = 0;
  if (buyTheDip?.enabled && buyTheDip?.triggered) {
    dipExtra = buyTheDip.extraAmount || 0;
    totalAmount += dipExtra;
  }

  // Determine how to split the contribution to rebalance toward target
  let growthAmount = totalAmount * targetAlloc.growth;
  let safetyAmount = totalAmount * targetAlloc.safety;

  // Adjust based on drift - if growth is underweight, allocate more there
  if (drift.growth < 0) {
    const rebalanceBoost = Math.min(Math.abs(drift.growth) * totalAmount, totalAmount * 0.3);
    growthAmount += rebalanceBoost;
    safetyAmount -= rebalanceBoost;
  } else if (drift.safety < 0) {
    const rebalanceBoost = Math.min(Math.abs(drift.safety) * totalAmount, totalAmount * 0.3);
    safetyAmount += rebalanceBoost;
    growthAmount -= rebalanceBoost;
  }

  // Get scored assets
  const growthAssets = scoreAssets(
    universe.filter(a => a.eligible && a.category === 'growth'),
    riskBand
  );
  const safetyAssets = scoreAssets(
    universe.filter(a => a.eligible && a.category === 'safety'),
    riskBand
  );

  // Allocate within each sleeve (top 2-3 assets proportionally)
  const orders = [];
  
  // Growth allocation
  if (growthAmount > 0 && growthAssets.length > 0) {
    const topGrowth = growthAssets.slice(0, 3);
    const totalScore = topGrowth.reduce((sum, a) => sum + a.score, 0);
    
    topGrowth.forEach(asset => {
      const allocation = (asset.score / totalScore) * growthAmount;
      if (allocation >= 5) { // Minimum $5 per order
        orders.push({
          ticker: asset.ticker,
          name: asset.name,
          amount: Math.round(allocation * 100) / 100,
          category: asset.category,
          reason: drift.growth < 0 ? 'Rebalancing toward growth target' : 'Regular DCA'
        });
      }
    });
  }

  // Safety allocation
  if (safetyAmount > 0 && safetyAssets.length > 0) {
    const topSafety = safetyAssets.slice(0, 2);
    const totalScore = topSafety.reduce((sum, a) => sum + a.score, 0);
    
    topSafety.forEach(asset => {
      const allocation = (asset.score / totalScore) * safetyAmount;
      if (allocation >= 5) { // Minimum $5 per order
        orders.push({
          ticker: asset.ticker,
          name: asset.name,
          amount: Math.round(allocation * 100) / 100,
          category: asset.category,
          reason: drift.safety < 0 ? 'Rebalancing toward safety target' : 'Regular DCA'
        });
      }
    });
  }

  return {
    orders,
    totalAmount,
    dipExtra,
    drift,
    nextRunDate: getNextContributionDate(contribution.cadence)
  };
}

/**
 * Calculate next contribution date
 */
function getNextContributionDate(cadence) {
  const now = new Date();
  const next = new Date(now);
  
  switch (cadence) {
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'fortnightly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      next.setDate(next.getDate() + 7);
  }
  
  return next.toISOString().split('T')[0];
}

/**
 * Check if rebalancing is needed
 */
export function checkRebalanceNeeded(holdings, riskBand, lastRebalanceDate) {
  const config = rules.risk_bands[riskBand];
  const currentAlloc = calculateAllocation(holdings);
  const targetAlloc = config.target;
  
  // Check drift threshold
  const growthDrift = Math.abs(currentAlloc.growth - targetAlloc.growth);
  const safetyDrift = Math.abs(currentAlloc.safety - targetAlloc.safety);
  const maxDrift = Math.max(growthDrift, safetyDrift);
  
  const driftExceeded = maxDrift > config.drift_trigger;
  
  // Check time-based cadence
  const monthsSinceRebalance = lastRebalanceDate 
    ? (Date.now() - new Date(lastRebalanceDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
    : 999;
  const cadenceExceeded = monthsSinceRebalance >= rules.rebalancing.hard_cadence_months;
  
  return {
    needed: driftExceeded || cadenceExceeded,
    reason: driftExceeded ? 'Drift threshold exceeded' : cadenceExceeded ? 'Time-based rebalance due' : null,
    maxDrift,
    monthsSinceRebalance: Math.floor(monthsSinceRebalance)
  };
}

/**
 * Project future value with compound growth
 */
export function projectFutureValue(currentValue, monthlyContribution, annualReturn, years) {
  const monthlyRate = annualReturn / 12;
  const months = years * 12;
  
  // Future value of current holdings
  const fvCurrent = currentValue * Math.pow(1 + monthlyRate, months);
  
  // Future value of monthly contributions (annuity)
  const fvContributions = monthlyContribution * 
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  
  return fvCurrent + fvContributions;
}

/**
 * Simulate crash and recovery scenarios
 */
export function simulateCrashRecovery(initialValue, monthlyContribution, crashPercent, recoveryMonths) {
  const timeline = [];
  let value = initialValue;
  const monthlyReturn = 0.07 / 12; // 7% annual
  
  // Pre-crash growth (6 months)
  for (let i = 0; i < 6; i++) {
    value = value * (1 + monthlyReturn) + monthlyContribution;
    timeline.push({ month: i, value, phase: 'growth' });
  }
  
  // Crash (instant)
  value = value * (1 + crashPercent);
  timeline.push({ month: 6, value, phase: 'crash' });
  
  // Recovery with continued contributions
  for (let i = 7; i < 6 + recoveryMonths; i++) {
    value = value * (1 + monthlyReturn * 1.2) + monthlyContribution; // Faster recovery
    timeline.push({ month: i, value, phase: 'recovery' });
  }
  
  // Post-recovery growth
  for (let i = 6 + recoveryMonths; i < 60; i++) {
    value = value * (1 + monthlyReturn) + monthlyContribution;
    timeline.push({ month: i, value, phase: 'growth' });
  }
  
  return timeline;
}

