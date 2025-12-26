# Arduino AI IDE (Aireduino)

[![Download](https://img.shields.io/badge/Download-Latest_for_Windows-blueviolet?style=for-the-badge&logo=windows)](https://github.com/Darshan736/vibe-coding-projects/releases/latest)

A next-generation, AI-powered IDE for Arduino Uno and Nano, featuring "Cursor-like" intelligence and "Anti-Gravity" aesthetics.

## 🚀 Getting Started

To get started immediately, you can download the latest version from our [Releases page](https://github.com/Darshan736/vibe-coding-projects/releases/latest).

### ⬇️ Download & Install (Easiest)
1. Go to the [Latest Release](https://github.com/Darshan736/vibe-coding-projects/releases/latest).
2. Download `AI-Arduino-IDE-Windows.zip`.
3. Extract the zip file and run `AI Arduino IDE.exe`.

---

### 🛠️ Developer Setup (Run from Source)
- Node.js & npm
- Python 3.8+
- Arduino CLI (optional, mocked by default)

### Installation

1.  **Backend Setup**
    ```bash
    cd backend
    pip install -r requirements.txt
    python -m uvicorn main:app --port 8001 --reload
    ```

2.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

3.  **Access**
    Open `http://localhost:5173` in your browser.

## 🌟 Features

-   **AI Assistant**: Ask "Blink LED" or "Control Servo" to generate correct code.
-   **Hardware Safety**: Automatically warns about motor power and pin conflicts.
-   **Modern UI**: Deep dark theme, smooth transitions, Monaco Editor.
-   **Arduino Integration**: Compiles and uploads sketches (Simulation Mode active).

## 🧠 AI Agents

-   **Code Generator**: deterministic generation of valid C++ code.
-   **Safety Auditor**: Scans prompts and code for hardware risks.

## 📁 Project Structure

-   `frontend/`: React + Vite + Monaco application.
-   `backend/`: FastAPI server + Python Agents.
-   `docs/`: Architecture diagrams.

---
*Built by Antigravity Design Team*
