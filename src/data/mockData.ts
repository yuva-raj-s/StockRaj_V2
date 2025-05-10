export const mockData = {
  stockData: {
    symbol: 'RELIANCE',
    price: 2456.75,
    change: 45.80,
    changePercent: 1.89,
  },
  prediction: {
    probability: 78,
    targetPrice: 2598.45,
    timeframe: '7 Days',
    confidence: 85
  },
  sentiment: {
    news: { positive: 45, neutral: 30, negative: 25 },
    social: { positive: 55, neutral: 25, negative: 20 },
    overall: 'Moderately Bullish'
  },
  sentimentScore: 72,
  articles: [
    {
      sentiment: 'neutral',
      title: 'Infosys Finalizes Acquisition Of MRE Consulting In A $36 Million Deal',
      description: 'Infosys, which is an IT major, has completed its acquisition of MRE Consulting...',
      date: '2024-03-15',
      baseScore: 0.65,
      weight: 1.2,
      totalScore: 0.78
    },
    {
      sentiment: 'positive',
      title: 'India real estate: Jackpot for Indians? \'...can unlock $3.3 trillion...\' - Infosys co-founder Nandan Nilekani',
      description: 'Indians have a chance to unlock massive wealth through real estate investments...',
      date: '2024-03-14',
      baseScore: 0.85,
      weight: 1.5,
      totalScore: 1.28
    },
    {
      sentiment: 'neutral',
      title: 'Good news for job seekers as this IT firm to hire 20000 freshers in 2025',
      description: 'The announcement of Cognizant\'s hiring plans shows strong growth...',
      date: '2024-03-14',
      baseScore: 0.70,
      weight: 1.0,
      totalScore: 0.70
    },
    {
      sentiment: 'positive',
      title: 'Infosys completes acquisition of MRE Consulting',
      description: 'It brings newer capabilities and expertise to Infosys...',
      date: '2024-03-13',
      baseScore: 0.75,
      weight: 1.3,
      totalScore: 0.98
    }
  ]
};