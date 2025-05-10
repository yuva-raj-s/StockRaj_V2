// Indian Market Indices
export const indiaIndices = [
  { name: 'NIFTY 50', value: 22634.55, change: 1.2, previousClose: 22364.55 },
  { name: 'SENSEX', value: 74572.98, change: 1.1, previousClose: 73762.98 },
  { name: 'NIFTY NEXT 50', value: 47128.75, change: 0.9, previousClose: 46708.75 },
  { name: 'NIFTY BANK', value: 48293.45, change: -0.4, previousClose: 48486.45 },
  { name: 'NIFTY MIDCAP 100', value: 48726.30, change: 1.5, previousClose: 47987.30 },
];

// Market Breadth Data
export const marketBreadthData = {
  nse: {
    advances: 1587,
    declines: 876,
    unchanged: 132,
    total: 2595,
  },
  bse: {
    advances: 2341,
    declines: 1234,
    unchanged: 243,
    total: 3818,
  }
};

// FII/DII Activity
export const institutionalActivity = {
  fii: {
    today: { bought: 12456.78, sold: 11234.56, netValue: 1222.22, netPercentage: 0.8 },
    week: { bought: 58456.78, sold: 52234.56, netValue: 6222.22, netPercentage: 1.2 },
    month: { bought: 245456.78, sold: 242234.56, netValue: 3222.22, netPercentage: 0.3 },
  },
  dii: {
    today: { bought: 9876.54, sold: 10234.56, netValue: -358.02, netPercentage: -0.4 },
    week: { bought: 48756.54, sold: 46234.56, netValue: 2521.98, netPercentage: 0.6 },
    month: { bought: 198756.54, sold: 189234.56, netValue: 9521.98, netPercentage: 0.8 },
  }
};

// Volume Leaders
export const volumeLeaders = [
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', volume: 28543290, avgVolume: 15432980, price: 876.45, change: 2.3 },
  { symbol: 'RELIANCE', name: 'Reliance Industries', volume: 19832456, avgVolume: 10987654, price: 2876.25, change: 1.1 },
  { symbol: 'SBIN', name: 'State Bank of India', volume: 18765432, avgVolume: 12345678, price: 768.55, change: -0.7 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', volume: 15678943, avgVolume: 9876543, price: 1567.75, change: 0.3 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', volume: 14563278, avgVolume: 8765432, price: 987.65, change: 0.5 },
];

// Options & Derivatives
export const derivativesData = {
  nifty: {
    putCallRatio: 0.85,
    impliedVolatility: 14.2,
    majorStrikes: [
      { strike: 22500, callOI: 25678, putOI: 18765, callChange: 12.3, putChange: -5.6 },
      { strike: 22600, callOI: 19876, putOI: 21345, callChange: 8.7, putChange: 3.2 },
      { strike: 22700, callOI: 15678, putOI: 28765, callChange: -3.2, putChange: 14.7 },
      { strike: 22800, callOI: 12456, putOI: 32456, callChange: -7.8, putChange: 18.9 },
    ],
  },
  bankNifty: {
    putCallRatio: 0.92,
    impliedVolatility: 16.5,
    majorStrikes: [
      { strike: 48000, callOI: 18765, putOI: 15678, callChange: 9.8, putChange: -4.5 },
      { strike: 48200, callOI: 15432, putOI: 18765, callChange: 5.6, putChange: 2.3 },
      { strike: 48400, callOI: 12345, putOI: 21345, callChange: -2.3, putChange: 11.2 },
      { strike: 48600, callOI: 9876, putOI: 24567, callChange: -8.9, putChange: 15.6 },
    ],
  }
};

