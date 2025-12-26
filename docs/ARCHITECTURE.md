# Arduino AI IDE - Architecture & Design Document

## 1. System Overview
A "Cursor-like" IDE specialized for Arduino Uno/Nano development, featuring an integrated AI assistant, hardware safety checks, and a modern dark UI.

## 2. Technology Stack
- **Frontend**: React (Vite), Monaco Editor, Vanilla CSS (Premium Dark Theme).
- **Backend**: Python (FastAPI). Acts as the bridge to `arduino-cli` and AI Logic.
- **Communication**: REST API (Frontend -> Backend).
- **Packaging**: (Planned) Electron/Tauri wrapper.

## 3. Core Modules

### 3.1 Frontend (UI)
- **Editor**: embedded `monaco-editor`. Custom theme to match "Anti-Gravity" aesthetics.
- **Sidebar**: File explorer (simplified).
- **Right Panel**: AI Chat Interface.
    - Streamed responses.
    - "Apply Code" buttons.
- **Bottom Panel**: Terminal/Serial Monitor/Compilation Output.
- **Command Palette**: `Ctrl/Cmd + K` menu for quick actions.

### 3.2 Backend (Engine)
- **API Defaults**: `localhost:8000`.
- **Endpoints**:
    - `/api/compile`: Triggers `arduino-cli compile`.
    - `/api/upload`: Triggers `arduino-cli upload`.
    - `/api/ports`: Lists available serial ports.
    - `/api/ai/chat`: Handles interaction with LLM agents.
    - `/api/monitor/start`: Opens serial connection.

### 3.3 AI Agents System
The AI logic is split into specialized agents (handled by Python backend):
1.  **Code Generator Agent**:
    - Context: Board type, Constraints.
    - Output: strict C++ code.
2.  **Hardware Rules Agent**:
    - Input: Proposed code/User query.
    - Logic: Rule-based checks (e.g., "Pin 0/1 are Serial", "Motor on 5V is bad").
3.  **Debug Agent**:
    - Input: Compiler error log.
    - Output: Human-readable fix.

## 4. UI/UX Design System
- **Colors**:
    - Background: `#0b0f14` (Deep void)
    - Surface: `#161b22` (Panel bg)
    - Accent: `#00e5ff` (Cyan - AI/Active)
    - Error: `#ff4757`
    - Success: `#2ecc71`
- **Typography**: Inter (sans-serif), JetBrains Mono (code).
- **Motion**: Subtle ease-out transitions on panels.

## 5. Directory Structure
```
/aireduinoIDE
  /frontend     # React App
  /backend      # Python FastAPI
    /agents     # AI Logic
    /arduino    # CLI Wrappers
  /sketches     # User workspace for sketches
```
