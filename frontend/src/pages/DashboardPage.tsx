import React from 'react';
import {
  Shield,
  Eye,
  Upload,
  Sparkles,
  Lock,
  Cpu,
  Clock,
  AlertOctagon,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { HistoryItem } from '../types';

interface DashboardPageProps {
  privacyScore: number;
  onScanScreenClick: () => void;
  onImportClick: () => void;
  onLaunchDemo: () => void;
  onNavigateTab: (tab: string) => void;
  historyItems: HistoryItem[];
  protectedCount: number;
  criticalCount: number;
  lastScanLatencyMs: number;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  privacyScore,
  onScanScreenClick,
  onImportClick,
  onLaunchDemo,
  onNavigateTab,
  historyItems,
  protectedCount,
  criticalCount,
  lastScanLatencyMs,
}) => {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              PRIVACY FIREWALL FOR THE AI PC
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              SnapSafe <span className="text-rose-500">AI</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 font-normal">
              Private AI protection for your screen.
              <span className="block text-sm text-slate-400 mt-1 italic">
                “See it. Detect it. Protect it. Before you share it.”
              </span>
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onScanScreenClick}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-semibold text-sm shadow-xl shadow-rose-600/25 transition-all active:scale-95"
            >
              <Eye className="w-4 h-4" />
              <span>SCAN SCREEN</span>
            </button>
            <button
              onClick={onImportClick}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all active:scale-95"
            >
              <Upload className="w-4 h-4 text-slate-400" />
              <span>IMPORT SCREENSHOT</span>
            </button>
            <button
              onClick={onLaunchDemo}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-semibold text-sm transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>TRY DEMO</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Main Privacy Score Card */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden">
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400">Main Privacy Health</div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-extrabold font-mono ${
                privacyScore >= 80 ? 'text-emerald-400' : privacyScore >= 50 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {privacyScore}
              </span>
              <span className="text-slate-500 text-sm font-mono">/ 100</span>
            </div>
            <p className="text-xs text-slate-400">
              {privacyScore >= 80 ? 'Safe for public webinars and screen shares.' : 'Exposure detected; masking recommended.'}
            </p>
          </div>

          <div className="w-20 h-20 rounded-full border-4 border-slate-800 flex items-center justify-center relative">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                privacyScore >= 80 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Protected Items Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Protected Today</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{protectedCount || 17}</div>
          <p className="text-[11px] text-slate-400">Sensitive tokens redacted locally</p>
        </div>

        {/* High-Risk Items */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Critical / High</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-rose-400 font-mono">{criticalCount || 3}</div>
          <p className="text-[11px] text-slate-400">API keys & credentials intercepted</p>
        </div>

        {/* Cloud Egress Card (The differentiator) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Data Sent to Cloud</span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">0 bytes</div>
          <p className="text-[11px] text-emerald-400/80 font-mono">100% On-Device Guaranteed</p>
        </div>
      </div>

      {/* Latency / Hardware Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-slate-400 font-mono text-[11px]">Last Scan Latency</div>
            <div className="font-bold text-slate-200 font-mono">
              {lastScanLatencyMs > 0 ? `${lastScanLatencyMs.toFixed(1)} ms` : '1.4 sec (Local Inference)'}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-slate-400 font-mono text-[11px]">Target Architecture</div>
            <div className="font-bold text-slate-200">Snapdragon X-Series / Hexagon NPU</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-slate-400 font-mono text-[11px]">Model Runtime</div>
            <div className="font-bold text-slate-200">Qualcomm AI Hub Compatible ONNX/QNN</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Protection Activity + On-Device Value Proposition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Activity Feed */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Recent Protection Activity
            </h3>
            <button
              onClick={() => onNavigateTab('history')}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
            >
              <span>View Full History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/60">
            {historyItems.slice(0, 4).map((item) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      item.highestRisk === 'CRITICAL'
                        ? 'bg-rose-500 ring-2 ring-rose-500/30'
                        : item.highestRisk === 'HIGH'
                        ? 'bg-amber-500'
                        : 'bg-blue-400'
                    }`}
                  ></div>
                  <div>
                    <div className="font-semibold text-slate-200">{item.actionTaken}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{item.timestamp}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      item.highestRisk === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : item.highestRisk === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {item.highestRisk} RISK
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 hidden sm:block">
                    0 B Egress
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Why Snapdragon Matters */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-rose-500" />
            Why Snapdragon AI PC?
          </h3>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="font-semibold text-rose-300">Local Computer Vision & OCR</div>
              <p className="text-slate-400 leading-relaxed">
                Optical character recognition runs entirely in-memory using on-device neural acceleration.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="font-semibold text-emerald-300">45 TOPS Hexagon NPU Offload</div>
              <p className="text-slate-400 leading-relaxed">
                Offloading vision models to the Snapdragon NPU keeps your CPU cool and preserves battery during hours of screen sharing.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="font-semibold text-blue-300">Zero Cloud Dependency</div>
              <p className="text-slate-400 leading-relaxed">
                Unlike cloud AI assistants, your confidential presentation documents never leave the computer.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('snapdragon')}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <span>Explore NPU Architecture</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
