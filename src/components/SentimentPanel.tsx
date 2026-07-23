import { useState } from 'react';
import { 
  HeartHandshake, 
  ThumbsUp, 
  ThumbsDown, 
  TrendingUp, 
  Globe, 
  MessageCircle, 
  Info,
  Loader2
} from 'lucide-react';
import { NewsArticle, SocialSentiment } from '../types.js';

interface SentimentPanelProps {
  symbol: string;
  newsData: { articles: NewsArticle[]; averageScore: number } | null;
  socialData: SocialSentiment[] | null;
}

export default function SentimentPanel({ symbol, newsData, socialData }: SentimentPanelProps) {
  const [activeTab, setActiveTab] = useState<'news' | 'social'>('news');

  if (!newsData || !socialData) {
    return (
      <div className="flex-1 bg-slate-900 border border-gray-800/80 rounded-lg p-8 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
        <span className="text-sm font-mono text-gray-400">Performing natural language sentiment scans...</span>
      </div>
    );
  }

  const getSentimentTag = (sent: 'positive' | 'negative' | 'neutral') => {
    if (sent === 'positive') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (sent === 'negative') return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
    return 'bg-gray-800 text-gray-400 border border-gray-700/60';
  };

  const getSentimentIcon = (score: number) => {
    if (score > 0.2) return <ThumbsUp className="w-4 h-4 text-emerald-500" />;
    if (score < -0.2) return <ThumbsDown className="w-4 h-4 text-rose-500" />;
    return <Globe className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="flex-1 bg-slate-900 border border-gray-800/80 rounded-lg overflow-hidden flex flex-col glass-panel select-none">
      
      {/* Header Banner */}
      <div className="p-6 border-b border-gray-800/60 bg-slate-950/40 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Sentiment & Social NLP Index</h3>
            <p className="text-xs text-gray-400 font-mono mt-0.5">Scraping financial print and retail social discussions for {symbol}</p>
          </div>
        </div>

        {/* Global Average sentiment score indicator */}
        <div className="bg-gray-950 p-3 rounded border border-gray-800 flex items-center gap-3">
          <div className="text-right">
            <span className="text-[9px] font-bold text-gray-500 uppercase block">AGGREGATE SENTIMENT</span>
            <span className="text-xs font-mono font-bold text-white">
              {newsData.averageScore > 0.2 ? 'BULLISH' : newsData.averageScore < -0.2 ? 'BEARISH' : 'NEUTRAL'}
            </span>
          </div>
          <div className={`text-xl font-mono font-extrabold px-2 py-0.5 rounded ${
            newsData.averageScore > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
          }`}>
            {(newsData.averageScore * 100).toFixed(0)}
          </div>
        </div>
      </div>

      {/* Tabs selectors */}
      <div className="flex border-b border-gray-800/60 bg-slate-950/20">
        {(['news', 'social'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-xs font-bold uppercase transition-all border-b-2 ${
              activeTab === tab 
                ? 'border-teal-500 text-teal-400 bg-slate-900/10' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'news' ? 'Financial Press Headlines (NLP)' : 'Social Media Buzz (Reddit, Twitter/X)'}
          </button>
        ))}
      </div>

      <div className="p-6 flex-1">
        
        {activeTab === 'news' && (
          <div className="space-y-4">
            <div className="flex items-center gap-1 bg-teal-500/5 px-3 py-2 rounded border border-teal-500/10 text-[10px] text-teal-400">
              <Info className="w-3.5 h-3.5" />
              Our NLP pipeline summarizes financial reporting and assigns scores from -100 (extreme negative) to +100 (extreme positive).
            </div>

            <div className="space-y-3">
              {newsData.articles.map((art, idx) => (
                <div 
                  key={`${art.title}-${idx}`}
                  className="p-4 rounded-lg bg-gray-950/40 border border-gray-800/60 flex items-start justify-between gap-4 hover:border-gray-800 transition-all"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono bg-gray-800 text-gray-300 px-2 py-0.5 rounded font-semibold">
                        {art.source}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {art.time}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${getSentimentTag(art.sentiment)}`}>
                        {art.sentiment} ({art.score > 0 ? '+' : ''}{(art.score * 100).toFixed(0)})
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-gray-100 hover:text-teal-400 leading-snug">
                      <a href={art.url} target="_blank" rel="noopener noreferrer">{art.title}</a>
                    </h4>
                    
                    <p className="text-[11px] text-gray-400 leading-normal bg-gray-900/40 p-2.5 rounded border border-gray-900">
                      {art.summary}
                    </p>
                  </div>

                  <div className="p-2 rounded bg-gray-950 border border-gray-850">
                    {getSentimentIcon(art.score)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socialData.map((soc) => (
              <div 
                key={soc.platform}
                className="p-5 rounded-lg bg-gray-950/40 border border-gray-800/60 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                        <MessageCircle className="w-3.5 h-3.5 text-teal-400" />
                      </div>
                      <span className="text-xs font-bold text-white">{soc.platform}</span>
                    </div>
                    <span className="font-mono text-[10px] text-gray-500">
                      Mentions: {soc.mentionsCount.toLocaleString()}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    {soc.summary}
                  </p>
                </div>

                {/* Bullish vs Bearish gauge metrics */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-emerald-500 font-bold">BULLISH {soc.bullishPercent}%</span>
                    <span className="text-rose-500 font-bold">BEARISH {soc.bearishPercent}%</span>
                  </div>
                  {/* Gauge bar */}
                  <div className="h-2 w-full bg-rose-500 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-emerald-500 rounded-l" 
                      style={{ width: `${soc.bullishPercent}%` }}
                    />
                  </div>
                  {/* Trending Keywords tags */}
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {soc.trendingKeywords.map(kw => (
                      <span 
                        key={kw} 
                        className="text-[9px] font-mono bg-gray-900 text-teal-400 px-1.5 py-0.5 rounded border border-gray-800"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
