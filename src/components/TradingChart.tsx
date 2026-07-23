import React, { useState, useRef, useEffect } from 'react';
import LivePriceDisplay from './LivePriceDisplay.js';
import { 
  Maximize, 
  Layers, 
  TrendingUp, 
  ZoomIn, 
  ZoomOut, 
  TrendingDown,
  Info,
  BookOpen,
  DollarSign,
  Activity,
  Calculator,
  ChevronRight,
  TrendingUp as TrendUpIcon,
  ShoppingBag,
  Sliders,
  CheckCircle,
  Clock,
  ShieldCheck,
  Percent
} from 'lucide-react';
import { PriceBar, StockDetails, AIPrediction } from '../types.js';

interface TradingChartProps {
  symbol: string;
  stock: StockDetails;
  bars: PriceBar[];
  patterns: any[];
  support: number;
  resistance: number;
  onAddTransaction: (symbol: string, shares: number, price: number, type: 'BUY' | 'SELL') => void;
  prediction?: AIPrediction | null;
}

export default function TradingChart({ 
  symbol, 
  stock, 
  bars, 
  patterns, 
  support, 
  resistance, 
  onAddTransaction,
  prediction = null
}: TradingChartProps) {
  const [timeframe, setTimeframe] = useState('1D');
  const [overlays, setOverlays] = useState({
    sma20: true,
    ema50: false,
    vwap: false,
    bb: false,
    supertrend: false,
    aiForecast: true,
  });

  const [zoomLevel, setZoomLevel] = useState(50); // Show last N bars
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [drawings, setDrawings] = useState<{ id: string; type: 'line' | 'horizontal'; y: number; yLabel?: string }[]>([]);
  const [drawingMode, setDrawingMode] = useState<'none' | 'trend' | 'horizontal'>('none');

  // Multi-Layout Configuration
  const [chartLayout, setChartLayout] = useState<'candle' | 'heikin' | 'line'>('candle');

  // Professional Sub-Workspace Tabs
  const [activeSubTab, setActiveSubTab] = useState<'depth' | 'order' | 'options' | 'futures'>('depth');

  // Order Desk Form States
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [productType, setProductType] = useState<'MIS' | 'CNC'>('MIS'); // MIS (Intraday Daytrading - 5x) vs CNC (Delivery - 1x)
  const [priceType, setPriceType] = useState<'MARKET' | 'LIMIT'>('LIMIT');
  const [orderQty, setOrderQty] = useState<number>(50);
  const [orderPrice, setOrderPrice] = useState<number>(stock.price);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  // Auto-Update order price when active stock updates
  useEffect(() => {
    if (priceType === 'MARKET') {
      setOrderPrice(stock.price);
    }
  }, [stock.price, priceType]);

  // Set default price on first load
  useEffect(() => {
    setOrderPrice(stock.price);
  }, [symbol]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [svgWidth, setSvgWidth] = useState(800);
  const [svgHeight, setSvgHeight] = useState(400);

  // Measure container dimensions
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSvgWidth(Math.max(entry.contentRect.width, 300));
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Time & Sales trade tick logs (sub-second transaction logging)
  const [tradeTicks, setTradeTicks] = useState<{ id: string; price: number; qty: number; time: string; type: 'BUY' | 'SELL' }[]>([]);

  useEffect(() => {
    // Generate realistic sub-second trade execution record as LTP mutates
    const nowStr = new Date().toLocaleTimeString([], { hour12: false });
    const isBuy = Math.random() > 0.45;
    const qty = Math.round(10 + Math.random() * 850);
    const offset = (Math.random() - 0.5) * (stock.price * 0.0003);
    const tickPrice = parseFloat((stock.price + offset).toFixed(2));

    const newTick = {
      id: Math.random().toString(),
      price: tickPrice,
      qty,
      time: nowStr,
      type: isBuy ? 'BUY' as const : 'SELL' as const
    };

    setTradeTicks(prev => [newTick, ...prev.slice(0, 14)]);
  }, [stock.price]);

  if (bars.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 font-mono">
        Aggregating candle ticks...
      </div>
    );
  }

  // Calculate Heikin-Ashi candles
  const getHeikinAshiBars = (priceBars: PriceBar[]): PriceBar[] => {
    const haBars: PriceBar[] = [];
    if (priceBars.length === 0) return haBars;

    let prevOpen = priceBars[0].open;
    let prevClose = priceBars[0].close;

    priceBars.forEach((bar, idx) => {
      const close = (bar.open + bar.high + bar.low + bar.close) / 4;
      const open = idx === 0 ? (bar.open + bar.close) / 2 : (prevOpen + prevClose) / 2;
      const high = Math.max(bar.high, open, close);
      const low = Math.min(bar.low, open, close);

      haBars.push({
        time: bar.time,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: bar.volume,
        indicators: bar.indicators
      });

      prevOpen = open;
      prevClose = close;
    });

    return haBars;
  };

  const processedBars = chartLayout === 'heikin' ? getHeikinAshiBars(bars) : bars;

  // Filter bars based on zoom level (slice the last zoomLevel bars)
  const visibleBars = processedBars.slice(-Math.min(zoomLevel, processedBars.length));
  const totalVisible = visibleBars.length;

  let minPrice = Math.min(...visibleBars.map(b => {
    const vals = [b.low];
    if (overlays.bb && b.indicators?.bbLower) vals.push(b.indicators.bbLower);
    if (overlays.supertrend && b.indicators?.supertrend) vals.push(b.indicators.supertrend);
    return Math.min(...vals);
  })) * 0.99;

  let maxPrice = Math.max(...visibleBars.map(b => {
    const vals = [b.high];
    if (overlays.bb && b.indicators?.bbUpper) vals.push(b.indicators.bbUpper);
    if (overlays.supertrend && b.indicators?.supertrend) vals.push(b.indicators.supertrend);
    return Math.max(...vals);
  })) * 1.01;

  if (overlays.aiForecast && prediction) {
    minPrice = Math.min(minPrice, prediction.expectedRangeMin * 0.995);
    maxPrice = Math.max(maxPrice, prediction.expectedRangeMax * 1.005);
  }

  const priceRange = maxPrice - minPrice;

  // Dimensions
  const paddingRight = 60;
  const paddingLeft = 10;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Map Price to SVG coordinates
  const getY = (price: number) => {
    return paddingTop + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
  };

  // Map SVG coordinates back to Price
  const getPriceFromY = (y: number) => {
    const normalizedY = (paddingTop + chartHeight - y) / chartHeight;
    return minPrice + normalizedY * priceRange;
  };

  // Map index to X coordinates
  const getX = (idx: number) => {
    return paddingLeft + (idx / (totalVisible - 1)) * chartWidth;
  };

  // SVG Mouse movements
  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - paddingLeft;
    const index = Math.round((x / chartWidth) * (totalVisible - 1));
    if (index >= 0 && index < totalVisible) {
      setHoverIndex(index);
    } else {
      setHoverIndex(null);
    }
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (drawingMode === 'horizontal') {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const clickedPrice = getPriceFromY(clickY);
      setDrawings([
        ...drawings,
        {
          id: Math.random().toString(),
          type: 'horizontal',
          y: clickY,
          yLabel: `Support/Resistance: ₹${clickedPrice.toFixed(2)}`
        }
      ]);
      setDrawingMode('none');
    }
  };

  // Active bar details (hovered, or fallback to the latest)
  const activeIndex = hoverIndex !== null ? hoverIndex : totalVisible - 1;
  const activeBar = visibleBars[activeIndex];

  // Draw overlay paths
  const makeLinePath = (indicatorKey: 'sma20' | 'ema50' | 'vwap' | 'supertrend') => {
    let path = '';
    for (let i = 0; i < totalVisible; i++) {
      const b = visibleBars[i];
      const val = b.indicators?.[indicatorKey];
      if (val) {
        const x = getX(i);
        const y = getY(val);
        if (i === 0 || path === '') {
          path += `M ${x} ${y}`;
        } else {
          path += ` L ${x} ${y}`;
        }
      }
    }
    return path;
  };

  // Draw Bollinger Bands Area path
  const makeBBAreaPath = () => {
    let topPath = '';
    let bottomPath = '';
    for (let i = 0; i < totalVisible; i++) {
      const b = visibleBars[i];
      const upper = b.indicators?.bbUpper;
      const lower = b.indicators?.bbLower;
      if (upper && lower) {
        const x = getX(i);
        const yUpper = getY(upper);
        const yLower = getY(lower);
        
        if (i === 0) {
          topPath += `M ${x} ${yUpper}`;
          bottomPath = `L ${x} ${yLower} ${bottomPath}`;
        } else {
          topPath += ` L ${x} ${yUpper}`;
          bottomPath = ` L ${x} ${yLower} ${bottomPath}`;
        }
      }
    }
    return topPath + ' ' + bottomPath + ' Z';
  };

  // Draw pure Area line chart path
  const makeLineAreaPath = () => {
    let path = '';
    for (let i = 0; i < totalVisible; i++) {
      const x = getX(i);
      const y = getY(visibleBars[i].close);
      if (i === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    }
    // Closed loop for gradient area
    const startX = getX(0);
    const endX = getX(totalVisible - 1);
    const bottomY = getY(minPrice);
    return `${path} L ${endX} ${bottomY} L ${startX} ${bottomY} Z`;
  };

  const makeLineStrokePath = () => {
    let path = '';
    for (let i = 0; i < totalVisible; i++) {
      const x = getX(i);
      const y = getY(visibleBars[i].close);
      if (i === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    }
    return path;
  };

  const isUS = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'].includes(symbol);

  // Option Chain Striking Interval Calculations
  const getStrikes = () => {
    const ltp = stock.price;
    let step = 50;
    if (ltp < 200) step = 1;
    else if (ltp < 500) step = 5;
    else if (ltp < 1500) step = 10;
    
    const centerStrike = Math.round(ltp / step) * step;
    const list = [];
    for (let i = -3; i <= 3; i++) {
      list.push(centerStrike + i * step);
    }
    return { step, centerStrike, list };
  };

  const { list: strikePrices } = getStrikes();

  // Option Chain calculations (Calls / Puts, LTP, Implied Volatility, Open Interest, Volume)
  const getOptionRow = (strike: number) => {
    const ltp = stock.price;
    const isCallITM = strike < ltp;
    const isPutITM = strike > ltp;

    // Standard theoretical values with dynamic offsets
    const callIntrinsic = isCallITM ? ltp - strike : 0;
    const putIntrinsic = isPutITM ? strike - ltp : 0;

    const baseOffset = (symbol.charCodeAt(0) % 5) + 3; // Deterministic seed
    const callLtp = callIntrinsic + (baseOffset * 1.5) + (strike % 7);
    const putLtp = putIntrinsic + (baseOffset * 1.3) + (strike % 5);

    return {
      strike,
      call: {
        ltp: Math.max(0.55, parseFloat(callLtp.toFixed(2))),
        iv: parseFloat((14.5 + (strike % 4) * 0.8).toFixed(1)),
        vol: Math.round(15000 + (strike % 12) * 2300),
        oi: Math.round(112000 + (strike % 8) * 14000),
        isITM: isCallITM
      },
      put: {
        ltp: Math.max(0.45, parseFloat(putLtp.toFixed(2))),
        iv: parseFloat((15.2 + (strike % 3) * 0.9).toFixed(1)),
        vol: Math.round(11000 + (strike % 9) * 1800),
        oi: Math.round(89000 + (strike % 6) * 11000),
        isITM: isPutITM
      }
    };
  };

  // Indian Regulatory GST/STT Tax and Brokerage Calculations
  const calculateCharges = () => {
    const price = orderPrice;
    const qty = orderQty;
    const turnover = price * qty;
    
    // Daytrading MIS has tiny flat brokerage or 0.03%, CNC Delivery delivery brokerage is ₹0
    let brokerage = 0;
    if (productType === 'MIS') {
      const calculated = turnover * 0.0003; // 0.03%
      brokerage = parseFloat(Math.min(20, calculated).toFixed(2));
    }

    // Securities Transaction Tax (STT) - major regulatory daytrader charge
    let stt = 0;
    if (productType === 'MIS') {
      // 0.025% on sell side only for intraday equities
      stt = orderType === 'SELL' ? parseFloat((turnover * 0.00025).toFixed(2)) : 0;
    } else {
      // 0.1% on buy AND sell sides for delivery equities
      stt = parseFloat((turnover * 0.001).toFixed(2));
    }

    // Exchange Transaction Charges (NSE standard: 0.00345%)
    const exchangeCharge = parseFloat((turnover * 0.0000345).toFixed(2));

    // SEBI Turnover fee (₹10 per crore, 0.0001%)
    const sebiFee = parseFloat((turnover * 0.000001).toFixed(2));

    // GST (18% of Brokerage + Exchange charges)
    const gst = parseFloat(((brokerage + exchangeCharge) * 0.18).toFixed(2));

    // Stamp Duty (Buy side only: 0.015% for Delivery, 0.003% for Intraday)
    let stampDuty = 0;
    if (orderType === 'BUY') {
      const rate = productType === 'MIS' ? 0.00003 : 0.00015;
      stampDuty = parseFloat((turnover * rate).toFixed(2));
    }

    const totalTaxes = parseFloat((brokerage + stt + exchangeCharge + sebiFee + gst + stampDuty).toFixed(2));
    const breakevenPoints = qty > 0 ? parseFloat((totalTaxes / qty).toFixed(2)) : 0;

    return {
      turnover,
      brokerage,
      stt,
      exchangeCharge,
      sebiFee,
      gst,
      stampDuty,
      totalTaxes,
      breakevenPoints
    };
  };

  const charges = calculateCharges();

  // Leverage and Available margins
  const leverageFactor = productType === 'MIS' ? 5 : 1;
  const virtualCash = 100000; // Virtual capital ₹100,000 INR
  const marginRequired = parseFloat(((charges.turnover) / leverageFactor).toFixed(2));
  const hasSufficientMargin = virtualCash >= marginRequired;

  // Execute Virtual Order Handler
  const handlePlaceOrder = () => {
    if (orderQty <= 0 || isNaN(orderQty)) {
      alert("Please input a valid quantity");
      return;
    }
    if (!hasSufficientMargin) {
      alert("Insufficient funds! Intraday limits exceeded.");
      return;
    }

    // Call the parent transaction aggregator
    onAddTransaction(symbol, orderQty, orderPrice, orderType);

    setOrderSuccessMsg(
      `Executed ${orderType} ${orderQty} ${symbol} @ ${isUS ? '$' : '₹'}${orderPrice.toFixed(2)} (${productType} ${productType === 'MIS' ? '5x Margin' : 'CNC Delivery'})`
    );

    // Auto clear feedback banner after 4 seconds
    setTimeout(() => {
      setOrderSuccessMsg(null);
    }, 4000);
  };

  return (
    <div className="flex-1 flex flex-col xl:flex-row gap-5">
      
      {/* Left Column - Dynamic Live Chart & Analytics */}
      <div className="flex-1 bg-slate-900 border border-gray-800/80 rounded-lg overflow-hidden flex flex-col glass-panel select-none">
        
        {/* Chart Header toolbar */}
        <div className="p-4 border-b border-gray-800/60 flex flex-wrap items-center justify-between gap-4 bg-slate-950/40">
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-gray-800/40 px-2.5 py-1 rounded text-xs text-white font-mono font-bold tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {symbol} : {stock.exchange || 'NSE'}
            </div>
            
            <LivePriceDisplay stock={stock} size="md" showDetail={true} />
          </div>

          <div className="flex items-center gap-2">
            {/* Chart Type Layout Selector */}
            <div className="bg-slate-900 border border-gray-800 rounded p-0.5 flex gap-0.5 text-[10px] font-bold">
              <button 
                onClick={() => setChartLayout('candle')}
                className={`px-2 py-1 rounded transition-all cursor-pointer ${chartLayout === 'candle' ? 'bg-teal-500 text-slate-950' : 'text-gray-400 hover:text-white'}`}
              >
                CANDLE
              </button>
              <button 
                onClick={() => setChartLayout('heikin')}
                className={`px-2 py-1 rounded transition-all cursor-pointer ${chartLayout === 'heikin' ? 'bg-teal-500 text-slate-950' : 'text-gray-400 hover:text-white'}`}
              >
                HEIKIN
              </button>
              <button 
                onClick={() => setChartLayout('line')}
                className={`px-2 py-1 rounded transition-all cursor-pointer ${chartLayout === 'line' ? 'bg-teal-500 text-slate-950' : 'text-gray-400 hover:text-white'}`}
              >
                LINE
              </button>
            </div>

            {/* Overlays list */}
            <div className="hidden md:flex bg-slate-900 border border-gray-800 rounded p-0.5 gap-0.5 text-[9px] font-bold">
              <button 
                onClick={() => setOverlays({ ...overlays, sma20: !overlays.sma20 })}
                className={`px-1.5 py-1 rounded ${overlays.sma20 ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                SMA20
              </button>
              <button 
                onClick={() => setOverlays({ ...overlays, ema50: !overlays.ema50 })}
                className={`px-1.5 py-1 rounded ${overlays.ema50 ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                EMA50
              </button>
              <button 
                onClick={() => setOverlays({ ...overlays, vwap: !overlays.vwap })}
                className={`px-1.5 py-1 rounded ${overlays.vwap ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                VWAP
              </button>
              <button 
                onClick={() => setOverlays({ ...overlays, bb: !overlays.bb })}
                className={`px-1.5 py-1 rounded ${overlays.bb ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                BBANDS
              </button>
              <button 
                onClick={() => setOverlays({ ...overlays, supertrend: !overlays.supertrend })}
                className={`px-1.5 py-1 rounded ${overlays.supertrend ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                S-TREND
              </button>
              {prediction && (
                <button 
                  onClick={() => setOverlays({ ...overlays, aiForecast: !overlays.aiForecast })}
                  className={`px-1.5 py-1 rounded ${overlays.aiForecast ? 'bg-teal-500/10 text-teal-400 border border-teal-500/25' : 'text-gray-500 hover:text-gray-300'}`}
                  title="Toggle Shaded Confidence Interval & Target Close Range"
                >
                  AI FORECAST
                </button>
              )}
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center bg-slate-900 border border-gray-800 rounded p-0.5 gap-0.5">
              <button 
                onClick={() => setZoomLevel(Math.min(100, zoomLevel + 10))}
                className="p-1 text-gray-400 hover:text-white rounded transition-all cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setZoomLevel(Math.max(20, zoomLevel - 10))}
                className="p-1 text-gray-400 hover:text-white rounded transition-all cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setDrawingMode(drawingMode === 'horizontal' ? 'none' : 'horizontal')}
              className={`p-1.5 rounded border ${drawingMode === 'horizontal' ? 'bg-teal-500/10 border-teal-500 text-teal-400' : 'bg-slate-900 border-gray-800 text-gray-400 hover:text-white'} transition-all cursor-pointer`}
              title="Draw Horizontal Support Line"
            >
              <Maximize className="w-3.5 h-3.5 rotate-45" />
            </button>
            
            {drawings.length > 0 && (
              <button
                onClick={() => setDrawings([])}
                className="px-1.5 py-1 text-[9px] font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded cursor-pointer transition-all"
              >
                CLEAR LINES
              </button>
            )}
          </div>
        </div>

        {/* OHLCV live ticks display bar */}
        <div className="px-4 py-2 bg-slate-950/20 border-b border-gray-800/40 flex flex-wrap items-center justify-between text-[11px] font-mono text-gray-400 gap-2">
          <div className="flex gap-3">
            <span>O: <span className={activeBar.close >= activeBar.open ? 'text-emerald-400' : 'text-rose-400'}>{isUS ? '$' : '₹'}{activeBar.open.toFixed(2)}</span></span>
            <span>H: <span className="text-white">{isUS ? '$' : '₹'}{activeBar.high.toFixed(2)}</span></span>
            <span>L: <span className="text-white">{isUS ? '$' : '₹'}{activeBar.low.toFixed(2)}</span></span>
            <span>C: <span className={activeBar.close >= activeBar.open ? 'text-emerald-400' : 'text-rose-400'}>{isUS ? '$' : '₹'}{activeBar.close.toFixed(2)}</span></span>
            <span className="hidden md:inline">V: <span className="text-white">{(activeBar.volume || 0).toLocaleString()}</span></span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-500">{activeBar.time}</span>
            <span className="px-1.5 py-0.5 rounded bg-gray-800 text-[10px] font-bold text-gray-300">
              {chartLayout.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Dynamic Vector Canvas */}
        <div className="flex-1 relative min-h-[300px]" ref={containerRef}>
          
          {drawingMode === 'horizontal' && (
            <div className="absolute top-2 left-2 z-10 bg-teal-500/10 text-teal-400 text-[10px] font-bold px-2 py-1 rounded border border-teal-500/30 font-mono animate-pulse">
              [DRAW MODE] Click inside chart grid to place support level
            </div>
          )}

          <svg 
            width={svgWidth} 
            height={svgHeight} 
            onMouseMove={handleSvgMouseMove}
            onMouseLeave={() => setHoverIndex(null)}
            onClick={handleSvgClick}
            className="absolute inset-0 w-full h-full cursor-crosshair"
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.00" />
              </linearGradient>
              <linearGradient id="predictionShadeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.04" />
              </linearGradient>
            </defs>

            {/* Y Axis Grid lines */}
            {[0.2, 0.4, 0.6, 0.8].map((ratio, i) => {
              const yVal = paddingTop + chartHeight * ratio;
              const priceLabel = minPrice + (1 - ratio) * priceRange;
              return (
                <g key={`grid-${i}`} className="opacity-30">
                  <line 
                    x1={paddingLeft} 
                    y1={yVal} 
                    x2={svgWidth - paddingRight} 
                    y2={yVal} 
                    stroke="#374151" 
                    strokeWidth={0.5} 
                    strokeDasharray="4,4" 
                  />
                  <text 
                    x={svgWidth - paddingRight + 5} 
                    y={yVal + 3} 
                    fill="#9ca3af" 
                    fontSize={9} 
                    fontFamily="monospace"
                  >
                    {isUS ? '$' : '₹'}{priceLabel.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* SMA Bollinger Band shading */}
            {overlays.bb && (
              <path 
                d={makeBBAreaPath()} 
                fill="rgba(59, 130, 246, 0.04)" 
                stroke="none" 
              />
            )}

            {/* Horizontal drawings placed by user */}
            {drawings.map((draw) => (
              <g key={draw.id}>
                <line 
                  x1={paddingLeft} 
                  y1={draw.y} 
                  x2={svgWidth - paddingRight} 
                  y2={draw.y} 
                  stroke="#14b8a6" 
                  strokeWidth={1.5} 
                />
                <text 
                  x={paddingLeft + 10} 
                  y={draw.y - 5} 
                  fill="#14b8a6" 
                  fontSize={8} 
                  fontWeight="bold" 
                  fontFamily="monospace"
                >
                  {draw.yLabel}
                </text>
              </g>
            ))}

            {/* Static support resistance levels passed from backend */}
            {support > 0 && (
              <g className="opacity-60">
                <line 
                  x1={paddingLeft} 
                  y1={getY(support)} 
                  x2={svgWidth - paddingRight} 
                  y2={getY(support)} 
                  stroke="#10b981" 
                  strokeWidth={1} 
                  strokeDasharray="2,2" 
                />
                <text 
                  x={paddingLeft + 15} 
                  y={getY(support) - 5} 
                  fill="#10b981" 
                  fontSize={9} 
                  fontFamily="monospace"
                >
                  SUP: {isUS ? '$' : '₹'}{support.toFixed(1)}
                </text>
              </g>
            )}

            {resistance > 0 && (
              <g className="opacity-60">
                <line 
                  x1={paddingLeft} 
                  y1={getY(resistance)} 
                  x2={svgWidth - paddingRight} 
                  y2={getY(resistance)} 
                  stroke="#f43f5e" 
                  strokeWidth={1} 
                  strokeDasharray="2,2" 
                />
                <text 
                  x={paddingLeft + 15} 
                  y={getY(resistance) - 5} 
                  fill="#f43f5e" 
                  fontSize={9} 
                  fontFamily="monospace"
                >
                  RES: {isUS ? '$' : '₹'}{resistance.toFixed(1)}
                </text>
              </g>
            )}

            {/* AI Expected Closing Range Shaded Confidence Interval Overlay */}
            {overlays.aiForecast && prediction && (
              <g>
                {/* Shaded confidence interval region */}
                <rect
                  x={paddingLeft}
                  y={Math.min(getY(prediction.expectedRangeMin), getY(prediction.expectedRangeMax))}
                  width={chartWidth}
                  height={Math.abs(getY(prediction.expectedRangeMin) - getY(prediction.expectedRangeMax))}
                  fill="url(#predictionShadeGrad)"
                  stroke="#2dd4bf"
                  strokeWidth={0.5}
                  strokeOpacity={0.15}
                />

                {/* Upper boundary line */}
                <line
                  x1={paddingLeft}
                  y1={getY(prediction.expectedRangeMax)}
                  x2={svgWidth - paddingRight}
                  y2={getY(prediction.expectedRangeMax)}
                  stroke="#2dd4bf"
                  strokeWidth={1.2}
                  strokeDasharray="4,4"
                  opacity={0.8}
                />

                {/* Lower boundary line */}
                <line
                  x1={paddingLeft}
                  y1={getY(prediction.expectedRangeMin)}
                  x2={svgWidth - paddingRight}
                  y2={getY(prediction.expectedRangeMin)}
                  stroke="#2dd4bf"
                  strokeWidth={1.2}
                  strokeDasharray="4,4"
                  opacity={0.8}
                />

                {/* Labels */}
                <text
                  x={paddingLeft + 15}
                  y={getY(prediction.expectedRangeMax) - 5}
                  fill="#2dd4bf"
                  fontSize={8}
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  AI CLOSE MAX: {isUS ? '$' : '₹'}{prediction.expectedRangeMax.toFixed(2)}
                </text>

                <text
                  x={paddingLeft + 15}
                  y={getY(prediction.expectedRangeMin) + 11}
                  fill="#2dd4bf"
                  fontSize={8}
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  AI CLOSE MIN: {isUS ? '$' : '₹'}{prediction.expectedRangeMin.toFixed(2)}
                </text>

                {/* Right Margin Axis Indicator */}
                <rect
                  x={svgWidth - paddingRight}
                  y={Math.min(getY(prediction.expectedRangeMin), getY(prediction.expectedRangeMax))}
                  width={paddingRight}
                  height={Math.abs(getY(prediction.expectedRangeMin) - getY(prediction.expectedRangeMax))}
                  fill="rgba(45, 212, 191, 0.12)"
                  stroke="#2dd4bf"
                  strokeWidth={0.5}
                />
                <text
                  x={svgWidth - paddingRight + 4}
                  y={getY((prediction.expectedRangeMin + prediction.expectedRangeMax) / 2) + 3}
                  fill="#2dd4bf"
                  fontSize={8}
                  fontWeight="extrabold"
                  fontFamily="monospace"
                >
                  AI ZONE
                </text>
              </g>
            )}

            {/* Render line layout area gradient and stroke */}
            {chartLayout === 'line' && (
              <>
                <path 
                  d={makeLineAreaPath()} 
                  fill="url(#chartGradient)" 
                />
                <path 
                  d={makeLineStrokePath()} 
                  fill="none" 
                  stroke="#14b8a6" 
                  strokeWidth={1.8} 
                />
              </>
            )}

            {/* Technical Overlay Paths */}
            {overlays.sma20 && (
              <path 
                d={makeLinePath('sma20')} 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth={1.2} 
              />
            )}
            {overlays.ema50 && (
              <path 
                d={makeLinePath('ema50')} 
                fill="none" 
                stroke="#a855f7" 
                strokeWidth={1.2} 
              />
            )}
            {overlays.vwap && (
              <path 
                d={makeLinePath('vwap')} 
                fill="none" 
                stroke="#eab308" 
                strokeWidth={1.2} 
              />
            )}
            {overlays.supertrend && (
              <path 
                d={makeLinePath('supertrend')} 
                fill="none" 
                stroke="#10b981" 
                strokeWidth={1.5} 
              />
            )}

            {/* Candlestick / Heikin layout drawing */}
            {chartLayout !== 'line' && visibleBars.map((bar, i) => {
              const x = getX(i);
              const yHigh = getY(bar.high);
              const yLow = getY(bar.low);
              const yOpen = getY(bar.open);
              const yClose = getY(bar.close);

              const isGreen = bar.close >= bar.open;
              const strokeColor = isGreen ? '#10b981' : '#f43f5e';
              const fillColor = isGreen ? 'rgba(16, 185, 129, 0.45)' : 'rgba(244, 63, 94, 0.45)';

              const barWidth = Math.max(2, (chartWidth / totalVisible) * 0.7);

              return (
                <g key={`candle-${i}`}>
                  {/* Wick */}
                  <line 
                    x1={x} 
                    y1={yHigh} 
                    x2={x} 
                    y2={yLow} 
                    stroke={strokeColor} 
                    strokeWidth={1.2} 
                  />
                  {/* Body */}
                  <rect 
                    x={x - barWidth / 2} 
                    y={Math.min(yOpen, yClose)} 
                    width={barWidth} 
                    height={Math.max(1, Math.abs(yOpen - yClose))} 
                    fill={fillColor} 
                    stroke={strokeColor} 
                    strokeWidth={1}
                  />
                </g>
              );
            })}

            {/* Interactive Mouse Crosshair */}
            {hoverIndex !== null && (
              <g>
                <line 
                  x1={getX(hoverIndex)} 
                  y1={paddingTop} 
                  x2={getX(hoverIndex)} 
                  y2={svgHeight - paddingBottom} 
                  stroke="#4b5563" 
                  strokeWidth={0.8} 
                  strokeDasharray="3,3" 
                />
                <line 
                  x1={paddingLeft} 
                  y1={getY(visibleBars[hoverIndex].close)} 
                  x2={svgWidth - paddingRight} 
                  y2={getY(visibleBars[hoverIndex].close)} 
                  stroke="#4b5563" 
                  strokeWidth={0.8} 
                  strokeDasharray="3,3" 
                />
                <circle 
                  cx={getX(hoverIndex)} 
                  cy={getY(visibleBars[hoverIndex].close)} 
                  r={3} 
                  fill="#14b8a6" 
                />
              </g>
            )}
          </svg>
        </div>

        {/* Pattern Recognition Engine */}
        <div className="p-4 border-t border-gray-800/60 bg-slate-950/30">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-teal-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Pattern Recognition Engine</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {patterns.map((pat, idx) => (
              <div 
                key={`${pat.name}-${idx}`}
                className="p-3 rounded-md bg-gray-950/50 border border-gray-800/80 flex items-start gap-3"
              >
                <div className={`p-1.5 rounded ${
                  pat.type === 'bullish' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {pat.type === 'bullish' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-200">{pat.name}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      pat.type === 'bullish' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {pat.type.toUpperCase()} ({pat.confidence}% Conf.)
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-normal">{pat.description}</p>
                  <div className="text-[9px] font-mono text-gray-500">
                    Target Price Level: {isUS ? '$' : '₹'}{pat.priceLevel}
                  </div>
                </div>
              </div>
            ))}

            {patterns.length === 0 && (
              <div className="col-span-2 py-4 text-center text-xs text-gray-500 flex items-center justify-center gap-2 font-mono">
                <Info className="w-4 h-4 text-gray-600" />
                Scanning head-and-shoulders, triangles, and double bottoms...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Professional Brokerage Tools Sidebar */}
      <div className="w-full xl:w-[420px] bg-slate-900 border border-gray-800/80 rounded-lg overflow-hidden flex flex-col glass-panel select-none">
        
        {/* Workspace Sub-Tabs */}
        <div className="flex border-b border-gray-800/60 bg-slate-950/40 text-[10px] font-bold">
          <button
            onClick={() => setActiveSubTab('depth')}
            className={`flex-1 py-3 border-b-2 text-center uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'depth' ? 'border-teal-500 text-teal-400 bg-teal-500/5' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Level 2 Book
          </button>
          <button
            onClick={() => setActiveSubTab('order')}
            className={`flex-1 py-3 border-b-2 text-center uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'order' ? 'border-teal-500 text-teal-400 bg-teal-500/5' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Order Desk
          </button>
          <button
            onClick={() => setActiveSubTab('options')}
            className={`flex-1 py-3 border-b-2 text-center uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'options' ? 'border-teal-500 text-teal-400 bg-teal-500/5' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Options Chain
          </button>
          <button
            onClick={() => setActiveSubTab('futures')}
            className={`flex-1 py-3 border-b-2 text-center uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'futures' ? 'border-teal-500 text-teal-400 bg-teal-500/5' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Futures
          </button>
        </div>

        {/* Dynamic Panel Switcher */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          
          {/* 1. Level 2 Book & Live trades list */}
          {activeSubTab === 'depth' && (() => {
            const rawDepth = stock.marketDepth || [];
            
            // Calculate cumulative bid volume (from highest price down to lowest price)
            let cumBid = 0;
            const bidsList = [...rawDepth].map(d => ({ price: d.bidPrice, qty: d.bidQty }));
            bidsList.sort((a, b) => b.price - a.price); // Descending bids
            const bidsCum = bidsList.map(b => {
              cumBid += b.qty;
              return { price: b.price, qty: b.qty, cumulative: cumBid };
            });

            // Calculate cumulative ask volume (from lowest price up to highest price)
            let cumAsk = 0;
            const asksList = [...rawDepth].map(d => ({ price: d.askPrice, qty: d.askQty }));
            asksList.sort((a, b) => a.price - b.price); // Ascending asks
            const asksCum = asksList.map(a => {
              cumAsk += a.qty;
              return { price: a.price, qty: a.qty, cumulative: cumAsk };
            });

            const maxCumVolume = Math.max(cumBid, cumAsk, 1);
            const totalBidsVolume = cumBid;
            const totalAsksVolume = cumAsk;
            const bidPowerPct = (totalBidsVolume / (totalBidsVolume + totalAsksVolume || 1)) * 100;
            const askPowerPct = 100 - bidPowerPct;

            // Generate clean linear points for visual buy/sell walls in an SVG
            // Bids sorted descending in price: reverse bidsCum to draw left-to-right (lowest bid to highest bid)
            const bidsCumSortedLeftToRight = [...bidsCum].reverse();
            const bidPoints = bidsCumSortedLeftToRight.map((b, idx) => {
              const x = (idx / Math.max(1, bidsCumSortedLeftToRight.length - 1)) * 175;
              const y = 80 - (b.cumulative / maxCumVolume) * 70;
              return `${x},${y}`;
            });
            const bidPath = bidsCumSortedLeftToRight.length > 0 
              ? `M 0,80 L ${bidPoints.join(' L ')} L 175,80 Z` 
              : "M 0,80 Z";
            const bidStrokePath = bidsCumSortedLeftToRight.length > 0 
              ? `M 0,${80 - (bidsCumSortedLeftToRight[0].cumulative / maxCumVolume) * 70} L ${bidPoints.join(' L ')}` 
              : "";

            // Asks sorted ascending in price (already goes lowest ask to highest ask, draw left-to-right)
            const askPoints = asksCum.map((a, idx) => {
              const x = 195 + (idx / Math.max(1, asksCum.length - 1)) * 175;
              const y = 80 - (a.cumulative / maxCumVolume) * 70;
              return `${x},${y}`;
            });
            const askPath = asksCum.length > 0 
              ? `M 195,80 L ${askPoints.join(' L ')} L 370,80 Z` 
              : "M 195,80 Z";
            const askStrokePath = asksCum.length > 0 
              ? `M 195,${80 - (asksCum[0].cumulative / maxCumVolume) * 70} L ${askPoints.join(' L ')}` 
              : "";

            return (
              <div className="space-y-4">
                
                {/* Bid-Ask Spread Panel */}
                <div className="bg-gray-950/40 p-3 rounded border border-gray-800 flex justify-between items-center text-xs font-mono">
                  <div className="text-left">
                    <span className="text-[10px] text-gray-500 block">BEST BID</span>
                    <span className="text-emerald-400 font-bold text-sm">{isUS ? '$' : '₹'}{stock.bidPrice?.toFixed(2) || stock.price.toFixed(2)}</span>
                    <span className="text-[9px] text-gray-600 block">Size: {stock.bidQty || 1200}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] text-gray-500 block font-sans">SPREAD</span>
                    <span className="text-teal-400 font-bold block text-[11px]">
                      {isUS ? '$' : '₹'}{parseFloat(( (stock.askPrice || stock.price) - (stock.bidPrice || stock.price) ).toFixed(2))}
                    </span>
                    <span className="text-[8px] text-gray-600 block font-semibold">
                      {( ( ((stock.askPrice || stock.price) - (stock.bidPrice || stock.price)) / stock.price ) * 100).toFixed(3)}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 block">BEST ASK</span>
                    <span className="text-rose-400 font-bold text-sm">{isUS ? '$' : '₹'}{stock.askPrice?.toFixed(2) || stock.price.toFixed(2)}</span>
                    <span className="text-[9px] text-gray-600 block">Size: {stock.askQty || 1400}</span>
                  </div>
                </div>

                {/* Level 2 Book Order Pressure Ratio (Balance of Power) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-gray-400">
                    <span className="text-emerald-400 font-bold">BUYS: {bidPowerPct.toFixed(1)}%</span>
                    <span>ORDER BOOK RATIO</span>
                    <span className="text-rose-400 font-bold">SELLS: {askPowerPct.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-950 overflow-hidden flex border border-gray-800">
                    <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${bidPowerPct}%` }} />
                    <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: `${askPowerPct}%` }} />
                  </div>
                </div>

                {/* Professional SVG Cumulative Market Depth Wall Chart */}
                <div className="bg-black/40 p-2.5 rounded border border-gray-800 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <span>Cumulative Bid Walls</span>
                    <span>Cumulative Ask Walls</span>
                  </div>
                  <div className="relative w-full h-[85px] select-none">
                    <svg viewBox="0 0 370 80" className="w-full h-full">
                      <defs>
                        <linearGradient id="bidWallGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="askWallGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Grid background reference lines */}
                      <line x1="0" y1="40" x2="370" y2="40" stroke="#1f2937" strokeWidth={0.5} strokeDasharray="3,3" />
                      <line x1="185" y1="0" x2="185" y2="80" stroke="#374151" strokeWidth={1} strokeDasharray="2,2" />

                      {/* Buy Wall Area & Border */}
                      <path d={bidPath} fill="url(#bidWallGrad)" />
                      <path d={bidStrokePath} fill="none" stroke="#10b981" strokeWidth={1.5} />

                      {/* Sell Wall Area & Border */}
                      <path d={askPath} fill="url(#askWallGrad)" />
                      <path d={askStrokePath} fill="none" stroke="#f43f5e" strokeWidth={1.5} />

                      {/* Mid Market Price Indicator */}
                      <rect x="150" y="32" width="70" height="16" rx="2" fill="#111827" stroke="#374151" strokeWidth={0.8} />
                      <text x="185" y="44" fill="#2dd4bf" fontSize={8} fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                        {isUS ? '$' : '₹'}{stock.price.toFixed(1)}
                      </text>
                    </svg>
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-gray-500">
                    <span>{isUS ? '$' : '₹'}{(stock.bidPrice! - (rawDepth.length - 1) * (stock.price * 0.0001)).toFixed(2)}</span>
                    <span className="text-gray-400">Midpoint</span>
                    <span>{isUS ? '$' : '₹'}{(stock.askPrice! + (rawDepth.length - 1) * (stock.price * 0.0001)).toFixed(2)}</span>
                  </div>
                </div>

                {/* L2 Depth Table (Top 5 Level with Cumulative Solid Bars) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <span>Bid Levels (BUY WALLS)</span>
                    <span>Ask Levels (SELL WALLS)</span>
                  </div>

                  <div className="space-y-1 text-xs font-mono">
                    {rawDepth.map((depth, idx) => {
                      // Retrieve pre-calculated cumulative volumes corresponding to this depth tier
                      const currentBidCum = bidsCum[idx]?.cumulative || depth.bidQty;
                      const currentAskCum = asksCum[idx]?.cumulative || depth.askQty;

                      const bidCumPercent = Math.min(100, (currentBidCum / maxCumVolume) * 100);
                      const askCumPercent = Math.min(100, (currentAskCum / maxCumVolume) * 100);

                      return (
                        <div key={idx} className="grid grid-cols-2 gap-2 relative h-6 items-center">
                          {/* Bid column with left facing relative depth bar representing buying support */}
                          <div className="flex justify-between items-center relative pr-2 h-full border-r border-gray-800/40">
                            <div 
                              className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 transition-all duration-300" 
                              style={{ width: `${bidCumPercent}%` }}
                            />
                            <span className="text-gray-400 text-[10px] z-10">{depth.bidQty}</span>
                            <span className="text-emerald-400 font-bold z-10">{depth.bidPrice.toFixed(2)}</span>
                          </div>

                          {/* Ask column with right facing relative depth bar representing selling resistance */}
                          <div className="flex justify-between items-center relative pl-2 h-full">
                            <div 
                              className="absolute left-0 top-0 bottom-0 bg-rose-500/10 transition-all duration-300" 
                              style={{ width: `${askCumPercent}%` }}
                            />
                            <span className="text-rose-400 font-bold z-10">{depth.askPrice.toFixed(2)}</span>
                            <span className="text-gray-400 text-[10px] z-10">{depth.askQty}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              {/* Volume Weighted Average Price (VWAP) & Open Interest (OI) metrics */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950/20 p-3 rounded border border-gray-800/60 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase font-sans">Turnover Volume</span>
                  <span className="text-white font-bold block mt-1">{(stock.volume || 10000).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase font-sans">Open Interest (OI)</span>
                  <span className="text-white font-bold block mt-1">{(stock.openInterest || 250000).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase font-sans">VWAP Indicator</span>
                  <span className="text-yellow-400 font-bold block mt-1">{isUS ? '$' : '₹'}{stock.vwap?.toFixed(2) || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase font-sans">LTP Stamp</span>
                  <span className="text-gray-400 font-bold block mt-1 truncate">
                    {stock.lastUpdate ? new Date(stock.lastUpdate).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Live Trade Ticks */}
              <div className="space-y-1.5">
                <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Live Time & Sales (Tick Log)</h5>
                <div className="overflow-hidden rounded border border-gray-800 bg-black/30 text-[10px] font-mono">
                  <div className="grid grid-cols-4 border-b border-gray-800 p-1.5 text-gray-500 uppercase">
                    <span>Time</span>
                    <span className="text-right">Price</span>
                    <span className="text-right">Qty</span>
                    <span className="text-right">Type</span>
                  </div>
                  <div className="divide-y divide-gray-800/40 max-h-[140px] overflow-y-auto">
                    {tradeTicks.map((tk) => (
                      <div key={tk.id} className="grid grid-cols-4 p-1.5 hover:bg-gray-800/10">
                        <span className="text-gray-500">{tk.time}</span>
                        <span className="text-right text-gray-300">{tk.price.toFixed(2)}</span>
                        <span className="text-right text-gray-400">{tk.qty}</span>
                        <span className={`text-right font-bold ${tk.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {tk.type}
                        </span>
                      </div>
                    ))}
                    {tradeTicks.length === 0 && (
                      <div className="p-4 text-center text-gray-600">Waiting for live trades...</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

          {/* 2. MIS / CNC Daytrader Order Desk */}
          {activeSubTab === 'order' && (
            <div className="space-y-4">
              
              {/* Order form feedback message banner */}
              {orderSuccessMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 text-[11px] leading-relaxed flex items-start gap-1.5 font-sans">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{orderSuccessMsg}</span>
                </div>
              )}

              {/* BUY / SELL Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-0.5 rounded border border-gray-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setOrderType('BUY')}
                  className={`py-1.5 rounded transition-all cursor-pointer ${orderType === 'BUY' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-gray-400 hover:text-white'}`}
                >
                  BUY DIRECT
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('SELL')}
                  className={`py-1.5 rounded transition-all cursor-pointer ${orderType === 'SELL' ? 'bg-rose-500 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                  SELL SHORT
                </button>
              </div>

              {/* CNC / MIS Product Type Selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setProductType('MIS')}
                  className={`p-2 rounded border text-left cursor-pointer transition-all ${
                    productType === 'MIS' 
                      ? 'bg-teal-500/5 border-teal-500 text-teal-400' 
                      : 'bg-slate-950 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <span className="text-[11px] font-bold block uppercase">MIS (Intraday)</span>
                  <span className="text-[9px] text-gray-500 block">5x Leverage (Auto Square-off)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProductType('CNC')}
                  className={`p-2 rounded border text-left cursor-pointer transition-all ${
                    productType === 'CNC' 
                      ? 'bg-teal-500/5 border-teal-500 text-teal-400' 
                      : 'bg-slate-950 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <span className="text-[11px] font-bold block uppercase">CNC (Delivery)</span>
                  <span className="text-[9px] text-gray-500 block">1x Leverage (Full Capital)</span>
                </button>
              </div>

              {/* Input Form Fields */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-500 uppercase font-bold font-sans">Shares Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={orderQty}
                    onChange={(e) => setOrderQty(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-gray-800 hover:border-gray-700 rounded p-2 text-white focus:outline-none focus:border-teal-500 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-500 uppercase font-bold font-sans">Trigger Price</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.05"
                      value={orderPrice}
                      disabled={priceType === 'MARKET'}
                      onChange={(e) => setOrderPrice(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-gray-800 hover:border-gray-700 disabled:opacity-40 disabled:hover:border-gray-800 rounded p-2 text-white focus:outline-none focus:border-teal-500 font-bold"
                    />
                    <span className="absolute right-2 top-2 text-[9px] text-gray-500 font-bold">
                      {isUS ? 'USD' : 'INR'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Mode MARKET/LIMIT Selector */}
              <div className="flex gap-4 text-xs font-bold pt-1">
                <label className="flex items-center gap-1.5 text-gray-400 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={priceType === 'LIMIT'} 
                    onChange={() => setPriceType('LIMIT')} 
                    className="accent-teal-500" 
                  />
                  LIMIT ORDER
                </label>
                <label className="flex items-center gap-1.5 text-gray-400 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={priceType === 'MARKET'} 
                    onChange={() => {
                      setPriceType('MARKET');
                      setOrderPrice(stock.price);
                    }} 
                    className="accent-teal-500" 
                  />
                  MARKET ORDER (LTP)
                </label>
              </div>

              {/* Margin & Leverage Estimator summary */}
              <div className="p-3 bg-gray-950/50 rounded border border-gray-800/80 space-y-2 text-[11px] font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-500">Gross Contract Turnover:</span>
                  <span className="text-white font-bold">{isUS ? '$' : '₹'}{charges.turnover.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Required Margin ({leverageFactor}x):</span>
                  <span className="text-teal-400 font-bold">{isUS ? '$' : '₹'}{marginRequired.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Virtual Funds Available:</span>
                  <span className="text-white">{isUS ? '$' : '₹'}{virtualCash.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-850">
                  <span className="text-gray-500">Fund Adequacy:</span>
                  <span className={`font-bold ${hasSufficientMargin ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {hasSufficientMargin ? 'SUFFICIENT FUNDS' : 'LIMITS EXCEEDED'}
                  </span>
                </div>
              </div>

              {/* Indian Regulatory Brokerage & Tax Calculator */}
              <div className="p-3.5 bg-gray-950/20 rounded border border-gray-800/60 space-y-2 text-[10px] font-mono">
                <div className="flex items-center gap-1.5 text-gray-400 font-bold uppercase tracking-wider mb-1 font-sans">
                  <Calculator className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  Indian Regulatory Tax Breakdown
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-gray-500">
                  <div className="flex justify-between">
                    <span>Brokerage Fee:</span>
                    <span className="text-gray-300">₹{charges.brokerage.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Securities STT:</span>
                    <span className="text-gray-300">₹{charges.stt.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Exchange Trans:</span>
                    <span className="text-gray-300">₹{charges.exchangeCharge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18% of fee):</span>
                    <span className="text-gray-300">₹{charges.gst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SEBI Turnover:</span>
                    <span className="text-gray-300">₹{charges.sebiFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stamp Duty:</span>
                    <span className="text-gray-300">₹{charges.stampDuty.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-850 pt-2 flex justify-between font-bold text-teal-400">
                  <span>Total Tax & Charges:</span>
                  <span>₹{charges.totalTaxes.toFixed(2)}</span>
                </div>

                <div className="bg-teal-500/5 p-1.5 rounded text-[9px] text-teal-400/90 leading-normal font-sans border border-teal-500/10">
                  <Info className="w-3 h-3 text-teal-400 shrink-0 inline mr-1" />
                  <strong>Breakeven Spread</strong>: Price needs to change by <strong>₹{charges.breakevenPoints.toFixed(2)}</strong> per share (or <strong>{((charges.breakevenPoints / orderPrice) * 100).toFixed(3)}%</strong>) to cover all transaction overheads.
                </div>
              </div>

              {/* Execution Action Button */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                className={`w-full py-2.5 rounded font-bold uppercase text-xs tracking-wider transition-all shadow-sm cursor-pointer ${
                  orderType === 'BUY' 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950' 
                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                }`}
              >
                EXECUTE VIRTUAL {orderType} ({orderQty} SHS)
              </button>

            </div>
          )}

          {/* 3. Interactive Options Chain (NSE Format) */}
          {activeSubTab === 'options' && (
            <div className="space-y-4">
              
              <div className="flex items-center justify-between text-[10px] font-mono text-teal-400">
                <span className="font-bold flex items-center gap-1 uppercase">
                  <Activity className="w-3.5 h-3.5" /> Derivative Contracts
                </span>
                <span>Active Expiry: {new Date().toLocaleString('en', { month: 'short' })} 2026</span>
              </div>

              {/* Options chain table container */}
              <div className="overflow-x-auto rounded border border-gray-800 bg-gray-950/40 text-[9px] font-mono">
                <table className="w-full text-center">
                  <thead>
                    <tr className="border-b border-gray-850 text-gray-500 uppercase">
                      <th className="py-2 bg-slate-950">CALL OI</th>
                      <th className="py-2 bg-slate-950">C-LTP</th>
                      <th className="py-2 bg-gray-900 text-white">STRIKE</th>
                      <th className="py-2 bg-slate-950">P-LTP</th>
                      <th className="py-2 bg-slate-950">PUT OI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-850/60">
                    {strikePrices.map((strike) => {
                      const row = getOptionRow(strike);
                      return (
                        <tr key={strike} className="hover:bg-gray-800/10">
                          {/* Call Volume and LTP */}
                          <td className={`py-2 text-gray-500 ${row.call.isITM ? 'bg-amber-500/5' : ''}`}>
                            {row.call.oi.toLocaleString()}
                          </td>
                          <td className={`py-2 text-emerald-400 font-bold ${row.call.isITM ? 'bg-amber-500/10' : ''}`}>
                            <button
                              onClick={() => {
                                setOrderPrice(row.call.ltp);
                                setOrderType('BUY');
                                setActiveSubTab('order');
                              }}
                              className="px-1 py-0.5 hover:bg-emerald-500/20 rounded text-emerald-400 transition-all font-bold cursor-pointer"
                              title={`Buy Call option @ strike ${strike}`}
                            >
                              ₹{row.call.ltp.toFixed(1)}
                            </button>
                          </td>

                          {/* Strike Price column */}
                          <td className="py-2 bg-gray-950/40 font-bold text-gray-300 border-x border-gray-850">
                            {strike}
                          </td>

                          {/* Put LTP and Volume */}
                          <td className={`py-2 text-rose-400 font-bold ${row.put.isITM ? 'bg-amber-500/10' : ''}`}>
                            <button
                              onClick={() => {
                                setOrderPrice(row.put.ltp);
                                setOrderType('BUY'); // Buying a put
                                setActiveSubTab('order');
                              }}
                              className="px-1 py-0.5 hover:bg-rose-500/20 rounded text-rose-400 transition-all font-bold cursor-pointer"
                              title={`Buy Put option @ strike ${strike}`}
                            >
                              ₹{row.put.ltp.toFixed(1)}
                            </button>
                          </td>
                          <td className={`py-2 text-gray-500 ${row.put.isITM ? 'bg-amber-500/5' : ''}`}>
                            {row.put.oi.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-gray-950/30 rounded border border-gray-800/80 text-[10px] text-gray-400 font-sans leading-relaxed">
                <span className="w-2 h-2 inline-block rounded bg-amber-500/10 border border-amber-500/20 mr-1" />
                Shaded rows represent <strong>In-The-Money (ITM)</strong> contracts. Click any LTP button to instantly load and lock that derivative option inside the Order Desk!
              </div>

            </div>
          )}

          {/* 4. Futures contracts list */}
          {activeSubTab === 'futures' && (
            <div className="space-y-4">
              
              <div className="flex items-center justify-between text-[10px] font-mono text-teal-400 uppercase">
                <span className="font-bold flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" /> Futures Contracts
                </span>
                <span>Asset: {symbol} Derivatives</span>
              </div>

              <div className="space-y-2.5">
                {[
                  { label: 'Current Month Expiry', basis: 5.50, name: 'Near Month', oi: 1850000, vol: 850000 },
                  { label: 'Next Month Expiry', basis: 14.20, name: 'Mid Month', oi: 450000, vol: 120000 },
                  { label: 'Far Month Expiry', basis: 22.80, name: 'Far Month', oi: 150000, vol: 35000 },
                ].map((fut, idx) => {
                  const futPrice = stock.price + fut.basis;
                  
                  return (
                    <div 
                      key={idx}
                      className="p-3 rounded-lg bg-gray-950/30 border border-gray-850 hover:border-gray-700 transition-all font-mono text-xs flex justify-between items-center"
                    >
                      <div className="space-y-1">
                        <span className="text-white font-bold block">{symbol} 2026 {fut.name} FUT</span>
                        <span className="text-[10px] text-gray-500 block">{fut.label}</span>
                        <span className="text-[9px] text-gray-600 block">OI: {fut.oi.toLocaleString()} | Vol: {fut.vol.toLocaleString()}</span>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <span className="text-teal-400 font-bold block text-sm">
                          ₹{futPrice.toFixed(2)}
                        </span>
                        <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold">
                          Basis: +{fut.basis.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-[10px] text-gray-500 font-sans leading-normal">
                Futures basis represents the mathematical premium or discount relative to the spot underlying price. Spreads lock automatically as contracts approach final settlement.
              </p>

            </div>
          )}

        </div>

        {/* Security verification tag */}
        <div className="p-3 border-t border-gray-800/60 bg-slate-950/40 text-[9px] font-mono text-gray-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
            VIRTUAL BRIDGE SECURED
          </span>
          <span>SaaS Platform v1.2</span>
        </div>

      </div>

    </div>
  );
}
