import React, { useState } from 'react';
import LivePriceDisplay from './LivePriceDisplay.js';
import ModelPerformanceCard from './ModelPerformanceCard.js';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Calendar, 
  PieChart, 
  AlertCircle,
  HelpCircle,
  Grid
} from 'lucide-react';
import { StockDetails } from '../types.js';

interface DashboardOverviewProps {
  stocks: StockDetails[];
  onSelectSymbol: (symbol: string) => void;
  selectedSymbol: string;
}

export default function DashboardOverview({ stocks, onSelectSymbol, selectedSymbol }: DashboardOverviewProps) {
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('performance-desc');
  
  // Sort for Gainers and Losers
  const sortedGainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 3);
  const sortedLosers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 3);
  const sortedActive = [...stocks].sort((a, b) => b.volume - a.volume).slice(0, 3);

  const isUSSymbol = (sym: string) => ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'].includes(sym);

  const sectors = ['All', ...Array.from(new Set(stocks.map(s => s.sector || 'Other')))];

  const filteredAndSortedStocks = [...stocks]
    .filter(s => {
      const matchSector = selectedSector === 'All' || s.sector === selectedSector;
      const matchRegion = selectedRegion === 'All' || 
        (selectedRegion === 'US' ? isUSSymbol(s.symbol) : !isUSSymbol(s.symbol));
      return matchSector && matchRegion;
    })
    .sort((a, b) => {
      if (sortBy === 'performance-desc') {
        return b.changePercent - a.changePercent;
      } else if (sortBy === 'performance-asc') {
        return a.changePercent - b.changePercent;
      } else if (sortBy === 'symbol') {
        return a.symbol.localeCompare(b.symbol);
      } else if (sortBy === 'volume') {
        return b.volume - a.volume;
      }
      return 0;
    });

  const getHeatmapColorClass = (changePercent: number) => {
    if (changePercent >= 2.0) {
      return 'bg-emerald-600 border-emerald-400 hover:bg-emerald-500 text-white';
    } else if (changePercent >= 0.5) {
      return 'bg-emerald-950/70 border-emerald-800 hover:bg-emerald-900 text-emerald-100';
    } else if (changePercent > -0.5) {
      return 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300';
    } else if (changePercent > -2.0) {
      return 'bg-rose-950/70 border-rose-900 hover:bg-rose-900 text-rose-100';
    } else {
      return 'bg-rose-600 border-rose-500 hover:bg-rose-500 text-white';
    }
  };

  const sectorsPerformance = [
    { name: "Information Technology", performance: "+1.65%", color: "text-emerald-400 bg-emerald-500/10" },
    { name: "Communication Services", performance: "+0.82%", color: "text-emerald-400 bg-emerald-500/10" },
    { name: "Energy & Petrochemicals", performance: "+0.45%", color: "text-emerald-400 bg-emerald-500/10" },
    { name: "Consumer Discretionary", performance: "-1.12%", color: "text-rose-400 bg-rose-500/10" },
    { name: "Financial Services", performance: "-0.24%", color: "text-rose-400 bg-rose-500/10" }
  ];

  const calendarEvents = [
    { date: "July 16", event: "US Core Retail Sales MoM (Consensus: 0.2%)", impact: "High" },
    { date: "July 17", event: "India Wholesale Price Index (WPI) YoY", impact: "Medium" },
    { date: "July 18", event: "US Initial Jobless Claims (Consensus: 220K)", impact: "Medium" },
    { date: "July 23", event: "Tesla (TSLA) Q2 Earnings Release", impact: "Critical" },
    { date: "July 25", event: "Microsoft (MSFT) Q2 Earnings Release", impact: "Critical" }
  ];

  return (
    <div className="flex-1 space-y-6 select-none">
      
      {/* Top row: Gainers / Losers / Active lists */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Top Gainers */}
        <div className="bg-slate-900 border border-gray-800/80 rounded-lg p-5 glass-panel">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Top Intraday Gainers</h4>
          </div>
          <div className="space-y-3">
            {sortedGainers.map((st) => (
              <div 
                key={st.symbol}
                onClick={() => onSelectSymbol(st.symbol)}
                className={`p-3 rounded border border-gray-800/40 flex items-center justify-between cursor-pointer transition-all ${
                  selectedSymbol === st.symbol ? 'bg-teal-500/5 border-teal-500/30' : 'bg-gray-950/25 hover:bg-gray-850'
                }`}
              >
                <div>
                  <span className="font-mono font-bold text-xs text-white">{st.symbol}</span>
                  <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{st.name}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <LivePriceDisplay stock={st} size="sm" showDetail={true} className="items-end text-right" />
                  <span className="block text-[10px] font-mono font-bold text-emerald-400">
                    +{st.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="bg-slate-900 border border-gray-800/80 rounded-lg p-5 glass-panel">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Top Intraday Losers</h4>
          </div>
          <div className="space-y-3">
            {sortedLosers.map((st) => (
              <div 
                key={st.symbol}
                onClick={() => onSelectSymbol(st.symbol)}
                className={`p-3 rounded border border-gray-800/40 flex items-center justify-between cursor-pointer transition-all ${
                  selectedSymbol === st.symbol ? 'bg-teal-500/5 border-teal-500/30' : 'bg-gray-950/25 hover:bg-gray-850'
                }`}
              >
                <div>
                  <span className="font-mono font-bold text-xs text-white">{st.symbol}</span>
                  <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{st.name}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <LivePriceDisplay stock={st} size="sm" showDetail={true} className="items-end text-right" />
                  <span className="block text-[10px] font-mono font-bold text-rose-400">
                    {st.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Active */}
        <div className="bg-slate-900 border border-gray-800/80 rounded-lg p-5 glass-panel">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-teal-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Most Active by Volume</h4>
          </div>
          <div className="space-y-3">
            {sortedActive.map((st) => (
              <div 
                key={st.symbol}
                onClick={() => onSelectSymbol(st.symbol)}
                className={`p-3 rounded border border-gray-800/40 flex items-center justify-between cursor-pointer transition-all ${
                  selectedSymbol === st.symbol ? 'bg-teal-500/5 border-teal-500/30' : 'bg-gray-950/25 hover:bg-gray-850'
                }`}
              >
                <div>
                  <span className="font-mono font-bold text-xs text-white">{st.symbol}</span>
                  <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{st.name}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-xs text-gray-300">
                    {(st.volume / 1e6).toFixed(1)}M trades
                  </span>
                  <span className={`block text-[10px] font-mono font-bold ${st.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {st.changePercent >= 0 ? '+' : ''}{st.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Interactive Market Performance Heatmap Grid */}
      <div className="bg-slate-900 border border-gray-800/80 rounded-lg p-5 glass-panel space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Grid className="w-4 h-4 text-teal-400" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Watched Equities Heatmap Grid</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Real-time daily percentage changes of watched equities</p>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-1 text-[9px] font-mono text-gray-400 select-none bg-slate-950/40 p-1.5 rounded border border-gray-800/30">
            <span className="px-1.5 py-0.5 bg-rose-600 text-white rounded">≤ -2%</span>
            <span className="px-1.5 py-0.5 bg-rose-950/70 border border-rose-900 text-rose-100 rounded">-0.5%</span>
            <span className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded">Flat</span>
            <span className="px-1.5 py-0.5 bg-emerald-950/70 border border-emerald-800 text-emerald-100 rounded">+0.5%</span>
            <span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded">≥ +2%</span>
          </div>
        </div>

        {/* Filters and Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-950/30 p-3 rounded border border-gray-800/40">
          {/* Sector filter */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Filter Sector</label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full bg-slate-900 border border-gray-800 rounded px-2.5 py-1 text-[11px] text-gray-300 focus:outline-none focus:border-teal-500/50 cursor-pointer font-sans"
            >
              {sectors.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          {/* Region filter */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Filter Region</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-slate-900 border border-gray-800 rounded px-2.5 py-1 text-[11px] text-gray-300 focus:outline-none focus:border-teal-500/50 cursor-pointer font-sans"
            >
              <option value="All">All Regions</option>
              <option value="US">US Markets (USD)</option>
              <option value="India">Indian Markets (INR)</option>
            </select>
          </div>

          {/* Sort selection */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Sort Order</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-900 border border-gray-800 rounded px-2.5 py-1 text-[11px] text-gray-300 focus:outline-none focus:border-teal-500/50 cursor-pointer font-sans"
            >
              <option value="performance-desc">Highest Gainers First</option>
              <option value="performance-asc">Biggest Losers First</option>
              <option value="symbol">Ticker (Alphabetical)</option>
              <option value="volume">Trading Volume</option>
            </select>
          </div>
        </div>

        {/* Heatmap Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {filteredAndSortedStocks.map((st) => {
            const isSelected = selectedSymbol === st.symbol;
            return (
              <div
                key={st.symbol}
                onClick={() => onSelectSymbol(st.symbol)}
                title={`${st.name} | Sector: ${st.sector}`}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between items-center text-center relative group select-none ${getHeatmapColorClass(st.changePercent)} ${
                  isSelected ? 'ring-2 ring-teal-400 border-transparent shadow-lg shadow-teal-500/30 scale-[1.03] z-10' : 'opacity-95 hover:opacity-100 hover:scale-[1.02]'
                }`}
              >
                {/* Visual Glow behind active cell */}
                {isSelected && (
                  <span className="absolute -inset-1 rounded-lg bg-teal-400/10 blur-sm pointer-events-none -z-10 animate-pulse" />
                )}
                
                <span className="font-mono font-extrabold text-xs tracking-wider uppercase block">{st.symbol}</span>
                <div className="mt-1 opacity-95">
                  <LivePriceDisplay stock={st} size="sm" showDetail={true} className="items-center text-center" />
                </div>
                
                <span className="font-mono font-extrabold text-[11px] mt-2 px-1.5 py-0.5 rounded bg-black/15 block">
                  {st.changePercent >= 0 ? '+' : ''}{st.changePercent.toFixed(2)}%
                </span>

                {/* Micro tooltip on hover showing details */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 hidden group-hover:block bg-gray-950 text-white text-[9px] p-2 rounded shadow-xl border border-gray-850 z-50 text-center leading-normal pointer-events-none">
                  <p className="font-bold text-teal-400 truncate">{st.name}</p>
                  <p className="text-gray-400 mt-0.5">Vol: {(st.volume / 1e6).toFixed(2)}M</p>
                  <p className="text-[8px] text-gray-500 uppercase mt-0.5">{st.sector}</p>
                </div>
              </div>
            );
          })}
          
          {filteredAndSortedStocks.length === 0 && (
            <div className="col-span-full py-8 text-center text-gray-500 text-xs">
              No matching tickers found for the active filter selections.
            </div>
          )}
        </div>
      </div>

      {/* AI Model Performance Comparison Card */}
      <ModelPerformanceCard />

      {/* Sector performances + Economic calendar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sector Performances block */}
        <div className="bg-slate-900 border border-gray-800/80 rounded-lg p-5 glass-panel space-y-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-teal-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">SaaS Sector performance heat block</h4>
          </div>

          <div className="space-y-2.5">
            {sectorsPerformance.map((sec, idx) => (
              <div key={idx} className="p-3 bg-gray-950/25 border border-gray-850 rounded flex items-center justify-between text-xs">
                <span className="text-gray-300">{sec.name}</span>
                <span className={`px-2 py-0.5 rounded font-mono font-bold ${sec.color}`}>
                  {sec.performance}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Economic / Earnings Calendar */}
        <div className="bg-slate-900 border border-gray-800/80 rounded-lg p-5 glass-panel space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Upcoming Earnings & Economic Events</h4>
          </div>

          <div className="divide-y divide-gray-800/30 font-mono text-[11px] leading-relaxed text-gray-300">
            {calendarEvents.map((ev, idx) => (
              <div key={idx} className="py-2.5 flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <span className="text-teal-400 font-bold shrink-0">{ev.date}</span>
                  <span className="text-gray-300">{ev.event}</span>
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  ev.impact === 'Critical' ? 'bg-rose-500/10 text-rose-400' : ev.impact === 'High' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-800 text-gray-400'
                }`}>
                  {ev.impact}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Landing page quant advisory prompt */}
      <div className="p-4 bg-teal-500/5 rounded-lg border border-teal-500/15 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-teal-400 shrink-0" />
        <div className="space-y-1">
          <span className="text-xs font-bold text-white">Institutional Algorithmic Strategy Active</span>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            All indicators are automatically updated in real-time. Navigate to **Trading Charts** for pattern detection overlays, or visit the **AI Predictions** view to check models metrics (LSTM, GRU, XGBoost, Prophet) and view SHAP features importance charts.
          </p>
        </div>
      </div>

    </div>
  );
}
