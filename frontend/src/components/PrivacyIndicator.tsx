import React from 'react';
import { ShieldCheck, Cpu, HardDrive, Lock } from 'lucide-react';

interface PrivacyIndicatorProps {
  processedCount?: number;
  cloudBytes?: number;
  deviceTarget?: string;
}

export const PrivacyIndicator: React.FC<PrivacyIndicatorProps> = ({
  processedCount = 17,
  cloudBytes = 0,
  deviceTarget = 'Local On-Device (Qualcomm AI Hub Target)',
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-4 text-xs">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">100% LOCAL PROCESSING GUARANTEE</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-bold">
              ZERO-CLOUD
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            No screenshots, OCR tokens, or personal data ever leave your device memory.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 font-mono text-[11px]">
        <div className="flex items-center gap-1.5">
          <HardDrive className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Processed Locally:</span>
          <span className="font-bold text-slate-200">{processedCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">Cloud Egress:</span>
          <span className="font-bold text-emerald-400">{cloudBytes} bytes</span>
        </div>
        <div className="flex items-center gap-1.5 hidden md:flex">
          <Cpu className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-slate-400">Runtime:</span>
          <span className="font-bold text-rose-300">{deviceTarget}</span>
        </div>
      </div>
    </div>
  );
};
