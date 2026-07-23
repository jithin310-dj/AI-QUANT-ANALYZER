import { useState } from 'react';
import LivePriceDisplay from './LivePriceDisplay.js';
import ModelPerformanceCard from './ModelPerformanceCard.js';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Percent, 
  TrendingUp, 
  BrainCircuit, 
  RefreshCw, 
  AlertTriangle,
  Activity,
  Award,
  Loader2
} from 'lucide-react';
import { AIPrediction, StockDetails } from '../types.js';

interface AIPredictionPanelProps {
  symbol: string;
  stock: StockDetails;
  prediction: AIPrediction | null;
  onRetrain: () => void;
  isRetraining: boolean;
}

export default function AIPredictionPanel({ symbol, stock, prediction, onRetrain, isRetraining }: AIPredictionPanelProps) {
  const [activeTab, setActiveTab] = useState<'explanation' | 'metrics' | 'shap'>('explanation');

  if (!prediction) {
    return (
      <div className="flex-1 bg-slate-900 border border-gray-800/80 rounded-lg p-8 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
        <span className="text-sm font-mono text-gray-400">Computing machine learning forecasts...</span>
      </div>
    );
  }

  const isGreen = prediction.signal === 'BUY';
  const isRed = prediction.signal === 'SELL';
  
  const getDirectionIcon = (dir: 'UP' | 'DOWN' | 'SIDEWAYS') => {
    if (dir === 'UP') return <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />;
    if (dir === 'DOWN') return <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />;
    return <Activity className="w-3.5 h-3.5 text-gray-500" />;
  };

  const getDirectionBadge = (dir: 'UP' | 'DOWN' | 'SIDEWAYS') => {
    if (dir === 'UP') return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
    if (dir === 'DOWN') return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
    return 'bg-gray-800 text-gray-400 border border-gray-700/60';
  };

  const isUS = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'].includes(symbol);

  return (
    <div className="flex-1 bg-slate-900 border border-gray-800/80 rounded-lg overflow-hidden flex flex-col glass-panel select-none">
      
      {/* Top Banner */}
      <div className="p-6 border-b border-gray-800/60 bg-slate-950/40 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Predictive Forecasting Engine</h3>
            <p className="text-xs text-gray-400 font-mono mt-0.5">Auto-updating machine learning backtests • Active: {prediction.bestModel}</p>
          </div>
          <div className="h-8 w-px bg-gray-850 hidden sm:block" />
          <LivePriceDisplay stock={stock} size="md" showDetail={true} />
        </div>

        <button
          onClick={onRetrain}
          disabled={isRetraining}
          className="px-3 py-1.5 rounded text-xs font-bold bg-teal-500/15 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
          {isRetraining ? 'RETRAINING MODELS...' : 'RETRAIN SYSTEM'}
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Signal & Expected Ranges */}
        <div className="bg-gray-950/40 p-5 rounded-lg border border-gray-800/80 space-y-5">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">QUANT SUGGESTION</span>
            <div className={`text-3xl font-display font-extrabold ${
              isGreen ? 'text-emerald-500' : isRed ? 'text-rose-500' : 'text-amber-500'
            }`}>
              {prediction.signal}
            </div>
            <div className="text-xs text-gray-400 font-mono mt-1">
              Signal Strength: {prediction.signalStrength}%
            </div>
          </div>

          {/* Progress gauge bar */}
          <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                isGreen ? 'bg-emerald-500' : isRed ? 'bg-rose-500' : 'bg-amber-500'
              }`}
              style={{ width: `${prediction.signalStrength}%` }}
            />
          </div>

          <div className="divide-y divide-gray-800/60 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-gray-400">Confidence Rating:</span>
              <span className="font-mono font-semibold text-white">{prediction.confidence}%</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-gray-400">Predictive Probability:</span>
              <span className="font-mono font-semibold text-teal-400">{prediction.probability}%</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-gray-400">Target Corridor Range:</span>
              <span className="font-mono font-semibold text-gray-200">
                {isUS ? '$' : '₹'}{prediction.expectedRangeMin} - {isUS ? '$' : '₹'}{prediction.expectedRangeMax}
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-gray-400">Calculated Volatility:</span>
              <span className="font-mono font-semibold text-amber-500 inline-flex items-center gap-0.5">
                <Percent className="w-3 h-3" />
                {prediction.volatility}%
              </span>
            </div>
          </div>

          {/* Visual Close Forecast Gauge with Shaded CI */}
          <div className="pt-4 border-t border-gray-800/60 space-y-2.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block font-mono">Closing Range Confidence Interval</span>
            
            <div className="relative pt-1">
              <div className="flex justify-between text-[9px] text-gray-500 font-mono mb-1">
                <span>{isUS ? '$' : '₹'}{(prediction.expectedRangeMin * 0.995).toFixed(1)}</span>
                <span className="text-teal-400 font-bold">Confidence Corridor</span>
                <span>{isUS ? '$' : '₹'}{(prediction.expectedRangeMax * 1.005).toFixed(1)}</span>
              </div>
              
              <div className="relative h-6 bg-gray-950 rounded-md border border-gray-850 mt-1 overflow-hidden">
                {/* Shaded confidence interval region */}
                <div 
                  className="absolute top-0 bottom-0 bg-teal-500/15 border-l border-r border-teal-500/35"
                  style={{
                    left: '20%',
                    right: '20%',
                  }}
                />
                
                {/* Min price target line */}
                <div className="absolute left-[20%] -translate-x-1/2 top-0 bottom-0 w-px bg-teal-400/50" />
                <div className="absolute left-[20%] top-1 -translate-x-1/2 text-[7px] text-teal-400 font-mono scale-90">MIN</div>
                
                {/* Max price target line */}
                <div className="absolute right-[20%] translate-x-1/2 top-0 bottom-0 w-px bg-teal-400/50" />
                <div className="absolute right-[20%] top-1 translate-x-1/2 text-[7px] text-teal-400 font-mono scale-90">MAX</div>

                {/* Current Price Marker */}
                {(() => {
                  const minBound = prediction.expectedRangeMin * 0.995;
                  const maxBound = prediction.expectedRangeMax * 1.005;
                  const pct = Math.max(0, Math.min(100, ((stock.price - minBound) / (maxBound - minBound)) * 100));
                  return (
                    <div 
                      className="absolute top-0 bottom-0 flex flex-col items-center justify-center transition-all duration-500"
                      style={{ left: `${pct}%` }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-white shadow-md shadow-white/85 border-2 border-teal-500 z-10" />
                      <div className="w-0.5 h-full bg-white/40 absolute" />
                    </div>
                  );
                })()}
              </div>

              <div className="flex justify-between text-[8px] text-gray-500 font-mono mt-1.5">
                <span>Buffer -0.5%</span>
                <span className="text-white bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20 font-bold">
                  Live: {isUS ? '$' : '₹'}{stock.price.toFixed(2)}
                </span>
                <span>Buffer +0.5%</span>
              </div>
            </div>
          </div>

        </div>

        {/* Directional Horizons */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          
          <div className="bg-gray-950/20 p-4 rounded-lg border border-gray-800/40 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">NEXT HOUR</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded inline-flex items-center gap-1 ${getDirectionBadge(prediction.nextHour)}`}>
                {getDirectionIcon(prediction.nextHour)}
                {prediction.nextHour}
              </span>
            </div>
            <span className="text-[10px] font-mono text-gray-600">High Speed</span>
          </div>

          <div className="bg-gray-950/20 p-4 rounded-lg border border-gray-800/40 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">TOMORROW</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded inline-flex items-center gap-1 ${getDirectionBadge(prediction.tomorrow)}`}>
                {getDirectionIcon(prediction.tomorrow)}
                {prediction.tomorrow}
              </span>
            </div>
            <span className="text-[10px] font-mono text-gray-600">Daily Close</span>
          </div>

          <div className="bg-gray-950/20 p-4 rounded-lg border border-gray-800/40 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">NEXT WEEK</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded inline-flex items-center gap-1 ${getDirectionBadge(prediction.nextWeek)}`}>
                {getDirectionIcon(prediction.nextWeek)}
                {prediction.nextWeek}
              </span>
            </div>
            <span className="text-[10px] font-mono text-gray-600">Swing trade</span>
          </div>

          <div className="bg-gray-950/20 p-4 rounded-lg border border-gray-800/40 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">NEXT MONTH</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded inline-flex items-center gap-1 ${getDirectionBadge(prediction.nextMonth)}`}>
                {getDirectionIcon(prediction.nextMonth)}
                {prediction.nextMonth}
              </span>
            </div>
            <span className="text-[10px] font-mono text-gray-600">Macro Trend</span>
          </div>

          {/* Model Fit metrics indicator */}
          <div className="col-span-2 bg-gray-950/40 p-4 rounded-lg border border-gray-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-xs font-bold text-gray-200">System Accuracy Leader: {prediction.bestModel}</span>
                <p className="text-[10px] text-gray-400 leading-normal">The backtesting module selected {prediction.bestModel} as having the lowest historical MAE on this ticker.</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Interactive Tabs (Explainable AI / Comparative Metrics / SHAP values) */}
      <div className="border-t border-gray-800/60 bg-slate-950/10 flex-1 flex flex-col">
        <div className="flex border-b border-gray-800/60 bg-slate-950/30">
          {(['explanation', 'metrics', 'shap'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-xs font-bold uppercase transition-all border-b-2 ${
                activeTab === tab 
                  ? 'border-teal-500 text-teal-400 bg-slate-900/10' 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'explanation' && 'Explainable AI Commentary'}
              {tab === 'metrics' && 'ML Model Backtests Compared'}
              {tab === 'shap' && 'SHAP Features Importance'}
            </button>
          ))}
        </div>

        <div className="p-6 flex-1">
          {activeTab === 'explanation' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Predictive Reasoning Analysis</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{prediction.explanation}</p>
                <div className="mt-4 p-3 rounded bg-teal-500/5 border border-teal-500/10 text-[11px] text-teal-400 leading-relaxed">
                  <strong>Macro Conditions:</strong> {prediction.marketConditions}
                </div>
              </div>

              {/* Risk metrics list */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Calculated Risk Factors</span>
                </div>
                <ul className="space-y-2 text-[11px] text-gray-400 leading-normal">
                  {prediction.riskFactors.map((risk, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-amber-500 font-bold font-mono">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-500">
                      <th className="py-2.5 font-bold uppercase">Algorithm</th>
                      <th className="py-2.5 font-bold uppercase">MAE (Mean Abs Error)</th>
                      <th className="py-2.5 font-bold uppercase">MSE (Mean Sq Error)</th>
                      <th className="py-2.5 font-bold uppercase">RMSE (Root MSE)</th>
                      <th className="py-2.5 font-bold uppercase">MAPE (Mean Abs Pct Error)</th>
                      <th className="py-2.5 font-bold uppercase text-teal-400">R² Coefficient</th>
                      <th className="py-2.5 font-bold uppercase text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/35 text-gray-300">
                    {prediction.modelMetrics.map((met) => {
                      const isBest = met.name === prediction.bestModel;
                      return (
                        <tr key={met.name} className={isBest ? 'bg-teal-500/5 text-white' : ''}>
                          <td className="py-3 font-semibold">{met.name}</td>
                          <td className="py-3">{met.mae}</td>
                          <td className="py-3">{met.mse}</td>
                          <td className="py-3 text-teal-400 font-semibold">{met.rmse}</td>
                          <td className="py-3">{met.mape}%</td>
                          <td className="py-3">{met.r2}</td>
                          <td className="py-3 text-right">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isBest ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-gray-800 text-gray-500'
                            }`}>
                              {isBest ? 'ACTIVE MODEL' : 'BACKTESTED'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-gray-800/60 pt-6">
                <ModelPerformanceCard />
              </div>
            </div>
          )}

          {activeTab === 'shap' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Features Weight Matrix (SHAP Index)</h4>
                  <p className="text-[10px] text-gray-400">SHAP values allocate a performance score representing how much each indicator shifted the model away from its baseline.</p>
                </div>
              </div>

              <div className="space-y-3">
                {prediction.featureImportance.map((feat, idx) => {
                  return (
                    <div key={`${feat.feature}-${idx}`} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-gray-300">{feat.feature}</span>
                        <span className="font-mono text-teal-400 font-semibold">+{feat.importance}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-teal-500/80 rounded-full transition-all"
                          style={{ width: `${feat.importance * 2.5}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
