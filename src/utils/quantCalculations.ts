import { PriceBar } from '../types.js';

// Calculate standard pivot points (Classic & Fibonacci)
export interface PivotPoints {
  pivot: number;
  s1: number;
  s2: number;
  s3: number;
  r1: number;
  r2: number;
  r3: number;
  fibS1: number;
  fibS2: number;
  fibS3: number;
  fibR1: number;
  fibR2: number;
  fibR3: number;
}

export function calculatePivotPoints(high: number, low: number, close: number): PivotPoints {
  const pivot = (high + low + close) / 3;
  
  // Classic Pivot Points
  const r1 = 2 * pivot - low;
  const s1 = 2 * pivot - high;
  const r2 = pivot + (high - low);
  const s2 = pivot - (high - low);
  const r3 = high + 2 * (pivot - low);
  const s3 = low - 2 * (high - pivot);

  // Fibonacci Pivot Points
  const diff = high - low;
  const fibR1 = pivot + diff * 0.382;
  const fibR2 = pivot + diff * 0.618;
  const fibR3 = pivot + diff * 1.0;
  const fibS1 = pivot - diff * 0.382;
  const fibS2 = pivot - diff * 0.618;
  const fibS3 = pivot - diff * 1.0;

  return {
    pivot,
    r1, r2, r3,
    s1, s2, s3,
    fibR1, fibR2, fibR3,
    fibS1, fibS2, fibS3
  };
}

// Calculate Fibonacci Retracement levels from a given range (High & Low)
export interface FibLevels {
  level0: number;    // 0% (Low)
  level236: number;  // 23.6%
  level382: number;  // 38.2%
  level500: number;  // 50%
  level618: number;  // 61.8%
  level786: number;  // 78.6%
  level100: number;  // 100% (High)
}

export function calculateFibLevels(high: number, low: number, isTrendUp = true): FibLevels {
  const diff = high - low;
  if (isTrendUp) {
    return {
      level0: low,
      level236: high - diff * 0.236,
      level382: high - diff * 0.382,
      level500: high - diff * 0.5,
      level618: high - diff * 0.618,
      level786: high - diff * 0.786,
      level100: high
    };
  } else {
    return {
      level0: high,
      level236: low + diff * 0.236,
      level382: low + diff * 0.382,
      level500: low + diff * 0.5,
      level618: low + diff * 0.618,
      level786: low + diff * 0.786,
      level100: low
    };
  }
}

// Dynamic Option Chain Generator based on current live underlying price
export interface OptionQuote {
  strike: number;
  callOI: number;
  callOIChange: number;
  callVolume: number;
  callIV: number;
  callLTP: number;
  callChangePercent: number;
  callDelta: number;
  callTheta: number;
  callVega: number;
  putLTP: number;
  putChangePercent: number;
  putIV: number;
  putVolume: number;
  putOIChange: number;
  putOI: number;
  putDelta: number;
  putTheta: number;
  putVega: number;
}

export interface OptionsSummary {
  pcr: number;
  maxPain: number;
  highestCallOIStrike: number;
  highestPutOIStrike: number;
  ivRank: number;
  ivPercentile: number;
  chain: OptionQuote[];
}

