import React, { useState, useRef } from 'react';
import { ShieldCheck, ShieldAlert, ArrowRight, Lock, Eye, EyeOff } from 'lucide-react';

interface ComparisonSliderProps {
  originalImageUri: string;
  protectedImageUri: string;
  riskBefore: number;
  riskAfter: number;
  protectedCount: number;
  redactionStyle: string;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({
  originalImageUri,
  protectedImageUri,
  riskBefore,
  riskAfter,
  protectedCount,
  redactionStyle,
}) => {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 - 100
  const [viewMode, setViewMode] = useState<'slider' | 'toggle' | 'split'>('slider');
  const [activeToggle, setActiveToggle] = useState<'original' | 'protected'>('protected');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || viewMode !== 'slider') return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || viewMode !== 'slider') return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  return (
    <div className="space-y-4">
      {/* Metric Delta Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-mono">Privacy Risk Exposure</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-rose-400 font-bold font-mono text-base">{riskBefore}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-emerald-400 font-bold font-mono text-base">{riskAfter}</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            -{riskBefore - riskAfter} pts
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-mono">Protected Items</div>
            <div className="text-base font-bold text-slate-100 font-mono mt-0.5">
              {protectedCount} <span className="text-xs text-slate-400 font-normal">redacted ({redactionStyle})</span>
            </div>
          </div>
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-mono">Cloud Egress</div>
            <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
              0 bytes
            </div>
          </div>
          <Lock className="w-5 h-5 text-emerald-400" />
        </div>
      </div>

      {/* Mode Controls Bar */}
      <div className="flex items-center justify-between bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-mono text-[11px]">Compare View:</span>
          <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
            <button
              onClick={() => setViewMode('slider')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                viewMode === 'slider' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Interactive Slider
            </button>
            <button
              onClick={() => setViewMode('toggle')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                viewMode === 'toggle' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Flip Toggle
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                viewMode === 'split' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Side-by-Side
            </button>
          </div>
        </div>

        {viewMode === 'toggle' && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveToggle('original')}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                activeToggle === 'original' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400'
              }`}
            >
              Original (Exposed)
            </button>
            <button
              onClick={() => setActiveToggle('protected')}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                activeToggle === 'protected' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400'
              }`}
            >
              Protected (Safe)
            </button>
          </div>
        )}

        {viewMode === 'slider' && (
          <span className="text-slate-400 font-mono text-[11px] hidden sm:block">
            ← Drag cursor to reveal protection →
          </span>
        )}
      </div>

      {/* Comparison Container */}
      {viewMode === 'slider' && (
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className="relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 cursor-ew-resize select-none shadow-2xl"
        >
          {/* Base Layer: Protected (Safe) Image */}
          <img
            src={protectedImageUri}
            alt="Protected Redacted Screen"
            className="w-full h-auto block select-none pointer-events-none"
          />

          {/* Top Layer: Original (Unredacted) Image clipped by slider position */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ width: `${sliderPos}%` }}
          >
            <img
              src={originalImageUri}
              alt="Original Raw Screen"
              className="absolute top-0 left-0 max-w-none w-full h-full object-cover select-none pointer-events-none"
              style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
            />
          </div>

          {/* Divider Handle Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-rose-500 pointer-events-none shadow-[0_0_12px_rgba(244,63,94,0.8)]"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-900 border-2 border-rose-500 flex items-center justify-center shadow-lg">
              <span className="text-[10px] text-rose-400 font-bold font-mono select-none">⇄</span>
            </div>
          </div>

          {/* Watermark Tags */}
          <div className="absolute top-3 left-3 bg-rose-950/80 border border-rose-500/40 text-rose-200 text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-sm pointer-events-none">
            ORIGINAL (EXPOSED)
          </div>
          <div className="absolute top-3 right-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-sm pointer-events-none">
            PROTECTED (SAFE)
          </div>
        </div>
      )}

      {viewMode === 'toggle' && (
        <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl relative">
          <img
            src={activeToggle === 'original' ? originalImageUri : protectedImageUri}
            alt="Active Preview"
            className="w-full h-auto block select-none"
          />
          <div className={`absolute top-3 right-3 text-[11px] font-mono px-2.5 py-1 rounded backdrop-blur-md ${
            activeToggle === 'original'
              ? 'bg-rose-950/90 text-rose-300 border border-rose-500/40'
              : 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40'
          }`}>
            {activeToggle === 'original' ? '⚠️ EXPOSED SCREEN' : '🛡️ PROTECTED SCREEN'}
          </div>
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl overflow-hidden bg-slate-950 border border-rose-900/50 shadow-xl relative">
            <div className="bg-slate-900 px-3 py-1.5 border-b border-rose-900/40 text-rose-300 text-xs font-mono font-semibold flex items-center justify-between">
              <span>BEFORE: Exposed Screen</span>
              <span className="text-[10px] bg-rose-500/20 px-1.5 rounded">Risk: {riskBefore}</span>
            </div>
            <img src={originalImageUri} alt="Original" className="w-full h-auto block select-none" />
          </div>

          <div className="rounded-xl overflow-hidden bg-slate-950 border border-emerald-900/50 shadow-xl relative">
            <div className="bg-slate-900 px-3 py-1.5 border-b border-emerald-900/40 text-emerald-300 text-xs font-mono font-semibold flex items-center justify-between">
              <span>AFTER: Protected & Masked</span>
              <span className="text-[10px] bg-emerald-500/20 px-1.5 rounded">Risk: {riskAfter}</span>
            </div>
            <img src={protectedImageUri} alt="Protected" className="w-full h-auto block select-none" />
          </div>
        </div>
      )}
    </div>
  );
};
