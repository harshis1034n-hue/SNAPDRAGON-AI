import React from 'react';
import { Shield, Cpu, Activity, History, Settings, Eye, Sliders, Play, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  privacyScore: number;
  onLaunchDemo: () => void;
  isNpuAccelerated?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  privacyScore,
  onLaunchDemo,
  isNpuAccelerated = false,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'scan', label: 'Scan Screen', icon: Eye },
    { id: 'results', label: 'Privacy Results', icon: Shield },
    { id: 'safeshare', label: 'Safe Share', icon: Sliders },
    { id: 'history', label: 'Scan History', icon: History },
    { id: 'snapdragon', label: 'Snapdragon AI', icon: Cpu },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Subtitle */}
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center shadow-lg shadow-rose-600/30 ring-1 ring-rose-400/50">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white font-mono">Snapdragon<span className="text-rose-500">AI</span> <span className="text-[11px] font-sans font-semibold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 ml-1">DEMO</span></span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
                  Protection Active
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">On-Device Privacy Firewall for Snapdragon AI PCs</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Metrics & Demo Launcher */}
          <div className="flex items-center gap-3">
            {/* Live Privacy Score Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400 font-mono text-[11px]">Score:</span>
              <span className={`font-bold font-mono ${
                privacyScore >= 80 ? 'text-emerald-400' : privacyScore >= 50 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {privacyScore}/100
              </span>
            </div>

            {/* Zero-cloud lock tag */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400">
              <span className="text-emerald-400">🔒</span>
              <span>0 B Egress</span>
            </div>

            {/* Try Demo CTA */}
            <button
              onClick={onLaunchDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Try Demo</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
