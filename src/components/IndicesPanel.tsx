import React, { useState, useEffect } from 'react';
import { 
  calculatePivotPoints, 
  calculateFibLevels, 
  generateOptionChain, 
  calculateTechnicalIndicators, 
  generateInstitutionalActivity, 
  generateNewsForIndex 
} from '../utils/quantCalculations.js';
import { AIPredictionsTab } from './AIPredictionsTab.js';
import { 
  Globe, 
  TrendingUp, 
  TrendingDown, 
  Compass, 
  Activity, 
  Cpu, 
  BarChart3, 
  Scale, 
  Calendar, 
  Newspaper, 
  Search, 
  Plus, 
  X, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  ChevronDown, 
  Percent, 
  Info,
  Layers,
  FileText,
  Brain,
  ShieldAlert,
  ServerCrash,
  RefreshCw
} from 'lucide-react';

// Helper to retrieve constituents list for index quant ensemble modeling
export function getIndexConstituentsList(symbol: string): { name: string; symbol: string; weight: number }[] {
  if (symbol === '^NSEI') {
    // NIFTY 50 - 50 stocks
    const nifty50List = [
      { symbol: 'RELIANCE', name: 'Reliance Industries', weight: 9.8 },
      { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', weight: 8.5 },
      { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', weight: 7.2 },
      { symbol: 'INFY', name: 'Infosys Ltd.', weight: 6.0 },
      { symbol: 'TCS', name: 'Tata Consultancy Services', weight: 4.8 },
      { symbol: 'ITC', name: 'ITC Ltd.', weight: 4.2 },
      { symbol: 'LT', name: 'Larsen & Toubro', weight: 3.9 },
      { symbol: 'SBIN', name: 'State Bank of India', weight: 3.5 },
      { symbol: 'BHARTIARTL', name: 'Bharti Airtel', weight: 3.3 },
      { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', weight: 2.8 },
      { symbol: 'AXISBANK', name: 'Axis Bank', weight: 2.4 },
      { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', weight: 2.1 },
      { symbol: 'M&M', name: 'Mahindra & Mahindra', weight: 1.9 },
      { symbol: 'TATAMOTORS', name: 'Tata Motors', weight: 1.8 },
      { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', weight: 1.6 },
      { symbol: 'NTPC', name: 'NTPC Ltd.', weight: 1.5 },
      { symbol: 'MARUTI', name: 'Maruti Suzuki', weight: 1.4 },
      { symbol: 'POWERGRID', name: 'Power Grid Corp', weight: 1.3 },
      { symbol: 'ULTRACEMCO', name: 'UltraTech Cement', weight: 1.2 },
      { symbol: 'TITAN', name: 'Titan Company', weight: 1.1 },
      { symbol: 'HINDALCO', name: 'Hindalco Industries', weight: 1.0 },
      { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd.', weight: 0.9 },
      { symbol: 'ADANIPORTS', name: 'Adani Ports & SEZ', weight: 0.8 },
      { symbol: 'BAJFINANCE', name: 'Bajaj Finance', weight: 1.5 },
      { symbol: 'ASIANPAINT', name: 'Asian Paints', weight: 1.1 }
    ];
    while (nifty50List.length < 50) {
      const id = nifty50List.length + 1;
      nifty50List.push({
        symbol: `NIFTY_STK_${id}`,
        name: `Nifty 50 Constituent Stock ${id}`,
        weight: parseFloat((10 / (id + 10)).toFixed(2))
      });
    }
    return nifty50List;
  } else if (symbol === '^NSEBANK') {
    // BANK NIFTY - 12 banking stocks
    return [
      { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', weight: 27.8 },
      { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', weight: 22.4 },
      { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', weight: 11.2 },
      { symbol: 'SBIN', name: 'State Bank of India', weight: 10.5 },
      { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', weight: 9.8 },
      { symbol: 'INDUSINDBK', name: 'IndusInd Bank', weight: 5.2 },
      { symbol: 'FEDERALBNK', name: 'The Federal Bank', weight: 2.8 },
      { symbol: 'IDFCFIRSTB', name: 'IDFC First Bank', weight: 2.5 },
      { symbol: 'BANKBARODA', name: 'Bank of Baroda', weight: 2.4 },
      { symbol: 'AUBANK', name: 'AU Small Finance Bank', weight: 2.0 },
      { symbol: 'PNB', name: 'Punjab National Bank', weight: 1.8 },
      { symbol: 'BANDHANBNK', name: 'Bandhan Bank', weight: 1.6 }
    ];
  } else if (symbol === '^BSESN') {
    // SENSEX - 30 stocks
    const sensexList = [
      { symbol: 'RELIANCE', name: 'Reliance Industries', weight: 11.8 },
      { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', weight: 10.5 },
      { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', weight: 8.9 },
      { symbol: 'TCS', name: 'Tata Consultancy Services', weight: 5.8 },
      { symbol: 'INFY', name: 'Infosys Ltd.', weight: 7.2 },
      { symbol: 'ITC', name: 'ITC Ltd.', weight: 5.1 },
      { symbol: 'LT', name: 'Larsen & Toubro', weight: 4.8 },
      { symbol: 'SBIN', name: 'State Bank of India', weight: 4.2 },
      { symbol: 'BHARTIARTL', name: 'Bharti Airtel', weight: 4.0 },
      { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', weight: 3.4 },
      { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', weight: 2.9 },
      { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', weight: 2.6 },
      { symbol: 'M&M', name: 'Mahindra & Mahindra', weight: 2.3 },
      { symbol: 'TATAMOTORS', name: 'Tata Motors', weight: 2.2 },
      { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', weight: 1.9 },
      { symbol: 'NTPC', name: 'NTPC Ltd.', weight: 1.8 },
      { symbol: 'MARUTI', name: 'Maruti Suzuki', weight: 1.7 },
      { symbol: 'POWERGRID', name: 'Power Grid Corp', weight: 1.5 },
      { symbol: 'ULTRACEMCO', name: 'UltraTech Cement', weight: 1.4 },
      { symbol: 'TITAN', name: 'Titan Company', weight: 1.3 }
    ];
    while (sensexList.length < 30) {
      const id = sensexList.length + 1;
      sensexList.push({
        symbol: `BSE_STK_${id}`,
        name: `Sensex Constituent Stock ${id}`,
        weight: parseFloat((8 / (id + 5)).toFixed(2))
      });
    }
    return sensexList;
  } else {
    // S&P 500 or others - dynamically generate up to 30
    const genericList = [
      { symbol: 'MSFT', name: 'Microsoft Corp.', weight: 6.8 },
      { symbol: 'AAPL', name: 'Apple Inc.', weight: 6.2 },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', weight: 5.4 },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', weight: 3.8 },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', weight: 2.5 },
      { symbol: 'META', name: 'Meta Platforms', weight: 2.2 },
      { symbol: 'TSLA', name: 'Tesla Inc.', weight: 1.8 },
      { symbol: 'LLY', name: 'Eli Lilly & Co.', weight: 1.5 },
      { symbol: 'JPM', name: 'JPMorgan Chase', weight: 1.3 },
      { symbol: 'AVGO', name: 'Broadcom Inc.', weight: 1.2 }
    ];
    while (genericList.length < 30) {
      const id = genericList.length + 1;
      genericList.push({
        symbol: `GEN_STK_${id}`,
        name: `Constituent Stock ${id}`,
        weight: parseFloat((5 / (id + 2)).toFixed(2))
      });
    }
    return genericList;
  }
}
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart, 
  Line, 
  Legend, 
  ComposedChart,
  Cell,
  ReferenceArea,
  ReferenceLine
} from 'recharts';
import { 
  ALL_INDICES_META, 
  generateIndexDetails, 
  calculateLivePredictions,
  SECTORS_LIST, 
  IndexDetails, 
  IndexConstituent 
} from '../data/indicesData.js';

interface IndicesPanelProps {
  onSelectStock: (symbol: string) => void;
  setActiveTab: (tab: string) => void;
}

export default function IndicesPanel({ onSelectStock, setActiveTab }: IndicesPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'analysis' | 'comparison'>('overview');
  const [selectedDetailTab, setSelectedDetailTab] = useState<'constituents' | 'technical' | 'options' | 'breadth' | 'news' | 'ai-predictions'>('constituents');
  
  // Real-time fluctuating state of indices
  const [indicesData, setIndicesData] = useState<Record<string, IndexDetails>>({});
  const [selectedSymbol, setSelectedSymbol] = useState<string>('^NSEI'); // Default NIFTY 50
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [indexFilter, setIndexFilter] = useState<'ALL' | 'NSE' | 'BSE' | 'US' | 'Europe' | 'Asia' | 'Other'>('ALL');

  // Chart type: 'candlestick' | 'intraday' | 'historical'
  const [chartType, setChartType] = useState<'candlestick' | 'intraday' | 'historical'>('candlestick');

  // Comparison Tool states
  const [compareIndexA, setCompareIndexA] = useState<string>('^NSEI');
  const [compareIndexB, setCompareIndexB] = useState<string>('^GSPC');

  const [activeProvider, setActiveProvider] = useState<string>('NSE Official Market Data');


  // Load indices initially & active provider details
  useEffect(() => {
    const initial: Record<string, IndexDetails> = {};
    ALL_INDICES_META.forEach(meta => {
      initial[meta.symbol] = generateIndexDetails(meta.symbol);
    });
    setIndicesData(initial);

    const fetchActiveProvider = async () => {
      try {
        const res = await fetch('/api/adapters');
        if (res.ok) {
          const data = await res.json();
          const active = data.configs.find((c: any) => c.id === data.activeProviderId);
          if (active) {
            setActiveProvider(active.name);
          }
        }
      } catch (e) {
        // quiet fail
      }
    };
    fetchActiveProvider();
  }, []);

  // Fetch real-time live index data from backend API
  useEffect(() => {
    const fetchLiveIndices = async () => {
      try {
        const res = await fetch('/api/indices');
        if (res.ok) {
          const liveData = await res.json();
          setIndicesData(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(symbol => {
              const original = next[symbol];
              if (!original) return;

              // Handle server mapping for caret keys
              const serverKey = symbol === 'INDIAVIX' ? '^INDIAVIX' : symbol;
              const liveQuote = liveData[serverKey];

              if (liveQuote) {
                const newPrice = liveQuote.regularMarketPrice;
                const change = liveQuote.regularMarketChange;
                const changePercent = liveQuote.regularMarketChangePercent;
                const volume = liveQuote.regularMarketVolume || original.volume;
                const high = liveQuote.regularMarketDayHigh || Math.max(original.high, newPrice);
                const low = liveQuote.regularMarketDayLow || Math.min(original.low, newPrice);
                const prevClose = newPrice - change;
                const open = liveQuote.regularMarketDayOpen || (prevClose * (1 + (changePercent * 0.001)));

                const livePred = calculateLivePredictions(symbol, newPrice, open, prevClose, high, low, changePercent);

                next[symbol] = {
                  ...original,
                  price: newPrice,
                  change: change,
                  changePercent: changePercent,
                  volume: volume,
                  high: high,
                  low: low,
                  prevClose: prevClose,
                  open: open,
                  predictions: {
                    ...original.predictions,
                    todayOpenRange: livePred.todayOpenRange,
                    todayCloseRange: livePred.todayCloseRange,
                    nextHour: livePred.nextHour,
                    endOfDay: livePred.endOfDay,
                    tomorrow: livePred.tomorrow,
                    nextWeek: livePred.nextWeek,
                    nextMonth: livePred.nextMonth
                  },
                  // Adjust constituents slightly to harmonize with the index move
                  constituents: original.constituents.map(c => {
                    const direction = changePercent >= 0 ? 1 : -1;
                    const shift = (Math.random() * 0.0003) * direction;
                    const newCPrice = c.price * (1 + shift);
                    return {
                      ...c,
                      price: newCPrice,
                      change: newCPrice - (c.price - c.change),
                      changePercent: c.changePercent + (shift * 100)
                    };
                  })
                };
              }
            });
            return next;
          });
        }
      } catch (err) {
        console.warn("Live indices fetch error, keeping last values", err);
      }
    };

    fetchLiveIndices();
    const interval = setInterval(fetchLiveIndices, 6000);
    return () => clearInterval(interval);
  }, []);

  const getIndex = (symbol: string): IndexDetails | undefined => {
    return indicesData[symbol];
  };

  const currentIdxDetails = getIndex(selectedSymbol);

  // Filtered list of indices metadata
  const filteredIndices = ALL_INDICES_META.filter(meta => {
    const matchesFilter = indexFilter === 'ALL' || meta.category === indexFilter;
    const matchesSearch = meta.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          meta.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Calculate top gainers / losers across all indices currently loaded
  const allIndicesList = Object.values(indicesData) as IndexDetails[];
  const topGlobalGainers = [...allIndicesList]
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 5);
  const topGlobalLosers = [...allIndicesList]
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 5);

  // FII / DII Flows (Mocked but real-time fluctuating values)
  const fiiDiiData = {
    date: 'July 15, 2026',
    fiiNet: 1452.80, // In Crores INR
    diiNet: 928.40,  // In Crores INR
    fiiStatus: 'BUY',
    diiStatus: 'BUY',
    globalSentiment: 'Extremely Bullish'
  };

  // Sector Performance lists (derived)
  const topSector = [...SECTORS_LIST].sort((a, b) => b.changePercent - a.changePercent)[0];
  const worstSector = [...SECTORS_LIST].sort((a, b) => a.changePercent - b.changePercent)[0];

  return (
    <div className="space-y-6">
      
      {/* Title Header Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-5 rounded-lg border border-gray-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-teal-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-widest">Global & Domestic Pipeline</span>
          </div>
          <h2 className="text-xl font-display font-bold text-white tracking-tight mt-1">Market Indices Terminal</h2>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Real-time tracking, technical rebalancing, and predictive forecasting models across 60+ major worldwide indices.
          </p>
        </div>
        
        {/* Navigation Subtabs */}
        <div className="flex bg-gray-950 p-1 rounded-lg border border-gray-850">
          <button
            id="subtab-overview"
            onClick={() => setActiveSubTab('overview')}
            className={`px-4 py-2 rounded text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-1.5 ${
              activeSubTab === 'overview'
                ? 'bg-teal-500/15 text-teal-400 border border-teal-500/35'
                : 'text-gray-400 hover:text-white border border-transparent'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            MARKET OVERVIEW
          </button>
          <button
            id="subtab-analysis"
            onClick={() => setActiveSubTab('analysis')}
            className={`px-4 py-2 rounded text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-1.5 ${
              activeSubTab === 'analysis'
                ? 'bg-teal-500/15 text-teal-400 border border-teal-500/35'
                : 'text-gray-400 hover:text-white border border-transparent'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            INDEX ANALYSIS
          </button>
          <button
            id="subtab-comparison"
            onClick={() => setActiveSubTab('comparison')}
            className={`px-4 py-2 rounded text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-1.5 ${
              activeSubTab === 'comparison'
                ? 'bg-teal-500/15 text-teal-400 border border-teal-500/35'
                : 'text-gray-400 hover:text-white border border-transparent'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            COMPARISON ENGINE
          </button>
        </div>
      </div>

      {/* ======================= TAB 1: MARKET OVERVIEW ======================= */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Top Tickers Snapshot Cards - Grid of 22 Professional Indian Indices */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { sym: '^NSEI', name: 'NIFTY 50' },
              { sym: '^NSENX', name: 'NIFTY NEXT 50' },
              { sym: 'NIFTY100', name: 'NIFTY 100' },
              { sym: 'NIFTY200', name: 'NIFTY 200' },
              { sym: 'NIFTY500', name: 'NIFTY 500' },
              { sym: 'NIFTYMID50', name: 'NIFTY MIDCAP' },
              { sym: 'NIFTYSML100', name: 'NIFTY SMALLCAP' },
              { sym: '^NSEBANK', name: 'BANK NIFTY' },
              { sym: 'NIFTYFIN', name: 'FINNIFTY' },
              { sym: 'NIFTYIT', name: 'NIFTY IT' },
              { sym: 'NIFTYAUTO', name: 'NIFTY AUTO' },
              { sym: 'NIFTYFMCG', name: 'NIFTY FMCG' },
              { sym: 'NIFTYMETAL', name: 'NIFTY METAL' },
              { sym: 'NIFTYPHARMA', name: 'NIFTY PHARMA' },
              { sym: 'NIFTYREALTY', name: 'NIFTY REALTY' },
              { sym: 'NIFTYENERGY', name: 'NIFTY ENERGY' },
              { sym: 'INDIAVIX', name: 'INDIA VIX' },
              { sym: '^BSESN', name: 'BSE SENSEX' },
              { sym: 'BSEBANK', name: 'BSE BANKEX' },
              { sym: 'BSE100', name: 'BSE 100' },
              { sym: 'BSE200', name: 'BSE 200' },
              { sym: 'BSE500', name: 'BSE 500' }
            ].map(item => {
              const details = getIndex(item.sym);
              if (!details) return null;
              const isUp = details.changePercent >= 0;
              const sign = isUp ? '+' : '';
              
              // Calculate sitting position for Day Range slider
              const rangeDiff = details.high - details.low;
              const positionPercent = rangeDiff > 0 
                ? Math.min(100, Math.max(0, ((details.price - details.low) / rangeDiff) * 100))
                : 50;

              return (
                <div 
                  key={item.sym} 
                  onClick={() => {
                    setSelectedSymbol(item.sym);
                    setActiveSubTab('analysis');
                  }}
                  className="bg-slate-900 border border-gray-800/80 p-5 rounded-lg hover:border-teal-500/50 cursor-pointer transition-all space-y-4 group relative overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase group-hover:text-teal-400 transition-colors">{item.name}</h4>
                      <span className="text-[9px] font-mono text-gray-500">{details.symbol}</span>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                      details.category === 'NSE' ? 'bg-teal-500/10 text-teal-400' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {details.category}
                    </span>
                  </div>

                  {/* Price & Change */}
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-mono font-bold text-white tracking-tight">
                      {details.symbol === 'INDIAVIX' ? '' : '₹'}{details.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {sign}{details.change.toFixed(2)} ({sign}{details.changePercent.toFixed(2)}%)
                    </span>
                  </div>

                  {/* OHLC Grid */}
                  <div className="grid grid-cols-2 gap-2 border-t border-gray-800/40 pt-3 text-[10px] font-mono text-gray-400">
                    <div className="flex justify-between">
                      <span>OPEN:</span>
                      <strong className="text-white">{details.open.toFixed(1)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>PREV CLOSE:</span>
                      <strong className="text-white">{details.prevClose.toFixed(1)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>HIGH:</span>
                      <strong className="text-white">{details.high.toFixed(1)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>LOW:</span>
                      <strong className="text-white">{details.low.toFixed(1)}</strong>
                    </div>
                  </div>

                  {/* Day Range Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-gray-500">
                      <span>L: {details.low.toFixed(1)}</span>
                      <span>H: {details.high.toFixed(1)}</span>
                    </div>
                    <div className="h-1 bg-gray-950 rounded-full relative">
                      <div 
                        className={`absolute w-1.5 h-1.5 rounded-full top-1/2 -translate-y-1/2 -translate-x-1/2 ${isUp ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]'}`}
                        style={{ left: `${positionPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Volume, Status, Data Source & Timestamp */}
                  <div className="flex justify-between items-center text-[9px] font-mono text-gray-500 border-t border-gray-800/30 pt-3">
                    <div className="flex flex-col">
                      <span>VOL: <strong className="text-gray-300">{(details.volume / 1000).toFixed(1)}k</strong></span>
                      <span>STATUS: <strong className={details.marketStatus === 'Open' ? 'text-emerald-400' : 'text-gray-400'}>{details.marketStatus}</strong></span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span>{details.lastUpdate || '15:30:00'} IST</span>
                      <span className="text-[8px] text-teal-400 font-bold truncate max-w-[150px]" title={activeProvider}>{activeProvider}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Core Market Overview Layout: Left (Movers & Sector Heatmap) | Right (Events & AI Sentiment) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left/Middle Column (Movers & Sectors) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Advance Decline and Breadth */}
              <div className="bg-slate-900 border border-gray-800/80 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Market Breadth & Flow (NIFTY 50 Pool)</h3>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 bg-gray-950 px-2 py-0.5 rounded border border-gray-850">
                    Ratio: {((getIndex('^NSEI')?.advanceDecline.advances || 15) / (getIndex('^NSEI')?.advanceDecline.declines || 10)).toFixed(1)}x
                  </span>
                </div>
                
                {/* Advance Decline ratio bar */}
                {(() => {
                  const n = getIndex('^NSEI')?.advanceDecline || { advances: 18, declines: 6, unchanged: 1 };
                  const total = n.advances + n.declines + n.unchanged;
                  const advPct = (n.advances / total) * 100;
                  const decPct = (n.declines / total) * 100;
                  const uncPct = (n.unchanged / total) * 100;
                  return (
                    <div className="space-y-3">
                      <div className="flex h-3 rounded-full overflow-hidden bg-gray-950 border border-gray-850">
                        <div style={{ width: `${advPct}%` }} className="bg-emerald-500 hover:opacity-90 transition-all" title={`${n.advances} Advances`} />
                        <div style={{ width: `${uncPct}%` }} className="bg-gray-600" title={`${n.unchanged} Unchanged`} />
                        <div style={{ width: `${decPct}%` }} className="bg-rose-500 hover:opacity-90 transition-all" title={`${n.declines} Declines`} />
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-gray-400">
                        <span className="text-emerald-400 font-bold">{n.advances} ADVANCES ({advPct.toFixed(0)}%)</span>
                        <span className="text-gray-500">{n.unchanged} UNCHANGED</span>
                        <span className="text-rose-400 font-bold">{n.declines} DECLINES ({decPct.toFixed(0)}%)</span>
                      </div>
                    </div>
                  );
                })()}

                {/* FII / DII activity summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-5 border-t border-gray-800/40">
                  <div className="bg-gray-950/40 p-3 rounded border border-gray-850 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] text-gray-500 font-bold block uppercase tracking-wider">FII Net Flow</span>
                      <span className="text-xs font-mono font-bold text-white">+{fiiDiiData.fiiNet.toFixed(1)} Cr</span>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold font-mono px-2 py-0.5 rounded border border-emerald-500/20">
                      NET BUY
                    </span>
                  </div>
                  <div className="bg-gray-950/40 p-3 rounded border border-gray-850 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] text-gray-500 font-bold block uppercase tracking-wider">DII Net Flow</span>
                      <span className="text-xs font-mono font-bold text-white">+{fiiDiiData.diiNet.toFixed(1)} Cr</span>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold font-mono px-2 py-0.5 rounded border border-emerald-500/20">
                      NET BUY
                    </span>
                  </div>
                </div>
              </div>

              {/* Sector Performance Table & Heatmap */}
              <div className="bg-slate-900 border border-gray-800/80 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-teal-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Sector Performance Heatmap</h3>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-gray-400">
                    <span>Top: <strong className="text-emerald-400">{topSector.name} ({topSector.changePercent}%)</strong></span>
                    <span>•</span>
                    <span>Worst: <strong className="text-rose-400">{worstSector.name} ({worstSector.changePercent}%)</strong></span>
                  </div>
                </div>

                {/* Grid performance visual blocks */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  {SECTORS_LIST.slice(0, 8).map(sec => {
                    const isUp = sec.changePercent >= 0;
                    return (
                      <div 
                        key={sec.name} 
                        className={`p-3 rounded border text-center transition-all ${
                          sec.changePercent >= 2.0 ? 'bg-emerald-950/40 border-emerald-500/30' :
                          sec.changePercent >= 0.5 ? 'bg-emerald-950/20 border-emerald-800/40' :
                          sec.changePercent >= 0 ? 'bg-gray-950/20 border-gray-850' :
                          sec.changePercent >= -1.0 ? 'bg-rose-950/20 border-rose-900/30' :
                          'bg-rose-950/40 border-rose-500/30'
                        }`}
                      >
                        <span className="text-[10px] font-medium text-gray-300 block truncate" title={sec.name}>{sec.name}</span>
                        <span className={`text-xs font-mono font-bold mt-1 block ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isUp ? '+' : ''}{sec.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* AI Sector Outlook Ledger list */}
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {SECTORS_LIST.map(sec => {
                    const isUp = sec.changePercent >= 0;
                    return (
                      <div key={sec.name} className="p-3 bg-gray-950/35 rounded border border-gray-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-white">{sec.name}</span>
                          <p className="text-[10px] text-gray-400 leading-normal">{sec.outlook}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          <span className="text-[10px] font-mono text-gray-500">Vol: {sec.volume}</span>
                          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                            isUp ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {isUp ? '+' : ''}{sec.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column (AI Sentiment, Calendars & Global Snapshot) */}
            <div className="space-y-6">
              
              {/* AI Market Sentiment Score */}
              <div className="bg-slate-900 border border-gray-800/80 rounded-lg p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/10">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Quant Market Sentiment</h3>
                </div>
                
                <div className="text-center py-2 space-y-2">
                  <div className="text-3xl font-mono font-bold text-teal-400">BULLISH</div>
                  <div className="text-xs font-bold text-gray-300">Confidence Factor: <span className="text-teal-400">72%</span></div>
                  <p className="text-[11px] text-gray-400 leading-normal italic px-2">
                    "FII/DII net flows are displaying net buying posture, while implied volatility levels in India VIX index remain steady below 14.5. Positive sector rotation into banking supports a solid floor."
                  </p>
                </div>
              </div>

              {/* Economic & Corporate Calendar */}
              <div className="bg-slate-900 border border-gray-800/80 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-teal-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Economic & Earnings Calendar</h3>
                </div>
                
                <div className="space-y-3">
                  {[
                    { date: 'JULY 16', label: 'US Core Retail Sales MoM', type: 'ECON', impact: 'HIGH' },
                    { date: 'JULY 17', label: 'India WPI YoY Inflation rate', type: 'ECON', impact: 'MED' },
                    { date: 'JULY 22', label: 'Nifty 50 IPO Listing - ABC Corp', type: 'IPO', impact: 'MED' },
                    { date: 'JULY 23', label: 'Tesla Inc (TSLA) Q2 Earnings', type: 'EARN', impact: 'CRIT' },
                    { date: 'JULY 25', label: 'Microsoft (MSFT) Q2 Earnings', type: 'EARN', impact: 'CRIT' }
                  ].map((evt, idx) => (
                    <div key={idx} className="p-2.5 bg-gray-950/30 rounded border border-gray-850 flex justify-between items-center text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-mono text-teal-400 font-bold block">{evt.date} • {evt.type}</span>
                        <span className="text-gray-200 font-sans">{evt.label}</span>
                      </div>
                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        evt.impact === 'CRIT' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        evt.impact === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-gray-800 text-gray-400'
                      }`}>
                        {evt.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Breaking Financial News Ticker */}
              <div className="bg-slate-900 border border-gray-800/80 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Newspaper className="w-4 h-4 text-teal-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Breaking Index News</h3>
                </div>
                
                <div className="space-y-3">
                  {[
                    { title: 'NIFTY 50 holds key 24,300 support floor; banking sectors rally.', time: '10 mins ago' },
                    { title: 'Federal Reserve hints at interest rate stabilization in upcoming session.', time: '45 mins ago' },
                    { title: 'Global IT index gains 1.8% as technology valuations attract institutional inflows.', time: '2 hours ago' }
                  ].map((news, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-xs text-gray-200 hover:text-teal-400 cursor-pointer transition-colors leading-relaxed">
                        {news.title}
                      </p>
                      <span className="text-[9px] font-mono text-gray-500 block">{news.time}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ======================= TAB 2: INDEX ANALYSIS ======================= */}
      {activeSubTab === 'analysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Left Column (Selector & List Search): 4 cols */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 border border-gray-800/80 rounded-lg p-4 space-y-4">
              
              {/* Category selector */}
              <div className="flex flex-wrap gap-1.5 border-b border-gray-800/60 pb-3">
                {['ALL', 'NSE', 'BSE', 'US', 'Europe', 'Asia', 'Other'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setIndexFilter(cat as any)}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                      indexFilter === cat
                        ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search 60+ Indices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-850 rounded-md pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              {/* Index List Container */}
              <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                {filteredIndices.map(meta => {
                  const details = getIndex(meta.symbol);
                  const isSelected = selectedSymbol === meta.symbol;
                  const changePercent = details ? details.changePercent : 0;
                  const price = details ? details.price : meta.baseValue;
                  const isUp = changePercent >= 0;
                  const sign = isUp ? '+' : '';
                  const isIndiaItem = meta.category === 'NSE' || meta.category === 'BSE';
                  const symbolPrefixItem = isIndiaItem ? '₹' : '$';

                  return (
                    <div
                      key={meta.symbol}
                      onClick={() => setSelectedSymbol(meta.symbol)}
                      className={`p-3 rounded border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-teal-500/10 border-teal-500/40'
                          : 'bg-gray-950/20 border-gray-850 hover:bg-gray-850'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-white group-hover:text-teal-400">{meta.symbol}</span>
                          <span className="text-[9px] text-gray-500 uppercase font-bold">{meta.category}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 truncate max-w-[150px]">{meta.name}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-white block">
                          {price.toFixed(meta.symbol === 'INDIAVIX' ? 2 : 1)}
                        </span>
                        <span className={`text-[10px] font-mono font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'} block`}>
                          {sign}{changePercent.toFixed(2)}%
                        </span>
                        {(details?.predictions?.todayCloseRange || details?.predictions?.endOfDay?.range) && (
                          <span className="text-[9px] font-mono text-teal-400/90 block mt-0.5" title="AI Expected Closing Range">
                            AI Cl: {symbolPrefixItem}{(details.predictions.todayCloseRange?.[0] ?? details.predictions.endOfDay.range[0]).toFixed(0)}-{symbolPrefixItem}{(details.predictions.todayCloseRange?.[1] ?? details.predictions.endOfDay.range[1]).toFixed(0)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          {/* Right Column (Advanced Technical Chart & Forecast details): 8 cols */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Live Stats Bar */}
            {currentIdxDetails && (
              <div className="bg-slate-900 border border-gray-800/80 rounded-lg p-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded border border-teal-500/20 uppercase">
                      Live Stream
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1.5">{currentIdxDetails.name}</h3>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{currentIdxDetails.symbol} • Status: {currentIdxDetails.marketStatus}</p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-left">
                      <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block font-sans">Live Index Price</span>
                      <span className="text-xl font-mono font-bold text-white block">
                        {currentIdxDetails.price.toFixed(currentIdxDetails.symbol === 'INDIAVIX' ? 2 : 1)}
                      </span>
                      <span className={`text-xs font-mono font-bold ${currentIdxDetails.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {currentIdxDetails.changePercent >= 0 ? '+' : ''}{currentIdxDetails.change.toFixed(1)} ({currentIdxDetails.changePercent >= 0 ? '+' : ''}{currentIdxDetails.changePercent.toFixed(2)}%)
                      </span>
                    </div>

                    {(() => {
                      const isIndia = currentIdxDetails.category === 'NSE' || currentIdxDetails.category === 'BSE';
                      const symbolPrefix = isIndia ? '₹' : '$';
                      return (
                        <>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[10px] text-gray-400 border-l border-gray-800 pl-6">
                            <div>OPEN: <strong className="text-white">{symbolPrefix}{currentIdxDetails.open.toFixed(1)}</strong></div>
                            <div>HIGH: <strong className="text-white">{symbolPrefix}{currentIdxDetails.high.toFixed(1)}</strong></div>
                            <div>CLOSE: <strong className="text-white">{symbolPrefix}{currentIdxDetails.prevClose.toFixed(1)}</strong></div>
                            <div>LOW: <strong className="text-white">{symbolPrefix}{currentIdxDetails.low.toFixed(1)}</strong></div>
                          </div>

                          <div className="grid grid-cols-1 gap-y-1 font-mono text-[10px] text-teal-400 border-l border-gray-800 pl-6 p-2 rounded bg-teal-950/15 border border-teal-500/25">
                            <div>AI PRED. OPEN: <span className="text-white font-bold">{symbolPrefix}{(currentIdxDetails.predictions.todayOpenRange?.[0] ?? (currentIdxDetails.open * 0.9995)).toFixed(1)} - {symbolPrefix}{(currentIdxDetails.predictions.todayOpenRange?.[1] ?? (currentIdxDetails.open * 1.0005)).toFixed(1)}</span></div>
                            <div>AI PRED. CLOSE: <span className="text-teal-400 font-extrabold">{symbolPrefix}{(currentIdxDetails.predictions.todayCloseRange?.[0] ?? currentIdxDetails.predictions.endOfDay.range[0]).toFixed(1)} - {symbolPrefix}{(currentIdxDetails.predictions.todayCloseRange?.[1] ?? currentIdxDetails.predictions.endOfDay.range[1]).toFixed(1)}</span></div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Sub-Chart Navigation */}
                <div className="flex border-b border-gray-800/60 mt-6 pb-2 items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setChartType('candlestick')}
                      className={`px-3 py-1.5 rounded text-[10px] font-mono font-bold transition-all ${
                        chartType === 'candlestick'
                          ? 'bg-teal-500/15 text-teal-400 border border-teal-500/35'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      CANDLESTICK CHART
                    </button>
                    <button
                      onClick={() => setChartType('intraday')}
                      className={`px-3 py-1.5 rounded text-[10px] font-mono font-bold transition-all ${
                        chartType === 'intraday'
                          ? 'bg-teal-500/15 text-teal-400 border border-teal-500/35'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      INTRADAY AREA
                    </button>
                    <button
                      onClick={() => setChartType('historical')}
                      className={`px-3 py-1.5 rounded text-[10px] font-mono font-bold transition-all ${
                        chartType === 'historical'
                          ? 'bg-teal-500/15 text-teal-400 border border-teal-500/35'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      HISTORICAL DURATION
                    </button>
                  </div>
                </div>

                {/* Main Visualizer Area */}
                <div className="h-64 mt-4 relative">
                  {chartType === 'intraday' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={currentIdxDetails.intradayBars}>
                        <defs>
                          <linearGradient id="idxGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" stroke="#475569" fontSize={10} fontFamily="monospace" />
                        <YAxis stroke="#475569" fontSize={10} domain={['auto', 'auto']} fontFamily="monospace" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '6px' }}
                          itemStyle={{ color: '#f1f5f9', fontSize: '11px', fontFamily: 'monospace' }}
                        />
                        {(currentIdxDetails.predictions?.todayCloseRange || currentIdxDetails.predictions?.endOfDay?.range) && (
                          <ReferenceArea 
                            {...({
                              y1: currentIdxDetails.predictions.todayCloseRange?.[0] ?? currentIdxDetails.predictions.endOfDay.range[0],
                              y2: currentIdxDetails.predictions.todayCloseRange?.[1] ?? currentIdxDetails.predictions.endOfDay.range[1],
                              fill: "#14b8a6",
                              fillOpacity: 0.06,
                              stroke: "#14b8a6",
                              strokeWidth: 0.5,
                              strokeDasharray: "4 4",
                              label: { 
                                value: 'AI PREDICTED RANGE', 
                                position: 'insideLeft', 
                                fill: '#14b8a6', 
                                fontSize: 8, 
                                fontFamily: 'monospace',
                                fontWeight: 'bold',
                                opacity: 0.6
                              }
                            } as any)}
                          />
                        )}
                        <Area type="monotone" dataKey="close" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#idxGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}

                  {chartType === 'historical' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={currentIdxDetails.historicalBars}>
                        <defs>
                          <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" stroke="#475569" fontSize={10} fontFamily="monospace" />
                        <YAxis stroke="#475569" fontSize={10} domain={['auto', 'auto']} fontFamily="monospace" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '6px' }}
                          itemStyle={{ color: '#f1f5f9', fontSize: '11px', fontFamily: 'monospace' }}
                        />
                        {(currentIdxDetails.predictions?.todayCloseRange || currentIdxDetails.predictions?.endOfDay?.range) && (
                          <ReferenceArea 
                            {...({
                              y1: currentIdxDetails.predictions.todayCloseRange?.[0] ?? currentIdxDetails.predictions.endOfDay.range[0],
                              y2: currentIdxDetails.predictions.todayCloseRange?.[1] ?? currentIdxDetails.predictions.endOfDay.range[1],
                              fill: "#14b8a6",
                              fillOpacity: 0.06,
                              stroke: "#14b8a6",
                              strokeWidth: 0.5,
                              strokeDasharray: "4 4",
                              label: { 
                                value: 'AI PREDICTED RANGE', 
                                position: 'insideLeft', 
                                fill: '#14b8a6', 
                                fontSize: 8, 
                                fontFamily: 'monospace',
                                fontWeight: 'bold',
                                opacity: 0.6
                              }
                            } as any)}
                          />
                        )}
                        <Area type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#histGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}

                  {chartType === 'candlestick' && (
                    <div className="w-full h-full flex flex-col justify-between">
                      {/* Interactive Candle Overlay details */}
                      <ResponsiveContainer width="100%" height="80%">
                        <ComposedChart data={currentIdxDetails.intradayBars}>
                          <XAxis dataKey="time" stroke="#475569" fontSize={9} fontFamily="monospace" />
                          <YAxis stroke="#475569" fontSize={9} domain={['auto', 'auto']} fontFamily="monospace" />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '6px' }}
                            itemStyle={{ color: '#f1f5f9', fontSize: '10px', fontFamily: 'monospace' }}
                            formatter={(value: any, name: string) => [parseFloat(value).toFixed(2), name.toUpperCase()]}
                          />
                          {(currentIdxDetails.predictions?.todayCloseRange || currentIdxDetails.predictions?.endOfDay?.range) && (
                            <ReferenceArea 
                              {...({
                                y1: currentIdxDetails.predictions.todayCloseRange?.[0] ?? currentIdxDetails.predictions.endOfDay.range[0],
                                y2: currentIdxDetails.predictions.todayCloseRange?.[1] ?? currentIdxDetails.predictions.endOfDay.range[1],
                                fill: "#14b8a6",
                                fillOpacity: 0.06,
                                stroke: "#14b8a6",
                                strokeWidth: 0.5,
                                strokeDasharray: "4 4",
                                label: { 
                                  value: 'AI PREDICTED RANGE', 
                                  position: 'insideLeft', 
                                  fill: '#14b8a6', 
                                  fontSize: 8, 
                                  fontFamily: 'monospace',
                                  fontWeight: 'bold',
                                  opacity: 0.6
                                }
                              } as any)}
                            />
                          )}
                          {/* Candle stick drawing using vertical floating bars representing High & Low, Open & Close */}
                          <Bar dataKey="close" fill="#0d9488" maxBarSize={15}>
                            {currentIdxDetails.intradayBars.map((entry, index) => {
                              const isGreen = entry.close >= entry.open;
                              return <Cell key={`cell-${index}`} fill={isGreen ? '#10b981' : '#f43f5e'} />;
                            })}
                          </Bar>
                        </ComposedChart>
                      </ResponsiveContainer>
                      <div className="h-[20%] mt-2">
                        {/* Index Volume */}
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={currentIdxDetails.intradayBars}>
                            <XAxis dataKey="time" hide />
                            <YAxis hide />
                            <Bar dataKey="volume" fill="#475569" opacity={0.35} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* AI Technical & Score cards */}
            {currentIdxDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* AI Index Analysis & Core Scores */}
                <div className="bg-slate-900 border border-gray-800/80 rounded-lg p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Quantum Index Rating</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-mono">
                    <div className="bg-gray-950 p-2.5 rounded border border-gray-850">
                      <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider block">Trend Assessment</span>
                      <span className="text-xs font-bold text-white block mt-0.5">{currentIdxDetails.aiAnalysis.marketTrend}</span>
                    </div>
                    <div className="bg-gray-950 p-2.5 rounded border border-gray-850">
                      <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider block">AI Recommendation</span>
                      <span className="text-xs font-bold text-teal-400 block mt-0.5">{currentIdxDetails.aiAnalysis.recommendation}</span>
                    </div>
                  </div>

                  {/* Rating Metrics bars */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                        <span>BULLISH / BEARISH MOMENTUM</span>
                        <span className="text-teal-400 font-bold">{currentIdxDetails.aiAnalysis.bullishBearishScore}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-950 rounded-full overflow-hidden">
                        <div style={{ width: `${currentIdxDetails.aiAnalysis.bullishBearishScore}%` }} className="h-full bg-teal-500" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                        <span>MOMENTUM VELOCITY</span>
                        <span className="text-teal-400 font-bold">{currentIdxDetails.aiAnalysis.momentumScore}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-950 rounded-full overflow-hidden">
                        <div style={{ width: `${currentIdxDetails.aiAnalysis.momentumScore}%` }} className="h-full bg-teal-500" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                        <span>VOLATILITY HARVEST</span>
                        <span className="text-teal-400 font-bold">{currentIdxDetails.aiAnalysis.volatilityScore}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-950 rounded-full overflow-hidden">
                        <div style={{ width: `${currentIdxDetails.aiAnalysis.volatilityScore}%` }} className="h-full bg-teal-500" />
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-400 leading-relaxed italic border-t border-gray-800/60 pt-3">
                    {currentIdxDetails.aiAnalysis.reasoning}
                  </p>
                </div>

                {/* Index Predictions Panel */}
                <div className="bg-slate-900 border border-gray-800/80 rounded-lg p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-teal-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Predictive Horizon (ML Models)</h4>
                  </div>

                  <div className="space-y-2.5">
                    {(() => {
                      const isIndia = currentIdxDetails.category === 'NSE' || currentIdxDetails.category === 'BSE';
                      const symbolPrefix = isIndia ? '₹' : '$';
                      return [
                        { key: 'nextHour', label: 'NEXT HOUR', data: currentIdxDetails.predictions.nextHour },
                        { key: 'endOfDay', label: 'END OF TRADING DAY', data: currentIdxDetails.predictions.endOfDay },
                        { key: 'tomorrow', label: 'TOMORROW', data: currentIdxDetails.predictions.tomorrow },
                        { key: 'nextWeek', label: 'NEXT WEEK', data: currentIdxDetails.predictions.nextWeek },
                        { key: 'nextMonth', label: 'NEXT MONTH', data: currentIdxDetails.predictions.nextMonth }
                      ].map(pred => {
                        const trendUp = pred.data.trend === 'Up';
                        return (
                          <div key={pred.key} className="p-2 bg-gray-950/40 rounded border border-gray-850 flex items-center justify-between font-mono text-[10px]">
                            <span className="text-gray-400 font-bold">{pred.label}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-white font-bold">{symbolPrefix}{pred.data.range[0].toFixed(0)} - {symbolPrefix}{pred.data.range[1].toFixed(0)}</span>
                              <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] ${
                                trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                              }`}>
                                {pred.data.trend} ({pred.data.probability}%)
                              </span>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Signals list */}
                  <div className="space-y-1.5 border-t border-gray-800/60 pt-3">
                    <span className="text-[9px] text-gray-500 font-bold block uppercase tracking-wider">Predictive Signals</span>
                    {currentIdxDetails.predictions.signals.map((sig, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-1.5 text-[10px] text-gray-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                        <span>{sig}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* Comprehensive Live Quant Analysis & Tabs Board */}
            {currentIdxDetails && (() => {
              const techSummary = calculateTechnicalIndicators(currentIdxDetails.price, currentIdxDetails.intradayBars);
              const optSummary = generateOptionChain(currentIdxDetails.price, currentIdxDetails.symbol);
              const instActivity = generateInstitutionalActivity(currentIdxDetails.price, currentIdxDetails.symbol);
              const newsItems = generateNewsForIndex(currentIdxDetails.symbol, currentIdxDetails.category);
              const pivotVals = calculatePivotPoints(currentIdxDetails.high, currentIdxDetails.low, currentIdxDetails.price);
              const fibVals = calculateFibLevels(currentIdxDetails.high, currentIdxDetails.low);

              const isIndia = currentIdxDetails.category === 'NSE' || currentIdxDetails.category === 'BSE';
              const currencySymbol = isIndia ? '₹' : '$';
              const unitLabel = isIndia ? 'Cr' : 'M';

              return (
                <div className="bg-slate-900 border border-gray-800/80 rounded-lg p-5 space-y-6">
                  
                  {/* Tab Selector Headers */}
                  <div className="flex flex-wrap gap-2 border-b border-gray-800/80 pb-4">
                    {[
                      { id: 'constituents', label: 'Index Constituents', icon: Layers },
                      { id: 'technical', label: 'Technical Indicators & Zones', icon: Activity },
                      { id: 'options', label: 'Options Chain & OI Analysis', icon: Percent },
                      { id: 'breadth', label: 'Market Breadth & Institutions', icon: Compass },
                      { id: 'news', label: 'Tailored News & Sentiment', icon: Newspaper },
                      { id: 'ai-predictions', label: 'AI Index Prediction Engine', icon: Brain }
                    ].map(tab => {
                      const Icon = tab.icon;
                      const isActive = selectedDetailTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setSelectedDetailTab(tab.id as any)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-teal-500/15 text-teal-400 border border-teal-500/40 shadow-sm shadow-teal-500/5'
                              : 'text-gray-400 hover:text-white hover:bg-gray-800/40 border border-transparent'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* ======================= TAB CONTENT 1: CONSTITUENTS ======================= */}
                  {selectedDetailTab === 'constituents' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex justify-between items-center">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">{currentIdxDetails.name} Weight Distributions</h4>
                          <p className="text-[10px] text-gray-400 font-mono">Live constituent stock prices syncing instantly with index ticks</p>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400 bg-gray-950 px-2 py-0.5 rounded border border-gray-850">
                          Total: {currentIdxDetails.constituents.length} Assets
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse font-sans text-xs">
                          <thead>
                            <tr className="border-b border-gray-800 text-gray-400 uppercase tracking-wider text-[9px] font-bold">
                              <th className="pb-3 px-3">Company</th>
                              <th className="pb-3 px-3">Symbol</th>
                              <th className="pb-3 px-3">Weight %</th>
                              <th className="pb-3 px-3 text-right">Live Price</th>
                              <th className="pb-3 px-3 text-right">Change %</th>
                              <th className="pb-3 px-3">Sentiment</th>
                              <th className="pb-3 px-3 text-right">Fund. Score</th>
                              <th className="pb-3 px-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-850">
                            {currentIdxDetails.constituents.map(c => {
                              const isUp = c.changePercent >= 0;
                              return (
                                <tr key={c.symbol} className="hover:bg-gray-950/40 group">
                                  <td className="py-2.5 px-3 font-semibold text-white truncate max-w-[150px]" title={c.name}>{c.name}</td>
                                  <td className="py-2.5 px-3 font-mono font-bold text-teal-400">{c.symbol}</td>
                                  <td className="py-2.5 px-3 font-mono text-gray-400">{c.weightage}%</td>
                                  <td className="py-2.5 px-3 font-mono text-right text-gray-100">{currencySymbol}{c.price.toFixed(2)}</td>
                                  <td className={`py-2.5 px-3 font-mono text-right font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {isUp ? '+' : ''}{c.changePercent.toFixed(2)}%
                                  </td>
                                  <td className="py-2.5 px-3 font-mono">
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                      c.newsSentiment > 0.2 ? 'bg-emerald-500/10 text-emerald-400' : 
                                      c.newsSentiment < -0.2 ? 'bg-rose-500/10 text-rose-400' : 'bg-gray-800 text-gray-400'
                                    }`}>
                                      {c.newsSentiment > 0.2 ? 'Positive' : c.newsSentiment < -0.2 ? 'Negative' : 'Neutral'}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 font-mono text-right text-teal-400 font-bold">{c.fundamentalScore}/10</td>
                                  <td className="py-2.5 px-3 text-right">
                                    <button
                                      onClick={() => {
                                        onSelectStock(c.symbol);
                                        setActiveTab('charts');
                                      }}
                                      className="opacity-0 group-hover:opacity-100 px-2 py-0.5 rounded bg-teal-500 text-slate-950 font-bold text-[9px] uppercase tracking-wider transition-opacity font-mono"
                                    >
                                      Analyze
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* ======================= TAB CONTENT 2: TECHNICAL ANALYSIS ======================= */}
                  {selectedDetailTab === 'technical' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
                      
                      {/* Left: Technical Oscillators & Moving Averages */}
                      <div className="lg:col-span-7 space-y-5">
                        
                        {/* Summary Header */}
                        <div className="p-3 bg-gray-950/40 border border-gray-850 rounded-md flex justify-between items-center font-mono text-[10px]">
                          <div>
                            <span className="text-gray-500 font-bold block">TECHNICAL CONCENSUS</span>
                            <span className="text-white text-xs font-bold mt-0.5 uppercase">{techSummary.overallRating}</span>
                          </div>
                          <div className="flex gap-4">
                            <div>
                              <span className="text-gray-500 block">OSCILLATORS</span>
                              <span className={`font-bold block ${techSummary.oscillatorsRating.includes('Buy') ? 'text-emerald-400' : 'text-gray-400'}`}>
                                {techSummary.oscillatorsRating}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 block">MOVING AVERAGES</span>
                              <span className={`font-bold block ${techSummary.movingAveragesRating.includes('Buy') ? 'text-emerald-400' : 'text-gray-400'}`}>
                                {techSummary.movingAveragesRating}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Indicators Grid Table */}
                        <div className="border border-gray-800/80 rounded overflow-hidden">
                          <table className="w-full text-left border-collapse font-mono text-[11px]">
                            <thead>
                              <tr className="bg-gray-950 text-gray-500 text-[9px] uppercase font-bold border-b border-gray-800/80">
                                <th className="py-2.5 px-3">Indicator Name</th>
                                <th className="py-2.5 px-3 text-right">Value</th>
                                <th className="py-2.5 px-3 text-right">Signal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-850 bg-gray-950/20">
                              <tr>
                                <td className="py-2 px-3 text-gray-400">RSI (14 Period)</td>
                                <td className="py-2 px-3 text-right text-white font-bold">{techSummary.rsi}</td>
                                <td className="py-2 px-3 text-right">
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                    techSummary.rsi > 70 ? 'bg-rose-500/10 text-rose-400' : 
                                    techSummary.rsi < 30 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-gray-400'
                                  }`}>{techSummary.rsi > 70 ? 'Overbought' : techSummary.rsi < 30 ? 'Oversold' : 'Neutral'}</span>
                                </td>
                              </tr>
                              <tr>
                                <td className="py-2 px-3 text-gray-400">MACD Histogram</td>
                                <td className="py-2 px-3 text-right text-white font-bold">{techSummary.macd.histogram}</td>
                                <td className="py-2 px-3 text-right">
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${techSummary.macd.histogram >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                    {techSummary.macd.histogram >= 0 ? 'Bullish' : 'Bearish'}
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td className="py-2 px-3 text-gray-400">ADX Trend Strength</td>
                                <td className="py-2 px-3 text-right text-white font-bold">{techSummary.adx}</td>
                                <td className="py-2 px-3 text-right">
                                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-teal-500/10 text-teal-400 font-bold">
                                    {techSummary.adx > 25 ? 'Strong Trend' : 'Weak Trend'}
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td className="py-2 px-3 text-gray-400">ATR Volatility Range</td>
                                <td className="py-2 px-3 text-right text-white font-bold">{techSummary.atr}</td>
                                <td className="py-2 px-3 text-right text-gray-500">ATR(14)</td>
                              </tr>
                              <tr>
                                <td className="py-2 px-3 text-gray-400">Commodity Channel Index (CCI)</td>
                                <td className="py-2 px-3 text-right text-white font-bold">{techSummary.cci}</td>
                                <td className="py-2 px-3 text-right">
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${Math.abs(techSummary.cci) > 100 ? 'text-teal-400 bg-teal-500/10' : 'text-gray-500'}`}>
                                    {techSummary.cci > 100 ? 'Bullish Stretch' : techSummary.cci < -100 ? 'Bearish Stretch' : 'Neutral'}
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td className="py-2 px-3 text-gray-400">Chaikin Money Flow (CMF)</td>
                                <td className="py-2 px-3 text-right text-white font-bold">{techSummary.cmf}</td>
                                <td className="py-2 px-3 text-right">
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${techSummary.cmf > 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                                    {techSummary.cmf > 0 ? 'Accumulation' : 'Distribution'}
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td className="py-2 px-3 text-gray-400">SuperTrend Value</td>
                                <td className="py-2 px-3 text-right text-white font-bold">{techSummary.superTrend.value}</td>
                                <td className="py-2 px-3 text-right">
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${techSummary.superTrend.direction === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                                    {techSummary.superTrend.direction}
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td className="py-2 px-3 text-gray-400">Parabolic SAR Stop</td>
                                <td className="py-2 px-3 text-right text-white font-bold">{techSummary.sar}</td>
                                <td className="py-2 px-3 text-right">
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${currentIdxDetails.price > techSummary.sar ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {currentIdxDetails.price > techSummary.sar ? 'Support' : 'Resistance'}
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td className="py-2 px-3 text-gray-400">Bollinger Bands (20, 2)</td>
                                <td className="py-2 px-3 text-right text-white font-bold">
                                  {techSummary.bollingerBands.lower.toFixed(0)} - {techSummary.bollingerBands.upper.toFixed(0)}
                                </td>
                                <td className="py-2 px-3 text-right text-gray-500">
                                  Basis: {techSummary.bollingerBands.middle.toFixed(0)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                      </div>

                      {/* Right: Pivot Points, Retracements & Order Blocks */}
                      <div className="lg:col-span-5 space-y-5">
                        
                        {/* Market Structure Gaps and Probabilities */}
                        <div className="p-3 bg-gray-950/35 border border-gray-850 rounded space-y-2.5 font-mono text-[10px]">
                          <span className="text-gray-500 font-bold uppercase tracking-wider block">Real-time Breakout Odds</span>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="flex justify-between font-bold text-teal-400 mb-0.5">
                                <span>BREAKOUT ODDS</span>
                                <span>{techSummary.breakoutProb}%</span>
                              </div>
                              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div style={{ width: `${techSummary.breakoutProb}%` }} className="h-full bg-teal-400" />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between font-bold text-rose-400 mb-0.5">
                                <span>BREAKDOWN ODDS</span>
                                <span>{techSummary.breakdownProb}%</span>
                              </div>
                              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div style={{ width: `${techSummary.breakdownProb}%` }} className="h-full bg-rose-400" />
                              </div>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-gray-850 text-gray-400 text-[9px] leading-normal font-sans italic">
                            {techSummary.gapAnalysis}
                          </div>
                        </div>

                        {/* Classic Pivot Levels */}
                        <div className="bg-gray-950/25 border border-gray-850 rounded p-3 space-y-3 font-mono text-[10px]">
                          <span className="text-gray-500 font-bold uppercase tracking-wider block">Mathematical Pivot Tiers</span>
                          <div className="space-y-1">
                            <div className="flex justify-between text-rose-400">
                              <span>RESISTANCE 3 (R3)</span>
                              <span className="font-bold">{currencySymbol}{pivotVals.r3.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between text-rose-400/80">
                              <span>RESISTANCE 2 (R2)</span>
                              <span className="font-bold">{currencySymbol}{pivotVals.r2.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between text-rose-300">
                              <span>RESISTANCE 1 (R1)</span>
                              <span className="font-bold">{currencySymbol}{pivotVals.r1.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between text-white border-t border-b border-gray-850 py-1 font-bold bg-slate-950/50 px-1 rounded">
                              <span>PIVOT POINT (PP)</span>
                              <span>{currencySymbol}{pivotVals.pivot.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between text-emerald-300">
                              <span>SUPPORT 1 (S1)</span>
                              <span className="font-bold">{currencySymbol}{pivotVals.s1.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between text-emerald-400/80">
                              <span>SUPPORT 2 (S2)</span>
                              <span className="font-bold">{currencySymbol}{pivotVals.s2.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between text-emerald-400">
                              <span>SUPPORT 3 (S3)</span>
                              <span className="font-bold">{currencySymbol}{pivotVals.s3.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Fibonacci Retracements */}
                        <div className="bg-gray-950/25 border border-gray-850 rounded p-3 space-y-3 font-mono text-[10px]">
                          <span className="text-gray-500 font-bold uppercase tracking-wider block">Fibonacci Retracement Grid</span>
                          <div className="space-y-1.5">
                            <div className="flex justify-between">
                              <span className="text-gray-500">0.0% (Day Low)</span>
                              <span className="text-white">{currencySymbol}{fibVals.level0.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-teal-400">23.6% Level</span>
                              <span className="text-teal-400 font-bold">{currencySymbol}{fibVals.level236.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-teal-400">38.2% Level</span>
                              <span className="text-teal-400 font-bold">{currencySymbol}{fibVals.level382.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">50.0% Mean</span>
                              <span className="text-white font-bold">{currencySymbol}{fibVals.level500.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-teal-400 font-bold">61.8% Golden Ratio</span>
                              <span className="text-teal-400 font-bold">{currencySymbol}{fibVals.level618.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-teal-400">78.6% Deep Floor</span>
                              <span className="text-teal-400 font-bold">{currencySymbol}{fibVals.level786.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">100.0% (Day High)</span>
                              <span className="text-white">{currencySymbol}{fibVals.level100.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Order Blocks & Supply/Demand zones */}
                        <div className="bg-gray-950/25 border border-gray-850 rounded p-3 space-y-2.5 font-mono text-[10px]">
                          <span className="text-gray-500 font-bold uppercase tracking-wider block">Institutional Order Blocks & Fair Value Gaps</span>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1 border-r border-gray-850 pr-2">
                              <span className="text-emerald-400 font-bold block text-[8px] uppercase">Demand Blocks (Support)</span>
                              {techSummary.orderBlocks.filter(o => o.type === 'Demand').map((ob, i) => (
                                <div key={i} className="flex justify-between text-[9px] bg-emerald-500/5 px-1 py-0.5 rounded border border-emerald-500/10">
                                  <span className="text-emerald-300/80">DB #{i+1}</span>
                                  <span className="text-white font-bold">{currencySymbol}{ob.price.toFixed(0)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="space-y-1 pl-1">
                              <span className="text-rose-400 font-bold block text-[8px] uppercase">Supply Blocks (Resistance)</span>
                              {techSummary.orderBlocks.filter(o => o.type === 'Supply').map((ob, i) => (
                                <div key={i} className="flex justify-between text-[9px] bg-rose-500/5 px-1 py-0.5 rounded border border-rose-500/10">
                                  <span className="text-rose-300/80">SB #{i+1}</span>
                                  <span className="text-white font-bold">{currencySymbol}{ob.price.toFixed(0)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                  {/* ======================= TAB CONTENT 3: OPTIONS ANALYSIS ======================= */}
                  {selectedDetailTab === 'options' && (
                    <div className="space-y-6 animate-fade-in">
                      
                      {/* Summary Metrics Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 font-mono text-[10px]">
                        <div className="p-3 bg-gray-950/60 border border-gray-850 rounded text-center space-y-1">
                          <span className="text-gray-500 font-bold uppercase block text-[8px]">PUT CALL RATIO (PCR)</span>
                          <div className="text-lg font-bold text-white">{optSummary.pcr}</div>
                          <span className={`font-bold block text-[8px] py-0.5 rounded ${optSummary.pcr > 1.1 ? 'text-emerald-400 bg-emerald-500/5' : 'text-rose-400 bg-rose-500/5'}`}>
                            {optSummary.pcr > 1.1 ? 'BULLISH WRITING' : 'BEARISH WRITING'}
                          </span>
                        </div>
                        <div className="p-3 bg-gray-950/60 border border-gray-850 rounded text-center space-y-1">
                          <span className="text-gray-500 font-bold uppercase block text-[8px]">MAXIMUM PAIN POINT</span>
                          <div className="text-lg font-bold text-white">{currencySymbol}{optSummary.maxPain}</div>
                          <span className="text-gray-500 font-bold block text-[8px]">EXPIRY CONVERGENCE</span>
                        </div>
                        <div className="p-3 bg-gray-950/60 border border-gray-850 rounded text-center space-y-1">
                          <span className="text-gray-500 font-bold uppercase block text-[8px]">HEAVY CALL OPEN INT.</span>
                          <div className="text-lg font-bold text-rose-400">{currencySymbol}{optSummary.highestCallOIStrike}</div>
                          <span className="text-rose-500/80 font-bold block text-[8px] uppercase">Resistance Roof</span>
                        </div>
                        <div className="p-3 bg-gray-950/60 border border-gray-850 rounded text-center space-y-1">
                          <span className="text-gray-500 font-bold uppercase block text-[8px]">HEAVY PUT OPEN INT.</span>
                          <div className="text-lg font-bold text-emerald-400">{currencySymbol}{optSummary.highestPutOIStrike}</div>
                          <span className="text-emerald-500/80 font-bold block text-[8px] uppercase">Support Cushion</span>
                        </div>
                        <div className="p-3 bg-gray-950/60 border border-gray-850 rounded text-center space-y-1">
                          <span className="text-gray-500 font-bold uppercase block text-[8px]">IMPLIED VOLATILITY RANK</span>
                          <div className="text-lg font-bold text-white">{optSummary.ivRank}%</div>
                          <span className="text-gray-500 font-bold block text-[8px]">IVR (30 DAYS)</span>
                        </div>
                        <div className="p-3 bg-gray-950/60 border border-gray-850 rounded text-center space-y-1">
                          <span className="text-gray-500 font-bold uppercase block text-[8px]">IV PERCENTILE (IVP)</span>
                          <div className="text-lg font-bold text-white">{optSummary.ivPercentile}%</div>
                          <span className="text-teal-400 font-bold block text-[8px]">PREMIUM LEVELS</span>
                        </div>
                      </div>

                      {/* Option Chain Grid */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono font-bold text-gray-500 block uppercase tracking-wider">LIVE INTRADAY OPTION CHAIN BOARD (ATM TICK HARMONIC)</span>
                        <div className="overflow-x-auto border border-gray-850/80 rounded-md">
                          <table className="w-full text-center border-collapse font-mono text-[10px]">
                            <thead>
                              <tr className="bg-gray-950 text-gray-500 font-bold uppercase border-b border-gray-850/80">
                                <th colSpan={4} className="py-2 px-3 border-r border-gray-850 text-rose-400 bg-rose-500/5 font-extrabold">CALLS (BULL OUTLOOK)</th>
                                <th className="py-2 px-3 text-white font-extrabold bg-slate-900">STRIKE</th>
                                <th colSpan={4} className="py-2 px-3 border-l border-gray-850 text-emerald-400 bg-emerald-500/5 font-extrabold">PUTS (BEAR OUTLOOK)</th>
                              </tr>
                              <tr className="bg-gray-950 text-gray-500 text-[9px] border-b border-gray-850/80">
                                <th className="py-2 px-1">LTP</th>
                                <th className="py-2 px-1">OI (Vol)</th>
                                <th className="py-2 px-1">IV %</th>
                                <th className="py-2 px-1 border-r border-gray-850">Greeks (Δ)</th>
                                <th className="py-2 px-3 text-white bg-slate-900/50">STRIKE</th>
                                <th className="py-2 px-1 border-l border-gray-850">Greeks (Δ)</th>
                                <th className="py-2 px-1">IV %</th>
                                <th className="py-2 px-1">OI (Vol)</th>
                                <th className="py-2 px-1">LTP</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-850/50">
                              {optSummary.chain.map(opt => {
                                const isATM = Math.abs(currentIdxDetails.price - opt.strike) < (currentIdxDetails.price * 0.0035);
                                const callChgUp = opt.callChangePercent >= 0;
                                const putChgUp = opt.putChangePercent >= 0;

                                return (
                                  <tr key={opt.strike} className={`hover:bg-slate-950/60 transition-colors ${isATM ? 'bg-amber-500/5 border-t-2 border-b-2 border-amber-500/35' : ''}`}>
                                    {/* CALLS */}
                                    <td className="py-2.5 px-1 font-bold text-white">
                                      {currencySymbol}{opt.callLTP.toFixed(1)}
                                      <span className={`block text-[8px] font-extrabold mt-0.5 ${callChgUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {callChgUp ? '+' : ''}{opt.callChangePercent}%
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-1 text-gray-400">
                                      {opt.callOI.toLocaleString()}
                                      <span className="block text-[8px] text-gray-600">Vol: {opt.callVolume.toLocaleString()}</span>
                                    </td>
                                    <td className="py-2.5 px-1 text-rose-300/70">{opt.callIV}%</td>
                                    <td className="py-2.5 px-1 border-r border-gray-850 text-gray-500 font-sans text-[9px] hover:text-white" title={`Theta: ${opt.callTheta} | Vega: ${opt.callVega}`}>
                                      Δ: {opt.callDelta}
                                    </td>

                                    {/* STRIKE */}
                                    <td className={`py-2.5 px-3 font-extrabold text-xs text-white ${isATM ? 'bg-amber-500/10 font-black text-amber-300' : 'bg-gray-950/50'}`}>
                                      {opt.strike}
                                      {isATM && <span className="block text-[7px] text-amber-400 font-bold font-sans">ATM</span>}
                                    </td>

                                    {/* PUTS */}
                                    <td className="py-2.5 px-1 border-l border-gray-850 text-gray-500 font-sans text-[9px] hover:text-white" title={`Theta: ${opt.putTheta} | Vega: ${opt.putVega}`}>
                                      Δ: {opt.putDelta}
                                    </td>
                                    <td className="py-2.5 px-1 text-emerald-300/70">{opt.putIV}%</td>
                                    <td className="py-2.5 px-1 text-gray-400">
                                      {opt.putOI.toLocaleString()}
                                      <span className="block text-[8px] text-gray-600">Vol: {opt.putVolume.toLocaleString()}</span>
                                    </td>
                                    <td className="py-2.5 px-1 font-bold text-white">
                                      {currencySymbol}{opt.putLTP.toFixed(1)}
                                      <span className={`block text-[8px] font-extrabold mt-0.5 ${putChgUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {putChgUp ? '+' : ''}{opt.putChangePercent}%
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* ======================= TAB CONTENT 4: MARKET BREADTH & INSTITUTIONS ======================= */}
                  {selectedDetailTab === 'breadth' && (
                    <div className="space-y-6 animate-fade-in">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Advances/Declines Panel */}
                        <div className="bg-gray-950/30 border border-gray-850 rounded p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono font-bold text-gray-400">INDEX MARKET BREADTH STATS</span>
                            <span className="text-[10px] font-mono text-teal-400 font-bold">
                              Ratio: {(currentIdxDetails.advanceDecline.advances / Math.max(1, currentIdxDetails.advanceDecline.declines)).toFixed(2)}
                            </span>
                          </div>

                          <div className="space-y-3 font-mono">
                            <div className="flex justify-between text-xs font-bold text-white">
                              <span className="text-emerald-400">ADVANCES ({currentIdxDetails.advanceDecline.advances})</span>
                              <span className="text-rose-400">DECLINES ({currentIdxDetails.advanceDecline.declines})</span>
                            </div>

                            {/* Breadth distribution bar */}
                            {(() => {
                              const totalBreadth = currentIdxDetails.advanceDecline.advances + currentIdxDetails.advanceDecline.declines + currentIdxDetails.advanceDecline.unchanged;
                              const advPct = (currentIdxDetails.advanceDecline.advances / totalBreadth) * 100;
                              const decPct = (currentIdxDetails.advanceDecline.declines / totalBreadth) * 100;
                              const uncPct = (currentIdxDetails.advanceDecline.unchanged / totalBreadth) * 100;

                              return (
                                <div className="space-y-1.5">
                                  <div className="h-3 bg-slate-950 rounded-full overflow-hidden flex">
                                    <div style={{ width: `${advPct}%` }} className="h-full bg-emerald-500" title={`Advances: ${advPct.toFixed(0)}%`} />
                                    <div style={{ width: `${uncPct}%` }} className="h-full bg-gray-600" title={`Unchanged: ${uncPct.toFixed(0)}%`} />
                                    <div style={{ width: `${decPct}%` }} className="h-full bg-rose-500" title={`Declines: ${decPct.toFixed(0)}%`} />
                                  </div>
                                  <div className="flex justify-between text-[9px] text-gray-500">
                                    <span>{advPct.toFixed(0)}% ADV</span>
                                    <span>{uncPct.toFixed(0)}% UNC</span>
                                    <span>{decPct.toFixed(0)}% DEC</span>
                                  </div>
                                </div>
                              );
                            })()}

                            <div className="pt-2 border-t border-gray-850 grid grid-cols-2 gap-4 text-[10px] text-gray-400 leading-relaxed font-sans">
                              <div>
                                <li>52W Highs: <strong className="text-teal-400 font-mono">14 assets</strong></li>
                                <li>Screener Breakouts: <strong className="text-teal-400 font-mono">6 stocks</strong></li>
                              </div>
                              <div>
                                <li>52W Lows: <strong className="text-rose-400 font-mono">2 assets</strong></li>
                                <li>Bearish Traps: <strong className="text-rose-400 font-mono">1 stock</strong></li>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Institutional Buying/Selling Panel */}
                        <div className="bg-gray-950/30 border border-gray-850 rounded p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono font-bold text-gray-400">DAILY INSTITUTIONAL ACTIVITY INTRADAY</span>
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">LIVE TRACKER</span>
                          </div>

                          <div className="space-y-3 font-mono text-[10px]">
                            <div className="grid grid-cols-2 gap-4">
                              
                              {/* FII Column */}
                              <div className="p-2.5 bg-gray-950/60 border border-gray-850 rounded space-y-1">
                                <span className="text-gray-500 font-bold block text-[8px] uppercase">FOREIGN INST. FLOWS (FII)</span>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Buy Value:</span>
                                  <span className="text-white">{currencySymbol}{instActivity.fiiBuy}{unitLabel}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Sell Value:</span>
                                  <span className="text-white">{currencySymbol}{instActivity.fiiSell}{unitLabel}</span>
                                </div>
                                <div className="flex justify-between border-t border-gray-850 pt-1 font-bold">
                                  <span>Net Flow:</span>
                                  <span className={instActivity.fiiNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                    {instActivity.fiiNet >= 0 ? '+' : ''}{instActivity.fiiNet}{unitLabel}
                                  </span>
                                </div>
                              </div>

                              {/* DII Column */}
                              <div className="p-2.5 bg-gray-950/60 border border-gray-850 rounded space-y-1">
                                <span className="text-gray-500 font-bold block text-[8px] uppercase">DOMESTIC INST. FLOWS (DII)</span>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Buy Value:</span>
                                  <span className="text-white">{currencySymbol}{instActivity.diiBuy}{unitLabel}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Sell Value:</span>
                                  <span className="text-white">{currencySymbol}{instActivity.diiSell}{unitLabel}</span>
                                </div>
                                <div className="flex justify-between border-t border-gray-850 pt-1 font-bold">
                                  <span>Net Flow:</span>
                                  <span className={instActivity.diiNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                    {instActivity.diiNet >= 0 ? '+' : ''}{instActivity.diiNet}{unitLabel}
                                  </span>
                                </div>
                              </div>

                            </div>

                            <div className="pt-2 border-t border-gray-850 text-gray-400 space-y-1 font-sans text-[9px]">
                              <div>• ETF Inflow Momentum: <strong className="text-white font-mono">{instActivity.etfInflow > 0 ? '+' : ''}{instActivity.etfInflow}{unitLabel}</strong></div>
                              <div>• Mutual Fund Inflow Allocation: <strong className="text-white font-mono">+{instActivity.mfInflow}{unitLabel}</strong></div>
                              <div>• Promoter Activity: <span className="text-teal-400 italic">{instActivity.promoterActivity}</span></div>
                              <div>• Block / Bulk Deals Transacted: <strong className="text-teal-400 font-mono">{instActivity.blockDealsCount} Deals Today</strong></div>
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                  {/* ======================= TAB CONTENT 5: NEWS & SENTIMENT ======================= */}
                  {selectedDetailTab === 'news' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono font-bold text-gray-400">INDEX SPECIFIC NEWS FEED</span>
                        <span className="text-[10px] font-mono text-teal-400 font-bold uppercase">AI ANALYZED IMPACT SCORES</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[10px]">
                        {newsItems.map((news, idx) => {
                          const isUp = news.classification === 'Bullish';
                          const isDown = news.classification === 'Bearish';
                          const impactColor = 
                            news.impact === 'Critical' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                            news.impact === 'High' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-teal-400 bg-teal-500/10 border-teal-500/20';

                          return (
                            <div key={idx} className="p-4 bg-gray-950/40 border border-gray-850 rounded-md space-y-2.5">
                              <div className="flex justify-between items-start gap-3">
                                <span className="text-white font-sans font-bold leading-snug hover:text-teal-400 text-xs block truncate max-w-[280px]" title={news.headline}>
                                  {news.headline}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold border shrink-0 ${impactColor}`}>
                                  {news.impact} IMPACT
                                </span>
                              </div>

                              <div className="flex justify-between text-[9px] text-gray-500 border-b border-gray-850/50 pb-1.5">
                                <span>Source: {news.source}</span>
                                <span className={`font-bold uppercase ${isUp ? 'text-emerald-400' : isDown ? 'text-rose-400' : 'text-gray-400'}`}>
                                  {news.classification} ({news.score > 0 ? '+' : ''}{news.score})
                                </span>
                              </div>

                              <p className="text-gray-400 leading-relaxed font-sans text-[10px] italic">
                                "AI Summarization: {news.aiSummary}"
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ======================= TAB CONTENT 6: AI INDEX PREDICTION ENGINE ======================= */}
                  {selectedDetailTab === 'ai-predictions' && (
                    <AIPredictionsTab 
                      currentIdxDetails={currentIdxDetails} 
                      activeProvider={activeProvider} 
                    />
                  )}

                </div>
              );
            })()}

          </div>

        </div>
      )}

      {/* ======================= TAB 3: COMPARISON ENGINE ======================= */}
      {activeSubTab === 'comparison' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Index A and Index B Selector Card */}
          <div className="bg-slate-900 border border-gray-800/80 rounded-lg p-5">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-teal-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Compare Markets Side-by-Side</h4>
              </div>

              {/* Selection Inputs */}
              <div className="flex flex-wrap items-center gap-3">
                
                {/* Index A */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block font-sans">Index A</label>
                  <select
                    value={compareIndexA}
                    onChange={(e) => setCompareIndexA(e.target.value)}
                    className="bg-gray-950 border border-gray-850 rounded px-3 py-1.5 text-xs text-teal-400 font-bold focus:outline-none"
                  >
                    {ALL_INDICES_META.map(meta => (
                      <option key={meta.symbol} value={meta.symbol}>{meta.name} ({meta.symbol})</option>
                    ))}
                  </select>
                </div>

                <div className="text-gray-500 font-mono text-xs pt-4">VS</div>

                {/* Index B */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block font-sans">Index B</label>
                  <select
                    value={compareIndexB}
                    onChange={(e) => setCompareIndexB(e.target.value)}
                    className="bg-gray-950 border border-gray-850 rounded px-3 py-1.5 text-xs text-blue-400 font-bold focus:outline-none"
                  >
                    {ALL_INDICES_META.map(meta => (
                      <option key={meta.symbol} value={meta.symbol}>{meta.name} ({meta.symbol})</option>
                    ))}
                  </select>
                </div>

              </div>

            </div>
          </div>

          {/* Comparison Details Grid */}
          {(() => {
            const idxA = getIndex(compareIndexA);
            const idxB = getIndex(compareIndexB);
            
            if (!idxA || !idxB) {
              return (
                <div className="py-12 text-center text-gray-500 text-xs">
                  Loading comparative datasets...
                </div>
              );
            }

            // High correlation calculations (mocked with stable deterministic offset)
            const corr = compareIndexA === compareIndexB ? 1.0 : parseFloat((0.65 + Math.sin(idxA.price + idxB.price) * 0.3).toFixed(2));
            const isCorrHigh = Math.abs(corr) > 0.7;

            // Align data for performance chart
            const comparisonChartData = idxA.historicalBars.map((bar, i) => {
              const bBar = idxB.historicalBars[i] || { close: idxB.price };
              const initialA = idxA.historicalBars[0].close;
              const initialB = idxB.historicalBars[0].close;
              
              const pctA = ((bar.close - initialA) / initialA) * 100;
              const pctB = ((bBar.close - initialB) / initialB) * 100;

              return {
                time: bar.time,
                [idxA.name]: pctA,
                [idxB.name]: pctB
              };
            });

            return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left/Middle: Performance comparison chart */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Performance Chart */}
                  <div className="bg-slate-900 border border-gray-800/80 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-teal-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Overlapping Performance Return Comparison (%)</h4>
                      </div>
                      <span className="text-[10px] font-mono text-gray-400">Duration: 30 days</span>
                    </div>

                    <div className="h-64 mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={comparisonChartData}>
                          <XAxis dataKey="time" stroke="#475569" fontSize={10} fontFamily="monospace" />
                          <YAxis stroke="#475569" fontSize={10} label={{ value: 'Return %', angle: -90, position: 'insideLeft', fill: '#475569', fontSize: 10 }} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '6px' }}
                            itemStyle={{ fontSize: '11px', fontFamily: 'monospace' }}
                            formatter={(value: any) => [`${parseFloat(value).toFixed(2)}%`, 'Return']}
                          />
                          <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                          <Line type="monotone" dataKey={idxA.name} stroke="#0d9488" strokeWidth={2.5} dot={false} />
                          <Line type="monotone" dataKey={idxB.name} stroke="#3b82f6" strokeWidth={2.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Side-by-Side Technical Comparison table */}
                  <div className="bg-slate-900 border border-gray-800/80 rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="w-4 h-4 text-teal-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Side-by-Side Tech Indicator Board</h4>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs font-mono">
                        <thead>
                          <tr className="border-b border-gray-850 text-gray-500 uppercase text-[9px] font-bold">
                            <th className="pb-3 px-3">TECHNICAL INDICATOR</th>
                            <th className="pb-3 px-3 text-teal-400">{idxA.name}</th>
                            <th className="pb-3 px-3 text-blue-400">{idxB.name}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-850">
                          <tr>
                            <td className="py-2.5 px-3 text-gray-400">Live Price</td>
                            <td className="py-2.5 px-3 text-white font-bold">${idxA.price.toFixed(1)}</td>
                            <td className="py-2.5 px-3 text-white font-bold">${idxB.price.toFixed(1)}</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 text-gray-400">Change Percent</td>
                            <td className={`py-2.5 px-3 font-bold ${idxA.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {idxA.changePercent >= 0 ? '+' : ''}{idxA.changePercent.toFixed(2)}%
                            </td>
                            <td className={`py-2.5 px-3 font-bold ${idxB.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {idxB.changePercent >= 0 ? '+' : ''}{idxB.changePercent.toFixed(2)}%
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 text-gray-400">AI Confidence %</td>
                            <td className="py-2.5 px-3 text-gray-300">{idxA.aiAnalysis.confidencePercent}%</td>
                            <td className="py-2.5 px-3 text-gray-300">{idxB.aiAnalysis.confidencePercent}%</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 text-gray-400">Support Floor</td>
                            <td className="py-2.5 px-3 text-emerald-400">${idxA.aiAnalysis.supportLevels[0].toFixed(0)}</td>
                            <td className="py-2.5 px-3 text-emerald-400">${idxB.aiAnalysis.supportLevels[0].toFixed(0)}</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 text-gray-400">Resistance Ceiling</td>
                            <td className="py-2.5 px-3 text-rose-400">${idxA.aiAnalysis.resistanceLevels[0].toFixed(0)}</td>
                            <td className="py-2.5 px-3 text-rose-400">${idxB.aiAnalysis.resistanceLevels[0].toFixed(0)}</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 text-gray-400">Volatility Score</td>
                            <td className="py-2.5 px-3 text-white">{idxA.aiAnalysis.volatilityScore}/100</td>
                            <td className="py-2.5 px-3 text-white">{idxB.aiAnalysis.volatilityScore}/100</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 text-gray-400">Breakout Detected</td>
                            <td className="py-2.5 px-3 text-teal-400">{idxA.aiAnalysis.breakoutDetected ? 'YES' : 'NO'}</td>
                            <td className="py-2.5 px-3 text-blue-400">{idxB.aiAnalysis.breakoutDetected ? 'YES' : 'NO'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

                {/* Right: Correlation, risk comparison & AI outlook comparison */}
                <div className="space-y-6">
                  
                  {/* Correlation Coefficient Meter */}
                  <div className="bg-slate-900 border border-gray-800/80 rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Scale className="w-4 h-4 text-teal-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Correlation Analysis</h4>
                    </div>

                    <div className="text-center py-4 space-y-2 font-mono">
                      <span className="text-[10px] text-gray-500 font-bold block">PEARSON RETURN CORRELATION</span>
                      <div className="text-4xl font-bold text-teal-400">{corr.toFixed(2)}</div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded inline-block ${
                        isCorrHigh ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {isCorrHigh ? 'HIGH DIVERSIFICATION LOCK' : 'MODERATE DIVERSIFICATION'}
                      </span>
                      <p className="text-[10px] text-gray-400 font-sans italic mt-3 leading-normal">
                        * A high positive return correlation indicates both indices are heavily exposed to identical global macro flows and capital distributions.
                      </p>
                    </div>
                  </div>

                  {/* Side-by-Side AI Outlook Comparison */}
                  <div className="bg-slate-900 border border-gray-800/80 rounded-lg p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-teal-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Outlook Comparison</h4>
                    </div>

                    <div className="space-y-4">
                      {/* Index A */}
                      <div className="p-3 bg-gray-950/40 rounded border border-gray-850 space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="font-bold text-teal-400">{idxA.name}</span>
                          <span className="text-white bg-teal-500/10 px-1.5 py-0.5 rounded">{idxA.aiAnalysis.recommendation}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-normal font-sans italic">
                          "Risk score currently set at {idxA.aiAnalysis.riskScore}/100. Support level holding firm at ${idxA.aiAnalysis.supportLevels[0].toFixed(0)}."
                        </p>
                      </div>

                      {/* Index B */}
                      <div className="p-3 bg-gray-950/40 rounded border border-gray-850 space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="font-bold text-blue-400">{idxB.name}</span>
                          <span className="text-white bg-blue-500/10 px-1.5 py-0.5 rounded">{idxB.aiAnalysis.recommendation}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-normal font-sans italic">
                          "Risk score currently set at {idxB.aiAnalysis.riskScore}/100. Support level holding firm at ${idxB.aiAnalysis.supportLevels[0].toFixed(0)}."
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            );
          })()}

        </div>
      )}

    </div>
  );
}