// Market Movers
export const marketMovers = {
  topGainers: [
    { symbol: 'ADANIENT', name: 'Adani Enterprises', price: 2786.55, change: 8.2, volume: 5647839 },
    { symbol: 'INFY', name: 'Infosys', price: 1476.40, change: 5.7, volume: 7865432 },
    { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3712.75, change: 4.9, volume: 3456789 },
    { symbol: 'WIPRO', name: 'Wipro Ltd.', price: 452.30, change: 4.5, volume: 6543219 },
    { symbol: 'TECHM', name: 'Tech Mahindra', price: 1245.65, change: 4.1, volume: 4321678 },
  ],
  topLosers: [
    { symbol: 'HINDALCO', name: 'Hindalco Industries', price: 563.25, change: -5.3, volume: 6789432 },
    { symbol: 'COALINDIA', name: 'Coal India', price: 342.15, change: -4.2, volume: 8976543 },
    { symbol: 'TATASTEEL', name: 'Tata Steel', price: 135.70, change: -3.8, volume: 9876123 },
    { symbol: 'AXISBANK', name: 'Axis Bank', price: 1012.45, change: -3.1, volume: 5678923 },
    { symbol: 'TITAN', name: 'Titan Company', price: 3245.85, change: -2.9, volume: 3214567 },
  ],
  year52High: [
    { symbol: 'HCLTECH', name: 'HCL Technologies', price: 1356.70, high52w: 1362.35, low52w: 987.65 },
    { symbol: 'LT', name: 'Larsen & Toubro', price: 2876.45, high52w: 2884.95, low52w: 2134.56 },
    { symbol: 'ASIANPAINT', name: 'Asian Paints', price: 3245.75, high52w: 3256.85, low52w: 2643.25 },
  ],
  year52Low: [
    { symbol: 'JSWSTEEL', name: 'JSW Steel', price: 789.45, high52w: 1245.65, low52w: 784.35 },
    { symbol: 'NTPC', name: 'NTPC Ltd.', price: 234.56, high52w: 356.78, low52w: 231.45 },
    { symbol: 'ONGC', name: 'Oil & Natural Gas Corp.', price: 178.65, high52w: 245.67, low52w: 176.35 },
  ],
};

// Market Calendar
export const marketEvents = [
  { date: '2023-06-15', type: 'RESULTS', symbol: 'TCS', name: 'Tata Consultancy Services', description: 'Q1 Results Announcement' },
  { date: '2023-06-17', type: 'DIVIDEND', symbol: 'RELIANCE', name: 'Reliance Industries', description: 'Dividend Announcement (₹8 per share)' },
  { date: '2023-06-18', type: 'SPLIT', symbol: 'INFY', name: 'Infosys', description: 'Stock Split (1:5)' },
  { date: '2023-06-22', type: 'POLICY', symbol: null, name: 'RBI', description: 'Monetary Policy Meeting' },
  { date: '2023-06-25', type: 'RESULTS', symbol: 'HDFCBANK', name: 'HDFC Bank', description: 'Q1 Results Announcement' },
];

