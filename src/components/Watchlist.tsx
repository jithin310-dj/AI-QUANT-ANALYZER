import { Search, Globe, MapPin, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import { StockDetails } from '../types.js';
import LivePriceDisplay from './LivePriceDisplay.js';

interface WatchlistProps {
  stocks: StockDetails[];
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}

export default function Watchlist({ stocks, selectedSymbol, onSelectSymbol }: WatchlistProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'US' | 'IN'>('ALL');

  const filtered = stocks.filter(stock => {
    // Search match
    const matchesSearch = stock.symbol.toLowerCase().includes(search.toLowerCase()) || 
                          stock.name.toLowerCase().includes(search.toLowerCase());
    
    // Geography match
    const isUS = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'].includes(stock.symbol);
    const isIN = ['RELIANCE', 'INFY', 'TCS'].includes(stock.symbol);

    if (filter === 'US') return matchesSearch && isUS;
    if (filter === 'IN') return matchesSearch && isIN;
    return matchesSearch;
  });

  return (
    <div className="w-80 bg-slate-900 border-r border-gray-800/80 flex flex-col select-none">
      {/* Search Block */}
      <div className="p-4 border-b border-gray-800/40 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Search tickers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-800/60 border border-gray-800 rounded px-3 py-2 pl-9 text-xs text-white focus:outline-none focus:border-teal-500/80"
          />
        </div>

        {/* Tab Filters */}
        <div className="grid grid-cols-3 gap-1 bg-gray-800/30 p-1 rounded border border-gray-800/60">
          {(['ALL', 'US', 'IN'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`py-1 rounded text-[10px] font-bold uppercase transition-all ${
                filter === tab 
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'ALL' && <span className="flex items-center justify-center gap-1"><Globe className="w-3 h-3" /> All</span>}
              {tab === 'US' && <span className="flex items-center justify-center gap-1"><Globe className="w-3 h-3 text-sky-400" /> NASDAQ</span>}
              {tab === 'IN' && <span className="flex items-center justify-center gap-1"><MapPin className="w-3 h-3 text-orange-400" /> NSE/BSE</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Symbol List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-800/30">
        {filtered.map(stock => {
          const isSelected = stock.symbol === selectedSymbol;
          const isUp = stock.change >= 0;
          const isUS = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'].includes(stock.symbol);

          return (
            <button
              key={stock.symbol}
              onClick={() => onSelectSymbol(stock.symbol)}
              className={`w-full text-left p-4 flex items-center justify-between transition-all ${
                isSelected 
                  ? 'bg-teal-500/5 border-l-2 border-teal-500' 
                  : 'hover:bg-gray-800/30'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-xs tracking-wider ${isSelected ? 'text-teal-400' : 'text-white'}`}>
                    {stock.symbol}
                  </span>
                  <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-gray-800 text-gray-400">
                    {isUS ? 'USD' : 'INR'}
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 truncate max-w-[140px]">
                  {stock.name}
                </div>
              </div>

              <div className="text-right space-y-1">
                <LivePriceDisplay stock={stock} size="sm" showDetail={false} />
                <div className={`text-[10px] font-mono inline-flex items-center font-semibold rounded px-1.5 py-0.5 ${
                  isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                }`}>
                  {isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </div>
              </div>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs text-gray-400 space-y-3">
            <p>No local matches found for "{search}"</p>
            {search.trim().length > 0 && (
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/stocks/add', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ symbol: search.trim().toUpperCase() })
                    });
                    if (res.ok) {
                      const data = await res.json();
                      if (data.success) {
                        window.dispatchEvent(new CustomEvent('new-stock-added', { detail: search.trim().toUpperCase() }));
                        setSearch('');
                      } else {
                        alert(data.error || "Failed to find security");
                      }
                    } else {
                      const errData = await res.json();
                      alert(errData.error || "Failed to find security");
                    }
                  } catch (e) {
                    alert("Security search query failed. Ensure it is a valid NSE/BSE or NASDAQ ticker.");
                  }
                }}
                className="px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded font-semibold text-[11px] transition-all cursor-pointer"
              >
                Sync "{search.toUpperCase()}" from Live Exchange
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
