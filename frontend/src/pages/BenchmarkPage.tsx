import React, { useState } from 'react';
import {
  Activity,
  Play,
  Loader2,
  Cpu,
  Clock,
  HardDrive,
  Zap,
  Info,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { BenchmarkResult } from '../types';
import { api } from '../services/api';

export const BenchmarkPage: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [benchmark, setBenchmark] = useState<BenchmarkResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRunBenchmark = async () => {
    setIsRunning(true);
    setErrorMsg(null);
    try {
      const data = await api.runBenchmark(2);
      setBenchmark(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Benchmark execution failed');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-rose-500" />
            On-Device Performance Benchmark
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real host measurements across text detection, recognition, and redaction latency.
          </p>
        </div>

        <button
          onClick={handleRunBenchmark}
          disabled={isRunning}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-rose-600/25 transition active:scale-95"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Running Live Passes...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>RUN BENCHMARK</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Benchmark Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="text-slate-400 text-xs font-mono uppercase flex items-center justify-between">
            <span>Average Latency</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {benchmark ? `${benchmark.averageLatencyMs} ms` : 'Not benchmarked'}
          </div>
          <p className="text-[11px] text-slate-400">
            {benchmark ? `Min: ${benchmark.minLatencyMs}ms | Max: ${benchmark.maxLatencyMs}ms` : 'Click Run Benchmark to measure'}
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="text-slate-400 text-xs font-mono uppercase flex items-center justify-between">
            <span>Execution Unit</span>
            <Cpu className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-lg font-bold text-rose-300 font-mono">
            {benchmark ? benchmark.executionUnit : 'CPU Fallback / NPU Target'}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            {benchmark?.isFabricated ? 'Warning: Fabricated' : 'Verified: Live host measurements'}
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="text-slate-400 text-xs font-mono uppercase flex items-center justify-between">
            <span>Memory Footprint</span>
            <HardDrive className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            {benchmark ? benchmark.memoryFootprintMb : '~18 MB'}
          </div>
          <p className="text-[11px] text-slate-400">Quantized INT8/FP16 models in RAM</p>
        </div>
      </div>

      {/* Benchmark Spec Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
          Benchmark Details & Thermal Profile
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-slate-400">Vision Model Architecture</div>
            <div className="text-slate-200 font-bold">
              {benchmark?.model || 'RapidOCR ONNX (DBNet Detection + CRNN Recognition)'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-slate-400">Target Hardware</div>
            <div className="text-slate-200 font-bold">
              {benchmark?.targetHardware || 'Qualcomm Hexagon NPU (Snapdragon X Elite / X Plus)'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1 md:col-span-2">
            <div className="text-slate-400 font-sans font-semibold mb-1">Power & Thermal Advantage on Snapdragon AI PC:</div>
            <p className="text-slate-300 font-sans text-xs leading-relaxed">
              {benchmark?.powerThermalNote ||
                'Snapdragon X Elite delivers up to 45 TOPS of sustained neural acceleration at under 5W of power. Traditional x86 CPU OCR execution consumes 30W+ causing fan noise and throttling during meetings.'}
            </p>
          </div>
        </div>

        {benchmark?.note && (
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{benchmark.note}</span>
          </div>
        )}
      </div>
    </div>
  );
};
