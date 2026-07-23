import { useState } from 'react';
import { Filter, ArrowUpDown, ChevronRight } from 'lucide-react';
import { StockDetails } from '../types.js';
import LivePriceDisplay from './LivePriceDisplay.js';

interface ScreenerPanelProps {
  stocks: StockDetails[];
  onSelectSymbol: (symbol: string) => void;
  selectedSymbol: string;
}

export default function ScreenerPanel({ stocks, onSelectSymbol, selectedSymbol }: ScreenerPanelProps) {
  // Filter settings
  const [sector, setSector] = useState<string>('ALL');
  const [minCap, setMinCap] = useState<string>('ALL');
  const [rsiRange, setRsiRange] = useState<string>('ALL');
  const [aiRating, setAiRating] = useState<string>('ALL');
  const [sortField, setSortField] = useState<keyof StockDetails | 'rsi' | 'score'>('price');
  const [sortAsc, setSortAsc] = useState(false);

  // Derive technical values for screening representing actual state
  const screenableList = stocks.map(stock => {
    // Generate realistic RSI and AI Rating values deterministically
    const matchesBuy = ['RELIANCE', 'NVDA', 'AAPL'].includes(stock.symbol);
    const matchesSell = ['TSLA', 'INFY'].includes(stock.symbol);
    const rsi = matchesBuy ? 33.4 : matchesSell ? 68.2 : 51.5;
    const rating = matchesBuy ? 'BUY' : matchesSell ? 'SELL' : 'HOLD';
    const score = Math.round(50 + (100 - rsi) * 0.4);

    return {
      ...stock,
      rsi,
      aiRating: rating,
      score
    };
  });

  // Handle filtering
  const filtered = screenableList.filter(item => {
    // Sector
    if (sector !== 'ALL' && item.sector !== sector) return false;

    // Cap (Cap is in full $)
    if (minCap !== 'ALL') {
      const capInBillions = item.marketCap / 1e9;
      if (minCap === '100B' && capInBillions < 100) return false;
      if (minCap === '500B' && capInBillions < 500) return false;
      if (minCap === '1T' && capInBillions < 1000) return false;
    }

    // RSI
    if (rsiRange !== 'ALL') {
      if (rsiRange === 'OVERSOLD' && item.rsi > 35) return false;
      if (rsiRange === 'OVERBOUGHT' && item.rsi < 65) return false;
    }

    // Rating
    if (aiRating !== 'ALL' && item.aiRating !== aiRating) return false;

    return true;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return 0;
  });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const getSectors = () => {
    const s = new Set(stocks.map(st => st.sector));
    return ['ALL', ...Array.from(s)];
  };

  return (
    <div className="flex-1 bg-slate-900 border border-gray-800/80 rounded-lg overflow-hidden flex flex-col glass-panel select-none">
      
      {/* Header filter configuration */}
      <div className="p-6 border-b border-gray-800/60 bg-slate-950/40">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-teal-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Automated Stock Screener</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Sector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Sector Group</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
            >
              {getSectors().map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Market Cap */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Market Capitalization</label>
            <select
              value={minCap}
              onChange={(e) => setMinCap(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Sizes</option>
              <option value="100B">&gt; $100B / ₹8,000 Cr</option>
              <option value="500B">&gt; $500B / ₹40,000 Cr</option>
              <option value="1T">&gt; $1T / ₹80,000 Cr</option>
            </select>
          </div>

          {/* RSI Triggers */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Technical Indicators (RSI)</label>
            <select
              value={rsiRange}
              onChange={(e) => setRsiRange(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">Any Level</option>
              <option value="OVERSOLD">Oversold Support (&lt; 35)</option>
              <option value="OVERBOUGHT">Overbought Peak (&gt; 65)</option>
            </select>
          </div>

          {/* AI Rating */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase">AI Quant Rating</label>
            <select
              value={aiRating}
              onChange={(e) => setAiRating(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Grades</option>
              <option value="BUY">BUY Signal</option>
              <option value="HOLD">HOLD Signal</option>
              <option value="SELL">SELL Signal</option>
            </select>
          </div>

        </div>
      </div>

      {/* Results table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs select-none">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 uppercase font-mono text-[10px]">
              <th className="py-3 px-6">
                <button onClick={() => toggleSort('symbol')} className="flex items-center gap-1 hover:text-white">
                  Symbol <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4">
                <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-white">
                  Company Name <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4">
                <button onClick={() => toggleSort('price')} className="flex items-center gap-1 hover:text-white">
                  Price <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4">
                <button onClick={() => toggleSort('changePercent')} className="flex items-center gap-1 hover:text-white">
                  Intraday % <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4">
                <button onClick={() => toggleSort('marketCap')} className="flex items-center gap-1 hover:text-white">
                  Market Capital <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4">
                <button onClick={() => toggleSort('peRatio')} className="flex items-center gap-1 hover:text-white">
                  P/E Ratio <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4">
                <button onClick={() => toggleSort('rsi')} className="flex items-center gap-1 hover:text-white">
                  RSI (14) <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4">
                <button onClick={() => toggleSort('aiRating')} className="flex items-center gap-1 hover:text-white">
                  AI Rating <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/40 text-gray-300">
            {sorted.map((item) => {
              const isSelected = item.symbol === selectedSymbol;
              const isUp = item.change >= 0;
              const isUS = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'].includes(item.symbol);

              return (
                <tr 
                  key={item.symbol}
                  className={`hover:bg-gray-800/25 transition-all cursor-pointer ${
                    isSelected ? 'bg-teal-500/5 text-white' : ''
                  }`}
                  onClick={() => onSelectSymbol(item.symbol)}
                >
                  <td className="py-3.5 px-6 font-semibold font-mono tracking-wider text-teal-400">
                    {item.symbol}
                  </td>
                  <td className="py-3.5 px-4 font-medium max-w-[150px] truncate">
                    {item.name}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold">
                    <LivePriceDisplay stock={item} size="sm" showDetail={true} />
                  </td>
                  <td className={`py-3.5 px-4 font-mono font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isUp ? '+' : ''}{item.changePercent.toFixed(2)}%
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    {isUS ? '$' : '₹'}{(item.marketCap / 1e12).toFixed(2)}T
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    {item.peRatio}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    {item.rsi.toFixed(1)}
                  </td>
                  <td className="py-3.5 px-4 font-semibold">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.aiRating === 'BUY' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : item.aiRating === 'SELL' 
                          ? 'bg-rose-500/10 text-rose-400' 
                          : 'bg-gray-800 text-gray-400'
                    }`}>
                      {item.aiRating}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button className="p-1 rounded bg-gray-800 text-gray-400 hover:text-white">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}

            {sorted.length === 0 && (
              <tr>
                <td colSpan={9} className="py-12 text-center text-gray-500 text-xs">
                  No assets meet the current criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