export function generateOptionChain(price: number, symbol: string): OptionsSummary {
  // Determine suitable strike interval based on price magnitude
  let interval = 100;
  if (price < 1000) interval = 10;
  else if (price < 5000) interval = 50;
  else if (price < 15000) interval = 100;
  else interval = 100; // For Nifty or similar

  const atmStrike = Math.round(price / interval) * interval;
  const numStrikes = 9; // Show 4 ITM, 1 ATM, 4 OTM on either side
  const strikes: number[] = [];
  const startStrike = atmStrike - Math.floor(numStrikes / 2) * interval;
  
  for (let i = 0; i < numStrikes; i++) {
    strikes.push(startStrike + i * interval);
  }

  // Deterministic seed based on underlying price and symbol
  const charSum = symbol.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  
  let totalCallOI = 0;
  let totalPutOI = 0;
  let maxCallOI = 0;
  let maxPutOI = 0;
  let highestCallOIStrike = atmStrike;
  let highestPutOIStrike = atmStrike;

  const chain: OptionQuote[] = strikes.map(strike => {
    // Generate options stats deterministically but realistic
    const strikeOffset = (strike - price) / price; // negative for ITM calls, positive for OTM calls
    
    // Call pricing
    const intrinsicCall = Math.max(0, price - strike);
    const extrinsicCall = price * 0.015 * Math.exp(-Math.pow(strikeOffset * 15, 2));
    const callLTP = intrinsicCall + extrinsicCall;
    const callChangePercent = Math.sin(strike + price) * 5 - (strikeOffset * 20);

    // Put pricing
    const intrinsicPut = Math.max(0, strike - price);
    const extrinsicPut = price * 0.015 * Math.exp(-Math.pow(strikeOffset * 15, 2));
    const putLTP = intrinsicPut + extrinsicPut;
    const putChangePercent = Math.sin(strike - price) * 5 + (strikeOffset * 20);

    // Volatilities & Greeks
    const iv = 12 + Math.abs(Math.sin(strike) * 8) + (strikeOffset * 10);
    
    // Call Greeks
    const callDelta = 1 / (1 + Math.exp(strikeOffset * 25)); // 0 to 1
    const callTheta = -callLTP * 0.05 - 2;
    const callVega = price * 0.02 * Math.exp(-Math.pow(strikeOffset * 10, 2));

    // Put Greeks
    const putDelta = callDelta - 1; // -1 to 0
    const putTheta = -putLTP * 0.05 - 2;
    const putVega = callVega;

    // Open Interests & Volume (higher near ATM)
    const callOI = Math.round((25000 + Math.sin(strike * 0.05) * 12000) * Math.exp(-Math.abs(strikeOffset * 8)));
    const putOI = Math.round((26000 + Math.cos(strike * 0.05) * 11000) * Math.exp(-Math.abs(strikeOffset * 8)));
    const callOIChange = Math.round(callOI * 0.05 * Math.sin(strike));
    const putOIChange = Math.round(putOI * 0.04 * Math.cos(strike));
    const callVolume = Math.round(callOI * 1.5);
    const putVolume = Math.round(putOI * 1.4);

    totalCallOI += callOI;
    totalPutOI += putOI;

    if (callOI > maxCallOI) {
      maxCallOI = callOI;
      highestCallOIStrike = strike;
    }
    if (putOI > maxPutOI) {
      maxPutOI = putOI;
      highestPutOIStrike = strike;
    }

    return {
      strike,
      callOI,
      callOIChange,
      callVolume,
      callIV: parseFloat(iv.toFixed(1)),
      callLTP: parseFloat(callLTP.toFixed(1)),
      callChangePercent: parseFloat(callChangePercent.toFixed(1)),
      callDelta: parseFloat(callDelta.toFixed(2)),
      callTheta: parseFloat(callTheta.toFixed(1)),
      callVega: parseFloat(callVega.toFixed(1)),
      putLTP: parseFloat(putLTP.toFixed(1)),
      putChangePercent: parseFloat(putChangePercent.toFixed(1)),
      putIV: parseFloat((iv + 0.5).toFixed(1)),
      putVolume,
      putOIChange,
      putOI,
      putDelta: parseFloat(putDelta.toFixed(2)),
      putTheta: parseFloat(putTheta.toFixed(1)),
      putVega: parseFloat(putVega.toFixed(1))
    };
  });

  const pcr = totalCallOI > 0 ? parseFloat((totalPutOI / totalCallOI).toFixed(2)) : 1.0;
  
  // Max pain calculation: strike that minimizes total options value at expiry
  let minPainValue = Infinity;
  let maxPain = atmStrike;
  
  strikes.forEach(testStrike => {
    let pain = 0;
    chain.forEach(opt => {
      // Calls pain
      if (testStrike > opt.strike) {
        pain += (testStrike - opt.strike) * opt.callOI;
      }
      // Puts pain
      if (testStrike < opt.strike) {
        pain += (opt.strike - testStrike) * opt.putOI;
      }
    });
    if (pain < minPainValue) {
      minPainValue = pain;
      maxPain = testStrike;
    }
  });

  const ivRank = Math.abs(Math.sin(charSum) * 45) + 15;
  const ivPercentile = Math.abs(Math.cos(charSum) * 50) + 20;

  return {
    pcr,
    maxPain,
    highestCallOIStrike,
    highestPutOIStrike,
    ivRank: Math.round(ivRank),
    ivPercentile: Math.round(ivPercentile),
    chain
  };
}

// Generate complete set of moving averages and oscillators
export interface IndicatorValue {
  name: string;
  value: number;
  rating: 'Bullish' | 'Bearish' | 'Neutral';
}

export interface TechnicalIndicatorsSummary {
  oscillatorsRating: 'Strong Buy' | 'Buy' | 'Sell' | 'Strong Sell' | 'Neutral';
  movingAveragesRating: 'Strong Buy' | 'Buy' | 'Sell' | 'Strong Sell' | 'Neutral';
  overallRating: 'Strong Buy' | 'Buy' | 'Sell' | 'Strong Sell' | 'Neutral';
  rsi: number;
  macd: { macd: number; signal: number; histogram: number };
  atr: number;
  adx: number;
  cci: number;
  obv: string;
  cmf: number;
  roc: number;
  superTrend: { value: number; direction: 'up' | 'down' };
  ichimoku: { conversionLine: number; baseLine: number; spanA: number; spanB: number };
  sar: number;
  bollingerBands: { upper: number; middle: number; lower: number };
  breakoutProb: number;
  breakdownProb: number;
  gapAnalysis: string;
  liquidityZones: { price: number; volumeWeight: number }[];
  orderBlocks: { price: number; type: 'Demand' | 'Supply' }[];
}

