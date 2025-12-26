# Arduino AI IDE 

A next-generation, AI-powered IDE for Arduino Uno and Nano, featuring "Cursor-like" intelligence and "Anti-Gravity" aesthetics.

## 🚀 Getting Started

### Prerequisites
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
