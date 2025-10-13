/**
 * Passive Income Calculator & Multi-Stream Income Tracking
 * Based on "Low-Hanging-Fruit" strategy
 */

// Income-focused assets
export const INCOME_ASSETS = {
  // Dividend ETFs
  'VAS.AX': {
    name: 'Vanguard Australian Shares',
    type: 'etf',
    yield: 0.038,
    category: 'dividend_etf',
    description: 'Auto-diversified, 300 companies'
  },
  'VGS.AX': {
    name: 'Vanguard Global Shares',
    type: 'etf',
    yield: 0.026,
    category: 'dividend_etf',
    description: 'Global safety & growth'
  },
  'VAF.AX': {
    name: 'Vanguard Australian Fixed Interest',
    type: 'etf',
    yield: 0.034,
    category: 'bond_etf',
    description: 'Stable bond income'
  },
  
  // Blue-Chip Dividend Stocks
  'CBA.AX': {
    name: 'Commonwealth Bank',
    type: 'stock',
    yield: 0.045,
    category: 'blue_chip',
    description: 'Strong dividend history'
  },
  'WES.AX': {
    name: 'Wesfarmers',
    type: 'stock',
    yield: 0.042,
    category: 'blue_chip',
    description: 'Retail conglomerate'
  },
  'TLS.AX': {
    name: 'Telstra',
    type: 'stock',
    yield: 0.055,
    category: 'blue_chip',
    description: 'Telecom leader'
  },
  'BHP.AX': {
    name: 'BHP Group',
    type: 'stock',
    yield: 0.06,
    category: 'blue_chip',
    description: 'Mining giant'
  },
  
  // Micro-investment apps
  'RAIZ': {
    name: 'Raiz',
    type: 'micro_app',
    yield: 0.05,
    category: 'micro_income',
    description: 'Round-up investing'
  },
  'SPACESHIP': {
    name: 'Spaceship',
    type: 'micro_app',
    yield: 0.08,
    category: 'micro_income',
    description: 'Tech-focused growth'
  },
  
  // Savings account
  'SAVINGS': {
    name: 'High-Yield Savings',
    type: 'savings',
    yield: 0.045,
    category: 'savings',
    description: 'Risk-free interest'
  }
};

/**
 * Calculate passive income from multiple streams
 */
export function calculatePassiveIncome(streams) {
  let totalMonthlyIncome = 0;
  const breakdown = [];
  
  streams.forEach(stream => {
    const asset = INCOME_ASSETS[stream.ticker];
    if (!asset) return;
    
    const annualIncome = stream.value * asset.yield;
    const monthlyIncome = annualIncome / 12;
    
    totalMonthlyIncome += monthlyIncome;
    
    breakdown.push({
      ticker: stream.ticker,
      name: asset.name,
      category: asset.category,
      value: stream.value,
      yield: asset.yield,
      monthlyIncome,
      annualIncome
    });
  });
  
  return {
    totalMonthlyIncome,
    totalAnnualIncome: totalMonthlyIncome * 12,
    breakdown: breakdown.sort((a, b) => b.monthlyIncome - a.monthlyIncome)
  };
}

/**
 * Project future passive income with compounding
 */
export function projectPassiveIncome(params) {
  const {
    startingInvestment,
    monthlyContribution,
    avgYield,
    years,
    reinvestDividends = true
  } = params;
  
  const months = years * 12;
  const monthlyYield = avgYield / 12;
  
  let value = startingInvestment;
  const timeline = [];
  
  for (let month = 0; month <= months; month++) {
    // Calculate income for this month
    const monthlyIncome = value * monthlyYield;
    
    // Add contribution
    value += monthlyContribution;
    
    // Reinvest dividends if enabled
    if (reinvestDividends) {
      value += monthlyIncome;
    }
    
    // Record data point every 3 months (quarterly)
    if (month % 3 === 0) {
      timeline.push({
        month,
        year: month / 12,
        value: Math.round(value),
        monthlyIncome: Math.round(monthlyIncome),
        annualIncome: Math.round(monthlyIncome * 12)
      });
    }
  }
  
  const finalData = timeline[timeline.length - 1];
  
  return {
    timeline,
    finalValue: finalData.value,
    finalMonthlyIncome: finalData.monthlyIncome,
    finalAnnualIncome: finalData.annualIncome,
    totalContributed: startingInvestment + (monthlyContribution * months),
    totalGrowth: finalData.value - (startingInvestment + monthlyContribution * months)
  };
}

