/**
 * Deep link URLs for micro-investing apps and brokers
 */

export const PROVIDERS = {
  raiz: {
    name: 'Raiz',
    url: 'https://raizinvest.com.au',
    appUrl: 'raiz://',
    description: 'Automated micro-investing with round-ups',
    minContribution: 5,
    color: 'purple',
    className: 'btn-raiz'
  },
  spaceship: {
    name: 'Spaceship Voyager',
    url: 'https://www.spaceship.com.au',
    appUrl: 'spaceship://',
    description: 'Tech-focused micro-investing',
    minContribution: 5,
    color: 'blue',
    className: 'btn-spaceship'
  },
  commsecPocket: {
    name: 'CommSec Pocket',
    url: 'https://www.commsec.com.au/pocket',
    appUrl: 'commsecpocket://',
    description: 'Simple investing with CommBank',
    minContribution: 50,
    color: 'yellow',
    className: 'btn-commsec-pocket'
  },
  stockspot: {
    name: 'Stockspot',
    url: 'https://www.stockspot.com.au',
    appUrl: 'stockspot://',
    description: 'Automated investing with expert portfolios',
    minContribution: 2000,
    color: 'green',
    className: 'btn-stockspot'
  },
  quietgrowth: {
    name: 'QuietGrowth',
    url: 'https://www.quietgrowth.com.au',
    appUrl: 'quietgrowth://',
    description: 'Low-cost automated portfolio management',
    minContribution: 10000,
    color: 'slate',
    className: 'btn-quietgrowth'
  },
  selfwealth: {
    name: 'SelfWealth',
    url: 'https://www.selfwealth.com.au',
    appUrl: 'selfwealth://',
    description: 'Low-cost online broker',
    minContribution: 100,
    color: 'teal',
    className: 'btn-selfwealth'
  },
  pearler: {
    name: 'Pearler',
    url: 'https://pearler.com',
    appUrl: 'pearler://',
    description: 'Long-term investing platform',
    minContribution: 100,
    color: 'indigo',
    className: 'btn-pearler'
  },
  commsec: {
    name: 'CommSec',
    url: 'https://www.commsec.com.au',
    appUrl: 'commsec://',
    description: 'Australia\'s leading online broker',
    minContribution: 500,
    color: 'orange',
    className: 'btn-commsec'
  }
};

/**
 * Open provider app or website
 */
export function openProvider(providerId) {
  const provider = PROVIDERS[providerId];
  if (!provider) {
    console.error('Unknown provider:', providerId);
    return;
  }

  // Try to open app first, fallback to web
  const appLink = provider.appUrl;
  const webLink = provider.url;

  // Create a hidden iframe to attempt app launch
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = appLink;
  document.body.appendChild(iframe);

  // Fallback to web after short delay
  setTimeout(() => {
    document.body.removeChild(iframe);
    window.open(webLink, '_blank');
  }, 1000);
}

/**
 * Generate CSV for order execution
 */
export function generateOrderCSV(orders) {
  const header = 'Ticker,Amount ($),Category,Reason\n';
  const rows = orders.map(order => 
    `${order.ticker},${order.amount.toFixed(2)},${order.category},${order.reason}`
  ).join('\n');
  
  return header + rows;
}

/**
 * Download CSV file
 */
export function downloadCSV(orders, filename = 'order-plan.csv') {
  const csv = generateOrderCSV(orders);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get recommended provider based on contribution amount
 */
export function getRecommendedProvider(amount) {
  if (amount < 50) {
    return ['raiz', 'spaceship'];
  } else if (amount < 100) {
    return ['commsecPocket', 'raiz', 'spaceship'];
  } else if (amount < 500) {
    return ['selfwealth', 'pearler', 'commsecPocket'];
  } else {
    return ['commsec', 'selfwealth', 'pearler'];
  }
}

