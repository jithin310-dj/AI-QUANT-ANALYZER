import { 
  LayoutDashboard, 
  CandlestickChart, 
  Cpu, 
  HeartHandshake, 
  Filter, 
  Briefcase, 
  MessageSquareCode, 
  BellRing, 
  ShieldAlert,
  Globe,
  Sun,
  Moon
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, theme = 'dark', onToggleTheme }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Quant Dashboard', icon: LayoutDashboard },
    { id: 'indices', label: 'Market Indices', icon: Globe },
    { id: 'charts', label: 'Trading Charts', icon: CandlestickChart },
    { id: 'predictions', label: 'AI predictions', icon: Cpu },
    { id: 'sentiment', label: 'Sentiment Index', icon: HeartHandshake },
    { id: 'screener', label: 'Stock Screener', icon: Filter },
    { id: 'portfolio', label: 'My Portfolio', icon: Briefcase },
    { id: 'chat', label: 'AI Quant Chat', icon: MessageSquareCode },
    { id: 'alerts', label: 'Price Alerts', icon: BellRing },
    { id: 'admin', label: 'Admin Hub', icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-gray-800/80 flex flex-col justify-between select-none">
      <div className="py-4">
        <div className="px-4 mb-4">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block px-2">Navigation</span>
        </div>

        <nav className="space-y-1 px-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-teal-500/10 text-teal-400 border-l-2 border-teal-500' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
                }`}
              >
                <IconComponent className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-800/40 font-mono text-[10px] text-gray-500 space-y-2">
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded border border-gray-800 bg-gray-950/40 text-gray-300 hover:text-white hover:border-teal-500/30 transition-all font-sans text-xs cursor-pointer"
          >
            <span className="flex items-center gap-2">
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
              <span>{theme === 'dark' ? 'Daylight Mode' : 'Dark Mode'}</span>
            </span>
            <span className="text-[9px] font-mono text-teal-400 uppercase font-bold">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        )}
        <div>ENVIRONMENT: SANDBOX</div>
        <div>MODEL: GEMINI-3.5-FLASH</div>
      </div>
    </aside>
  );
}
