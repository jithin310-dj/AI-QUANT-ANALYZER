import React, { useState } from 'react';
import { Briefcase, TrendingUp, TrendingDown, DollarSign, PlusCircle, MinusCircle, PieChart as LucidePieChart, Download } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { StockDetails, PortfolioPosition } from '../types.js';
import LivePriceDisplay from './LivePriceDisplay.js';

interface PortfolioPanelProps {
  symbol: string;
  stock: StockDetails;
  positions: PortfolioPosition[];
  onAddTransaction: (symbol: string, shares: number, price: number, type: 'BUY' | 'SELL') => void;
  onUpdateTargetPercent: (symbol: string, percent: number) => void;
  stocks: StockDetails[];
}

export default function PortfolioPanel({ symbol, stock, positions, onAddTransaction, onUpdateTargetPercent, stocks }: PortfolioPanelProps) {
  const [tradeShares, setTradeShares] = useState<number>(10);
  const [customPrice, setCustomPrice] = useState<string>(stock.price.toString());

  // Handle updates when selected stock shifts
  useState(() => {
    setCustomPrice(stock.price.toString());
  });

  const isUS = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'].includes(symbol);

  // Totals calculations
  const totalCost = positions.reduce((sum, p) => sum + p.totalCost, 0);
  const totalValue = positions.reduce((sum, p) => sum + p.marketValue, 0);
  const totalProfit = totalValue - totalCost;
  const totalProfitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  // Sector diversification breakdown
  const sectorWeights: { [key: string]: number } = {};
  positions.forEach(pos => {
    sectorWeights[pos.symbol] = pos.marketValue;
  });

  const getPositionForSymbol = (sym: string) => {
    return positions.find(p => p.symbol === sym);
  };

  const activePosition = getPositionForSymbol(symbol);

  const handleTrade = (type: 'BUY' | 'SELL') => {
    const shares = parseFloat(tradeShares.toString());
    const price = parseFloat(customPrice);
    if (isNaN(shares) || shares <= 0 || isNaN(price) || price <= 0) return;

    if (type === 'SELL' && (!activePosition || activePosition.shares < shares)) {
      alert("Insufficient shares to sell!");
      return;
    }

    onAddTransaction(symbol, shares, price, type);
  };

  const handleExportCSV = () => {
    if (positions.length === 0) {
      alert("No active positions available to export!");
      return;
    }

    // Build headers with tax-relevant columns
    const headers = [
      'Asset Ticker (Symbol)',
      'Shares Owned',
      'Average Cost Price ($)',
      'Current Market Price ($)',
      'Total Cost Basis ($)',
      'Current Market Value ($)',
      'Cumulative Profit/Loss ($)',
      'Cumulative Return (%)',
      'Valuation Timestamp (ISO)'
    ];

    // Build CSV records
    const rows = positions.map(pos => [
      pos.symbol,
      pos.shares.toString(),
      pos.avgPrice.toFixed(2),
      pos.currentPrice.toFixed(2),
      pos.totalCost.toFixed(2),
      pos.marketValue.toFixed(2),
      pos.profit.toFixed(2),
      pos.profitPercent.toFixed(2),
      new Date().toISOString()
    ]);

    // Construct comma-separated text
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create a client-side blob and trigger safe anchor click download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Quant_Portfolio_Tax_Accounting_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 bg-slate-900 border border-gray-800/80 rounded-lg overflow-hidden flex flex-col glass-panel select-none">
      
      {/* Portfolio Value Summary boxes */}
      <div className="p-6 border-b border-gray-800/60 bg-slate-950/40 grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Total portfolio net worth */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Portfolio net worth</span>
          <div className="text-2xl font-mono font-extrabold text-white flex items-center">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-gray-400">Includes dynamic real-time tick adjustments</p>
        </div>

        {/* Investment cost basis */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Investment cost basis</span>
          <div className="text-2xl font-mono font-extrabold text-gray-300">
            ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-gray-400">Aggregated purchase sums</p>
        </div>

        {/* Unrealized profit / Loss */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">unrealized profit / loss</span>
          <div className={`text-2xl font-mono font-extrabold inline-flex items-center gap-1 ${
            totalProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'
          }`}>
            {totalProfit >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            {totalProfit >= 0 ? '+' : ''}${Math.abs(totalProfit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`text-[10px] font-bold ${totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalProfit >= 0 ? '+' : ''}{totalProfitPercent.toFixed(2)}% ROI
          </div>
        </div>

        {/* Active Asset position */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">{symbol} ACTIVE HOLDING</span>
          <div className="flex flex-col gap-0.5">
            <div className="text-sm font-mono font-bold text-teal-400">
              {activePosition ? `${activePosition.shares} Shares` : 'No Position'}
            </div>
            <LivePriceDisplay stock={stock} size="sm" showDetail={true} />
          </div>
          <p className="text-[10px] text-gray-400">
            {activePosition ? `Avg cost: ${isUS ? '$' : '₹'}${activePosition.avgPrice.toFixed(2)}` : 'Initiate purchase below'}
          </p>
        </div>

      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Transaction buy/sell order desk */}
        <div className="bg-gray-950/40 p-5 rounded-lg border border-gray-800/80 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-teal-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Execute Simulation Trade</h4>
          </div>

          <div className="space-y-3">
            {/* Shares input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Quantity (Shares)</label>
              <input 
                type="number" 
                value={tradeShares}
                onChange={(e) => setTradeShares(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Execution price */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Limit Price ({isUS ? 'USD' : 'INR'})</label>
              <input 
                type="number" 
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                step="0.01"
                className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>

            <div className="text-[10px] text-gray-500 font-mono text-center">
              Estimated Total: ${(tradeShares * parseFloat(customPrice || "0")).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>

            {/* CTA Buy / Sell buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => handleTrade('BUY')}
                className="py-2.5 rounded bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-all flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                BUY LONG
              </button>
              <button
                onClick={() => handleTrade('SELL')}
                disabled={!activePosition || activePosition.shares === 0}
                className="py-2.5 rounded bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                <MinusCircle className="w-4 h-4" />
                SELL SHORT
              </button>
            </div>
          </div>
        </div>

        {/* Portfolio Positions Ledger table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-teal-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Account holdings Ledger</h4>
            </div>
            
            <button
              onClick={handleExportCSV}
              disabled={positions.length === 0}
              className="px-3 py-1.5 rounded bg-teal-500/10 border border-teal-500/25 text-teal-400 hover:bg-teal-500/25 transition-all text-[11px] font-mono font-bold inline-flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
              title="Download professional CSV report for tax filing and audit tracking"
            >
              <Download className="w-3.5 h-3.5" />
              EXPORT CSV (TAX REPORT)
            </button>
          </div>

          <div className="overflow-x-auto rounded border border-gray-800 bg-gray-950/20">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 uppercase text-[9px] font-mono">
                  <th className="py-2 px-4">Symbol</th>
                  <th className="py-2 px-4">Shares</th>
                  <th className="py-2 px-4">Avg Cost</th>
                  <th className="py-2 px-4">Live Price</th>
                  <th className="py-2 px-4">Market Value</th>
                  <th className="py-2 px-4">Target %</th>
                  <th className="py-2 px-4 text-right">Profit/Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/35 text-gray-300">
                {positions.map(pos => {
                  const pUp = pos.profit >= 0;
                  const currentTarget = pos.targetPercent !== undefined ? pos.targetPercent : Math.round(100 / positions.length);
                  const matchingStock = stocks.find(s => s.symbol === pos.symbol);
                  const isUSPos = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'].includes(pos.symbol);
                  return (
                    <tr key={pos.symbol} className="hover:bg-gray-800/20">
                      <td className="py-3 px-4 font-bold text-teal-400">{pos.symbol}</td>
                      <td className="py-3 px-4">{pos.shares}</td>
                      <td className="py-3 px-4">{isUSPos ? '$' : '₹'}{pos.avgPrice.toFixed(2)}</td>
                      <td className="py-3 px-4 font-bold text-white">
                        <LivePriceDisplay stock={matchingStock} size="sm" showDetail={true} />
                      </td>
                      <td className="py-3 px-4 font-bold">{isUSPos ? '$' : '₹'}{pos.marketValue.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={currentTarget}
                            onChange={(e) => onUpdateTargetPercent(pos.symbol, Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                            className="w-12 bg-gray-950 border border-gray-800 rounded px-1.5 py-0.5 text-center text-xs text-teal-400 font-bold focus:outline-none focus:border-teal-500 font-mono"
                          />
                          <span className="text-gray-500 text-[10px] select-none">%</span>
                        </div>
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${pUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {pUp ? '+' : ''}${pos.profit.toFixed(2)} ({pUp ? '+' : ''}{pos.profitPercent.toFixed(1)}%)
                      </td>
                    </tr>
                  );
                })}

                {positions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500 text-xs">
                      No active holdings. Place a simulator trade above to start!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {positions.length > 0 && (
            <div className="bg-gray-950/40 p-5 rounded-lg border border-gray-800/80 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
              {/* Left column: Pie Chart visualization */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <LucidePieChart className="w-4 h-4 text-teal-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Asset Allocation Breakdown</h4>
                </div>
                <div className="h-48 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={positions.map((pos) => ({
                          name: pos.symbol,
                          value: pos.marketValue
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {positions.map((entry, index) => {
                          const COLORS = ['#0d9488', '#06b6d4', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#f43f5e', '#f59e0b'];
                          return (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#0f172a" strokeWidth={2} />
                          );
                        })}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '6px' }}
                        itemStyle={{ color: '#f1f5f9', fontSize: '11px', fontFamily: 'monospace' }}
                        formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, 'Market Value']}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconSize={8}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', color: '#94a3b8' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right column: Target rebalancing ledger plan */}
              <div className="space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Asset Rebalance Plan</span>
                    <span className="text-[10px] font-mono text-gray-400 bg-slate-950/40 px-2 py-0.5 rounded border border-gray-850">
                      Target Sum: {positions.reduce((sum, p) => sum + (p.targetPercent !== undefined ? p.targetPercent : Math.round(100 / positions.length)), 0)}%
                    </span>
                  </div>

                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {positions.map((pos) => {
                      const currAlloc = totalValue > 0 ? (pos.marketValue / totalValue) * 100 : 0;
                      const targetAlloc = pos.targetPercent !== undefined ? pos.targetPercent : Math.round(100 / positions.length);
                      const dev = currAlloc - targetAlloc;
                      const targetValue = totalValue * (targetAlloc / 100);
                      const valueDiff = targetValue - pos.marketValue;
                      const sharesDiff = valueDiff / pos.currentPrice;

                      return (
                        <div key={pos.symbol} className="p-2 rounded bg-gray-950/30 border border-gray-850/60 flex items-center justify-between gap-3 text-xs font-mono">
                          <div className="space-y-0.5">
                            <span className="font-bold text-white text-[11px]">{pos.symbol}</span>
                            <div className="flex items-center gap-1.5 text-[9px] text-gray-400">
                              <span>Curr: {currAlloc.toFixed(1)}%</span>
                              <span>•</span>
                              <span>Tgt: {targetAlloc}%</span>
                            </div>
                          </div>
                          <div className="text-right">
                            {Math.abs(dev) < 1.0 ? (
                              <span className="text-emerald-400 font-bold text-[9px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Aligned</span>
                            ) : valueDiff > 0 ? (
                              <div className="space-y-0.5">
                                <span className="text-emerald-400 font-bold block text-[10px]">🟢 BUY {Math.abs(sharesDiff).toFixed(1)} Shrs</span>
                                <span className="text-[9px] text-gray-500 block">+$${Math.abs(valueDiff).toFixed(2)}</span>
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                <span className="text-rose-400 font-bold block text-[10px]">🔴 SELL {Math.abs(sharesDiff).toFixed(1)} Shrs</span>
                                <span className="text-[9px] text-gray-500 block">-$${Math.abs(valueDiff).toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <p className="text-[9px] text-gray-500 font-sans italic leading-normal border-t border-gray-800/40 pt-2">
                  * Dynamic allocations automatically adjust based on tick fluctuations. Visit the AI Quant Advisor tab to ask for detailed strategic recommendations on execution size and tax harvesting.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
