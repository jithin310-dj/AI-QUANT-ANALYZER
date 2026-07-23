import { StockDetails } from '../types.js';

interface LivePriceDisplayProps {
  stock: StockDetails | null | undefined;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDetail?: boolean;
}

export default function LivePriceDisplay({ 
  stock, 
  className = '', 
  size = 'md', 
  showDetail = true 
}: LivePriceDisplayProps) {
  // Get global wsStatus
  const wsStatus = (window as any).wsStatus || 'connected';
  const isDisconnected = wsStatus === 'disconnected';

  // 1. Basic Validation: Is stock object or price missing/invalid?
  if (!stock || typeof stock.price !== 'number' || isNaN(stock.price) || stock.price <= 0) {
    return (
      <span className="text-rose-500 font-mono text-[10px] sm:text-xs font-semibold px-2 py-1 bg-rose-500/10 border border-rose-500/20 rounded inline-block">
        Live market data unavailable
      </span>
    );
  }

  // 2. Data Staleness Validation: Check if server sync hasn't updated the lastUpdate timestamp recently
  const lastUpdateMs = stock.lastUpdate ? new Date(stock.lastUpdate).getTime() : 0;
  const isStale = lastUpdateMs > 0 && (Date.now() - lastUpdateMs) > 45000; // Over 45 seconds is considered stale in real-time fast ticks

  // If the websocket is disconnected AND we have stale data, render the fallback warning requested by the user
  if (isDisconnected && isStale) {
    return (
      <div className={`inline-flex flex-col gap-1 ${className}`}>
        <span className="text-rose-500 font-mono text-[10px] sm:text-xs font-bold px-2 py-1 bg-rose-500/10 border border-rose-500/20 rounded inline-block animate-pulse">
          Live market data unavailable
        </span>
        {showDetail && (
          <span className="text-[8px] sm:text-[9px] text-gray-500 font-mono">
            Feed Connection Lost • Backing up via REST Sync
          </span>
        )}
      </div>
    );
  }

  const isUS = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'].includes(stock.symbol);
  const currencySymbol = isUS ? '$' : '₹';
  const exchange = stock.exchange || (isUS ? 'NASDAQ' : 'NSE');
  
  // Format the lastUpdate timestamp in IST (UTC+5:30)
  const getISTTime = (isoString?: string) => {
    if (!isoString) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST';
    const date = new Date(isoString);
    // Convert to IST offset (5.5 hours)
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(date.getTime() + istOffset);
    return istDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC' }) + ' IST';
  };

  const timeStr = getISTTime(stock.lastUpdate);
  const source = stock.dataSource || 'NSE Official WebSocket';

  let sizeClasses = 'text-sm';
  if (size === 'sm') sizeClasses = 'text-xs';
  if (size === 'lg') sizeClasses = 'text-lg md:text-xl font-bold';
  if (size === 'xl') sizeClasses = 'text-2xl md:text-3xl font-extrabold';

  return (
    <div className={`inline-flex flex-col gap-0.5 ${className}`}>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`${sizeClasses} font-mono font-bold text-white tracking-tight`}>
          {currencySymbol}{stock.price.toFixed(2)}
        </span>
        {showDetail && (
          <>
            {isStale ? (
              <span className="inline-flex items-center gap-0.5 px-1 py-0.5 text-[8px] sm:text-[9px] font-bold font-mono uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                STALE
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            )}
            <span className="text-[9px] font-bold font-mono text-gray-400 px-1 bg-gray-800/60 rounded">
              {exchange}
            </span>
          </>
        )}
      </div>
      {showDetail && (
        <div className="flex flex-wrap gap-x-1.5 text-[8px] sm:text-[9px] font-mono text-gray-500 leading-none">
          <span>Source: {source}</span>
          <span>•</span>
          <span>Updated {timeStr}</span>
        </div>
      )}
    </div>
  );
}
