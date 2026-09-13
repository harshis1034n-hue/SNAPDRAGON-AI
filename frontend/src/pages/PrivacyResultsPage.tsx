import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  EyeOff,
  Eye,
  RotateCcw,
  CheckCheck,
  ArrowRight,
  Sliders,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { ScanResult, DetectedEntity } from '../types';
import { BoundingBoxOverlay } from '../components/BoundingBoxOverlay';
import { PrivacyCoachCard } from '../components/PrivacyCoachCard';

interface PrivacyResultsPageProps {
  scanResult: ScanResult;
  imageUri: string;
  onProceedToSafeShare: (entities: DetectedEntity[]) => void;
  onRescan: () => void;
}

export const PrivacyResultsPage: React.FC<PrivacyResultsPageProps> = ({
  scanResult,
  imageUri,
  onProceedToSafeShare,
  onRescan,
}) => {
  const safeEntities = scanResult?.entities || [];
  const [entities, setEntities] = useState<DetectedEntity[]>(safeEntities);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(
    safeEntities.length > 0 ? safeEntities[0].id : null
  );

  const selectedEntity = entities.find((e) => e.id === selectedEntityId) || null;

  // Toggle individual entity mask state
  const handleToggleEntityMask = (id: string) => {
    setEntities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isMasked: !item.isMasked } : item))
    );
  };

  // Mask All Action
  const handleMaskAll = () => {
    setEntities((prev) => prev.map((item) => ({ ...item, isMasked: true })));
  };

  // Unmask All (Expose)
  const handleUnmaskAll = () => {
    setEntities((prev) => prev.map((item) => ({ ...item, isMasked: false })));
  };

  // Count risk distribution
  const criticalCount = entities.filter((e) => e.risk === 'CRITICAL').length;
  const highCount = entities.filter((e) => e.risk === 'HIGH').length;
  const mediumCount = entities.filter((e) => e.risk === 'MEDIUM').length;
  const lowCount = entities.filter((e) => e.risk === 'LOW').length;

  const maskedCount = entities.filter((e) => e.isMasked).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Action & Navigation Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Privacy Analysis & Detection</h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
              {entities.length} Items Detected
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Inspected via {scanResult.ocrEngine} ({scanResult.deviceTarget}) in {scanResult.totalPipelineTimeMs}ms.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRescan}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESCAN</span>
          </button>

          <button
            onClick={handleMaskAll}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>MASK ALL ({entities.length})</span>
          </button>

          <button
            onClick={() => onProceedToSafeShare(entities)}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold shadow-lg shadow-rose-600/25 transition active:scale-95"
          >
            <span>PROCEED TO SAFE SHARE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Two-Column View: Interactive Image + Right Analysis Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Canvas with Visual Bounding Boxes */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Visual Bounding Boxes (Click any item to inspect):</span>
            <span className="font-mono text-[11px] text-emerald-400">
              {maskedCount} of {entities.length} items queued for redaction
            </span>
          </div>

          <BoundingBoxOverlay
            imageUri={imageUri}
            imageWidth={scanResult.imageWidth}
            imageHeight={scanResult.imageHeight}
            entities={entities}
            selectedEntityId={selectedEntityId}
            onSelectEntity={(entity) => setSelectedEntityId(entity.id)}
            onToggleEntityMask={handleToggleEntityMask}
          />

          {/* Quick Legend Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <span className="text-slate-400 font-mono text-[11px]">Severity Legend:</span>
            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Critical
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> High
              </span>
              <span className="flex items-center gap-1.5 text-yellow-400">
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span> Medium
              </span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span> Low
              </span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Privacy Analysis & Coach Panel */}
        <div className="space-y-4">
          {/* Summary Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Privacy Analysis
              </h3>
              <div className="text-xs font-mono font-bold text-rose-400">
                Risk: {scanResult?.riskAssessment?.privacyRiskRaw ?? 0} / 100
              </div>
            </div>

            {/* Severity Breakdown Chips */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <div className="text-lg font-bold text-rose-400 font-mono">{criticalCount}</div>
                <div className="text-[10px] text-slate-400 font-mono">Critical</div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="text-lg font-bold text-amber-400 font-mono">{highCount}</div>
                <div className="text-[10px] text-slate-400 font-mono">High</div>
              </div>
              <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <div className="text-lg font-bold text-yellow-400 font-mono">{mediumCount}</div>
                <div className="text-[10px] text-slate-400 font-mono">Medium</div>
              </div>
            </div>

            {/* List of Detected Entities */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {entities.map((item) => {
                const isSelected = item.id === selectedEntityId;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedEntityId(item.id)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-800 border-rose-500/60 ring-1 ring-rose-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          item.risk === 'CRITICAL'
                            ? 'bg-rose-500'
                            : item.risk === 'HIGH'
                            ? 'bg-amber-500'
                            : 'bg-yellow-400'
                        }`}
                      ></span>
                      <div className="truncate">
                        <div className="font-semibold text-slate-200 truncate">{item.displayName}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">{item.maskedValue}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-slate-500">
                        {Math.round(item.confidence * 100)}%
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleEntityMask(item.id);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition ${
                          item.isMasked
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {item.isMasked ? 'MASK' : 'EXPOSED'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Privacy Coach AI Explanation Card */}
          <PrivacyCoachCard entity={selectedEntity} />
        </div>
      </div>
    </div>
  );
};
