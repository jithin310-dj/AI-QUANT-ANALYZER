import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, User, Bot, Loader2, Calculator, Scale } from 'lucide-react';
import { ChatMessage, PortfolioPosition } from '../types.js';

interface AssistantPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  portfolio: PortfolioPosition[];
}

export default function AssistantPanel({ messages, onSendMessage, isLoading, portfolio }: AssistantPanelProps) {
  const [inputText, setInputText] = useState('');
  const logRef = useRef<HTMLDivElement>(null);

  // Risk-Reward Calculator States
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [entryPrice, setEntryPrice] = useState<number>(100);
  const [targetPrice, setTargetPrice] = useState<number>(120);
  const [stopLoss, setStopLoss] = useState<number>(90);
  const [capital, setCapital] = useState<number>(10000);
  const [riskPct, setRiskPct] = useState<number>(2);

  // Calculations
  const rawRisk = direction === 'long' ? entryPrice - stopLoss : stopLoss - entryPrice;
  const rawReward = direction === 'long' ? targetPrice - entryPrice : entryPrice - targetPrice;
  
  const riskPerShare = Math.max(0, rawRisk);
  const rewardPerShare = Math.max(0, rawReward);
  
  const rrRatio = riskPerShare > 0 ? rewardPerShare / riskPerShare : 0;
  const maxRiskAmount = capital * (riskPct / 100);
  const suggestedShares = riskPerShare > 0 ? Math.floor(maxRiskAmount / riskPerShare) : 0;
  const totalTradeValue = suggestedShares * entryPrice;

  // Auto-scroll on new messages
  useEffect(() => {
    logRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const samplePrompts = [
    { label: "Analyze Apple", query: "Can you analyze Apple technically?" },
    { label: "Should I buy Reliance?", query: "Should I buy Reliance stock right now?" },
    { label: "Explain RSI indicator", query: "Explain what RSI means and how to trade it." },
    { label: "Show bullish stocks today", query: "Which stocks show a bullish pattern setup today?" }
  ];

  return (
    <div className="flex-1 bg-slate-900 border border-gray-800/80 rounded-lg overflow-hidden flex flex-col glass-panel select-none h-[600px]">
      
      {/* Chat header */}
      <div className="p-4 border-b border-gray-800/60 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Quantitative Quant Advisor</h3>
            <p className="text-[10px] text-gray-400 font-mono mt-0.5">Gemini 3.5 Active • Full session market context aware</p>
          </div>
        </div>

        {/* Toggle Calculator */}
        <button
          id="toggle-rr-calculator"
          type="button"
          onClick={() => setIsCalcOpen(!isCalcOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-mono font-bold border transition-all select-none ${
            isCalcOpen
              ? 'bg-teal-500/20 text-teal-400 border-teal-500/40'
              : 'bg-gray-900 hover:bg-gray-850 text-gray-400 border-gray-850 hover:text-white hover:border-gray-700'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          {isCalcOpen ? 'CLOSE CALCULATOR' : 'RISK/REWARD CALC'}
        </button>
      </div>

      {/* Risk-Reward Calculator Panel */}
      {isCalcOpen && (
        <div id="rr-calculator-panel" className="bg-slate-950/90 border-b border-gray-800/80 p-4 space-y-4 font-sans text-xs shrink-0 max-h-[300px] overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-teal-400" />
              <span className="font-bold text-white uppercase tracking-wider text-[11px]">Dynamic Position Sizing & Risk-Reward</span>
            </div>
            {/* Long / Short Toggle */}
            <div className="flex bg-gray-900 rounded p-0.5 border border-gray-850">
              <button
                type="button"
                onClick={() => setDirection('long')}
                className={`px-2.5 py-1 rounded text-[9px] font-bold font-mono tracking-wider transition-all ${
                  direction === 'long'
                    ? 'bg-teal-500/20 text-teal-400 font-bold border border-teal-500/30'
                    : 'text-gray-400 hover:text-white border border-transparent'
                }`}
              >
                LONG
              </button>
              <button
                type="button"
                onClick={() => setDirection('short')}
                className={`px-2.5 py-1 rounded text-[9px] font-bold font-mono tracking-wider transition-all ${
                  direction === 'short'
                    ? 'bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30'
                    : 'text-gray-400 hover:text-white border border-transparent'
                }`}
              >
                SHORT
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Entry Price */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Entry Price ($)</label>
              <input
                type="number"
                value={entryPrice}
                onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-900 border border-gray-850 rounded px-2.5 py-1.5 text-xs text-teal-400 font-bold font-mono focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Target Price */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Target Price ($)</label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-900 border border-gray-850 rounded px-2.5 py-1.5 text-xs text-emerald-400 font-bold font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Stop Loss Price */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Stop Loss ($)</label>
              <input
                type="number"
                value={stopLoss}
                onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-900 border border-gray-850 rounded px-2.5 py-1.5 text-xs text-rose-400 font-bold font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Capital Size */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Total Capital ($)</label>
              <input
                type="number"
                value={capital}
                onChange={(e) => setCapital(parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-900 border border-gray-850 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Risk Tolerance */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Risk Tolerance (%)</label>
              <input
                type="number"
                step="0.1"
                value={riskPct}
                onChange={(e) => setRiskPct(parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-900 border border-gray-850 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Quick Calculate / Action Button */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  const text = `Please analyze this trade setup:\n- Direction: ${direction.toUpperCase()}\n- Entry Price: $${entryPrice}\n- Target Price: $${targetPrice}\n- Stop Loss: $${stopLoss}\n- Total Capital: $${capital}\n- Risk Tolerance: ${riskPct}% (Max Risk: $${maxRiskAmount.toFixed(2)})\n- Calculated Risk/Reward Ratio: ${rrRatio.toFixed(2)}:1\n- Recommended Position Size: ${suggestedShares} shares\n\nPlease give your tactical risk rating and standard strategy recommendations.`;
                  onSendMessage(text);
                }}
                className="w-full h-8 rounded bg-teal-500/10 border border-teal-500/30 hover:bg-teal-500/20 text-teal-400 text-[10px] font-bold font-mono tracking-wider transition-all flex items-center justify-center gap-1 hover:border-teal-500 select-none"
              >
                <Sparkles className="w-3 h-3 animate-pulse" />
                AI ANALYSIS
              </button>
            </div>
          </div>

          {/* Metrics Display Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-800/40">
            <div className="bg-gray-900/50 p-2 rounded border border-gray-850">
              <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider block font-sans">Risk per share</span>
              <span className="text-xs font-mono font-bold text-rose-400">${riskPerShare.toFixed(2)}</span>
            </div>
            <div className="bg-gray-900/50 p-2 rounded border border-gray-850">
              <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider block font-sans">Reward per share</span>
              <span className="text-xs font-mono font-bold text-emerald-400">${rewardPerShare.toFixed(2)}</span>
            </div>
            <div className="bg-gray-900/50 p-2 rounded border border-gray-850">
              <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider block font-sans">Risk/Reward</span>
              <span className={`text-xs font-mono font-bold ${rrRatio >= 2 ? 'text-emerald-400' : rrRatio >= 1 ? 'text-yellow-400' : 'text-rose-400'}`}>
                {rrRatio.toFixed(2)}:1
              </span>
            </div>
            <div className="bg-gray-900/50 p-2 rounded border border-gray-850">
              <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider block font-sans">Sizing (Shares)</span>
              <span className="text-xs font-mono font-bold text-white">{suggestedShares} shares</span>
            </div>
          </div>

          {/* Dynamic Warnings and Ledger */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400">
              <span>Max Risk Amount: <strong className="text-rose-400">${maxRiskAmount.toFixed(2)}</strong></span>
              <span>•</span>
              <span>Total Trade Value: <strong className="text-teal-400">${totalTradeValue.toFixed(2)}</strong></span>
            </div>
            {totalTradeValue > capital && (
              <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25 flex items-center gap-1">
                ⚠️ Value exceeds total capital
              </span>
            )}
          </div>
        </div>
      )}

      {/* Message log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/10">
        
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div 
              key={msg.id} 
              className={`flex gap-3 max-w-[80%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 ${
                isUser 
                  ? 'bg-teal-500/10 border-teal-500/20 text-teal-400' 
                  : 'bg-gray-800 border-gray-700 text-gray-300'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Balloon */}
              <div className={`p-3 rounded-lg text-xs leading-relaxed space-y-1 ${
                isUser 
                  ? 'bg-teal-500/10 text-gray-100 border border-teal-500/25 rounded-tr-none' 
                  : 'bg-gray-800/50 text-gray-200 border border-gray-800/80 rounded-tl-none'
              }`}>
                <p className="whitespace-pre-line">{msg.content}</p>
                <span className="block text-[9px] text-gray-500 font-mono text-right mt-1">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 mr-auto max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-750 flex items-center justify-center text-gray-300 shrink-0">
              <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
            </div>
            <div className="p-3 rounded-lg bg-gray-850 text-xs text-gray-400 border border-gray-800/80 rounded-tl-none flex items-center gap-2">
              <span>AI Quant is evaluating technical parameters and training backtests...</span>
            </div>
          </div>
        )}

        <div ref={logRef} />
      </div>

      {/* Footer controls & prompt suggestions */}
      <div className="p-4 border-t border-gray-800/60 bg-slate-950/40 space-y-3">
        {messages.length <= 1 && !isLoading && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Suggested Questions</span>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map((p) => (
                <button
                  key={p.label}
                  onClick={() => onSendMessage(p.query)}
                  className="px-2.5 py-1 rounded text-[10px] font-medium bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 hover:text-white transition-all"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {portfolio.length > 0 && (
          <div className="p-3 bg-teal-950/25 border border-teal-800/40 rounded flex items-center justify-between gap-3 flex-wrap">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">Portfolio Rebalancing Advisor</span>
              <p className="text-[9px] text-gray-400">Analyses variance against target allocations and suggests buy/sell transactions.</p>
            </div>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onSendMessage("Calculate and suggest optimal buy/sell actions to rebalance my current portfolio back to my desired target percentage allocation.")}
              className="px-3 py-1.5 rounded bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-[10px] font-mono font-bold tracking-wider border border-teal-500/30 hover:border-teal-500/50 transition-all flex items-center gap-1.5 select-none disabled:opacity-40 disabled:pointer-events-none"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              CALCULATE REBALANCE PLAN
            </button>
          </div>
        )}

        {/* Input box */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input 
            type="text" 
            placeholder="Ask AI Quant about specific symbols, patterns, formulas or indicators..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-gray-900 border border-gray-800 rounded px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500/80"
          />
          <button 
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="p-2 rounded bg-teal-500 hover:bg-teal-600 text-white transition-all disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
