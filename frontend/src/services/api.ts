import { ScanResult, HardwareInfo, HistoryItem, BenchmarkResult, DetectedEntity } from '../types';
import { LocalOnDeviceEngine, COACH_EXPLANATIONS } from './localEngine';

// Dynamically select API base based on environment
const isLocalHttp = typeof window !== 'undefined' &&
  window.location.protocol === 'http:' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE = isLocalHttp ? 'http://127.0.0.1:8000/api' : '/api';

/**
 * Fetch wrapper with timeout and automatic local fallback
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 2500): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export const api = {
  async getHealth(): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/health`, {}, 1500);
      if (res.ok) return await res.json();
    } catch {
      // Local in-browser on-device fallback
    }
    const hw = LocalOnDeviceEngine.getHardwareInfo();
    const { metrics } = LocalOnDeviceEngine.getHistory();
    return {
      status: 'HEALTHY',
      protectionActive: true,
      timestamp: Date.now() / 1000,
      hardware: hw,
      metrics,
      cloudDataEgressBytes: 0,
      mode: 'In-Browser On-Device Engine',
    };
  },

  async getHardwareInfo(): Promise<HardwareInfo> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/hardware`, {}, 1500);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return LocalOnDeviceEngine.getHardwareInfo();
  },

  async runBenchmark(iterations = 2): Promise<BenchmarkResult> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/benchmark/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iterations }),
      }, 4000);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return LocalOnDeviceEngine.runBenchmark(iterations);
  },

  async generateDemo(): Promise<{ dataUri: string; width: number; height: number; isSyntheticDemo: boolean }> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/demo/generate`, {}, 2000);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return LocalOnDeviceEngine.generateDemoPortal();
  },

  async scanImage(imageBase64: string, ocrProvider = 'auto', categoryFilter?: string[]): Promise<ScanResult> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, ocrProvider, categoryFilter }),
      }, 5000);
      if (res.ok) return await res.json();
    } catch {
      // Automatic fallback to in-browser on-device privacy engine
    }
    return await LocalOnDeviceEngine.scanImageLocally(imageBase64, ocrProvider);
  },

  async redactImage(
    imageBase64: string,
    entities: DetectedEntity[],
    redactionStyle = 'blur',
    logToHistory = true
  ): Promise<{ protectedImageUri: string; maskedCount: number; redactionStyle: string; assessment: any }> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/redact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, entities, redactionStyle, logToHistory }),
      }, 5000);
      if (res.ok) return await res.json();
    } catch {
      // Automatic fallback
    }
    return await LocalOnDeviceEngine.redactImageLocally(imageBase64, entities, redactionStyle);
  },

  async captureDesktopScreen(monitorIndex = 1): Promise<{ success: boolean; dataUri: string; width: number; height: number; source?: string }> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/screen/capture?monitorIndex=${monitorIndex}`, {
        method: 'POST',
      }, 3000);
      if (res.ok) {
        const data = await res.json();
        if (data.success) return data;
      }
    } catch {
      // Fallback
    }
    const demo = LocalOnDeviceEngine.generateDemoPortal();
    return {
      success: true,
      dataUri: demo.dataUri,
      width: demo.width,
      height: demo.height,
      source: 'simulated_desktop_session'
    };
  },

  async getHistory(): Promise<{ history: HistoryItem[]; metrics: any }> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/history`, {}, 1500);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return LocalOnDeviceEngine.getHistory();
  },

  async clearHistory(): Promise<void> {
    try {
      await fetchWithTimeout(`${API_BASE}/history/clear`, { method: 'POST' }, 1000);
    } catch {}
    LocalOnDeviceEngine.clearHistory();
  },

  async getCoachExplanation(entityType: string): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/coach/explain/${entityType}`, {}, 1500);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return COACH_EXPLANATIONS[entityType] || COACH_EXPLANATIONS.DEFAULT;
  },
};
