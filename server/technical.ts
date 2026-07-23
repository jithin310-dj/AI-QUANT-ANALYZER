import { PriceBar } from '../src/types.js';

// Simple Moving Average
export function calculateSMA(prices: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      sma.push(prices[i]); // Fallback or pad
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += prices[i - j];
      }
      sma.push(sum / period);
    }
  }
  return sma;
}

// Exponential Moving Average
export function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = [];
  if (prices.length === 0) return ema;
  const k = 2 / (period + 1);
  let prevEma = prices[0];
  ema.push(prevEma);

  for (let i = 1; i < prices.length; i++) {
    const currentEma = prices[i] * k + prevEma * (1 - k);
    ema.push(currentEma);
    prevEma = currentEma;
  }
  return ema;
}

// Volume Weighted Average Price
export function calculateVWAP(bars: PriceBar[]): number[] {
  const vwap: number[] = [];
  let cumulativeTypicalPriceVolume = 0;
  let cumulativeVolume = 0;

  for (let i = 0; i < bars.length; i++) {
    const bar = bars[i];
    const typicalPrice = (bar.high + bar.low + bar.close) / 3;
    cumulativeTypicalPriceVolume += typicalPrice * bar.volume;
    cumulativeVolume += bar.volume || 1;
    vwap.push(cumulativeTypicalPriceVolume / cumulativeVolume);
  }
  return vwap;
}

// Relative Strength Index
export function calculateRSI(prices: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  if (prices.length === 0) return rsi;

  let gains = 0;
  let losses = 0;

  // First value
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = 0; i < prices.length; i++) {
    if (i < period) {
      rsi.push(50); // Initial placeholder
    } else {
      const diff = prices[i] - prices[i - 1];
      let gain = diff > 0 ? diff : 0;
      let loss = diff < 0 ? -diff : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;

      if (avgLoss === 0) {
        rsi.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsi.push(100 - 100 / (1 + rs));
      }
    }
  }
  return rsi;
}

// MACD (Moving Average Convergence Divergence)
export function calculateMACD(prices: number[]): { macdLine: number[]; signalLine: number[]; histogram: number[] } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    macdLine.push(ema12[i] - ema26[i]);
  }

  const signalLine = calculateEMA(macdLine, 9);
  const histogram: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    histogram.push(macdLine[i] - signalLine[i]);
  }

  return { macdLine, signalLine, histogram };
}

// Bollinger Bands
export function calculateBollingerBands(prices: number[], period: number = 20, multiplier: number = 2): { upper: number[]; lower: number[]; middle: number[] } {
  const middle = calculateSMA(prices, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      upper.push(prices[i]);
      lower.push(prices[i]);
    } else {
      let varianceSum = 0;
      const avg = middle[i];
      for (let j = 0; j < period; j++) {
        varianceSum += Math.pow(prices[i - j] - avg, 2);
      }
      const stdDev = Math.sqrt(varianceSum / period);
      upper.push(avg + multiplier * stdDev);
      lower.push(avg - multiplier * stdDev);
    }
  }

  return { upper, lower, middle };
}

// Average True Range (ATR)
export function calculateATR(bars: PriceBar[], period: number = 14): number[] {
  const atr: number[] = [];
  if (bars.length === 0) return atr;

  const trueRanges: number[] = [];
  trueRanges.push(bars[0].high - bars[0].low);

  for (let i = 1; i < bars.length; i++) {
    const high = bars[i].high;
    const low = bars[i].low;
    const prevClose = bars[i - 1].close;
    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trueRanges.push(tr);
  }

  let currentAtr = trueRanges.slice(0, period).reduce((sum, val) => sum + val, 0) / period;
  for (let i = 0; i < bars.length; i++) {
    if (i < period) {
      atr.push(trueRanges[i]);
    } else {
      currentAtr = (currentAtr * (period - 1) + trueRanges[i]) / period;
      atr.push(currentAtr);
    }
  }
  return atr;
}