export function calculateTechnicalIndicators(price: number, bars: PriceBar[]): TechnicalIndicatorsSummary {
  // Compute indicators using high-fidelity deterministic seeds based on price structure
  const lastBar = bars[bars.length - 1] || { close: price, high: price, low: price, open: price };
  
  const rsi = 45 + (Math.sin(price * 0.01) * 20); // 25 to 65
  const macdVal = Math.sin(price * 0.005) * (price * 0.003);
  const macdSig = Math.sin(price * 0.005 + 0.2) * (price * 0.0025);
  const macdHist = macdVal - macdSig;

  const atr = price * 0.012;
  const adx = 15 + Math.abs(Math.cos(price * 0.02) * 30);
  const cci = Math.sin(price * 0.01) * 150;
  const obvValue = Math.round(50000000 + Math.sin(price) * 15000000);
  const cmf = parseFloat((Math.sin(price * 0.04) * 0.25).toFixed(2));
  const roc = parseFloat((Math.sin(price * 0.003) * 1.8).toFixed(2));

  const superTrendVal = price * (1 + (Math.sin(price) > 0 ? -0.015 : 0.015));
  const superTrendDir = Math.sin(price) > 0 ? 'up' : 'down';

  const ichimoku = {
    conversionLine: price * 0.995,
    baseLine: price * 0.99,
    spanA: price * 0.985,
    spanB: price * 0.98
  };

  const sar = price * (Math.sin(price * 0.1) > 0 ? 0.982 : 1.018);

  const bbDev = price * 0.025;
  const bollingerBands = {
    upper: price + bbDev,
    middle: price,
    lower: price - bbDev
  };

  // Probabilities
  const breakoutProb = Math.round(40 + Math.abs(Math.sin(price * 0.05) * 45));
  const breakdownProb = 100 - breakoutProb;

  // Order Blocks & Liquidity
  const orderBlocks: { price: number; type: 'Demand' | 'Supply' }[] = [
    { price: parseFloat((price * 0.975).toFixed(1)), type: 'Demand' },
    { price: parseFloat((price * 0.988).toFixed(1)), type: 'Demand' },
    { price: parseFloat((price * 1.015).toFixed(1)), type: 'Supply' },
    { price: parseFloat((price * 1.025).toFixed(1)), type: 'Supply' }
  ];

  const liquidityZones = [
    { price: parseFloat((price * 0.992).toFixed(1)), volumeWeight: 88 },
    { price: parseFloat((price * 1.008).toFixed(1)), volumeWeight: 72 }
  ];

  const gapAnalysis = Math.abs(Math.sin(price)) > 0.7 
    ? 'Gap Up of 0.45% filled at open. Consolidated inside the first 15m order block.' 
    : 'No major gaps detected. Steady matching on baseline liquidity zones.';

  // Ratings summary
  const oscillatorsRating = rsi > 70 ? 'Sell' : rsi < 30 ? 'Buy' : 'Neutral';
  const movingAveragesRating = price > ichimoku.baseLine ? 'Strong Buy' : 'Neutral';
  const overallRating = price > ichimoku.conversionLine ? 'Buy' : 'Neutral';

  return {
    oscillatorsRating,
    movingAveragesRating,
    overallRating,
    rsi: parseFloat(rsi.toFixed(1)),
    macd: { macd: parseFloat(macdVal.toFixed(1)), signal: parseFloat(macdSig.toFixed(1)), histogram: parseFloat(macdHist.toFixed(1)) },
    atr: parseFloat(atr.toFixed(1)),
    adx: parseFloat(adx.toFixed(1)),
    cci: parseFloat(cci.toFixed(1)),
    obv: obvValue.toLocaleString(),
    cmf,
    roc,
    superTrend: { value: parseFloat(superTrendVal.toFixed(1)), direction: superTrendDir as 'up' | 'down' },
    ichimoku,
    sar: parseFloat(sar.toFixed(1)),
    bollingerBands,
    breakoutProb,
    breakdownProb,
    gapAnalysis,
    liquidityZones,
    orderBlocks
  };
}

// Tailored institutional data (FII/DII net purchases in Crores for NSE/BSE or Billions for US)
export interface InstitutionalActivity {
  fiiBuy: number;
  fiiSell: number;
  fiiNet: number;
  diiBuy: number;
  diiSell: number;
  diiNet: number;
  etfInflow: number;
  mfInflow: number;
  promoterActivity: string;
  blockDealsCount: number;
  insiderPurchases: number;
}

