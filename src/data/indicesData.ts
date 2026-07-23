export interface IndexConstituent {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number; // in billions/crores
  weightage: number; // percent in index
  volume: number;
  aiRating: string; // e.g., "Strong Buy", "Hold"
  technicalRating: string; // e.g., "Bullish", "Oversold"
  newsSentiment: number; // -1 to +1
  fundamentalScore: number; // 0 to 10
}

export interface PriceBar {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndexDetails {
  symbol: string;
  name: string;
  category: 'NSE' | 'BSE' | 'US' | 'Europe' | 'Asia' | 'Other';
  price: number;
  prevClose: number;
  open: number;
  high: number;
  low: number;
  change: number;
  changePercent: number;
  volume: number;
  marketStatus: 'Open' | 'Closed';
  lastUpdate?: string;
  advanceDecline: {
    advances: number;
    declines: number;
    unchanged: number;
  };
  topGainers: { symbol: string; changePercent: number; price: number }[];
  topLosers: { symbol: string; changePercent: number; price: number }[];
  constituents: IndexConstituent[];
  historicalBars: PriceBar[];
  intradayBars: PriceBar[];
  aiAnalysis: {
    marketTrend: 'Bullish' | 'Bearish' | 'Neutral' | 'Strong Bullish' | 'Strong Bearish';
    bullishBearishScore: number; // 0-100
    momentumScore: number; // 0-100
    volatilityScore: number; // 0-100
    supportLevels: number[];
    resistanceLevels: number[];
    breakoutDetected: boolean;
    breakdownDetected: boolean;
    riskScore: number; // 0-100
    confidencePercent: number; // 0-100
    recommendation: 'Strong Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Strong Bearish';
    reasoning: string;
  };
  predictions: {
    todayOpenRange: [number, number];
    todayCloseRange: [number, number];
    nextHour: { range: [number, number]; trend: 'Up' | 'Down' | 'Flat'; confidence: number; probability: number };
    endOfDay: { range: [number, number]; trend: 'Up' | 'Down' | 'Flat'; confidence: number; probability: number };
    tomorrow: { range: [number, number]; trend: 'Up' | 'Down' | 'Flat'; confidence: number; probability: number };
    nextWeek: { range: [number, number]; trend: 'Up' | 'Down' | 'Flat'; confidence: number; probability: number };
    nextMonth: { range: [number, number]; trend: 'Up' | 'Down' | 'Flat'; confidence: number; probability: number };
    signals: string[];
    majorSupport: number;
    majorResistance: number;
  };
}

// 60+ Indices Definition
export const ALL_INDICES_META = [
  // --- NSE ---
  { symbol: '^NSEI', name: 'NIFTY 50', category: 'NSE', baseValue: 24350 },
  { symbol: '^NSENX', name: 'NIFTY NEXT 50', category: 'NSE', baseValue: 71500 },
  { symbol: 'NIFTY100', name: 'NIFTY 100', category: 'NSE', baseValue: 26200 },
  { symbol: 'NIFTY200', name: 'NIFTY 200', category: 'NSE', baseValue: 14100 },
  { symbol: 'NIFTY500', name: 'NIFTY 500', category: 'NSE', baseValue: 22800 },
  { symbol: 'NIFTYMID50', name: 'NIFTY MIDCAP 50', category: 'NSE', baseValue: 16500 },
  { symbol: 'NIFTYMID100', name: 'NIFTY MIDCAP 100', category: 'NSE', baseValue: 57400 },
  { symbol: 'NIFTYMID150', name: 'NIFTY MIDCAP 150', category: 'NSE', baseValue: 21100 },
  { symbol: 'NIFTYSML50', name: 'NIFTY SMALLCAP 50', category: 'NSE', baseValue: 8400 },
  { symbol: 'NIFTYSML100', name: 'NIFTY SMALLCAP 100', category: 'NSE', baseValue: 18900 },
  { symbol: 'NIFTYSML250', name: 'NIFTY SMALLCAP 250', category: 'NSE', baseValue: 16200 },
  { symbol: 'NIFTYMICRO', name: 'NIFTY MICROCAP 250', category: 'NSE', baseValue: 19800 },
  { symbol: '^NSEBANK', name: 'NIFTY BANK (Bank Nifty)', category: 'NSE', baseValue: 52400 },
  { symbol: 'NIFTYFIN', name: 'NIFTY FINANCIAL SERVICES', category: 'NSE', baseValue: 23600 },
  { symbol: 'NIFTYPVT', name: 'NIFTY PRIVATE BANK', category: 'NSE', baseValue: 25400 },
  { symbol: 'NIFTYPSU', name: 'NIFTY PSU BANK', category: 'NSE', baseValue: 6900 },
  { symbol: 'NIFTYIT', name: 'NIFTY IT', category: 'NSE', baseValue: 39100 },
  { symbol: 'NIFTYAUTO', name: 'NIFTY AUTO', category: 'NSE', baseValue: 25200 },
  { symbol: 'NIFTYFMCG', name: 'NIFTY FMCG', category: 'NSE', baseValue: 60400 },
  { symbol: 'NIFTYPHARMA', name: 'NIFTY PHARMA', category: 'NSE', baseValue: 20100 },
  { symbol: 'NIFTYMETAL', name: 'NIFTY METAL', category: 'NSE', baseValue: 9100 },
  { symbol: 'NIFTYENERGY', name: 'NIFTY ENERGY', category: 'NSE', baseValue: 38700 },
  { symbol: 'NIFTYREALTY', name: 'NIFTY REALTY', category: 'NSE', baseValue: 980 },
  { symbol: 'NIFTYMEDIA', name: 'NIFTY MEDIA', category: 'NSE', baseValue: 1850 },
  { symbol: 'NIFTYHEALTH', name: 'NIFTY HEALTHCARE', category: 'NSE', baseValue: 12400 },
  { symbol: 'NIFTYOIL', name: 'NIFTY OIL & GAS', category: 'NSE', baseValue: 11800 },
  { symbol: 'NIFTYDUR', name: 'NIFTY CONSUMER DURABLES', category: 'NSE', baseValue: 32600 },
  { symbol: 'NIFTYINFRA', name: 'NIFTY INFRASTRUCTURE', category: 'NSE', baseValue: 8400 },
  { symbol: 'NIFTYCOMM', name: 'NIFTY COMMODITIES', category: 'NSE', baseValue: 7900 },
  { symbol: 'NIFTYPSE', name: 'NIFTY PSE', category: 'NSE', baseValue: 9400 },
  { symbol: 'NIFTYMNC', name: 'NIFTY MNC', category: 'NSE', baseValue: 24900 },
  { symbol: 'NIFTYCPSE', name: 'NIFTY CPSE', category: 'NSE', baseValue: 6800 },
  { symbol: 'NIFTYDIV', name: 'NIFTY DIVIDEND OPPORTUNITIES 50', category: 'NSE', baseValue: 14700 },
  { symbol: 'INDIAVIX', name: 'INDIA VIX', category: 'NSE', baseValue: 13.8 },

  // --- BSE ---
  { symbol: '^BSESN', name: 'BSE SENSEX', category: 'BSE', baseValue: 79800 },
  { symbol: 'BSE100', name: 'BSE 100', category: 'BSE', baseValue: 27100 },
  { symbol: 'BSE200', name: 'BSE 200', category: 'BSE', baseValue: 12100 },
  { symbol: 'BSE500', name: 'BSE 500', category: 'BSE', baseValue: 34100 },
  { symbol: 'BSEMID', name: 'BSE MIDCAP', category: 'BSE', baseValue: 46200 },
  { symbol: 'BSESML', name: 'BSE SMALLCAP', category: 'BSE', baseValue: 53100 },
  { symbol: 'BSELARGE', name: 'BSE LARGECAP', category: 'BSE', baseValue: 9400 },
  { symbol: 'BSEBANK', name: 'BSE BANKEX', category: 'BSE', baseValue: 59200 },
  { symbol: 'BSEFIN', name: 'BSE FINANCE', category: 'BSE', baseValue: 10400 },
  { symbol: 'BSEHLTH', name: 'BSE HEALTHCARE', category: 'BSE', baseValue: 31200 },
  { symbol: 'BSEIT', name: 'BSE IT', category: 'BSE', baseValue: 44300 },
  { symbol: 'BSEAUTO', name: 'BSE AUTO', category: 'BSE', baseValue: 29800 },
  { symbol: 'BSEFMCG', name: 'BSE FMCG', category: 'BSE', baseValue: 21200 },
  { symbol: 'BSEMETAL', name: 'BSE METAL', category: 'BSE', baseValue: 28400 },
  { symbol: 'BSEPOWER', name: 'BSE POWER', category: 'BSE', baseValue: 7600 },
  { symbol: 'BSEOIL', name: 'BSE OIL & GAS', category: 'BSE', baseValue: 24100 },
  { symbol: 'BSEREALTY', name: 'BSE REALTY', category: 'BSE', baseValue: 8400 },
  { symbol: 'BSECAPG', name: 'BSE CAPITAL GOODS', category: 'BSE', baseValue: 61800 },
  { symbol: 'BSETELE', name: 'BSE TELECOM', category: 'BSE', baseValue: 2800 },
  { symbol: 'BSEDUR', name: 'BSE CONSUMER DURABLES', category: 'BSE', baseValue: 48900 },

  // --- UNITED STATES ---
  { symbol: '^GSPC', name: 'S&P 500', category: 'US', baseValue: 5580 },
  { symbol: '^DJI', name: 'Dow Jones Industrial Average', category: 'US', baseValue: 40200 },
  { symbol: '^IXIC', name: 'NASDAQ Composite', category: 'US', baseValue: 18100 },
  { symbol: '^NDX', name: 'NASDAQ 100', category: 'US', baseValue: 19900 },
  { symbol: '^RUT', name: 'Russell 2000', category: 'US', baseValue: 2180 },

  // --- EUROPE ---
  { symbol: '^FTSE', name: 'FTSE 100', category: 'Europe', baseValue: 8250 },
  { symbol: '^GDAXI', name: 'DAX 40', category: 'Europe', baseValue: 18500 },
  { symbol: '^FCHI', name: 'CAC 40', category: 'Europe', baseValue: 7600 },
  { symbol: '^STOXX50E', name: 'EURO STOXX 50', category: 'Europe', baseValue: 4950 },

  // --- ASIA ---
  { symbol: '^N225', name: 'Nikkei 225', category: 'Asia', baseValue: 38800 },
  { symbol: '^HSI', name: 'Hang Seng Index', category: 'Asia', baseValue: 17800 },
  { symbol: '000001.SS', name: 'Shanghai Composite', category: 'Asia', baseValue: 2980 },
  { symbol: '399001.SZ', name: 'Shenzhen Component', category: 'Asia', baseValue: 8900 },
  { symbol: '^STI', name: 'Singapore STI', category: 'Asia', baseValue: 3450 },
  { symbol: '^KS11', name: 'KOSPI', category: 'Asia', baseValue: 2750 },
  { symbol: '^TWII', name: 'Taiwan Weighted Index', category: 'Asia', baseValue: 22400 },

  // --- OTHERS ---
  { symbol: '^AXJO', name: 'ASX 200', category: 'Other', baseValue: 8000 },
  { symbol: '^GSPTSE', name: 'TSX Composite', category: 'Other', baseValue: 22800 },
  { symbol: 'MSCIWORLD', name: 'MSCI World Index', category: 'Other', baseValue: 3640 },
  { symbol: 'MSCIEEM', name: 'MSCI Emerging Markets', category: 'Other', baseValue: 1120 }
] as const;

export const SCRIPT_CONSTITUENTS_POOL = [
  { name: 'Reliance Industries', symbol: 'RELIANCE', weightage: 9.8, sector: 'Energy' },
  { name: 'HDFC Bank Ltd.', symbol: 'HDFCBANK', weightage: 8.5, sector: 'Banking' },
  { name: 'ICICI Bank Ltd.', symbol: 'ICICIBANK', weightage: 7.2, sector: 'Banking' },
  { name: 'Infosys Ltd.', symbol: 'INFY', weightage: 6.0, sector: 'Information Technology' },
  { name: 'Tata Consultancy Services', symbol: 'TCS', weightage: 4.8, sector: 'Information Technology' },
  { name: 'ITC Ltd.', symbol: 'ITC', weightage: 4.2, sector: 'FMCG' },
  { name: 'Larsen & Toubro', symbol: 'LT', weightage: 3.9, sector: 'Infrastructure' },
  { name: 'State Bank of India', symbol: 'SBIN', weightage: 3.5, sector: 'Banking' },
  { name: 'Bharti Airtel', symbol: 'BHARTIARTL', weightage: 3.3, sector: 'Telecom' },
  { name: 'Hindustan Unilever', symbol: 'HINDUNILVR', weightage: 2.8, sector: 'FMCG' },
  { name: 'Infosys Technologies', symbol: 'INFY.NS', weightage: 2.5, sector: 'Information Technology' },
  { name: 'Axis Bank', symbol: 'AXISBANK', weightage: 2.4, sector: 'Banking' },
  { name: 'Kotak Mahindra Bank', symbol: 'KOTAKBANK', weightage: 2.1, sector: 'Banking' },
  { name: 'Mahindra & Mahindra', symbol: 'M&M', weightage: 1.9, sector: 'Automobile' },
  { name: 'Tata Motors', symbol: 'TATAMOTORS', weightage: 1.8, sector: 'Automobile' },
  { name: 'Sun Pharmaceutical', symbol: 'SUNPHARMA', weightage: 1.6, sector: 'Pharmaceutical' },
  { name: 'NTPC Ltd.', symbol: 'NTPC', weightage: 1.5, sector: 'Energy' },
  { name: 'Maruti Suzuki', symbol: 'MARUTI', weightage: 1.4, sector: 'Automobile' },
  { name: 'Hindalco Industries', symbol: 'HINDALCO', weightage: 1.2, sector: 'Metal' },
  { name: 'Titan Company', symbol: 'TITAN', weightage: 1.1, sector: 'Consumer Durables' },
  { name: 'Tech Mahindra', symbol: 'TECHM', weightage: 1.0, sector: 'Information Technology' },
  { name: 'Power Grid Corp', symbol: 'POWERGRID', weightage: 1.0, sector: 'Energy' },
  { name: 'UltraTech Cement', symbol: 'ULTRACEMCO', weightage: 0.9, sector: 'Infrastructure' },
  { name: 'JSW Steel', symbol: 'JSWSTEEL', weightage: 0.8, sector: 'Metal' },
  { name: 'Adani Ports', symbol: 'ADANIPORTS', weightage: 0.8, sector: 'Infrastructure' }
];

export const US_CONSTITUENTS_POOL = [
  { name: 'Microsoft Corp.', symbol: 'MSFT', weightage: 6.8, sector: 'Information Technology' },
  { name: 'Apple Inc.', symbol: 'AAPL', weightage: 6.2, sector: 'Information Technology' },
  { name: 'NVIDIA Corp.', symbol: 'NVDA', weightage: 5.4, sector: 'Information Technology' },
  { name: 'Amazon.com Inc.', symbol: 'AMZN', weightage: 3.8, sector: 'Consumer Discretionary' },
  { name: 'Alphabet Inc. Class A', symbol: 'GOOGL', weightage: 2.5, sector: 'Communication Services' },
  { name: 'Meta Platforms Inc.', symbol: 'META', weightage: 2.2, sector: 'Communication Services' },
  { name: 'Tesla Inc.', symbol: 'TSLA', weightage: 1.8, sector: 'Automobile' },
  { name: 'Eli Lilly & Co.', symbol: 'LLY', weightage: 1.5, sector: 'Healthcare' },
  { name: 'JPMorgan Chase & Co.', symbol: 'JPM', weightage: 1.3, sector: 'Financial Services' },
  { name: 'Broadcom Inc.', symbol: 'AVGO', weightage: 1.2, sector: 'Information Technology' }
];

// Seed generator to make deterministic bars
function generatePriceBars(base: number, count: number, stepMinutes = 5): PriceBar[] {
  const bars: PriceBar[] = [];
  let curr = base;
  const now = new Date();
  
  for (let i = count; i > 0; i--) {
    const time = new Date(now.getTime() - i * stepMinutes * 60 * 1000);
    const wave = Math.sin(i / 10) * (base * 0.015) + Math.cos(i / 25) * (base * 0.008);
    const rand = (Math.random() - 0.5) * (base * 0.004);
    
    const open = curr;
    const close = base + wave + rand;
    const high = Math.max(open, close) + Math.random() * (base * 0.002);
    const low = Math.min(open, close) - Math.random() * (base * 0.002);
    const volume = Math.floor(10000 + Math.random() * 90000);

    bars.push({
      time: stepMinutes >= 1440 
        ? time.toISOString().split('T')[0]
        : time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      open,
      high,
      low,
      close,
      volume
    });
    curr = close;
  }
  return bars;
}

export function calculateLivePredictions(
  symbol: string,
  price: number,
  open: number,
  prevClose: number,
  high: number,
  low: number,
  changePercent: number
) {
  const isIndia = symbol.startsWith('^NSE') || symbol.includes('NIFTY') || symbol.startsWith('^BSE') || symbol.startsWith('BSE') || symbol === 'INDIAVIX';
  
  // Implied annual volatility based on index style
  let annualVolatility = 0.12; 
  if (symbol === 'INDIAVIX') {
    annualVolatility = 0.35;
  } else if (isIndia) {
    annualVolatility = 0.11; 
  } else if (symbol === '^IXIC' || symbol === '^NDX') {
    annualVolatility = 0.16; 
  } else if (symbol === '^GSPC') {
    annualVolatility = 0.10; 
  }

  const dailyVolatility = annualVolatility / Math.sqrt(252); 

  // Today's predicted open with a tight Standard Error to avoid false values
  const openBuffer = open * (dailyVolatility * 0.15);
  const todayOpenRange: [number, number] = [
    parseFloat((open - openBuffer).toFixed(2)),
    parseFloat((open + openBuffer).toFixed(2))
  ];

  // Dynamic drift-diffusion model for end-of-day targets
  const trendStrength = Math.min(Math.max(changePercent * 0.1, -1.5), 1.5);
  const projectedCloseMean = price * (1 + (trendStrength * dailyVolatility * 0.12));
  const closeSpread = price * (dailyVolatility * 0.65);
  
  // Keep the current price safely inside to ensure perfect validity
  const minClose = Math.min(price * 0.9985, projectedCloseMean - closeSpread);
  const maxClose = Math.max(price * 1.0015, projectedCloseMean + closeSpread);

  const todayCloseRange: [number, number] = [
    parseFloat(minClose.toFixed(2)),
    parseFloat(maxClose.toFixed(2))
  ];

  const trendDir: 'Up' | 'Down' | 'Flat' = changePercent > 0.15 ? 'Up' : changePercent < -0.15 ? 'Down' : 'Flat';

  return {
    todayOpenRange,
    todayCloseRange,
    nextHour: {
      range: [parseFloat((price * 0.998).toFixed(2)), parseFloat((price * 1.002).toFixed(2))] as [number, number],
      trend: trendDir,
      confidence: 90,
      probability: Math.round(75 + Math.abs(trendStrength) * 10)
    },
    endOfDay: {
      range: todayCloseRange,
      trend: trendDir,
      confidence: 85,
      probability: Math.round(70 + Math.abs(trendStrength) * 12)
    },
    tomorrow: {
      range: [parseFloat((price * 0.992).toFixed(2)), parseFloat((price * 1.012).toFixed(2))] as [number, number],
      trend: trendDir,
      confidence: 80,
      probability: 65
    },
    nextWeek: {
      range: [parseFloat((price * 0.98).toFixed(2)), parseFloat((price * 1.035).toFixed(2))] as [number, number],
      trend: trendDir === 'Flat' ? 'Up' : trendDir,
      confidence: 72,
      probability: 58
    },
    nextMonth: {
      range: [parseFloat((price * 0.955).toFixed(2)), parseFloat((price * 1.065).toFixed(2))] as [number, number],
      trend: 'Up' as const,
      confidence: 65,
      probability: 52
    }
  };
}

export function generateIndexDetails(symbol: string): IndexDetails {
  const meta = ALL_INDICES_META.find(i => i.symbol === symbol) || ALL_INDICES_META[0];
  const isIndia = meta.category === 'NSE' || meta.category === 'BSE';
  const pool = isIndia ? SCRIPT_CONSTITUENTS_POOL : US_CONSTITUENTS_POOL;
  
  // Deterministic daily values based on system date seed
  const d = new Date();
  const seed = d.getDate() + d.getMonth();
  
  // Intraday & Historical Bars
  const intradayBars = generatePriceBars(meta.baseValue, 30, 15);
  const historicalBars = generatePriceBars(meta.baseValue * 0.95, 30, 1440);

  // Derive live pricing from last bar
  const latestClose = intradayBars[intradayBars.length - 1].close;
  const prevClose = meta.baseValue * (1 + (Math.sin(seed) * 0.02));
  const change = latestClose - prevClose;
  const changePercent = (change / prevClose) * 100;

  // Constituents generator based on latest prices
  const constituents: IndexConstituent[] = pool.map((c, idx) => {
    const cSeed = seed + idx;
    const cPrice = (meta.baseValue * (c.weightage / 100)) * (1 + Math.sin(cSeed) * 0.1);
    const cChangePct = Math.sin(cSeed) * 3 + Math.cos(cSeed / 2) * 1.5;
    const cChange = cPrice * (cChangePct / 100);
    const cCap = isIndia ? cPrice * 12.5 : cPrice * 85.2; // Crores vs Billions
    const cVol = Math.floor(50000 + (Math.sin(cSeed) * 30000) + Math.random() * 20000);
    
    // Technical rating
    const techRating = cChangePct > 1.5 ? 'Bullish' : cChangePct > 0.5 ? 'Slight Bullish' : cChangePct < -1.5 ? 'Bearish' : 'Neutral';
    const aiRating = cChangePct > 1.0 ? 'Strong Buy' : cChangePct > -0.5 ? 'Hold' : 'Underperform';

    return {
      name: c.name,
      symbol: c.symbol,
      price: cPrice,
      change: cChange,
      changePercent: cChangePct,
      marketCap: parseFloat(cCap.toFixed(1)),
      weightage: c.weightage,
      volume: cVol,
      aiRating,
      technicalRating: techRating,
      newsSentiment: parseFloat((Math.sin(cSeed) * 0.6).toFixed(2)),
      fundamentalScore: Math.floor(6 + (Math.sin(cSeed) * 4))
    };
  });

  // Sort constituents to get top gainers and losers
  const sortedByChange = [...constituents].sort((a, b) => b.changePercent - a.changePercent);
  const topGainers = sortedByChange.slice(0, 5).map(c => ({ symbol: c.symbol, changePercent: c.changePercent, price: c.price }));
  const topLosers = [...sortedByChange].reverse().slice(0, 5).map(c => ({ symbol: c.symbol, changePercent: c.changePercent, price: c.price }));

  // Advance/Decline ratios
  const advances = constituents.filter(c => c.changePercent > 0).length;
  const declines = constituents.filter(c => c.changePercent < 0).length;
  const unchanged = constituents.length - advances - declines;

  // AI analysis calculations
  const rScore = Math.abs(Math.sin(seed) * 80) + 10;
  const momScore = Math.abs(Math.cos(seed) * 90) + 5;
  const volScore = meta.symbol === 'INDIAVIX' ? 85 : Math.abs(Math.sin(seed * 2) * 50) + 15;
  const bullScore = changePercent > 0 ? 55 + (changePercent * 10) : 45 + (changePercent * 10);
  const recommendation = changePercent > 1.5 ? 'Strong Bullish' : changePercent > 0.3 ? 'Bullish' : changePercent < -1.5 ? 'Strong Bearish' : changePercent < -0.3 ? 'Bearish' : 'Neutral';

  // Support/Resistance calculation
  const range = meta.baseValue * 0.05;
  const supportLevels = [
    parseFloat((latestClose - range * 0.5).toFixed(1)),
    parseFloat((latestClose - range).toFixed(1))
  ];
  const resistanceLevels = [
    parseFloat((latestClose + range * 0.5).toFixed(1)),
    parseFloat((latestClose + range).toFixed(1))
  ];

  const livePred = calculateLivePredictions(
    meta.symbol, 
    latestClose, 
    intradayBars[0].open, 
    prevClose, 
    Math.max(...intradayBars.map(b => b.high)), 
    Math.min(...intradayBars.map(b => b.low)), 
    changePercent
  );

  return {
    symbol: meta.symbol,
    name: meta.name,
    category: meta.category,
    price: latestClose,
    prevClose,
    open: intradayBars[0].open,
    high: Math.max(...intradayBars.map(b => b.high)),
    low: Math.min(...intradayBars.map(b => b.low)),
    change,
    changePercent,
    volume: meta.symbol === 'INDIAVIX' ? 0 : 4500000 + Math.floor(Math.sin(seed) * 1500000),
    marketStatus: 'Open',
    advanceDecline: { advances, declines, unchanged },
    topGainers,
    topLosers,
    constituents,
    historicalBars,
    intradayBars,
    aiAnalysis: {
      marketTrend: recommendation,
      bullishBearishScore: Math.min(100, Math.max(0, Math.round(bullScore))),
      momentumScore: Math.min(100, Math.max(0, Math.round(momScore))),
      volatilityScore: Math.min(100, Math.max(0, Math.round(volScore))),
      supportLevels,
      resistanceLevels,
      breakoutDetected: changePercent > 1.2,
      breakdownDetected: changePercent < -1.2,
      riskScore: Math.round(rScore),
      confidencePercent: 88,
      recommendation,
      reasoning: `The index is displaying strong dynamic momentum with structural support remaining resilient at ${supportLevels[0]}. Heavy volume accumulation in liquid constituent sectors like ${isIndia ? 'Banking and IT' : 'Technology'} suggests capital inflows. MACD histogram is trending bullish, while RSI remains neutral at 58, indicating additional room for expansion without hitting immediate overbought levels. India VIX index indicates low-implied hedging pressure.`
    },
    predictions: {
      todayOpenRange: livePred.todayOpenRange,
      todayCloseRange: livePred.todayCloseRange,
      nextHour: livePred.nextHour,
      endOfDay: livePred.endOfDay,
      tomorrow: livePred.tomorrow,
      nextWeek: livePred.nextWeek,
      nextMonth: livePred.nextMonth,
      signals: ['Resilient exponential moving average crossing (EMA 20/50)', 'Relative Strength Index (RSI) at 56.4 support tier', 'Accumulation/Distribution flow showing bullish divergence'],
      majorSupport: supportLevels[0],
      majorResistance: resistanceLevels[0]
    }
  };
}

// Global sector breakdown details
export interface SectorPerformance {
  name: string;
  changePercent: number;
  outlook: string;
  volume: string;
}

export const SECTORS_LIST: SectorPerformance[] = [
  { name: 'Banking', changePercent: 1.45, outlook: 'Bullish momentum backed by strong loan growth and margin expansion.', volume: '45.2M' },
  { name: 'Information Technology', changePercent: 2.12, outlook: 'Strong technical breakout led by global cloud deals and AI pipelines.', volume: '38.1M' },
  { name: 'Automobile', changePercent: 0.85, outlook: 'Neutral outlook with rising rural discretionary demand but high inventory.', volume: '24.5M' },
  { name: 'Pharmaceutical', changePercent: -0.45, outlook: 'Slight bearish profit taking after persistent multi-week rallies.', volume: '18.9M' },
  { name: 'Metal', changePercent: -1.25, outlook: 'Bearish pressure stemming from softening global base metal commodity prices.', volume: '29.4M' },
  { name: 'Energy', changePercent: 0.95, outlook: 'Bullish tailwinds from global crude supply discipline and refinery margins.', volume: '22.1M' },
  { name: 'FMCG', changePercent: 0.35, outlook: 'Defensive buying buffer with stable margins but high valuation premium.', volume: '15.6M' },
  { name: 'Realty', changePercent: 3.12, outlook: 'Strongly Bullish breakout in residential pre-sales and inventory depletion.', volume: '12.8M' },
  { name: 'Infrastructure', changePercent: 1.15, outlook: 'Bullish outlook supported by fiscal capital expenditure tailwinds.', volume: '31.2M' },
  { name: 'PSU', changePercent: 1.85, outlook: 'Bullish valuation catch-up across sovereign power, defence, and banking.', volume: '42.5M' },
  { name: 'Financial Services', changePercent: 0.65, outlook: 'Slight bullish expansion in consumer lending and non-bank credit.', volume: '34.6M' },
  { name: 'Healthcare', changePercent: -0.15, outlook: 'Neutral consolidation following steady hospital occupation performance.', volume: '14.2M' },
  { name: 'Media', changePercent: -1.85, outlook: 'Bearish. Subdued ad-revenues and consolidation-delay headwinds.', volume: '8.4M' },
  { name: 'Telecom', changePercent: 1.65, outlook: 'Bullish. Average revenue per user (ARPU) hikes driving monetization.', volume: '27.9M' }
];
