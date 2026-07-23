import { useEffect, useState } from 'react';
import { ShieldCheck, TrendingUp, TrendingDown, Clock, Loader2, Sun, Moon } from 'lucide-react';
import { StockDetails, MarketStatus } from '../types.js';
import LivePriceDisplay from './LivePriceDisplay.js';

interface HeaderTickerProps {
  stocks: StockDetails[];
  marketStatus: MarketStatus | null;
  wsStatus: 'connected' | 'connecting' | 'disconnected';
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export default function HeaderTicker({ stocks, marketStatus, wsStatus, theme = 'dark', onToggleTheme }: HeaderTickerProps) {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (stocks.length === 0) {
    return (
      <header className="h-14 bg-slate-900 border-b border-gray-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
          <span className="text-gray-400 text-sm font-mono">Syncing pipeline ticker feeds...</span>
        </div>
      </header>
    );
  }

  // Duplicate list to achieve continuous infinite marquee slide
  const marqueeStocks = [...stocks, ...stocks, ...stocks];

  return (
    <header className="bg-slate-900 border-b border-gray-800/80 select-none">
      {/* Live Feed Info Banner */}
      {wsStatus !== 'connected' && (
        <div className="bg-teal-500/5 text-teal-400/90 text-[11px] font-medium py-1 px-6 border-b border-gray-800/40 text-center flex items-center justify-center gap-2 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          <span>Sync Mode: Seamless Real-Time HTTP Polling Fallback is active and healthy.</span>
        </div>
      )}

      {/* Sliding Marquee */}
      <div className="h-10 border-b border-gray-800/40 bg-slate-900/40 overflow-hidden flex items-center relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />
        
        <div className="animate-ticker">
          {marqueeStocks.map((stock, idx) => {
            const isUp = stock.change >= 0;
            return (
              <div 
                key={`${stock.symbol}-${idx}`} 
                className="inline-flex items-center gap-3 px-6 border-r border-gray-800/60 py-1.5 font-mono text-xs"
              >
                <span className="text-gray-300 font-bold">{stock.symbol}</span>
                <LivePriceDisplay stock={stock} size="sm" showDetail={true} />
                <span className={`inline-flex items-center font-bold px-1.5 py-0.5 rounded ${isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {isUp ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control / Info Bar */}
      <div className="h-12 px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
              <span className="text-teal-400 font-bold text-xs">Q</span>
            </div>
            <span className="font-display font-bold text-sm tracking-wide text-white uppercase">AI Quant Analyzer</span>
          </div>

          <div className="h-4 w-px bg-gray-800" />

          {/* Market Status */}
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${marketStatus?.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-xs text-gray-400 font-medium">
              Market: {marketStatus?.isOpen ? 'OPEN' : 'CLOSED'}
            </span>
          </div>

          <div className="h-4 w-px bg-gray-800" />

          {/* WebSocket / Polling Connection Status */}
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${wsStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : wsStatus === 'connecting' ? 'bg-amber-400 animate-pulse' : 'bg-teal-400 animate-pulse'}`} />
            <span className="text-xs text-gray-400 font-medium font-mono">
              Live Feed: {wsStatus === 'connected' ? 'WEBSOCKET (ACTIVE)' : wsStatus === 'connecting' ? 'CONNECTING...' : 'HTTP POLLING (ACTIVE)'}
            </span>
          </div>
        </div>

        {/* Live Clock, Theme Toggle & Security Status */}
        <div className="flex items-center gap-3">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              id="daylight_theme_toggle_btn"
              title={theme === 'dark' ? "Switch to High-Contrast Light Mode" : "Switch to Default Dark Mode"}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono font-bold transition-all bg-teal-500/10 text-teal-400 border-teal-500/30 hover:bg-teal-500/20 cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Daylight Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="hidden md:inline">Dark Mode</span>
                </>
              )}
            </button>
          )}

          <div className="flex items-center gap-1.5 bg-gray-800/40 px-2.5 py-1 rounded border border-gray-800 font-mono text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>{timeStr}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-teal-500/10 text-teal-400 px-2.5 py-1 rounded border border-teal-500/20 text-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AI Models Active</span>
          </div>
        </div>
      </div>
    </header>
  );
}
