/**
 * Generate demo performance data for ETFs
 */

// Historical performance data (demo - 12 months)
export function generatePerformanceData() {
  const months = 12;
  const data = [];
  
  // Starting values (normalized to 100)
  const baseValues = {
    'VAS.AX': 100,
    'VGS.AX': 100,
    'IVV.AX': 100,
    'VAF.AX': 100,
    'GOLD.AX': 100
  };
  
  // Monthly return patterns (annualized returns / 12)
  const monthlyReturns = {
    'VAS.AX': 0.008,  // ~9.6% annual
    'VGS.AX': 0.010,  // ~12% annual
    'IVV.AX': 0.0125, // ~15% annual
    'VAF.AX': 0.003,  // ~3.6% annual
    'GOLD.AX': 0.009  // ~10.8% annual
  };
  
  // Generate monthly data with some volatility
  for (let i = 0; i < months; i++) {
    const month = new Date();
    month.setMonth(month.getMonth() - (months - i - 1));
    const monthLabel = month.toLocaleDateString('en-AU', { month: 'short', year: '2-digit' });
    
    const dataPoint = { month: monthLabel };
    
    Object.keys(baseValues).forEach(ticker => {
      // Add some random volatility
      const volatility = (Math.random() - 0.5) * 0.04; // ±2% random
      const monthReturn = monthlyReturns[ticker] + volatility;
      baseValues[ticker] *= (1 + monthReturn);
      dataPoint[ticker] = Math.round(baseValues[ticker] * 100) / 100;
    });
    
    data.push(dataPoint);
  }
  
  return data;
}

/**
 * Calculate P/L for each ETF
 */
export function calculatePL(performanceData) {
  if (!performanceData || performanceData.length === 0) return [];
  
  const firstMonth = performanceData[0];
  const lastMonth = performanceData[performanceData.length - 1];
  
  const tickers = ['VAS.AX', 'VGS.AX', 'IVV.AX', 'VAF.AX', 'GOLD.AX'];
  const tickerNames = {
    'VAS.AX': 'VAS',
    'VGS.AX': 'VGS',
    'IVV.AX': 'IVV',
    'VAF.AX': 'VAF',
    'GOLD.AX': 'GOLD'
  };
  
  const pl = tickers.map(ticker => {
    const firstValue = firstMonth[ticker];
    const lastValue = lastMonth[ticker];
    const change = lastValue - firstValue;
    const changePercent = (change / firstValue) * 100;
    
    return {
      ticker: tickerNames[ticker],
      fullTicker: ticker,
      firstValue,
      lastValue,
      change,
      changePercent,
      isPositive: change >= 0
    };
  });
  
  // Sort by performance (best to worst)
  return pl.sort((a, b) => b.changePercent - a.changePercent);
}

/**
 * Generate planned buys with priority
 */
export function generatePlannedBuys(orderPlan) {
  if (!orderPlan || !orderPlan.orders) return [];
  
  const fees = {
    'VAS': 0.10,
    'VGS': 0.18,
    'IVV': 0.04,
    'VAF': 0.20,
    'GOLD': 0.40
  };
  
  // Group by sleeve
  const growthOrders = orderPlan.orders.filter(o => o.category === 'growth');
  const safetyOrders = orderPlan.orders.filter(o => o.category === 'safety');
  
  // Find lowest fee in each sleeve
  const lowestGrowthFee = Math.min(...growthOrders.map(o => fees[o.ticker] || 999));
  const lowestSafetyFee = Math.min(...safetyOrders.map(o => fees[o.ticker] || 999));
  
  return orderPlan.orders.map(order => {
    const fee = fees[order.ticker] || 0;
    const isLowestInSleeve = (order.category === 'growth' && fee === lowestGrowthFee) ||
                             (order.category === 'safety' && fee === lowestSafetyFee);
    
    return {
      ...order,
      fee,
      priority: isLowestInSleeve ? 'high' : 'normal',
      sleeve: order.category
    };
  });
}

/**
 * Get ETF colors for charts
 */
export const ETF_COLORS = {
  'VAS.AX': '#2563eb', // blue
  'VGS.AX': '#7c3aed', // purple
  'IVV.AX': '#db2777', // pink
  'VAF.AX': '#ea580c', // orange
  'GOLD.AX': '#ca8a04'  // yellow
};

