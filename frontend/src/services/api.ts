import { ScanResult, HardwareInfo, HistoryItem, BenchmarkResult, DetectedEntity } from '../types';

const API_BASE = 'http://127.0.0.1:8000/api';

export const api = {
  async getHealth(): Promise<any> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Backend offline');
    return res.json();
  },

  async getHardwareInfo(): Promise<HardwareInfo> {
    const res = await fetch(`${API_BASE}/hardware`);
    if (!res.ok) throw new Error('Failed to fetch hardware status');
    return res.json();
  },

  async runBenchmark(iterations = 2): Promise<BenchmarkResult> {
    const res = await fetch(`${API_BASE}/benchmark/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ iterations }),
    });
    if (!res.ok) throw new Error('Benchmark failed');
    return res.json();
  },

  async generateDemo(): Promise<{ dataUri: string; width: number; height: number; isSyntheticDemo: boolean }> {
    const res = await fetch(`${API_BASE}/demo/generate`);
    if (!res.ok) throw new Error('Failed to generate demo image');
    return res.json();
  },

  async scanImage(imageBase64: string, ocrProvider = 'auto', categoryFilter?: string[]): Promise<ScanResult> {
    const res = await fetch(`${API_BASE}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, ocrProvider, categoryFilter }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Scan failed' }));
      throw new Error(err.detail || 'Local scan failed');
    }
    return res.json();
  },

  async redactImage(
    imageBase64: string,
    entities: DetectedEntity[],
    redactionStyle = 'blur',
    logToHistory = true
  ): Promise<{ protectedImageUri: string; maskedCount: number; redactionStyle: string; assessment: any }> {
    const res = await fetch(`${API_BASE}/redact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, entities, redactionStyle, logToHistory }),
    });
    if (!res.ok) throw new Error('Redaction failed');
    return res.json();
  },

  async captureDesktopScreen(monitorIndex = 1): Promise<{ success: boolean; dataUri: string; width: number; height: number }> {
    const res = await fetch(`${API_BASE}/screen/capture?monitorIndex=${monitorIndex}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Screen capture failed');
    return res.json();
  },

  async getHistory(): Promise<{ history: HistoryItem[]; metrics: any }> {
    const res = await fetch(`${API_BASE}/history`);
    if (!res.ok) throw new Error('Failed to load history');
    return res.json();
  },

  async clearHistory(): Promise<void> {
    await fetch(`${API_BASE}/history/clear`, { method: 'POST' });
  },

  async getCoachExplanation(entityType: string): Promise<any> {
    const res = await fetch(`${API_BASE}/coach/explain/${entityType}`);
    if (!res.ok) throw new Error('Failed to get explanation');
    return res.json();
  },
};
