import React from 'react';
import { DetectedEntity } from '../types';
import { ShieldAlert, AlertTriangle, Info, CheckCircle2, Sparkles } from 'lucide-react';

interface PrivacyCoachCardProps {
  entity: DetectedEntity | null;
}

export const PrivacyCoachCard: React.FC<PrivacyCoachCardProps> = ({ entity }) => {
  if (!entity) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
        <Sparkles className="w-6 h-6 text-slate-500 mx-auto mb-2" />
        <p className="text-xs text-slate-400">
          Select any highlighted item on the screen to view the Privacy Coach risk explanation.
        </p>
      </div>
    );
  }

  const coach = entity.coachAdvice || {
    title: entity.displayName,
    whyRisky: 'This information appears to contain personal or privileged data that should not be visible to third parties during a screen share.',
    impact: 'Potential privacy leakage or unintended audience exposure.',
    recommendation: 'Review and mask before sharing your screen.',
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 relative overflow-hidden">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-100">{coach.title}</h4>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase ${getRiskBadge(entity.risk)}`}>
              {entity.risk}
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate max-w-xs">
            Detected: <span className="text-slate-200">{entity.maskedValue}</span>
          </p>
        </div>
        <div className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
          {Math.round(entity.confidence * 100)}% conf
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div>
          <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1 mb-0.5">
            <AlertTriangle className="w-3 h-3" />
            Why is this risky?
          </span>
          <p className="text-slate-300 leading-relaxed">{coach.whyRisky}</p>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1 mb-0.5">
            <Info className="w-3 h-3" />
            Potential Impact:
          </span>
          <p className="text-slate-300 leading-relaxed">{coach.impact}</p>
        </div>

        <div className="pt-1 border-t border-slate-800">
          <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 mb-0.5">
            <CheckCircle2 className="w-3 h-3" />
            Recommendation:
          </span>
          <p className="text-slate-200">{coach.recommendation}</p>
        </div>
      </div>

      <div className="pt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between border-t border-slate-800/80">
        <span>Snapdragon On-Device Privacy Coach</span>
        <span className="text-emerald-400">100% Local Inference</span>
      </div>
    </div>
  );
};