/**
 * Calculate income required to reach target
 */
export function calculateIncomeTarget(targetMonthlyIncome, avgYield = 0.05) {
  const requiredCapital = (targetMonthlyIncome * 12) / avgYield;
  
  return {
    targetMonthlyIncome,
    targetAnnualIncome: targetMonthlyIncome * 12,
    requiredCapital: Math.round(requiredCapital),
    avgYield
  };
}

/**
 * Suggest income stream allocation
 */
export function suggestIncomeAllocation(totalCapital) {
  // Recommended allocation for passive income
  const allocation = {
    dividend_etf: 0.40,  // 40% in VAS/VGS
    bond_etf: 0.20,      // 20% in VAF
    blue_chip: 0.25,     // 25% in CBA/WES/TLS/BHP
    micro_income: 0.10,  // 10% in Raiz/Spaceship
    savings: 0.05        // 5% in high-yield savings
  };
  
  const suggestions = [];
  
  // Dividend ETFs
  suggestions.push({
    ticker: 'VAS.AX',
    amount: totalCapital * 0.25,
    expectedMonthlyIncome: (totalCapital * 0.25 * 0.038) / 12,
    category: 'dividend_etf'
  });
  suggestions.push({
    ticker: 'VGS.AX',
    amount: totalCapital * 0.15,
    expectedMonthlyIncome: (totalCapital * 0.15 * 0.026) / 12,
    category: 'dividend_etf'
  });
  
  // Bonds
  suggestions.push({
    ticker: 'VAF.AX',
    amount: totalCapital * 0.20,
    expectedMonthlyIncome: (totalCapital * 0.20 * 0.034) / 12,
    category: 'bond_etf'
  });
  
  // Blue chips
  suggestions.push({
    ticker: 'CBA.AX',
    amount: totalCapital * 0.10,
    expectedMonthlyIncome: (totalCapital * 0.10 * 0.045) / 12,
    category: 'blue_chip'
  });
  suggestions.push({
    ticker: 'WES.AX',
    amount: totalCapital * 0.08,
    expectedMonthlyIncome: (totalCapital * 0.08 * 0.042) / 12,
    category: 'blue_chip'
  });
  suggestions.push({
    ticker: 'TLS.AX',
    amount: totalCapital * 0.07,
    expectedMonthlyIncome: (totalCapital * 0.07 * 0.055) / 12,
    category: 'blue_chip'
  });
  
  // Micro apps
  suggestions.push({
    ticker: 'RAIZ',
    amount: totalCapital * 0.05,
    expectedMonthlyIncome: (totalCapital * 0.05 * 0.05) / 12,
    category: 'micro_income'
  });
  suggestions.push({
    ticker: 'SPACESHIP',
    amount: totalCapital * 0.05,
    expectedMonthlyIncome: (totalCapital * 0.05 * 0.08) / 12,
    category: 'micro_income'
  });
  
  // Savings
  suggestions.push({
    ticker: 'SAVINGS',
    amount: totalCapital * 0.05,
    expectedMonthlyIncome: (totalCapital * 0.05 * 0.045) / 12,
    category: 'savings'
  });
  
  const totalMonthlyIncome = suggestions.reduce((sum, s) => sum + s.expectedMonthlyIncome, 0);
  
  return {
    suggestions,
    totalMonthlyIncome: Math.round(totalMonthlyIncome),
    totalAnnualIncome: Math.round(totalMonthlyIncome * 12),
    allocation
  };
}

/**
 * Income milestones (common targets)
 */
export const INCOME_MILESTONES = [
  { monthly: 500, label: 'Coffee Money', capital: 120000, description: 'Cover daily expenses' },
  { monthly: 1000, label: 'Bill Payer', capital: 240000, description: 'Cover utilities & groceries' },
  { monthly: 2000, label: 'Rent Covered', capital: 480000, description: 'Cover housing costs' },
  { monthly: 3000, label: 'Basic Living', capital: 720000, description: 'Cover essential living' },
  { monthly: 5000, label: 'Comfortable Life', capital: 1200000, description: 'Live comfortably' },
  { monthly: 10000, label: 'Financial Freedom', capital: 2400000, description: 'Full financial independence' }
];

