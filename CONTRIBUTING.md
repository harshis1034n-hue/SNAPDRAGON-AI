# Contributing to SnapSafe AI

Thank you for your interest in contributing to **SnapSafe AI**!

## Core Security & Privacy Rule
SnapSafe AI is an **on-device privacy firewall**. Any contribution that:
1. Introduces external cloud API calls for OCR, text extraction, or image processing, OR
2. Emits screen buffers or unmasked tokens over network sockets,
**will be rejected immediately.**

## Development Workflow

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/<your-username>/snapsafe-ai.git
   cd snapsafe-ai
   ```

2. **Install Python & Node Dependencies:**
   ```bash
   pip install -r requirements.txt
   npm install
   ```

3. **Run Automated Tests:**
   ```bash
   npm run test:py
   ```

4. **Verify Frontend Build:**
   ```bash
   npm run build
   ```

5. **Submit Pull Request:**
   Ensure all 25 unit tests pass and new features are tested with synthetic fixtures.
