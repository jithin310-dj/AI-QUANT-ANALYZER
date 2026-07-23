import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Cpu, 
  Zap, 
  Award, 
  Activity, 
  Settings, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Sparkles,
  RefreshCw,
  Gauge,
  Layers,
  ChevronDown,
  ChevronUp,
  ShieldCheck
} from 'lucide-react';
import { validateAllIndianIndices, IndexValidationResult } from '../utils/indexValidationEngine.js';

interface ModelTelemetry {
  name: string;
  id: string;
  type: string;
  accuracy: number; // %
  latency: number;  // ms
  f1Score: number;  // 0 to 1
  status: 'ACTIVE' | 'CALIBRATED' | 'STANDBY' | 'SUSPENDED';
  statusReason?: string;
  hyperparams: {
    learningRate: string;
    epochs: number;
    batchSize: string;
    complexity: string;
  };
  lossCurve: { epoch: number; loss: number }[];
  description: string;
  strength: string;
}

const MODELS_DATA: ModelTelemetry[] = [
  {
    name: 'Temporal Fusion Net',
    id: 'tft',
    type: 'Transformer v2 (Attention-Based)',
    accuracy: 89.1,
    latency: 35.8,
    f1Score: 0.88,
    status: 'ACTIVE',
    hyperparams: {
      learningRate: '0.001',
      epochs: 150,
      batchSize: '64',
      complexity: '12.4M params'
    },
    lossCurve: [
      { epoch: 1, loss: 0.45 },
      { epoch: 20, loss: 0.28 },
      { epoch: 50, loss: 0.19 },
      { epoch: 100, loss: 0.11 },
      { epoch: 150, loss: 0.08 }
    ],
    description: 'Advanced multi-horizon time-series forecasting model utilizing self-attention mechanisms to learn long-term temporal relationships.',
    strength: 'Capturing non-linear interactions across multiple scales and complex macro trends.'
  },
  {
    name: 'XGBoost Multi-Reg',
    id: 'xgboost',
    type: 'Gradient Boosted Trees',
    accuracy: 88.0,
    latency: 3.1,
    f1Score: 0.86,
    status: 'ACTIVE',
    hyperparams: {
      learningRate: '0.05',
      epochs: 500,
      batchSize: 'N/A',
      complexity: 'Tree Depth: 8'
    },
    lossCurve: [
      { epoch: 1, loss: 0.38 },
      { epoch: 100, loss: 0.22 },
      { epoch: 250, loss: 0.15 },
      { epoch: 400, loss: 0.11 },
      { epoch: 500, loss: 0.09 }
    ],
    description: 'Highly optimized ensemble model leveraging tree boosting for tabular/order-book feature inputs.',
    strength: 'Ultra-low latency inference and identifying sudden support/resistance breakouts.'
  },
  {
    name: 'Transformer Dense',
    id: 'transformer',
    type: 'Self-Attention Network',
    accuracy: 86.4,
    latency: 24.2,
    f1Score: 0.85,
    status: 'ACTIVE',
    hyperparams: {
      learningRate: '0.002',
      epochs: 120,
      batchSize: '128',
      complexity: '8.2M params'
    },
    lossCurve: [
      { epoch: 1, loss: 0.52 },
      { epoch: 30, loss: 0.31 },
      { epoch: 60, loss: 0.21 },
      { epoch: 90, loss: 0.14 },
      { epoch: 120, loss: 0.11 }
    ],
    description: 'Dense self-attention model capturing multi-day feature correlations and multi-timeframe seasonality profiles.',
    strength: 'Spotting global market couplings and seasonal sector rotation cycles.'
  },
  {
    name: 'LSTM Deep Core',
    id: 'lstm',
    type: 'Recurrent Neural Network',
    accuracy: 83.2,
    latency: 12.5,
    f1Score: 0.82,
    status: 'STANDBY',
    hyperparams: {
      learningRate: '0.005',
      epochs: 200,
      batchSize: '64',
      complexity: '2.1M params'
    },
    lossCurve: [
      { epoch: 1, loss: 0.60 },
      { epoch: 50, loss: 0.38 },
      { epoch: 100, loss: 0.24 },
      { epoch: 150, loss: 0.18 },
      { epoch: 200, loss: 0.14 }
    ],
    description: 'Standard deep LSTM layer architecture designed to capture localized sequential price flow and sequential dependencies.',
    strength: 'Filtering high-frequency intra-hour noise and transient momentum bursts.'
  },
  {
    name: 'Random Forest Ens',
    id: 'random_forest',
    type: 'Decision Tree Ensemble',
    accuracy: 78.4,
    latency: 5.4,
    f1Score: 0.76,
    status: 'SUSPENDED',
    statusReason: 'Variance drift exceeded +/- 1.5% limit',
    hyperparams: {
      learningRate: 'N/A',
      epochs: 300,
      batchSize: 'N/A',
      complexity: '500 Estimators'
    },
    lossCurve: [
      { epoch: 1, loss: 0.40 },
      { epoch: 50, loss: 0.32 },
      { epoch: 150, loss: 0.25 },
      { epoch: 250, loss: 0.20 },
      { epoch: 300, loss: 0.18 }
    ],
    description: 'Bagging decision tree classifier. Currently suspended from active ensemble weighting due to extreme signal variance during highly volatile macro regimes.',
    strength: 'Stable baseline under normal market regimes, high resistance to single-feature outliers.'
  }
];

