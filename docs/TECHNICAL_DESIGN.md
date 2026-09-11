# SnapSafe AI — Technical Design Document
### Detailed Engineering Specifications & Interface Contracts

---

## 1. Data Models & JSON Schemas

### 1.1 BoundingBox
```typescript
interface BoundingBox {
  x: number;       // Upper-left X coordinate in pixels
  y: number;       // Upper-left Y coordinate in pixels
  width: number;   // Box width in pixels
  height: number;  // Box height in pixels
}
```

### 1.2 DetectedEntity
```typescript
interface DetectedEntity {
  id: string;                      // e.g. "det-a1b2c3d4"
  type: string;                    // "API_KEY" | "STUDENT_ID" | "EMAIL" | etc.
  displayName: string;             // Human-readable label
  value: string;                   // Unmasked detected text
  maskedValue: string;             // e.g. "sk-live_****...e2"
  confidence: number;              // Float 0.0 - 1.0
  risk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  action: 'MASK' | 'WARN' | 'REVIEW';
  boundingBox: BoundingBox;
  category: 'credentials' | 'pii' | 'financial' | 'confidential';
  isMasked: boolean;               // Checked for redaction
  coachAdvice?: {
    title: string;
    whyRisky: string;
    impact: string;
    recommendation: string;
  };
}
```

### 1.3 RiskAssessment
```typescript
interface RiskAssessment {
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
  privacyRiskRaw: number;          // 0 - 100
  privacyRiskAfter: number;        // 0 - 100
  privacyScoreRaw: number;         // 0 - 100
  privacyScoreAfter: number;       // 0 - 100
  dataUploadedBytes: 0;            // Invariant: 0
  isSafeToShare: boolean;          // true if privacyRiskAfter <= 15
}
```

---

## 2. API Endpoint Specifications

### `POST /api/scan`
- **Request Body:**
  ```json
  {
    "imageBase64": "data:image/png;base64,...",
    "ocrProvider": "auto",
    "categoryFilter": ["credentials", "pii", "financial", "confidential"]
  }
  ```
- **Response Body:**
  ```json
  {
    "success": true,
    "imageWidth": 960,
    "imageHeight": 600,
    "ocrEngine": "RapidOCR (ONNX Runtime)",
    "deviceTarget": "ONNX CPU (Local)",
    "ocrInferenceTimeMs": 240.5,
    "totalPipelineTimeMs": 310.2,
    "totalEntitiesDetected": 4,
    "entities": [...],
    "riskAssessment": {...},
    "zeroCloudGuarantee": true,
    "cloudBytesTransmitted": 0
  }
  ```

### `POST /api/redact`
- **Request Body:**
  ```json
  {
    "imageBase64": "data:image/png;base64,...",
    "entities": [...],
    "redactionStyle": "blur",
    "logToHistory": true
  }
  ```
- **Response Body:**
  ```json
  {
    "success": true,
    "protectedImageUri": "data:image/png;base64,...",
    "maskedCount": 4,
    "redactionStyle": "blur",
    "assessment": {...},
    "cloudBytesTransmitted": 0
  }
  ```

### `POST /api/benchmark/run`
- **Request Body:**
  ```json
  {
    "iterations": 2
  }
  ```
- **Response Body:**
  ```json
  {
    "model": "RapidOCR ONNX (DBNet + CRNN)",
    "targetHardware": "Qualcomm Hexagon NPU (Snapdragon X Elite)",
    "executionUnit": "Local CPU (Prototype Environment)",
    "isFabricated": false,
    "benchmarkStatus": "Live Measured on Host",
    "iterations": 2,
    "averageLatencyMs": 242.1,
    "minLatencyMs": 238.4,
    "maxLatencyMs": 245.8,
    "throughputFps": 4.1,
    "memoryFootprintMb": "~18 MB (Quantized ONNX models)",
    "powerThermalNote": "Snapdragon X Elite NPU delivers up to 45 TOPS...",
    "qualcommAiHubReady": true,
    "note": "Latency measured on current host CPU..."
  }
  ```

---

## 3. Mathematical & Algorithmic Formulations

### 3.1 Shannon Entropy
Calculated across detected candidate token strings to differentiate generated secret keys from standard natural language:
$$H(X) = -\sum_{i=1}^{k} P(x_i) \log_2 P(x_i)$$
Tokens with length $\ge 16$ and $H(X) \ge 3.2$ are classified as high-entropy credentials.

### 3.2 Luhn Checksum Algorithm (Mod-10)
Applied to all 13-19 digit candidates to prevent false positives on random numerical codes:
$$\left( \sum_{i=1}^{N} d_i' \right) \equiv 0 \pmod{10}$$
where $d_i' = 2d_i - 9$ (if $2d_i > 9$) for every second digit from the right.

### 3.3 Privacy Exposure Scoring
$$\text{Raw Exposure} = \min\left(100, \sum_{e \in \text{Entities}} W(e.\text{risk})\right)$$
$$\text{Residual Exposure} = \min\left(100, \sum_{e \in \text{Entities unmasked}} W(e.\text{risk})\right)$$
where $W(\text{CRITICAL}) = 35$, $W(\text{HIGH}) = 20$, $W(\text{MEDIUM}) = 10$, and $W(\text{LOW}) = 5$.
$$\text{Privacy Health Score} = 100 - \text{Residual Exposure}$$
