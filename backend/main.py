from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import sys
import os
import subprocess
import tempfile
from typing import Optional, List

# Import Agents
# Ensure current dir is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from agents import process_ai_request

def get_cli_path():
    # Detect if we are running in a PyInstaller bundle
    if getattr(sys, 'frozen', False):
        # We are running as backend.exe
        base_dir = os.path.dirname(sys.executable)
    else:
        # Running from source
        base_dir = os.path.dirname(os.path.abspath(__file__))
    
    local_cli = os.path.join(base_dir, "tools", "arduino-cli.exe")
    if os.path.exists(local_cli):
        return local_cli
    return "arduino-cli" # Fallback to PATH

app = FastAPI(title="Arduino AI IDE Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Sketch(BaseModel):
    code: str
    board: str
    port: Optional[str] = None

class AIQuery(BaseModel):
    prompt: str
    context_code: Optional[str] = None
    board: str = "arduino:avr:uno"

@app.get("/")
def read_root():
    return {"status": "Aireduino Backend Online"}

@app.get("/ports")
def get_ports():
    try:
        import serial.tools.list_ports
        ports = serial.tools.list_ports.comports()
        data = [{"device": p.device, "description": p.description} for p in ports]
        # Always return a mock port if empty for demo
        if not data:
            data = [{"device": "MOCK_COM3", "description": "Arduino Uno (Simulated)"}]
        return data
    except ImportError:
        return [{"device": "MOCK_COM3", "description": "Arduino Uno (Mock)"}]

@app.post("/compile")
async def compile_sketch(sketch: Sketch):
    # Create temp directory
    with tempfile.TemporaryDirectory() as temp_dir:
        # Arduino CLI requires folder name = sketch name
        sketch_name = "AireduinoSketch"
        sketch_dir = os.path.join(temp_dir, sketch_name)
        os.makedirs(sketch_dir)
        
        sketch_path = os.path.join(sketch_dir, f"{sketch_name}.ino")
        with open(sketch_path, "w") as f:
            f.write(sketch.code)
        
        # Run arduino-cli compile
        # Assumes arduino-cli is in PATH
        # Command: arduino-cli compile --fqbn {board} {sketch_path}
        # Determine CLI path
        cli_path = get_cli_path()
        print(f"Using CLI: {cli_path}")

        try:
            cmd = [cli_path, "compile", "--fqbn", sketch.board, sketch_path]
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                print(f"Compile Error: {result.stderr}")
                raise HTTPException(status_code=400, detail=f"Compilation Failed:\n{result.stderr}")
            
            return {"status": "success", "message": "Sketch compiled successfully!"}
            
        except FileNotFoundError:
             # Fallback for dev/demo if CLI not installed
             return {"status": "warning", "message": "Arduino CLI not found. Mode: Simulation."}


@app.post("/upload")
async def upload_sketch(sketch: Sketch):
    if not sketch.port:
        raise HTTPException(status_code=400, detail="Port required for upload")
    
    with tempfile.TemporaryDirectory() as temp_dir:
        # Arduino CLI requires folder name = sketch name
        sketch_name = "AireduinoSketch"
        sketch_dir = os.path.join(temp_dir, sketch_name)
        os.makedirs(sketch_dir)
        
        sketch_path = os.path.join(sketch_dir, f"{sketch_name}.ino")
        with open(sketch_path, "w") as f:
            f.write(sketch.code)
            
        try:
            # Determine CLI path
            cli_path = get_cli_path()
            print(f"Using CLI: {cli_path}")

            # Command: arduino-cli compile --upload -p {port} --fqbn {board} {sketch_path}
            # We use compile --upload because the temp dir is fresh and has no previous build artifacts
            cmd = [cli_path, "compile", "--upload", "-p", sketch.port, "--fqbn", sketch.board, sketch_path]
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                print(f"Upload Error: {result.stderr}")
                raise HTTPException(status_code=400, detail=f"Upload Failed:\n{result.stderr}")
                
            return {"status": "success", "message": "Sketch uploaded successfully!"}
            
        except FileNotFoundError:
             return {"status": "warning", "message": "Arduino CLI not found. Mode: Simulation."}


@app.post("/ai/generate")
async def generate_code(query: AIQuery):
    result = process_ai_request(query.prompt, query.board)
    return result

@app.websocket("/ws/monitor")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await asyncio.sleep(0.5)
            # Send dummy data
            await websocket.send_text("Sensor: 1023\n")
    except Exception as e:
        print(f"WebSocket Error: {e}")

if __name__ == "__main__":
    import uvicorn
    # Use frozen port 8001, loop='asyncio' to avoid compatibility issues in frozen apps
    uvicorn.run(app, host="127.0.0.1", port=8001)