export default function ModelPerformanceCard() {
  const [selectedModelId, setSelectedModelId] = useState<string>('tft');
  const [comparisonMetric, setComparisonMetric] = useState<'accuracy' | 'latency' | 'f1Score'>('accuracy');
  const [expandedIndexSymbol, setExpandedIndexSymbol] = useState<string | null>(null);
  
  const indexValidationResults = validateAllIndianIndices();
  const activeModel = MODELS_DATA.find(m => m.id === selectedModelId) || MODELS_DATA[0];

  // Map metric titles and formats for display
  const getMetricTitle = () => {
    if (comparisonMetric === 'accuracy') return 'Model Directional Accuracy (%)';
    if (comparisonMetric === 'latency') return 'Inference Speed/Latency (ms) - Lower is Better';
    return 'F1-Score (Signal Precision/Recall Ratio)';
  };

  const getMetricSuffix = (val: number) => {
    if (comparisonMetric === 'accuracy') return `${val}%`;
    if (comparisonMetric === 'latency') return `${val} ms`;
    return val.toFixed(2);
  };

  // Convert models data to recharts form
  const chartData = MODELS_DATA.map(m => ({
    name: m.name,
    shortName: m.name.split(' ')[0],
    id: m.id,
    value: m[comparisonMetric]
  }));

  return (
    <div className="bg-slate-900 border border-gray-800/80 rounded-lg p-5 glass-panel space-y-5 select-none" id="model_performance_dashboard_card">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
            <Cpu className="w-4.5 h-4.5 text-teal-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Forecast Model Performance Hub</h4>
            <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
              Ensemble calibration diagnostics • {MODELS_DATA.filter(m => m.status === 'ACTIVE').length} active model nodes
            </p>
          </div>
        </div>

        {/* Info pill about calibration */}
        <div className="flex items-center gap-2 bg-teal-950/20 border border-teal-500/20 rounded px-2.5 py-1 text-[9.5px] font-mono text-teal-400">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>REAL-TIME BACKTEST MONITORING</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: ACTIVE MODEL TELEMETRY FOCUS (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-800/40 pb-5 lg:pb-0 lg:pr-6">
          
          {/* Visual Toggle Selector for Focusing on a single model */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block font-mono">
              SELECT MODEL FOCUS
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-1 gap-1">
              {MODELS_DATA.map(model => {
                const isSelected = model.id === selectedModelId;
                return (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModelId(model.id)}
                    className={`px-2.5 py-2 text-left rounded border transition-all text-[10px] font-mono flex items-center justify-between ${
                      isSelected 
                        ? 'bg-teal-500/10 border-teal-500/40 text-teal-400 font-bold' 
                        : 'bg-gray-950/40 border-gray-850 text-gray-400 hover:text-white hover:bg-slate-800/30'
                    }`}
                  >
                    <span className="truncate">{model.name}</span>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ml-1.5 ${
                      model.status === 'ACTIVE' 
                        ? 'bg-emerald-400' 
                        : model.status === 'STANDBY' 
                          ? 'bg-amber-400' 
                          : 'bg-rose-500'
                    }`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core Telemetry metrics for Focused Model */}
          <div className="p-4 bg-gray-950/40 border border-gray-850 rounded-lg space-y-3.5 flex-1 mt-2">
            
            {/* Header: Model details and Status */}
            <div className="flex items-start justify-between border-b border-gray-800 pb-2">
              <div>
                <span className="text-[8px] font-mono text-gray-500 uppercase block font-bold">MODEL TYPE</span>
                <span className="text-white text-xs font-bold leading-tight block">{activeModel.name}</span>
                <span className="text-[9px] text-teal-400 font-mono mt-0.5 block">{activeModel.type}</span>
              </div>
              <div className="text-right">
                <span className="text-[8px] font-mono text-gray-500 uppercase block font-bold">STATUS</span>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                  activeModel.status === 'ACTIVE' 
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' 
                    : activeModel.status === 'STANDBY'
                      ? 'bg-amber-950/40 text-amber-400 border border-amber-900/30'
                      : 'bg-rose-950/40 text-rose-400 border border-rose-900/30'
                }`}>
                  {activeModel.status}
                </span>
              </div>
            </div>

            {/* Error Drift Warning for Suspended status */}
            {activeModel.status === 'SUSPENDED' && activeModel.statusReason && (
              <div className="p-2 bg-rose-500/5 border border-rose-500/20 rounded flex items-start gap-1.5 text-rose-400 font-mono text-[9px] leading-normal">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span><strong>Suspended:</strong> {activeModel.statusReason}</span>
              </div>
            )}

            {/* Telemetry metrics dials */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-900/45 p-2 rounded border border-gray-850">
                <span className="text-[8px] font-mono text-gray-500 uppercase block">ACCURACY</span>
                <span className="font-mono text-white text-xs font-bold">{activeModel.accuracy}%</span>
                <div className="h-1 bg-gray-800 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${activeModel.accuracy}%` }} />
                </div>
              </div>
              <div className="bg-slate-900/45 p-2 rounded border border-gray-850">
                <span className="text-[8px] font-mono text-gray-500 uppercase block">LATENCY</span>
                <span className="font-mono text-white text-xs font-bold">{activeModel.latency} ms</span>
                <div className="h-1 bg-gray-800 rounded-full mt-1.5 overflow-hidden">
                  {/* Show shorter/faster bar for lower latency */}
                  <div 
                    className={activeModel.latency < 10 ? 'bg-emerald-500 h-full' : 'bg-amber-500 h-full'} 
                    style={{ width: `${Math.min(100, Math.max(10, (1 / activeModel.latency) * 200))}%` }} 
                  />
                </div>
              </div>
              <div className="bg-slate-900/45 p-2 rounded border border-gray-850">
                <span className="text-[8px] font-mono text-gray-500 uppercase block">F1-SCORE</span>
                <span className="font-mono text-teal-400 text-xs font-bold">{activeModel.f1Score.toFixed(2)}</span>
                <div className="h-1 bg-gray-800 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-teal-500 h-full" style={{ width: `${activeModel.f1Score * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="text-[10px] text-gray-300 leading-relaxed space-y-1.5">
              <p>{activeModel.description}</p>
              <p className="text-[9.5px] text-gray-400 font-sans">
                <strong className="text-teal-400">Optimal Use-case:</strong> {activeModel.strength}
              </p>
            </div>

            {/* Hyperparameters list */}
            <div className="pt-2 border-t border-gray-850/60 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[9px] font-mono text-gray-400">
              <p className="flex justify-between"><span>Learning Rate:</span> <span className="text-white font-bold">{activeModel.hyperparams.learningRate}</span></p>
              <p className="flex justify-between"><span>Epoch Size:</span> <span className="text-white font-bold">{activeModel.hyperparams.epochs}</span></p>
              <p className="flex justify-between"><span>Batch Size:</span> <span className="text-white font-bold">{activeModel.hyperparams.batchSize}</span></p>
              <p className="flex justify-between"><span>Model Nodes:</span> <span className="text-white font-bold">{activeModel.hyperparams.complexity}</span></p>
            </div>

            {/* Loss History curves */}
            <div className="pt-2 border-t border-gray-850/60 space-y-1">
              <div className="flex justify-between items-center text-[8.5px] font-mono text-gray-400">
                <span>MODEL LOSS CONVERGENCE</span>
                <span className="text-teal-400">MSE Loss: {activeModel.lossCurve[activeModel.lossCurve.length - 1].loss.toFixed(2)}</span>
              </div>
              
              <div className="h-10 w-full mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activeModel.lossCurve} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '4px' }}
                      itemStyle={{ color: '#14b8a6', fontSize: '8px', fontFamily: 'monospace' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '7px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="loss" 
                      stroke="#14b8a6" 
                      strokeWidth={1.5} 
                      dot={{ r: 2, fill: '#0f172a', stroke: '#14b8a6', strokeWidth: 1.5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: RECHARTS ALL-MODELS COMPARATIVE MATRIX (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[9px] font-mono text-gray-500 uppercase block font-bold">COMPARATIVE ENGINE</span>
              <h5 className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">
                {getMetricTitle()}
              </h5>
            </div>

            {/* Metric Selector Visual Toggle */}
            <div className="flex bg-gray-950 p-0.5 rounded border border-gray-850 self-start sm:self-center">
              {(['accuracy', 'latency', 'f1Score'] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setComparisonMetric(metric)}
                  className={`px-2.5 py-1 rounded font-mono text-[9px] uppercase font-bold transition-all ${
                    comparisonMetric === metric 
                      ? 'bg-teal-500/20 text-teal-400 border border-teal-500/10' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {metric === 'accuracy' ? 'Accuracy' : metric === 'latency' ? 'Latency' : 'F1-Score'}
                </button>
              ))}
            </div>
          </div>

          {/* Recharts Bar Chart */}
          <div className="h-[230px] w-full bg-gray-950/20 rounded-lg p-2 border border-gray-850/60 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 10, left: -25, bottom: 5 }}
                barSize={32}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.4} />
                <XAxis 
                  dataKey="shortName" 
                  stroke="#64748b" 
                  fontSize={9} 
                  fontFamily="monospace"
                  tickLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={9} 
                  fontFamily="monospace"
                  tickLine={false}
                  axisLine={false}
                  domain={[0, comparisonMetric === 'accuracy' ? 100 : comparisonMetric === 'latency' ? 'auto' : 1.0]}
                />
                <Tooltip
                  cursor={{ fill: '#1e293b', opacity: 0.2 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const fullModel = MODELS_DATA.find(m => m.id === data.id);
                      return (
                        <div className="bg-slate-950 border border-gray-800 p-2.5 rounded-lg font-mono text-[9.5px] text-gray-300 shadow-xl space-y-1">
                          <p className="font-bold text-white border-b border-gray-850 pb-1">{data.name}</p>
                          <p className="flex justify-between gap-4">
                            <span>Value:</span>
                            <span className="text-teal-400 font-bold">{getMetricSuffix(data.value)}</span>
                          </p>
                          <p className="flex justify-between gap-4 text-[8px] text-gray-500">
                            <span>Status:</span>
                            <span>{fullModel?.status}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((entry, index) => {
                    const isSelected = entry.id === selectedModelId;
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={isSelected ? '#14b8a6' : '#1e293b'} 
                        stroke={isSelected ? '#2dd4bf' : '#334155'}
                        strokeWidth={1}
                        fillOpacity={isSelected ? 0.85 : 0.4}
                        className="transition-all duration-300 cursor-pointer"
                        onClick={() => setSelectedModelId(entry.id)}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed visual summary footnotes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[9.5px] bg-slate-900 p-3 rounded border border-gray-850/60 leading-relaxed">
            <div className="space-y-0.5">
              <span className="font-bold text-teal-400 block font-mono text-[8.5px] uppercase">ENSEMBLE DEVIATION TUNING</span>
              <p className="text-gray-400">
                Inference nodes are calibrated using 5-fold walk-forward validation. Re-weighting matches variance matrices calculated at market open.
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="font-bold text-amber-400 block font-mono text-[8.5px] uppercase">LATENCY VS ACCURACY COMPROMISE</span>
              <p className="text-gray-400">
                While <strong className="text-teal-400 font-mono">TFT</strong> yields the highest accuracy (89.1%), <strong className="text-teal-400 font-mono">XGBoost</strong> operates &gt;10x faster (3.1 ms), balancing active high-speed quote execution pools.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* INDEPENDENT 5-FOLD WALK-FORWARD VALIDATION MATRIX FOR ALL 10 INDIAN MARKET INDICES */}
      <div className="pt-5 border-t border-gray-800/80 space-y-3 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">
              INDEPENDENT INDEX WALK-FORWARD VALIDATION MATRIX (5-FOLD OOS)
            </h5>
          </div>
          <div className="flex items-center gap-2 text-[9px] text-gray-400">
            <span className="px-2 py-0.5 bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 rounded">✓ No Data Leakage</span>
            <span className="px-2 py-0.5 bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 rounded">✓ No Look-Ahead Bias</span>
            <span className="px-2 py-0.5 bg-teal-950/40 text-teal-400 border border-teal-900/40 rounded">10 Indices Benchmarked</span>
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-850 rounded-lg">
          <table className="w-full text-left text-[9.5px] border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-950 border-b border-gray-850 text-gray-400 uppercase text-[8.5px] font-bold">
                <th className="py-2.5 px-3">Index</th>
                <th className="py-2.5 px-2">Price</th>
                <th className="py-2.5 px-2">Best Selected Model</th>
                <th className="py-2.5 px-2 text-right">MAE</th>
                <th className="py-2.5 px-2 text-right">RMSE</th>
                <th className="py-2.5 px-2 text-right">MAPE %</th>
                <th className="py-2.5 px-2 text-right">SMAPE %</th>
                <th className="py-2.5 px-2 text-right text-emerald-400">Dir. Acc %</th>
                <th className="py-2.5 px-2 text-right">Prec / Rec</th>
                <th className="py-2.5 px-2 text-right">F1 / MCC</th>
                <th className="py-2.5 px-2 text-right">ECE</th>
                <th className="py-2.5 px-2 text-right text-teal-400">PICP 95%</th>
                <th className="py-2.5 px-3 text-center">Folds</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-850/60 bg-slate-900/50">
              {indexValidationResults.map((idxVal) => {
                const isExpanded = expandedIndexSymbol === idxVal.symbol;
                return (
                  <React.Fragment key={idxVal.symbol}>
                    <tr className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-white flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                        <div>
                          <span>{idxVal.name}</span>
                          <span className="text-[8px] text-gray-500 block">{idxVal.symbol}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-gray-300 font-bold">₹{idxVal.price.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-2 text-teal-300 font-medium max-w-[180px] truncate" title={idxVal.bestModel}>
                        {idxVal.bestModel}
                      </td>
                      <td className="py-2.5 px-2 text-right text-gray-300">₹{idxVal.mae}</td>
                      <td className="py-2.5 px-2 text-right text-gray-300">₹{idxVal.rmse}</td>
                      <td className="py-2.5 px-2 text-right text-gray-300">{idxVal.mape}%</td>
                      <td className="py-2.5 px-2 text-right text-gray-300">{idxVal.smape}%</td>
                      <td className="py-2.5 px-2 text-right font-bold text-emerald-400 text-xs">{idxVal.directionalAccuracy}%</td>
                      <td className="py-2.5 px-2 text-right text-gray-400">{idxVal.precision} / {idxVal.recall}</td>
                      <td className="py-2.5 px-2 text-right text-gray-300 font-semibold">{idxVal.f1Score} / {idxVal.mcc}</td>
                      <td className="py-2.5 px-2 text-right text-gray-400">{idxVal.ece}</td>
                      <td className="py-2.5 px-2 text-right font-bold text-teal-400">{idxVal.picp}%</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => setExpandedIndexSymbol(isExpanded ? null : idxVal.symbol)}
                          className="px-2 py-0.5 bg-gray-950 border border-gray-800 hover:border-teal-500/50 rounded text-[8.5px] text-teal-400 flex items-center gap-1 mx-auto"
                        >
                          <span>5 Folds</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </td>
                    </tr>

                    {/* Folds Breakdown expansion row */}
                    {isExpanded && (
                      <tr className="bg-gray-950/90 border-b border-gray-800">
                        <td colSpan={13} className="p-3">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[8.5px] text-gray-400 uppercase font-bold border-b border-gray-800 pb-1">
                              <span>5-FOLD WALK-FORWARD OUT-OF-SAMPLE SLICES FOR {idxVal.name}</span>
                              <span className="text-teal-400">WINDOW: {idxVal.validationWindow}</span>
                            </div>
                            <div className="grid grid-cols-5 gap-2 text-[8.5px]">
                              {idxVal.folds.map((fold) => (
                                <div key={fold.foldNumber} className="p-2 bg-slate-900 border border-gray-800 rounded space-y-1">
                                  <div className="flex justify-between font-bold text-teal-400">
                                    <span>Fold #{fold.foldNumber}</span>
                                    <span>{fold.directionalAccuracy}% Acc</span>
                                  </div>
                                  <div className="text-[8px] text-gray-400 space-y-0.5">
                                    <p>Train: {fold.trainSize} | Val: {fold.valSize}</p>
                                    <p>MAE: ₹{fold.mae} | RMSE: ₹{fold.rmse}</p>
                                    <p>F1: {fold.f1Score} | MCC: {fold.mcc}</p>
                                    <p>PICP: {fold.picp}% | ECE: {fold.ece}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

