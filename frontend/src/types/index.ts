export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CoachAdvice {
  title: string;
  whyRisky: string;
  impact: string;
  recommendation: string;
}

export interface DetectedEntity {
  id: string;
  type: string;
  displayName: string;
  value: string;
  maskedValue: string;
  confidence: number;
  risk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  action: string;
  boundingBox: BoundingBox;
  category: string;
  isMasked: boolean;
  coachAdvice?: CoachAdvice;
}

export interface RiskAssessment {
  totalDetected: number;
  totalMasked: number;
  counts: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  privacyRiskRaw: number;
  privacyRiskAfter: number;
  privacyScoreRaw: number;
  privacyScoreAfter: number;
  dataUploadedBytes: number;
  isSafeToShare: boolean;
}

export interface ScanResult {
  success: boolean;
  imageWidth: number;
  imageHeight: number;
  ocrEngine: string;
  deviceTarget: string;
  ocrInferenceTimeMs: number;
  totalPipelineTimeMs: number;
  totalEntitiesDetected: number;
  entities: DetectedEntity[];
  riskAssessment: RiskAssessment;
  zeroCloudGuarantee: boolean;
  cloudBytesTransmitted: number;
}

export interface HardwareInfo {
  platform: string;
  architecture: string;
  processor: string;
  isWindowsArm64: boolean;
  isSnapdragonHost: boolean;
  targetDevice: string;
  onnxProviders: string[];
  hasNpuHardware: boolean;
  npuStatus: string;
  directMlAvailable: boolean;
  aiBackend: string;
  cloudUploadStatus: string;
  environmentStatus: string;
}

export interface HistoryItem {
  id: number;
  timestamp: string;
  detectionCount: number;
  highestRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  actionTaken: string;
  itemsMasked: number;
  categories: string[];
  riskBefore: number;
  riskAfter: number;
  cloudBytes: number;
}

export interface BenchmarkResult {
  model: string;
  targetHardware: string;
  executionUnit: string;
  isFabricated: boolean;
  benchmarkStatus: string;
  iterations: number;
  averageLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  throughputFps: number;
  memoryFootprintMb: string;
  powerThermalNote: string;
  qualcommAiHubReady: boolean;
  note: string;
}