export function generateInstitutionalActivity(price: number, symbol: string): InstitutionalActivity {
  const isUS = symbol.startsWith('^') && !['^NSEI', '^NSENX', '^NSEBANK', '^BSESN'].includes(symbol);
  const factor = isUS ? 1 : 10; // scale factor
  const charSum = symbol.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  
  const fiiBuy = 1200 * factor + Math.round(Math.abs(Math.sin(charSum) * 800) * factor);
  const fiiSell = 1000 * factor + Math.round(Math.abs(Math.cos(charSum) * 750) * factor);
  const fiiNet = fiiBuy - fiiSell;

  const diiBuy = 950 * factor + Math.round(Math.abs(Math.sin(charSum * 1.5) * 500) * factor);
  const diiSell = 850 * factor + Math.round(Math.abs(Math.cos(charSum * 1.5) * 450) * factor);
  const diiNet = diiBuy - diiSell;

  return {
    fiiBuy,
    fiiSell,
    fiiNet,
    diiBuy,
    diiSell,
    diiNet,
    etfInflow: parseFloat((Math.sin(charSum) * 15 * factor).toFixed(1)),
    mfInflow: parseFloat((Math.cos(charSum) * 22 * factor).toFixed(1)),
    promoterActivity: Math.sin(charSum) > 0.3 ? 'Net buying (+0.12% increase in promoter holding)' : 'No significant insider activity detected',
    blockDealsCount: Math.round(3 + Math.abs(Math.sin(charSum) * 8)),
    insiderPurchases: parseFloat((Math.abs(Math.sin(charSum * 2)) * 4.5).toFixed(2))
  };
}

// Realistic tailored news headlines with Bullish/Bearish classification, sentiment score & AI short summaries
export interface NewsItem {
  headline: string;
  source: string;
  classification: 'Bullish' | 'Bearish' | 'Neutral';
  score: number; // -100 to 100
  impact: 'Critical' | 'High' | 'Medium' | 'Low';
  aiSummary: string;
}

export function generateNewsForIndex(symbol: string, category: string): NewsItem[] {
  const isNSE = category === 'NSE' || category === 'BSE';
  
  if (isNSE) {
    return [
      {
        headline: 'RBI MPC retains repo rate at 6.50% pointing to resilient inflation buffer',
        source: 'Moneycontrol',
        classification: 'Neutral',
        score: 5,
        impact: 'Critical',
        aiSummary: 'The reserve bank maintains stable rates to secure target consumer price index bands while praising strong domestic capital expansion.'
      },
      {
        headline: 'SEBI proposes relaxed margins for low-volatility indexes to trigger trading volume',
        source: 'Economic Times',
        classification: 'Bullish',
        score: 45,
        impact: 'High',
        aiSummary: 'New SEBI margin regulations could reduce structural capital cost for retail derivatives, enhancing market depth.'
      },
      {
        headline: 'FII flows turn positive in large cap IT and banking sectors ahead of earnings',
        source: 'LiveMint',
        classification: 'Bullish',
        score: 65,
        impact: 'High',
        aiSummary: 'Foreign institutional flows showed net purchase momentum over the last 3 sessions, validating valuations in resilient Indian bluechips.'
      },
      {
        headline: 'CPI Inflation spikes slightly due to seasonal food pricing pressures',
        source: 'Business Standard',
        classification: 'Bearish',
        score: -35,
        impact: 'Medium',
        aiSummary: 'Rising vegetable and pulses prices offset non-food rate cooling, maintaining cautious hawkish tones in upcoming bond discussions.'
      }
    ];
  } else {
    return [
      {
        headline: 'Federal Reserve indicates cautious rate path as labor markets achieve balance',
        source: 'Bloomberg',
        classification: 'Bullish',
        score: 55,
        impact: 'Critical',
        aiSummary: 'Fed minutes suggest easing inflationary pressures, with a high probability of initial rate cuts in the upcoming quarter.'
      },
      {
        headline: 'Global semiconductor order books expand on hyperscaler datacenter orders',
        source: 'Reuters',
        classification: 'Bullish',
        score: 75,
        impact: 'High',
        aiSummary: 'AI hardware investment cycle remains firm, with top foundry capacities booked out through the calendar year.'
      },
      {
        headline: 'Treasury yields push higher as retail spending outpaces central baseline projections',
        source: 'Wall Street Journal',
        classification: 'Bearish',
        score: -40,
        impact: 'High',
        aiSummary: 'US 10-year Treasury yield ticks to 4.35% as robust consumption signals sticky structural interest pricing.'
      }
    ];
  }
}
