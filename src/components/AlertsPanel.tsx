import React, { useState } from 'react';
import { BellRing, CheckCircle2, AlertTriangle, Play, Pause, Trash2 } from 'lucide-react';
import { PriceAlert, StockDetails } from '../types.js';

interface AlertsPanelProps {
  symbol: string;
  stock: StockDetails;
  alerts: PriceAlert[];
  onCreateAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'isTriggered'>) => void;
  onToggleAlert: (id: string) => void;
  onDeleteAlert: (id: string) => void;
}

export default function AlertsPanel({ symbol, stock, alerts, onCreateAlert, onToggleAlert, onDeleteAlert }: AlertsPanelProps) {
  const [type, setType] = useState<'price' | 'volume' | 'rsi'>('price');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [value, setValue] = useState<string>(stock.price.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(value);
    if (isNaN(val) || val <= 0) return;

    onCreateAlert({
      symbol,
      type,
      condition,
      value: val,
      isActive: true
    });
  };

  const isUS = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'].includes(symbol);

  return (
    <div className="flex-1 bg-slate-900 border border-gray-800/80 rounded-lg overflow-hidden flex flex-col glass-panel select-none">
      
      {/* Alert Creator form header */}
      <div className="p-6 border-b border-gray-800/60 bg-slate-950/40">
        <div className="flex items-center gap-2 mb-4">
          <BellRing className="w-4 h-4 text-teal-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Configure Price & Technical Alarm triggers</h3>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          {/* Target Symbol */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Alert Ticker</label>
            <input 
              type="text" 
              value={symbol} 
              disabled 
              className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-1.5 text-xs text-teal-400 font-bold focus:outline-none"
            />
          </div>

          {/* Trigger Condition Type */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Trigger Parameter</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
            >
              <option value="price">Price Action</option>
              <option value="volume">Volume Threshold</option>
              <option value="rsi">Relative Strength Index (RSI 14)</option>
            </select>
          </div>

          {/* Condition direction */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Condition Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as any)}
              className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
            >
              <option value="above">CROSSES ABOVE (&gt;=)</option>
              <option value="below">CROSSES BELOW (&lt;=)</option>
            </select>
          </div>

          {/* Value input */}
          <div className="space-y-1.5 flex gap-2">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Target Trigger Value</label>
              <input 
                type="number" 
                value={value}
                onChange={(e) => setValue(e.target.value)}
                step="0.01"
                className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs transition-all h-[32px] self-end shrink-0"
            >
              SET ALARM
            </button>
          </div>
        </form>
      </div>

      {/* Alarms lists Ledger */}
      <div className="p-6 flex-1 space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Active Alarms and Logs Ledger</h4>

        <div className="overflow-x-auto rounded border border-gray-800/80 bg-gray-950/20">
          <table className="w-full text-left text-xs font-mono select-none">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 uppercase text-[9px]">
                <th className="py-2.5 px-4">Ticker</th>
                <th className="py-2.5 px-4">Parameter type</th>
                <th className="py-2.5 px-4">Condition direction</th>
                <th className="py-2.5 px-4">Trigger threshold</th>
                <th className="py-2.5 px-4">Status state</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/35 text-gray-300">
              {alerts.map((al) => {
                const isPrice = al.type === 'price';
                const isRsi = al.type === 'rsi';
                
                return (
                  <tr key={al.id} className={al.isTriggered ? 'bg-amber-500/5 text-amber-300' : 'hover:bg-gray-800/10'}>
                    <td className="py-3.5 px-4 font-bold text-teal-400">{al.symbol}</td>
                    <td className="py-3.5 px-4 font-semibold uppercase">{al.type}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-300 uppercase">{al.condition}</td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {isPrice ? (isUS ? '$' : '₹') : ''}{al.value.toFixed(2)}{isRsi ? ' index' : ''}
                    </td>
                    <td className="py-3.5 px-4">
                      {al.isTriggered ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                          <AlertTriangle className="w-3 h-3" /> TRIGGERED
                        </span>
                      ) : al.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> MONITORING
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-500">
                          PAUSED
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {!al.isTriggered && (
                        <button
                          onClick={() => onToggleAlert(al.id)}
                          className="p-1 rounded bg-gray-800 text-gray-400 hover:text-white"
                          title={al.isActive ? 'Pause monitoring' : 'Resume monitoring'}
                        >
                          {al.isActive ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteAlert(al.id)}
                        className="p-1 rounded bg-gray-800 text-gray-400 hover:text-rose-400"
                        title="Delete alarm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {alerts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 text-xs">
                    No technical alarms configured for this asset yet. Specify metrics above to activate alarm monitoring!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
