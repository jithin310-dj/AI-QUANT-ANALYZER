import { WebSocket } from "ws";
import { decodeYahooMessage } from "./yahooDecoder.js";
import { stocksDatabase, symbolMap, brokerConfigs, activeProviderId } from "./stocksData.js";

// Create reverse map for O(1) database symbol lookups from Yahoo ticker ID
const reverseSymbolMap: { [key: string]: string } = {};
Object.entries(symbolMap).forEach(([key, val]) => {
  reverseSymbolMap[val as string] = key as string;
});

let yahooWs: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
let pingInterval: NodeJS.Timeout | null = null;
let isConnected = false;
let onTickCallback: (() => void) | null = null;

export function startYahooWsClient(onTick: () => void) {
  onTickCallback = onTick;
  connectToYahoo();
}

function connectToYahoo() {
  if (yahooWs) {
    try {
      yahooWs.terminate();
    } catch (e) {}
  }

  console.log("[Yahoo WS Live] Initializing official connection to wss://streamer.finance.yahoo.com...");
  yahooWs = new WebSocket("wss://streamer.finance.yahoo.com");

  yahooWs.on("open", () => {
    isConnected = true;
    console.log("[Yahoo WS Live] Connection established successfully.");
    
    // Subscribe to all mapped instrument symbols
    const symbolsToSubscribe = Object.values(symbolMap);
    console.log(`[Yahoo WS Live] Subscribing to ${symbolsToSubscribe.length} instrument feeds...`);
    
    try {
      yahooWs?.send(JSON.stringify({
        subscribe: symbolsToSubscribe
      }));
    } catch (err) {
      console.error("[Yahoo WS Live] Subscription send failed:", err);
    }

    // Keepalive heartbeat ping every 30 seconds
    if (pingInterval) clearInterval(pingInterval);
    pingInterval = setInterval(() => {
      if (yahooWs && yahooWs.readyState === WebSocket.OPEN) {
        try {
          yahooWs.ping();
        } catch (e) {}
      }
    }, 30000);
  });

  yahooWs.on("message", (data: any) => {
    try {
      const base64Str = data.toString();
      const decoded = decodeYahooMessage(base64Str);
      if (!decoded || !decoded.id) return;

      const symbolKey = reverseSymbolMap[decoded.id];
      if (!symbolKey) return;

      const stock = stocksDatabase[symbolKey];
      if (stock) {
        // Update price metrics with high-fidelity WebSocket ticks
        if (typeof decoded.price === "number") {
          stock.price = parseFloat(decoded.price.toFixed(2));
        }
        if (typeof decoded.change === "number") {
          stock.change = parseFloat(decoded.change.toFixed(2));
        }
        if (typeof decoded.changePercent === "number") {
          stock.changePercent = parseFloat(decoded.changePercent.toFixed(2));
        }
        if (typeof decoded.dayVolume === "number") {
          stock.volume = decoded.dayVolume;
        }
        if (typeof decoded.dayHigh === "number") {
          stock.high52Week = Math.max(stock.high52Week, decoded.dayHigh);
        }
        if (typeof decoded.dayLow === "number") {
          stock.low52Week = Math.min(stock.low52Week, decoded.dayLow);
        }
        
        // Live bid/ask values
        if (typeof decoded.bid === "number") stock.bidPrice = parseFloat(decoded.bid.toFixed(2));
        if (typeof decoded.ask === "number") stock.askPrice = parseFloat(decoded.ask.toFixed(2));
        if (typeof decoded.bidSize === "number") stock.bidQty = decoded.bidSize;
        if (typeof decoded.askSize === "number") stock.askQty = decoded.askSize;

        const activeBroker = brokerConfigs[activeProviderId];
        stock.dataSource = activeBroker ? `${activeBroker.name} via Live Streamer` : "Yahoo Live Streamer";
        stock.lastUpdate = new Date().toISOString();

        // Regenerate dynamic market depth book based on the live ticket LTP and spread
        const spread = stock.price * 0.0002;
        const bidPrice = stock.bidPrice || parseFloat((stock.price - spread / 2).toFixed(2));
        const askPrice = stock.askPrice || parseFloat((stock.price + spread / 2).toFixed(2));
        const bidQty = stock.bidQty || 1200;
        const askQty = stock.askQty || 1150;

        const bids: any[] = [];
        const asks: any[] = [];
        for (let j = 1; j <= 5; j++) {
          bids.push({
            bidPrice: parseFloat((bidPrice - (j - 1) * (stock.price * 0.0001)).toFixed(2)),
            bidQty: Math.round(bidQty / j)
          });
          asks.push({
            askPrice: parseFloat((askPrice + (j - 1) * (stock.price * 0.0001)).toFixed(2)),
            askQty: Math.round(askQty / j)
          });
        }

        stock.marketDepth = bids.map((b, i) => ({
          bidPrice: b.bidPrice,
          bidQty: b.bidQty,
          askPrice: asks[i].askPrice,
          askQty: asks[i].askQty
        }));

        // Notify parent server to broadcast tick to clients immediately
        if (onTickCallback) {
          onTickCallback();
        }
      }
    } catch (err) {
      console.error("[Yahoo WS Live] Message parse error:", err);
    }
  });

  yahooWs.on("close", () => {
    isConnected = false;
    console.warn("[Yahoo WS Live] Connection closed. Automatically reconnecting in 5 seconds...");
    if (pingInterval) clearInterval(pingInterval);
    triggerReconnect();
  });

  yahooWs.on("error", (err) => {
    isConnected = false;
    console.error("[Yahoo WS Live] Connection error encountered:", err);
    triggerReconnect();
  });
}

function triggerReconnect() {
  if (reconnectTimeout) clearTimeout(reconnectTimeout);
  reconnectTimeout = setTimeout(() => {
    connectToYahoo();
  }, 5000);
}
