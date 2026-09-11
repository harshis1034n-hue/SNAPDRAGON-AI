import React from 'react';
import { Sparkles, Play, CheckCircle2, ShieldAlert, Cpu, ArrowRight, X, Clock } from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunOneClickDemo: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({
  isOpen,
  onClose,
  onRunOneClickDemo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            COMPETITION PRESENTATION MODE
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            90-Second Snapdragon Pitch Demo
          </h3>
          <p className="text-xs text-slate-400">
            Automated synthetic demonstration designed for judges and presentation reviewers.
          </p>
        </div>

        {/* Demo Steps Checklist */}
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-rose-600/20 text-rose-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <div>
              <div className="font-semibold text-slate-200">Generate Realistic Synthetic Portal</div>
              <p className="text-slate-400 mt-0.5">
                Generates a clean university student portal image with fake synthetic records: Sarah Jenkins, student ID, email, mobile number, and private API key.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-rose-600/20 text-rose-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <div>
              <div className="font-semibold text-slate-200">On-Device Text & Pattern Detection</div>
              <p className="text-slate-400 mt-0.5">
                Executes the local OCR pipeline on-device. Identifies sensitive tokens with bounding box coordinates and risk weights.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-rose-600/20 text-rose-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <div>
              <div className="font-semibold text-slate-200">Automatic Masking & Before/After Comparison</div>
              <p className="text-slate-400 mt-0.5">
                Redacts all high-risk items and shows an interactive before/after split slider demonstrating privacy exposure reduction (Risk 87 → 4).
              </p>
            </div>
          </div>
        </div>

        {/* Synthetic Data Label Disclaimer */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 font-mono flex items-center justify-between">
          <span>⚠️ Synthetic Demo Data Only</span>
          <span>Zero Real PII</span>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Execution time: ~1.5 seconds</span>
          </div>

          <button
            onClick={() => {
              onClose();
              onRunOneClickDemo();
            }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs shadow-lg shadow-rose-600/25 transition active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>RUN 1-CLICK COMPETITION DEMO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
