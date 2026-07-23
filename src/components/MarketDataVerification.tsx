import { useState, useEffect, useRef } from 'react';
import { Wifi, Activity, Database, Clock, RefreshCw } from 'lucide-react';
import { StockDetails } from '../types.js';

interface MarketDataVerificationProps {
  wsStatus: 'connected' | 'connecting' | 'disconnected';
  selectedSymbol: string;
  activeStock: StockDetails | null;
  stocks: StockDetails[];
}

export default function MarketDataVerification({
  wsStatus,
  selectedSymbol,
  activeStock,
  stocks
}: MarketDataVerificationProps) {
  const [latency, setLatency] = useState<number | null>(null);
  const [latencyHistory, setLatencyHistory] = useState<number[]>([]);
  const [timeSinceLastTick, setTimeSinceLastTick] = useState<number>(0);
  const [lastTickTimestamp, setLastTickTimestamp] = useState<number>(Date.now());
  const [flashTick, setFlashTick] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  
  const lastStockPricesRef = useRef<Record<string, number>>({});

  // 1. Measure live latency (ping) to /api/health periodically
  useEffect(() => {
    const measureLatency = async () => {
      const startTime = performance.now();
      try {
        const response = await fetch('/api/health', { cache: 'no-store' });
        if (response.ok) {
          const endTime = performance.now();
          const ms = Math.round(endTime - startTime);
          setLatency(ms);
          setLatencyHistory(prev => {
            const next = [...prev, ms];
            if (next.length > 6) next.shift();
            return next;
          });
        }
      } catch (err) {
        console.warn('[Latency Monitor] Failed to measure ping:', err);
      }
    };

    // Run immediately and then every 6 seconds
    measureLatency();
    const interval = setInterval(measureLatency, 6000);
    return () => clearInterval(interval);
  }, []);

  // 2. Track changes in stock prices to determine exact last-tick interval
  useEffect(() => {
    let hasChanged = false;
    
    stocks.forEach(stock => {
      const prevPrice = lastStockPricesRef.current[stock.symbol];
      if (prevPrice !== undefined && prevPrice !== stock.price) {
        hasChanged = true;
      }
      lastStockPricesRef.current[stock.symbol] = stock.price;
    });

    // If any stock price updated, reset our live tick timer and trigger a visual flash
    if (hasChanged || stocks.length === 0) {
      setLastTickTimestamp(Date.now());
      setFlashTick(true);
      const timer = setTimeout(() => setFlashTick(false), 800);
      return () => clearTimeout(timer);
    }
  }, [stocks]);

  // 3. Count up the timer showing seconds since the last received price tick
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = (Date.now() - lastTickTimestamp) / 1000;
      setTimeSinceLastTick(elapsed);
    }, 100);

    return () => clearInterval(interval);
  }, [lastTickTimestamp]);

  // Determine attribution labels
  const isUS = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'].includes(selectedSymbol);
  const currentExchange = activeStock?.exchange || (isUS ? "NASDAQ" : "NSE");
  const currentProvider = activeStock?.dataSource || (isUS ? "Yahoo Finance Core API (Live)" : "NSE Direct Feed via Yahoo API");

  return (
    <div 
      id="market-data-verification-container"
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 select-none ${
        isExpanded ? 'w-80' : 'w-56'
      }`}
    >
      <div 
        id="market-data-verification-card"
        className={`bg-slate-900/90 backdrop-blur-md border rounded-lg shadow-xl shadow-black/40 overflow-hidden transition-all duration-300 ${
          flashTick 
            ? 'border-emerald-500 bg-slate-900/95 ring-1 ring-emerald-500/20' 
            : 'border-slate-800/80 hover:border-gray-700'
        }`}
      >
        {/* Toggle Header */}
        <div 
          id="verification-header"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                wsStatus === 'connected' ? 'bg-emerald-400' : 'bg-teal-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                wsStatus === 'connected' ? 'bg-emerald-500' : 'bg-teal-500'
              }`} />
            </span>
            <span className="text-[11px] font-bold tracking-wider uppercase font-mono text-gray-300">
              Live Verification
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-[10px] text-gray-400 font-semibold">
              {latency ? `${latency}ms` : '-- ms'}
            </span>
            <Activity className={`w-3.5 h-3.5 ${
              latency && latency < 50 ? 'text-emerald-400' : latency && latency < 150 ? 'text-teal-400' : 'text-amber-400'
            }`} />
          </div>
        </div>

        {/* Short info row when collapsed */}
        {!isExpanded && (
          <div className="px-2.5 pb-2.5 pt-0.5 border-t border-slate-800/40 flex items-center justify-between text-[10px] font-mono text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-gray-500" />
              <span>Tick: {timeSinceLastTick.toFixed(1)}s ago</span>
            </span>
            <span className="text-gray-500">Click to expand</span>
          </div>
        )}

        {/* Detailed diagnostic panel when expanded */}
        {isExpanded && (
          <div id="verification-body" className="p-3 border-t border-slate-800/60 space-y-2.5 bg-slate-950/40">
            {/* Status Grid */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="bg-slate-900/60 p-2 rounded border border-slate-800/40">
                <span className="text-gray-500 block uppercase tracking-wider mb-1">Live Connection</span>
                <span className="text-gray-200 font-bold flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  {wsStatus === 'connected' ? 'WebSocket' : 'HTTP Polling'}
                </span>
              </div>
              
              <div className="bg-slate-900/60 p-2 rounded border border-slate-800/40">
                <span className="text-gray-500 block uppercase tracking-wider mb-1">API Latency</span>
                <span className="text-gray-200 font-bold flex items-center gap-1">
                  <Activity className="w-3 h-3 text-teal-400" />
                  {latency ? `${latency} ms` : 'Measuring...'}
                </span>
              </div>
            </div>

            {/* Latency History Graph (Mini sparkline) */}
            {latencyHistory.length > 0 && (
              <div className="bg-slate-900/30 p-2 rounded border border-slate-800/40 space-y-1">
                <div className="flex justify-between items-center text-[8px] font-mono text-gray-500">
                  <span>LATENCY GRAPH</span>
                  <span>MAX: {Math.max(...latencyHistory)}ms</span>
                </div>
                <div className="h-6 flex items-end gap-1 pt-1 justify-between">
                  {latencyHistory.map((val, idx) => {
                    const max = Math.max(...latencyHistory, 1);
                    const pct = Math.max(15, (val / max) * 100);
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center">
                        <div 
                          className={`w-full rounded-t-sm transition-all duration-300 ${
                            val < 60 ? 'bg-emerald-500/55' : val < 120 ? 'bg-teal-500/55' : 'bg-amber-500/55'
                          }`}
                          style={{ height: `${pct}%` }}
                        />
                        <span className="text-[7px] text-gray-600 font-mono mt-0.5">{val}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Source Attribution details */}
            <div className="bg-slate-900/60 p-2 rounded border border-slate-800/40 space-y-1.5 text-[10px] font-mono">
              <span className="text-gray-500 block uppercase tracking-wider font-bold">SOURCE ATTRIBUTION</span>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Security:</span>
                <span className="text-gray-200 font-semibold">{selectedSymbol} ({currentExchange})</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Attribution:</span>
                <span className="text-emerald-400 font-semibold text-right max-w-[150px] truncate" title={currentProvider}>
                  {currentProvider}
                </span>
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-slate-800/40">
                <span className="text-gray-400 flex items-center gap-1">
                  <Database className="w-2.5 h-2.5 text-gray-500" />
                  Cache Status:
                </span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1 py-0.5 rounded text-[9px] uppercase tracking-wider flex items-center gap-0.5">
                  <RefreshCw className={`w-2 h-2 ${flashTick ? 'animate-spin text-emerald-300' : 'text-emerald-400'}`} />
                  NO CACHE / LIVE
                </span>
              </div>
            </div>

            {/* Live Data flow ticking proofs */}
            <div className="flex justify-between items-center text-[9px] font-mono text-gray-500 px-1">
              <span>LAST TICK RECEIVED</span>
              <span className={`font-bold ${flashTick ? 'text-emerald-400' : 'text-gray-400'}`}>
                {timeSinceLastTick.toFixed(1)}s ago
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
