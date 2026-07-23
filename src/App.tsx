import { useState, useEffect } from 'react';
import { 
  StockDetails, 
  MarketStatus, 
  PriceBar, 
  AIPrediction, 
  NewsArticle, 
  SocialSentiment, 
  PortfolioPosition, 
  ChatMessage, 
  PriceAlert 
} from './types.js';

import Sidebar from './components/Sidebar.js';
import HeaderTicker from './components/HeaderTicker.js';
import Watchlist from './components/Watchlist.js';
import TradingChart from './components/TradingChart.js';
import AIPredictionPanel from './components/AIPredictionPanel.js';
import SentimentPanel from './components/SentimentPanel.js';
import ScreenerPanel from './components/ScreenerPanel.js';
import PortfolioPanel from './components/PortfolioPanel.js';
import AssistantPanel from './components/AssistantPanel.js';
import AlertsPanel from './components/AlertsPanel.js';
import AdminPanel from './components/AdminPanel.js';
import DashboardOverview from './components/DashboardOverview.js';
import IndicesPanel from './components/IndicesPanel.js';
import MarketDataVerification from './components/MarketDataVerification.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('AAPL');

  // Theme State (Dark Mode default vs Daylight High-Contrast Light Mode)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('quant_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
    localStorage.setItem('quant_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Core market states
  const [stocks, setStocks] = useState<StockDetails[]>([]);
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null);
  const [wsStatus, setWsStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');

  // Synchronize wsStatus globally so all modular components can validate real-time availability
  useEffect(() => {
    (window as any).wsStatus = wsStatus;
  }, [wsStatus]);

  // Active symbol analytics states
  const [bars, setBars] = useState<PriceBar[]>([]);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [support, setSupport] = useState<number>(0);
  const [resistance, setResistance] = useState<number>(0);

  // AI & Sentiment states
  const [prediction, setPrediction] = useState<AIPrediction | null>(null);
  const [newsData, setNewsData] = useState<{ articles: NewsArticle[]; averageScore: number } | null>(null);
  const [socialData, setSocialData] = useState<SocialSentiment[] | null>(null);

  // Simulation loaders
  const [isRetraining, setIsRetraining] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // User persistent state models
  const [portfolio, setPortfolio] = useState<PortfolioPosition[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am your AI Quantitative Advisor. I am currently monitoring global and Indian markets, compiling multi-model forecast predictions, and scanning financial charts for candlestick patterns. How can I assist your portfolio strategies today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);

  // 1. Initial Load and Live WebSocket Feed Setup
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;
    let reconnectDelay = 1000;
    let pingInterval: any = null;
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 3;

    const fetchInitialData = async () => {
      try {
        const res = await fetch('/api/stocks');
        if (res.ok) {
          const data = await res.json();
          setStocks(data);
        }
        const statRes = await fetch('/api/market-status');
        if (statRes.ok) {
          const data = await statRes.json();
          setMarketStatus(data);
        }
      } catch (err) {
        console.error('Failed to load initial global feeds:', err);
      }
    };

    const connectWebSocket = () => {
      setWsStatus('connecting');
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/api/live`;
      
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('[WS Client] Connected successfully');
          setWsStatus('connected');
          reconnectDelay = 1000; // Reset backoff on success
          reconnectAttempts = 0; // Reset attempts

          // Keepalive heartbeat ping every 15s
          pingInterval = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'ping' }));
            }
          }, 15000);
        };

        ws.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.type === 'tick' || parsed.type === 'all-stocks') {
              setStocks(parsed.data);
            }
          } catch (err) {
            console.error('[WS Client] Message parse error:', err);
          }
        };

        ws.onclose = (event) => {
          console.log(`[WS Client] Connection closed (Code: ${event.code || 'None'}). Falling back to safe HTTP sync.`);
          setWsStatus('disconnected');
          if (pingInterval) clearInterval(pingInterval);

          if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            // Auto-reconnect with exponential backoff
            reconnectTimeout = setTimeout(() => {
              console.log(`[WS Client] Attempting reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
              reconnectDelay = Math.min(reconnectDelay * 2, 12000);
              connectWebSocket();
            }, reconnectDelay);
          } else {
            console.log('[WS Client] Maximum reconnect attempts reached. Switching permanently to seamless HTTP Polling Fallback.');
          }
        };

        ws.onerror = (err) => {
          // Log gently to prevent loud error messages in restricted iframe sandboxes
          console.log('[WS Client] WebSocket connection could not be established. Falling back gracefully...');
          if (ws) {
            try {
              ws.close();
            } catch (e) {
              // Ignore already-closed error
            }
          }
        };
      } catch (err) {
        console.log('[WS Client] WebSocket initialization failed. Falling back gracefully...');
        setWsStatus('disconnected');
      }
    };

    fetchInitialData();
    connectWebSocket();

    // Regular interval to fetch market status
    const statusInterval = setInterval(async () => {
      try {
        const statRes = await fetch('/api/market-status');
        if (statRes.ok) {
          const data = await statRes.json();
          setMarketStatus(data);
        }
      } catch (err) {
        // quiet fail
      }
    }, 15000);

    return () => {
      if (ws) {
        ws.onclose = null; // Prevent reconnect loop on unmount
        ws.close();
      }
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (pingInterval) clearInterval(pingInterval);
      clearInterval(statusInterval);
    };
  }, []);

  // 1b. Fallback HTTP Polling for stock updates when WebSocket is offline
  useEffect(() => {
    let pollingInterval: any = null;

    if (wsStatus !== 'connected') {
      console.log('[Sync Engine] WebSocket offline. Engaging high-fidelity HTTP polling fallback...');
      
      const pollStocks = async () => {
        try {
          const res = await fetch('/api/stocks');
          if (res.ok) {
            const data = await res.json();
            setStocks(data);
          }
        } catch (err) {
          console.error('[Sync Engine] HTTP polling fallback error:', err);
        }
      };

      // Poll every 4 seconds to match the server's update interval
      pollingInterval = setInterval(pollStocks, 4000);
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [wsStatus]);

  // Sync state and select dynamically added NSE/BSE stocks
  useEffect(() => {
    const handleNewStock = async (e: Event) => {
      const sym = (e as CustomEvent).detail;
      try {
        const res = await fetch('/api/stocks');
        if (res.ok) {
          const data = await res.json();
          setStocks(data);
          setSelectedSymbol(sym);
        }
      } catch (err) {
        console.error('Failed to sync stock universe after dynamic add:', err);
      }
    };
    window.addEventListener('new-stock-added', handleNewStock);
    return () => window.removeEventListener('new-stock-added', handleNewStock);
  }, []);

  // 2. Fetch specific Ticker Analytics on active selection shift
  useEffect(() => {
    const fetchSymbolData = async () => {
      try {
        // Reset sub-states to trigger spinners
        setPrediction(null);
        setNewsData(null);
        setSocialData(null);

        // Fetch historical candles & indicator frames
        const histRes = await fetch(`/api/historical/${selectedSymbol}`);
        if (histRes.ok) {
          const data = await histRes.json();
          setBars(data.bars);
          setPatterns(data.patterns);
          setSupport(data.support);
          setResistance(data.resistance);
        }

        // Fetch AI Forecast models
        const predRes = await fetch(`/api/predict/${selectedSymbol}`);
        if (predRes.ok) {
          const data = await predRes.json();
          setPrediction(data);
        }

        // Fetch News NLP indices
        const newsRes = await fetch(`/api/news/${selectedSymbol}`);
        if (newsRes.ok) {
          const data = await newsRes.json();
          setNewsData(data);
        }

        // Fetch Social Media Buzz index
        const socRes = await fetch(`/api/social/${selectedSymbol}`);
        if (socRes.ok) {
          const data = await socRes.json();
          setSocialData(data);
        }
      } catch (err) {
        console.error(`Failed to load data for symbol ${selectedSymbol}:`, err);
      }
    };

    fetchSymbolData();
  }, [selectedSymbol]);

  // 3. Monitor Alerts trigger check whenever stock prices shift
  useEffect(() => {
    if (stocks.length === 0 || alerts.length === 0) return;

    setAlerts(prevAlerts => 
      prevAlerts.map(alert => {
        if (alert.isTriggered || !alert.isActive) return alert;

        const liveStock = stocks.find(s => s.symbol === alert.symbol);
        if (!liveStock) return alert;

        let triggered = false;
        if (alert.type === 'price') {
          if (alert.condition === 'above' && liveStock.price >= alert.value) triggered = true;
          if (alert.condition === 'below' && liveStock.price <= alert.value) triggered = true;
        }

        if (triggered) {
          // Play standard HTML5 audio beep if available or just trigger in-app flag
          console.warn(`[ALERT TRIGGERED] ${alert.symbol} action crosses ${alert.condition} threshold: ${alert.value}`);
          return { ...alert, isTriggered: true, isActive: false };
        }

        return alert;
      })
    );
  }, [stocks]);

  // Retrain Forecasting models simulator
  const handleRetrain = async () => {
    setIsRetraining(true);
    try {
      const res = await fetch(`/api/predict/${selectedSymbol}?retrain=true`);
      if (res.ok) {
        const data = await res.json();
        setPrediction(data);
      }
    } catch (err) {
      console.error('Failed to trigger training model rebuild:', err);
    } finally {
      setIsRetraining(false);
    }
  };

  // Add simulator portfolio Transaction
  const handleAddTransaction = (symbol: string, shares: number, price: number, type: 'BUY' | 'SELL') => {
    const liveStock = stocks.find(s => s.symbol === symbol);
    const currentPrice = liveStock ? liveStock.price : price;

    setPortfolio(prev => {
      const existing = prev.find(p => p.symbol === symbol);
      if (existing) {
        let updatedShares = existing.shares;
        let updatedTotalCost = existing.totalCost;

        if (type === 'BUY') {
          updatedShares += shares;
          updatedTotalCost += shares * price;
        } else {
          updatedShares = Math.max(0, updatedShares - shares);
          updatedTotalCost = Math.max(0, updatedTotalCost - (shares * existing.avgPrice));
        }

        const updatedAvg = updatedShares > 0 ? updatedTotalCost / updatedShares : 0;
        const marketVal = updatedShares * currentPrice;
        const profitVal = marketVal - updatedTotalCost;
        const profitPct = updatedTotalCost > 0 ? (profitVal / updatedTotalCost) * 100 : 0;

        if (updatedShares === 0) {
          return prev.filter(p => p.symbol !== symbol);
        }

        return prev.map(p => p.symbol === symbol ? {
          ...p,
          shares: updatedShares,
          avgPrice: updatedAvg,
          currentPrice,
          totalCost: updatedTotalCost,
          marketValue: marketVal,
          profit: profitVal,
          profitPercent: profitPct
        } : p);

      } else {
        if (type === 'SELL') return prev; // Cannot sell non-existent position

        const cost = shares * price;
        const val = shares * currentPrice;
        const profitVal = val - cost;
        const profitPct = cost > 0 ? (profitVal / cost) * 100 : 0;

        return [...prev, {
          symbol,
          shares,
          avgPrice: price,
          currentPrice,
          totalCost: cost,
          marketValue: val,
          profit: profitVal,
          profitPercent: profitPct
        }];
      }
    });
  };

  const handleUpdateTargetPercent = (symbol: string, targetPercent: number) => {
    setPortfolio(prev => prev.map(p => p.symbol === symbol ? { ...p, targetPercent } : p));
  };

  // Chat message submit
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          symbol: selectedSymbol,
          portfolio: portfolio
        })
      });

      if (res.ok) {
        const data = await res.json();
        const systemMsg: ChatMessage = {
          id: Math.random().toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, systemMsg]);
      } else {
        throw new Error('Server returned non-ok status');
      }
    } catch (err) {
      console.error('Chat routing failure:', err);
      const errMsg: ChatMessage = {
        id: Math.random().toString(),
        role: 'assistant',
        content: "I experienced a temporary communication hiccup with the predictive database. Let me try re-analyzing the indicators again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Alert Actions
  const handleCreateAlert = (alertData: Omit<PriceAlert, 'id' | 'createdAt' | 'isTriggered'>) => {
    const newAlert: PriceAlert = {
      ...alertData,
      id: Math.random().toString(),
      createdAt: new Date().toLocaleString(),
      isTriggered: false
    };
    setAlerts(prev => [...prev, newAlert]);
  };

  const handleToggleAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const activeStock = stocks.find(s => s.symbol === selectedSymbol) || stocks[0];

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 flex flex-col font-sans select-none antialiased">
      {/* Ticker & Status Bar */}
      <HeaderTicker 
        stocks={stocks} 
        marketStatus={marketStatus} 
        wsStatus={wsStatus} 
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Container Layout Grid */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Navigation Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Dynamic Panel Context Workspace */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* Context active symbol Watchlist (Visible on relevant charts/predictions tabs) */}
            {['dashboard', 'charts', 'predictions', 'sentiment', 'screener', 'portfolio', 'alerts'].includes(activeTab) && (
              <Watchlist 
                stocks={stocks} 
                selectedSymbol={selectedSymbol} 
                onSelectSymbol={setSelectedSymbol} 
              />
            )}

            {/* Render Workspace Views */}
            <div className="flex-1 w-full min-w-0">
              
              {activeTab === 'indices' && (
                <IndicesPanel 
                  onSelectStock={(symbol) => setSelectedSymbol(symbol)}
                  setActiveTab={setActiveTab}
                />
              )}
              
              {activeTab === 'dashboard' && (
                <DashboardOverview 
                  stocks={stocks} 
                  onSelectSymbol={setSelectedSymbol} 
                  selectedSymbol={selectedSymbol} 
                />
              )}

              {activeTab === 'charts' && activeStock && (
                <TradingChart 
                  symbol={selectedSymbol}
                  stock={activeStock}
                  bars={bars}
                  patterns={patterns}
                  support={support}
                  resistance={resistance}
                  onAddTransaction={handleAddTransaction}
                  prediction={prediction}
                />
              )}

              {activeTab === 'predictions' && activeStock && (
                <AIPredictionPanel 
                  symbol={selectedSymbol}
                  stock={activeStock}
                  prediction={prediction}
                  onRetrain={handleRetrain}
                  isRetraining={isRetraining}
                />
              )}

              {activeTab === 'sentiment' && (
                <SentimentPanel 
                  symbol={selectedSymbol}
                  newsData={newsData}
                  socialData={socialData}
                />
              )}

              {activeTab === 'screener' && (
                <ScreenerPanel 
                  stocks={stocks} 
                  onSelectSymbol={setSelectedSymbol} 
                  selectedSymbol={selectedSymbol} 
                />
              )}

              {activeTab === 'portfolio' && activeStock && (
                <PortfolioPanel 
                  symbol={selectedSymbol}
                  stock={activeStock}
                  positions={portfolio}
                  onAddTransaction={handleAddTransaction}
                  onUpdateTargetPercent={handleUpdateTargetPercent}
                  stocks={stocks}
                />
              )}

              {activeTab === 'chat' && (
                <AssistantPanel 
                  messages={chatMessages}
                  onSendMessage={handleSendMessage}
                  isLoading={isChatLoading}
                  portfolio={portfolio}
                />
              )}

              {activeTab === 'alerts' && activeStock && (
                <AlertsPanel 
                  symbol={selectedSymbol}
                  stock={activeStock}
                  alerts={alerts}
                  onCreateAlert={handleCreateAlert}
                  onToggleAlert={handleToggleAlert}
                  onDeleteAlert={handleDeleteAlert}
                />
              )}

              {activeTab === 'admin' && (
                <AdminPanel />
              )}

            </div>

          </div>

        </main>
      </div>

      {/* Floating Market Data Live Status & Provider Verification Widget */}
      <MarketDataVerification 
        wsStatus={wsStatus} 
        selectedSymbol={selectedSymbol} 
        activeStock={activeStock} 
        stocks={stocks} 
      />
    </div>
  );
}
