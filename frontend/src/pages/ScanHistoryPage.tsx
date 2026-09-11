import React, { useState, useEffect } from 'react';
import { History, Trash2, ShieldCheck, Lock, AlertTriangle, ArrowDownRight, RefreshCw } from 'lucide-react';
import { HistoryItem } from '../types';
import { api } from '../services/api';

interface ScanHistoryPageProps {
  historyItems: HistoryItem[];
  onRefreshHistory: () => void;
}

export const ScanHistoryPage: React.FC<ScanHistoryPageProps> = ({
  historyItems,
  onRefreshHistory,
}) => {
  const [filterRisk, setFilterRisk] = useState<string>('ALL');

  const filteredItems = historyItems.filter((item) => {
    if (filterRisk === 'ALL') return true;
    return item.highestRisk === filterRisk;
  });

  const handleClear = async () => {
    if (window.confirm('Clear all local scan history logs?')) {
      await api.clearHistory();
      onRefreshHistory();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-rose-500" />
            Local Scan History & Audit Log
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Metadata-only log. Strictly adheres to zero-retention: raw pixels are never stored on disk.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-medium transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Log</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-mono text-[11px]">Filter by Severity:</span>
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((risk) => (
              <button
                key={risk}
                onClick={() => setFilterRisk(risk)}
                className={`px-3 py-1 rounded-md text-[11px] font-mono font-semibold transition ${
                  filterRisk === risk
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {risk}
              </button>
            ))}
          </div>
        </div>

        <span className="text-[11px] font-mono text-slate-400 hidden sm:block">
          Showing {filteredItems.length} records
        </span>
      </div>

      {/* History Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                <th className="py-3.5 px-4 font-semibold">Detections</th>
                <th className="py-3.5 px-4 font-semibold">Highest Severity</th>
                <th className="py-3.5 px-4 font-semibold">Action Taken</th>
                <th className="py-3.5 px-4 font-semibold">Risk Delta</th>
                <th className="py-3.5 px-4 font-semibold">Cloud Transmitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans text-slate-300">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No scan records match the current filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {item.timestamp}
                    </td>
                    <td className="py-3.5 px-4 font-semibold">
                      {item.detectionCount} items
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          item.highestRisk === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : item.highestRisk === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : item.highestRisk === 'MEDIUM'
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.highestRisk === 'CRITICAL'
                              ? 'bg-rose-400'
                              : item.highestRisk === 'HIGH'
                              ? 'bg-amber-400'
                              : 'bg-yellow-400'
                          }`}
                        ></span>
                        {item.highestRisk}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {item.actionTaken}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <span className="text-rose-400 font-bold">{item.riskBefore}</span>
                      <span className="text-slate-500 mx-1.5">→</span>
                      <span className="text-emerald-400 font-bold">{item.riskAfter}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-emerald-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>{item.cloudBytes} B</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
