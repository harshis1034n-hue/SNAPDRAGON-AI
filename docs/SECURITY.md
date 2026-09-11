# SnapSafe AI — Security & Privacy Architecture
### Threat Modeling & Zero-Trust On-Device Data Protection

---

## 1. Zero-Cloud Egress Invariant

The fundamental tenet of SnapSafe AI is that **privacy tools must not introduce privacy risks**. 

### The Security Invariant:
```
Total External Network Transmission (Bytes) = 0
```

1. **No External AI APIs:** All tokenization, optical character recognition, regex matching, entropy analysis, and risk evaluation occur inside the local process memory.
2. **Local Loopback Only:** The FastAPI backend binds exclusively to `127.0.0.1:8000`. It does not listen on `0.0.0.0` or external network adapters.
3. **No Telemetry of Sensitive Text:** Application metrics track only aggregate counters (e.g. `itemsProtectedToday: 17`, `cloudBytes: 0`). Raw strings, bounding box text, and OCR outputs are never logged to external monitoring services.

---

## 2. Data In-Flight & At-Rest Policy

### Volatile Memory Handling
- Screen captures acquired via `mss` or browser `getDisplayMedia` exist exclusively in ephemeral RAM buffers.
- When a scan concludes, raw unredacted image buffers are discarded from memory upon garbage collection.

### Zero-Pixel Storage At-Rest
- The SQLite database (`snapsafe_history.db`) records **metadata only**:
  - Timestamp (e.g., `Sep 18, 10:42 AM`)
  - Detection counts (e.g., `4 detections`)
  - Highest risk tier (`CRITICAL`)
  - Action taken (`4 items blurred`)
  - Risk exposure reduction (`87 -> 4`)
- **No raw screenshots or unmasked credentials are ever written to disk.**

---

## 3. Cryptographic & Statistical Validation

### Shannon Entropy for Key Identification
To distinguish authentic random cryptographic secrets from ordinary natural language, SnapSafe AI computes Shannon entropy across candidate tokens:
$$H(X) = -\sum_{i=1}^{n} p(x_i) \log_2 p(x_i)$$
Tokens with length $\ge 16$ characters and $H(X) \ge 3.2$ bits/character are isolated and categorized as high-risk credentials.

### Luhn Mod-10 Checksum Algorithm
To protect user financial privacy without false alarms on order IDs, tracking numbers, or phone sequences, all 13–19 digit candidate strings are validated against the Luhn Mod-10 algorithm. Non-compliant sequences are rejected from financial classification.

---

## 4. Redaction Irreversibility
- **Gaussian Blur:** Applied with kernel sizes $\ge 15 \times 15$ and $\sigma \ge 25$, mathematically destroying high-frequency edge data so that character reconstruction via deconvolution is impossible.
- **Pixelation:** Blocks downsampled by factor of 10 and resampled via nearest-neighbor interpolation, permanently eliminating glyph strokes.
- **Solid Blackout:** Target bounding box pixels are replaced with uniform solid matte RGB `(18, 24, 38)`, leaving zero residual pixel information.

---

## 5. Security Audit Checklist
- [x] No hardcoded production API keys in repository.
- [x] No external cloud AI SDKs (OpenAI, Anthropic, Google Gemini Cloud) imported in core pipeline.
- [x] All test fixtures use synthetic reserved domains (`@example.test`) and synthetic mock tokens.
- [x] Backend CORS policy restricted to local origins.
- [x] Ephemeral screen buffers scrubbed from memory.