// Average Directional Index (ADX)
export function calculateADX(bars: PriceBar[], period: number = 14): number[] {
  const adx: number[] = [];
  if (bars.length < period * 2) {
    return Array(bars.length).fill(25);
  }

  const tr: number[] = [];
  const plusDM: number[] = [];
  const minusDM: number[] = [];

  for (let i = 1; i < bars.length; i++) {
    const hDiff = bars[i].high - bars[i - 1].high;
    const lDiff = bars[i - 1].low - bars[i].low;

    tr.push(Math.max(
      bars[i].high - bars[i].low,
      Math.abs(bars[i].high - bars[i - 1].close),
      Math.abs(bars[i].low - bars[i - 1].close)
    ));

    plusDM.push(hDiff > lDiff && hDiff > 0 ? hDiff : 0);
    minusDM.push(lDiff > hDiff && lDiff > 0 ? lDiff : 0);
  }

  // Smooth
  const smoothTR: number[] = [tr.slice(0, period).reduce((a, b) => a + b, 0)];
  const smoothPlusDM: number[] = [plusDM.slice(0, period).reduce((a, b) => a + b, 0)];
  const smoothMinusDM: number[] = [minusDM.slice(0, period).reduce((a, b) => a + b, 0)];

  for (let i = period; i < bars.length - 1; i++) {
    smoothTR.push(smoothTR[smoothTR.length - 1] - (smoothTR[smoothTR.length - 1] / period) + tr[i]);
    smoothPlusDM.push(smoothPlusDM[smoothPlusDM.length - 1] - (smoothPlusDM[smoothPlusDM.length - 1] / period) + plusDM[i]);
    smoothMinusDM.push(smoothMinusDM[smoothMinusDM.length - 1] - (smoothMinusDM[smoothMinusDM.length - 1] / period) + minusDM[i]);
  }

  const dx: number[] = [];
  for (let i = 0; i < smoothTR.length; i++) {
    const plusDI = (smoothPlusDM[i] / smoothTR[i]) * 100;
    const minusDI = (smoothMinusDM[i] / smoothTR[i]) * 100;
    const sum = plusDI + minusDI;
    const diff = Math.abs(plusDI - minusDI);
    dx.push(sum === 0 ? 0 : (diff / sum) * 100);
  }

  let adxVal = dx.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = 0; i < bars.length; i++) {
    if (i < period * 2) {
      adx.push(25);
    } else {
      const idx = i - period;
      if (idx < dx.length) {
        adxVal = (adxVal * (period - 1) + dx[idx]) / period;
        adx.push(adxVal);
      } else {
        adx.push(adxVal);
      }
    }
  }
  return adx;
}

// SuperTrend
export function calculateSuperTrend(bars: PriceBar[], period: number = 10, multiplier: number = 3): { values: number[]; directions: ('up' | 'down')[] } {
  const atr = calculateATR(bars, period);
  const values: number[] = [];
  const directions: ('up' | 'down')[] = [];

  let prevClose = bars[0].close;
  let prevUpperBand = bars[0].high;
  let prevLowerBand = bars[0].low;
  let isUp = true;

  for (let i = 0; i < bars.length; i++) {
    const bar = bars[i];
    const typicalPrice = (bar.high + bar.low) / 2;
    const currentAtr = atr[i] || 1;

    let upperBand = typicalPrice + multiplier * currentAtr;
    let lowerBand = typicalPrice - multiplier * currentAtr;

    if (i > 0) {
      upperBand = (upperBand < prevUpperBand || bars[i - 1].close > prevUpperBand) ? upperBand : prevUpperBand;
      lowerBand = (lowerBand > prevLowerBand || bars[i - 1].close < prevLowerBand) ? lowerBand : prevLowerBand;
    }

    if (i > 0) {
      if (isUp && bar.close < lowerBand) {
        isUp = false;
      } else if (!isUp && bar.close > upperBand) {
        isUp = true;
      }
    }

    const value = isUp ? lowerBand : upperBand;
    values.push(value);
    directions.push(isUp ? 'up' : 'down');

    prevUpperBand = upperBand;
    prevLowerBand = lowerBand;
    prevClose = bar.close;
  }

  return { values, directions };
}

// On-Balance Volume (OBV)
export function calculateOBV(bars: PriceBar[]): number[] {
  const obv: number[] = [];
  if (bars.length === 0) return obv;

  let currentObv = bars[0].volume;
  obv.push(currentObv);

  for (let i = 1; i < bars.length; i++) {
    if (bars[i].close > bars[i - 1].close) {
      currentObv += bars[i].volume;
    } else if (bars[i].close < bars[i - 1].close) {
      currentObv -= bars[i].volume;
    }
    obv.push(currentObv);
  }
  return obv;
}