// Technical Signals
export const technicalSignals = {
  breakouts: [
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel', pattern: 'Cup and Handle', timeframe: 'Daily', reliability: 'High' },
    { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', pattern: 'Ascending Triangle', timeframe: 'Weekly', reliability: 'Medium' },
    { symbol: 'DRREDDY', name: 'Dr. Reddy\'s Laboratories', pattern: 'Channel Breakout', timeframe: 'Daily', reliability: 'High' },
  ],
  breakdowns: [
    { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv', pattern: 'Head and Shoulders', timeframe: 'Daily', reliability: 'Medium' },
    { symbol: 'NESTLEIND', name: 'Nestle India', pattern: 'Double Top', timeframe: 'Weekly', reliability: 'High' },
    { symbol: 'ITC', name: 'ITC Ltd.', pattern: 'Rising Wedge', timeframe: 'Daily', reliability: 'Medium' },
  ],
  trendStrength: [
    { symbol: 'NIFTY 50', adx: 28.7, trending: true, direction: 'Bullish' },
    { symbol: 'BANKNIFTY', adx: 22.4, trending: true, direction: 'Bullish' },
    { symbol: 'NIFTYMETAL', adx: 18.3, trending: false, direction: 'Neutral' },
    { symbol: 'NIFTYPHARMA', adx: 32.1, trending: true, direction: 'Bullish' },
  ],
};

// Circuit Filters
export const circuitFilters = {
  upperCircuit: [
    { symbol: 'IDEA', name: 'Vodafone Idea', price: 14.75, percentChange: 5.0, circuit: 5.0 },
    { symbol: 'RPOWER', name: 'Reliance Power', price: 18.90, percentChange: 5.0, circuit: 5.0 },
    { symbol: 'YESBANK', name: 'Yes Bank', price: 24.15, percentChange: 5.0, circuit: 5.0 },
  ],
  lowerCircuit: [
    { symbol: 'SUZLON', name: 'Suzlon Energy', price: 17.85, percentChange: -5.0, circuit: -5.0 },
    { symbol: 'RCOM', name: 'Reliance Communications', price: 3.25, percentChange: -5.0, circuit: -5.0 },
    { symbol: 'GMRINFRA', name: 'GMR Infrastructure', price: 52.30, percentChange: -5.0, circuit: -5.0 },
  ],
  approachingUpper: [
    { symbol: 'IFCI', name: 'IFCI Ltd.', price: 28.45, percentChange: 4.7, circuit: 5.0 },
    { symbol: 'ADANIPOWER', name: 'Adani Power', price: 345.75, percentChange: 4.8, circuit: 5.0 },
  ],
  approachingLower: [
    { symbol: 'RELINFRA', name: 'Reliance Infrastructure', price: 168.95, percentChange: -4.8, circuit: -5.0 },
    { symbol: 'DHFL', name: 'Dewan Housing', price: 21.35, percentChange: -4.9, circuit: -5.0 },
  ],
};

// IPO Monitor
export const ipoData = {
  upcoming: [
    { name: 'LIC', fullName: 'Life Insurance Corporation of India', bidDates: '2023-06-22 to 2023-06-28', priceRange: '₹902 - ₹949', lotSize: 15, issueSize: '₹21,000 Cr' },
    { name: 'DELHIVERY', fullName: 'Delhivery Ltd.', bidDates: '2023-07-05 to 2023-07-08', priceRange: '₹450 - ₹487', lotSize: 30, issueSize: '₹5,235 Cr' },
  ],
  ongoing: [
    { name: 'ZOMATO', fullName: 'Zomato Ltd.', bidDates: '2023-06-14 to 2023-06-16', priceRange: '₹72 - ₹76', lotSize: 195, issueSize: '₹9,375 Cr', subscription: { retail: 2.7, nii: 3.8, qib: 5.5, total: 4.2 } },
  ],
  recent: [
    { name: 'EASEMYTRIP', fullName: 'Easy Trip Planners Ltd.', listingDate: '2023-05-28', issuePrice: '₹187', listingPrice: '₹212.25', currentPrice: '₹237.85', gain: 27.2 },
    { name: 'NAZARA', fullName: 'Nazara Technologies Ltd.', listingDate: '2023-05-12', issuePrice: '₹1,101', listingPrice: '₹1,990', currentPrice: '₹1,758.35', gain: 59.7 },
  ],
};

// Volatility Meter
export const volatilityData = {
  indiaVix: {
    current: 14.85,
    change: -2.3,
    weekly: [16.5, 15.8, 15.2, 14.9, 14.85],
    monthly: [18.7, 17.5, 16.8, 16.2, 15.5, 15.1, 14.9, 14.85],
  },
  correlation: {
    vixToNifty: -0.75, // Negative correlation
    vixToBankNifty: -0.68,
  },
  impliedVolatility: {
    nifty: 15.2,
    bankNifty: 16.8,
    midcap: 18.5,
  },
};

// Commodity Impact
export const commodityImpactData = {
  crude: {
    price: 78.65,
    change: 1.2,
    impact: [
      { sector: 'Aviation', magnitude: 'High', direction: 'Negative' },
      { sector: 'Paints', magnitude: 'Medium', direction: 'Negative' },
      { sector: 'OMCs', magnitude: 'High', direction: 'Negative' },
      { sector: 'Oil Exploration', magnitude: 'High', direction: 'Positive' },
    ],
  },
  gold: {
    price: 62345,
    change: 0.8,
    impact: [
      { sector: 'Jewellery', magnitude: 'Medium', direction: 'Mixed' },
      { sector: 'NBFCs', magnitude: 'Medium', direction: 'Positive' },
    ],
  },
  currency: {
    usdinr: 82.45,
    change: -0.3,
    impact: [
      { sector: 'IT', magnitude: 'High', direction: 'Negative' },
      { sector: 'Pharma', magnitude: 'Medium', direction: 'Negative' },
      { sector: 'Importers', magnitude: 'High', direction: 'Positive' },
      { sector: 'Exporters', magnitude: 'High', direction: 'Negative' },
    ],
  },
}; 