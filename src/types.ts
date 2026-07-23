export interface PriceBar {
  time: string; // YYYY-MM-DD or timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  indicators?: {
    sma20?: number;
    ema50?: number;
    vwap?: number;
    rsi?: number;
    macdLine?: number;
    macdSignal?: number;
    macdHist?: number;
    bbUpper?: number;
    bbLower?: number;
    bbMiddle?: number;
    atr?: number;
    adx?: number;
    supertrend?: number;
    supertrendDir?: 'up' | 'down';
  };
}

export interface StockDetails {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  dividendYield: number;
  high52Week: number;
  low52Week: number;
  sector: string;
  // Professional trading terminal parameters
  exchange?: string;
  dataSource?: string;
  lastUpdate?: string;
  bidPrice?: number;
  askPrice?: number;
  bidQty?: number;
  askQty?: number;
  vwap?: number;
  openInterest?: number;
  marketDepth?: {
    bidPrice: number;
    bidQty: number;
    askPrice: number;
    askQty: number;
  }[];
}

export interface ChartPattern {
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  description: string;
  index: number;
  priceLevel?: number;
}

export interface NewsArticle {
  title: string;
  source: string;
  url: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number; // -1 to +1
  time: string;
}

export interface SocialSentiment {
  platform: 'Twitter/X' | 'Reddit' | 'StockTwits' | 'YouTube';
  bullishPercent: number;
  bearishPercent: number;
  trendingKeywords: string[];
  mentionsCount: number;
  summary: string;
}

export interface MLMetric {
  name: string;
  mae: number;
  mse: number;
  rmse: number;
  mape: number;
  r2: number;
}

export interface AIPrediction {
  symbol: string;
  currentPrice: number;
  nextHour: 'UP' | 'DOWN' | 'SIDEWAYS';
  tomorrow: 'UP' | 'DOWN' | 'SIDEWAYS';
  nextWeek: 'UP' | 'DOWN' | 'SIDEWAYS';
  nextMonth: 'UP' | 'DOWN' | 'SIDEWAYS';
  confidence: number; // 0 to 100
  probability: number; // 0 to 100
  expectedRangeMin: number;
  expectedRangeMax: number;
  volatility: number; // %
  signal: 'BUY' | 'SELL' | 'HOLD';
  signalStrength: number; // 0 to 100
  explanation: string;
  riskFactors: string[];
  marketConditions: string;
  shapValues: { [key: string]: number };
  featureImportance: { feature: string; importance: number }[];
  modelMetrics: MLMetric[];
  bestModel: string;
}

export interface PortfolioPosition {
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  totalCost: number;
  marketValue: number;
  profit: number;
  profitPercent: number;
  allocationPercent: number;
  targetPercent?: number;
}

export interface PortfolioSummary {
  positions: PortfolioPosition[];
  totalValue: number;
  totalCost: number;
  totalProfit: number;
  totalProfitPercent: number;
  riskScore: number; // 1 to 100
  todayProfit: number;
  todayProfitPercent: number;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  type: 'price' | 'volume' | 'rsi' | 'macd';
  condition: 'above' | 'below' | 'cross';
  value: number;
  isActive: boolean;
  isTriggered: boolean;
  createdAt: string;
}

export interface ScreenerFilter {
  sector: string;
  minMarketCap: number; // in billions
  minVolume: number; // in millions
  peMin: number;
  peMax: number;
  dividendYieldMin: number;
  rsiMin: number;
  rsiMax: number;
  aiRating: 'BUY' | 'SELL' | 'HOLD' | 'ALL';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface MarketStatus {
  isOpen: boolean;
  timezone: string;
  nextClose: string;
  nextOpen: string;
}