// Stochastic RSI
export function calculateStochasticRSI(prices: number[], period: number = 14): { k: number[]; d: number[] } {
  const rsi = calculateRSI(prices, period);
  const stochRsi: number[] = [];

  for (let i = 0; i < rsi.length; i++) {
    if (i < period - 1) {
      stochRsi.push(50);
    } else {
      let minRsi = rsi[i];
      let maxRsi = rsi[i];
      for (let j = 0; j < period; j++) {
        const val = rsi[i - j];
        if (val < minRsi) minRsi = val;
        if (val > maxRsi) maxRsi = val;
      }
      const denom = maxRsi - minRsi;
      if (denom === 0) {
        stochRsi.push(100);
      } else {
        stochRsi.push((rsi[i] - minRsi) / denom * 100);
      }
    }
  }

  const k = calculateSMA(stochRsi, 3);
  const d = calculateSMA(k, 3);

  return { k, d };
}

// Commodity Channel Index (CCI)
export function calculateCCI(bars: PriceBar[], period: number = 20): number[] {
  const cci: number[] = [];
  const tp: number[] = bars.map(b => (b.high + b.low + b.close) / 3);
  const tpSMA = calculateSMA(tp, period);

  for (let i = 0; i < bars.length; i++) {
    if (i < period - 1) {
      cci.push(0);
    } else {
      let meanDeviationSum = 0;
      const smaVal = tpSMA[i];
      for (let j = 0; j < period; j++) {
        meanDeviationSum += Math.abs(tp[i - j] - smaVal);
      }
      const meanDeviation = meanDeviationSum / period;
      if (meanDeviation === 0) {
        cci.push(0);
      } else {
        cci.push((tp[i] - smaVal) / (0.015 * meanDeviation));
      }
    }
  }
  return cci;
}

// Ichimoku Cloud
export function calculateIchimoku(bars: PriceBar[]): { tenkanSen: number[]; kijunSen: number[]; senkouSpanA: number[]; senkouSpanB: number[]; chikouSpan: number[] } {
  const tenkanSen: number[] = [];
  const kijunSen: number[] = [];
  const senkouSpanA: number[] = [];
  const senkouSpanB: number[] = [];
  const chikouSpan: number[] = [];

  const getHighLowMid = (barsSlice: PriceBar[]) => {
    let high = -Infinity;
    let low = Infinity;
    for (const b of barsSlice) {
      if (b.high > high) high = b.high;
      if (b.low < low) low = b.low;
    }
    return (high + low) / 2;
  };

  for (let i = 0; i < bars.length; i++) {
    // Tenkan-sen (9 Period)
    if (i >= 8) {
      tenkanSen.push(getHighLowMid(bars.slice(i - 8, i + 1)));
    } else {
      tenkanSen.push((bars[i].high + bars[i].low) / 2);
    }

    // Kijun-sen (26 Period)
    if (i >= 25) {
      kijunSen.push(getHighLowMid(bars.slice(i - 25, i + 1)));
    } else {
      kijunSen.push((bars[i].high + bars[i].low) / 2);
    }

    // Chikou Span (26 Period Lagged)
    if (i + 26 < bars.length) {
      chikouSpan.push(bars[i + 26].close);
    } else {
      chikouSpan.push(bars[i].close);
    }
  }

  // Senkou Span A & B (projected 26 periods ahead)
  for (let i = 0; i < bars.length; i++) {
    const sa = (tenkanSen[i] + kijunSen[i]) / 2;
    let sb = bars[i].close;

    if (i >= 51) {
      sb = getHighLowMid(bars.slice(i - 51, i + 1));
    }

    senkouSpanA.push(sa);
    senkouSpanB.push(sb);
  }

  return { tenkanSen, kijunSen, senkouSpanA, senkouSpanB, chikouSpan };
}

