import { ScanResult, HardwareInfo, HistoryItem, BenchmarkResult, DetectedEntity } from '../types';
import { LocalOnDeviceEngine, COACH_EXPLANATIONS } from './localEngine';

// Dynamically check if running locally on HTTP with backend available
const isLocalHttp = typeof window !== 'undefined' &&
  window.location.protocol === 'http:' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE = isLocalHttp ? 'http://127.0.0.1:8000/api' : '/api';

/**
 * Fetch wrapper with timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 2000): Promise<Response> {
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
    if (isLocalHttp) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/health`, {}, 1500);
        if (res.ok) {
          const data = await res.json();
          if (data && data.status) return data;
        }
      } catch {}
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
    if (isLocalHttp) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/hardware`, {}, 1500);
        if (res.ok) {
          const data = await res.json();
          if (data && data.processorName) return data;
        }
      } catch {}
    }
    return LocalOnDeviceEngine.getHardwareInfo();
  },

  async runBenchmark(iterations = 2): Promise<BenchmarkResult> {
    if (isLocalHttp) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/benchmark/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ iterations }),
        }, 4000);
        if (res.ok) {
          const data = await res.json();
          if (data && data.summary) return data;
        }
      } catch {}
    }
    return LocalOnDeviceEngine.runBenchmark(iterations);
  },

  async generateDemo(): Promise<{ dataUri: string; width: number; height: number; isSyntheticDemo: boolean }> {
    if (isLocalHttp) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/demo/generate`, {}, 2000);
        if (res.ok) {
          const data = await res.json();
          if (data && data.dataUri) return data;
        }
      } catch {}
    }
    return LocalOnDeviceEngine.generateDemoPortal();
  },

  async scanImage(imageBase64: string, ocrProvider = 'auto', categoryFilter?: string[]): Promise<ScanResult> {
    if (isLocalHttp) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64, ocrProvider, categoryFilter }),
        }, 5000);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.entities)) return data;
        }
      } catch {}
    }
    // Guaranteed on-device local execution
    return await LocalOnDeviceEngine.scanImageLocally(imageBase64, ocrProvider);
  },

  async redactImage(
    imageBase64: string,
    entities: DetectedEntity[],
    redactionStyle = 'blur',
    logToHistory = true
  ): Promise<{ protectedImageUri: string; maskedCount: number; redactionStyle: string; assessment: any }> {
    if (isLocalHttp) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/redact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64, entities, redactionStyle, logToHistory }),
        }, 5000);
        if (res.ok) {
          const data = await res.json();
          if (data && data.protectedImageUri) return data;
        }
      } catch {}
    }
    return await LocalOnDeviceEngine.redactImageLocally(imageBase64, entities, redactionStyle);
  },

  async captureDesktopScreen(monitorIndex = 1): Promise<{ success: boolean; dataUri: string; width: number; height: number; source?: string }> {
    if (isLocalHttp) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/screen/capture?monitorIndex=${monitorIndex}`, {
          method: 'POST',
        }, 3000);
        if (res.ok) {
          const data = await res.json();
          if (data.success) return data;
        }
      } catch {}
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
    if (isLocalHttp) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/history`, {}, 1500);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.history)) return data;
        }
      } catch {}
    }
    return LocalOnDeviceEngine.getHistory();
  },

  async clearHistory(): Promise<void> {
    if (isLocalHttp) {
      try {
        await fetchWithTimeout(`${API_BASE}/history/clear`, { method: 'POST' }, 1000);
      } catch {}
    }
    LocalOnDeviceEngine.clearHistory();
  },

  async getCoachExplanation(entityType: string): Promise<any> {
    if (isLocalHttp) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/coach/explain/${entityType}`, {}, 1500);
        if (res.ok) {
          const data = await res.json();
          if (data && data.title) return data;
        }
      } catch {}
    }
    return COACH_EXPLANATIONS[entityType] || COACH_EXPLANATIONS.DEFAULT;
  },
};