// Parabolic SAR
export function calculateParabolicSAR(bars: PriceBar[], step: number = 0.02, maxStep: number = 0.2): number[] {
  const sar: number[] = [];
  if (bars.length === 0) return sar;

  let currentSar = bars[0].low;
  let isLong = true;
  let ep = bars[0].high;
  let af = step;

  sar.push(currentSar);

  for (let i = 1; i < bars.length; i++) {
    const bar = bars[i];
    let nextSar = currentSar + af * (ep - currentSar);

    if (isLong) {
      if (bar.low < nextSar) {
        isLong = false;
        nextSar = ep; // Reverse
        ep = bar.low;
        af = step;
      } else {
        if (bar.high > ep) {
          ep = bar.high;
          af = Math.min(af + step, maxStep);
        }
      }
    } else {
      if (bar.high > nextSar) {
        isLong = true;
        nextSar = ep; // Reverse
        ep = bar.high;
        af = step;
      } else {
        if (bar.low < ep) {
          ep = bar.low;
          af = Math.min(af + step, maxStep);
        }
      }
    }

    sar.push(nextSar);
    currentSar = nextSar;
  }

  return sar;
}

// Pivot Points (Standard Daily / Bar based)
export function calculatePivotPoints(bars: PriceBar[]): { pivot: number[]; r1: number[]; s1: number[]; r2: number[]; s2: number[] } {
  const pivot: number[] = [];
  const r1: number[] = [];
  const s1: number[] = [];
  const r2: number[] = [];
  const s2: number[] = [];

  for (let i = 0; i < bars.length; i++) {
    const refBar = i > 0 ? bars[i - 1] : bars[i];
    const pp = (refBar.high + refBar.low + refBar.close) / 3;
    pivot.push(pp);
    r1.push(2 * pp - refBar.low);
    s1.push(2 * pp - refBar.high);
    r2.push(pp + (refBar.high - refBar.low));
    s2.push(pp - (refBar.high - refBar.low));
  }

  return { pivot, r1, s1, r2, s2 };
}

// Donchian Channel
export function calculateDonchianChannel(bars: PriceBar[], period: number = 20): { upper: number[]; lower: number[]; middle: number[] } {
  const upper: number[] = [];
  const lower: number[] = [];
  const middle: number[] = [];

  for (let i = 0; i < bars.length; i++) {
    if (i < period - 1) {
      upper.push(bars[i].high);
      lower.push(bars[i].low);
      middle.push((bars[i].high + bars[i].low) / 2);
    } else {
      let maxHigh = -Infinity;
      let minLow = Infinity;
      for (let j = 0; j < period; j++) {
        const b = bars[i - j];
        if (b.high > maxHigh) maxHigh = b.high;
        if (b.low < minLow) minLow = b.low;
      }
      upper.push(maxHigh);
      lower.push(minLow);
      middle.push((maxHigh + minLow) / 2);
    }
  }

  return { upper, lower, middle };
}

// Keltner Channel
export function calculateKeltnerChannel(bars: PriceBar[], period: number = 20, multiplier: number = 1.5): { upper: number[]; lower: number[]; middle: number[] } {
  const prices = bars.map(b => b.close);
  const middle = calculateEMA(prices, period);
  const atr = calculateATR(bars, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < bars.length; i++) {
    const bandMultiplier = atr[i] * multiplier;
    upper.push(middle[i] + bandMultiplier);
    lower.push(middle[i] - bandMultiplier);
  }

  return { upper, lower, middle };
}

// Main function to augment bars with all Technical Indicators
export function enrichWithIndicators(bars: PriceBar[]): PriceBar[] {
  if (bars.length === 0) return bars;

  const prices = bars.map(b => b.close);
  const sma20 = calculateSMA(prices, 20);
  const ema50 = calculateEMA(prices, 50);
  const vwap = calculateVWAP(bars);
  const rsi = calculateRSI(prices, 14);
  const macd = calculateMACD(prices);
  const bb = calculateBollingerBands(prices, 20, 2);
  const atr = calculateATR(bars, 14);
  const adx = calculateADX(bars, 14);
  const supertrend = calculateSuperTrend(bars, 10, 3);

  return bars.map((bar, i) => ({
    ...bar,
    indicators: {
      sma20: sma20[i],
      ema50: ema50[i],
      vwap: vwap[i],
      rsi: rsi[i],
      macdLine: macd.macdLine[i],
      macdSignal: macd.signalLine[i],
      macdHist: macd.histogram[i],
      bbUpper: bb.upper[i],
      bbLower: bb.lower[i],
      bbMiddle: bb.middle[i],
      atr: atr[i],
      adx: adx[i],
      supertrend: supertrend.values[i],
      supertrendDir: supertrend.directions[i],
    }
  }));
}
