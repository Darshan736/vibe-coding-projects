import React, { useState, useEffect } from 'react';
import CodeEditor from './components/Editor';
import Sidebar from './components/Sidebar';
import AIPanel from './components/AIPanel';
import Terminal from './components/Terminal';
import SerialMonitor from './components/SerialMonitor';
import InputModal from './components/InputModal';
import { Play, Upload, Settings, RefreshCw, PlugZap, Terminal as TerminalIcon, Cpu, ListFilter } from 'lucide-react';
import axios from 'axios';

function App() {
  const [code, setCode] = useState('// Welcome to AI Arduino IDE\nvoid setup() {\n  // Put your setup code here, to run once:\n}\n\nvoid loop() {\n  // Put your main code here, to run repeatedly:\n}\n');
  const [logs, setLogs] = useState([]);
  const [board, setBoard] = useState('arduino:avr:uno');
  const [activeTab, setActiveTab] = useState('terminal'); // 'terminal' or 'serial'

  // File System State
  const [fileTree, setFileTree] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);

  // Serial Port State
  const [ports, setPorts] = useState([]);
  const [selectedPort, setSelectedPort] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [baudRate, setBaudRate] = useState(9600);

  // Modal State
  const [modal, setModal] = useState({ isOpen: false, type: '', value: '' });

  const addLog = (msg, type = 'info') => {
    setLogs(prev => [...prev, { message: msg, type, timestamp: Date.now() }]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  // Load Ports
  const refreshPorts = async () => {
    if (window.api) {
      addLog('Scanning for ports...', 'info');
      try {
        const availablePorts = await window.api.serial.list();
        setPorts(availablePorts);
        addLog(`Found ${availablePorts.length} ports.`, 'success');

        if (availablePorts.length > 0 && !selectedPort) {
          setSelectedPort(availablePorts[0].path);
        }
      } catch (e) {
        addLog(`Error scanning ports: ${e.message}`, 'error');
      }
    }
  };

  useEffect(() => {
    refreshPorts();

    // Listen for Serial Data
    if (window.api) {
      const removeDataListener = window.api.serial.onData((data) => {
        addLog(data, 'serial');
      });

      const removeClosedListener = window.api.serial.onClosed(() => {
        setIsConnected(false);
        addLog('Serial Port Closed', 'warning');
      });

      const removeErrorListener = window.api.serial.onError((err) => {
        addLog(`Serial Error: ${err}`, 'error');
      });

      return () => {
        removeDataListener();
        removeClosedListener();
        removeErrorListener();
      };
    }
  }, []);

  const handleConnect = async () => {
    if (!window.api || !selectedPort) {
      addLog('No port selected or API unavailable', 'warning');
      return;
    }

    if (isConnected) {
      await window.api.serial.disconnect();
      setIsConnected(false);
      addLog('Disconnected from ' + selectedPort, 'info');
    } else {
      addLog(`Connecting to ${selectedPort} at ${baudRate} baud...`, 'info');
      const res = await window.api.serial.connect(selectedPort, baudRate);
      if (res.success) {
        setIsConnected(true);
        addLog('Connected to ' + selectedPort, 'success');
        // Automatically switch to serial monitor tab on success
        setActiveTab('serial');
      } else {
        addLog('Failed to connect: ' + res.error, 'error');
      }
    }
  };

  const handleCompile = async () => {
    addLog('Compiling...', 'info');
    setActiveTab('terminal');
    try {
      const res = await axios.post('http://localhost:8001/compile', { code, board });
      addLog(res.data.message, 'success');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Compilation Failed';
      addLog(msg, 'error');
    }
  };

  const handleUpload = async () => {
    if (!selectedPort) {
      addLog('Please select a port first!', 'error');
      return;
    }

    setActiveTab('terminal');

    // Disconnect serial before upload if open (Arduino CLI needs the port)
    if (isConnected) {
      addLog('Disconnecting serial for upload...', 'warning');
      if (window.api) await window.api.serial.disconnect();
      setIsConnected(false);
    }

    addLog('Uploading...', 'info');
    try {
      const res = await axios.post('http://localhost:8001/upload', { code, board, port: selectedPort });
      addLog(res.data.message, 'success');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Upload Failed';
      addLog(msg, 'error');
    }
  };

  const handleOpenFolder = async () => {
    if (window.api && window.api.fs) {
      const result = await window.api.fs.openFolder();
      if (result) {
        setFileTree({ name: result.path.split(/[\\/]/).pop(), path: result.path, files: result.files });
        addLog(`Opened folder: ${result.path}`, 'success');
      }
    }
  };

  const handleFileClick = async (file) => {
    if (window.api && window.api.fs) {
      try {
        const content = await window.api.fs.readFile(file.path);
        if (content !== null) {
          setCode(content);
          setCurrentFile(file);
          addLog(`Opened file: ${file.name}`, 'info');
        } else {
          addLog(`Failed to read file: ${file.name}`, 'error');
        }
      } catch (err) {
        addLog(`Error reading file: ${err}`, 'error');
      }
    }
  };

  const openModal = (type) => {
    if (!fileTree) return addLog('Open a folder first!', 'warning');
    setModal({ isOpen: true, type, value: '' });
  };

  const closeModal = () => setModal({ isOpen: false, type: '', value: '' });

  const handleModalConfirm = async (name) => {
    if (!name) return;
    closeModal();

    if (modal.type === 'file') {
      const res = await window.api.fs.createFile(fileTree.path, name);
      if (res.success) {
        addLog(`Created file: ${name}`, 'success');
        refreshFileTree(fileTree.path);
      } else {
        addLog(`Error creating file: ${res.error}`, 'error');
      }
    } else if (modal.type === 'folder') {
      const res = await window.api.fs.createFolder(fileTree.path, name);
      if (res.success) {
        addLog(`Created folder: ${name}`, 'success');
        refreshFileTree(fileTree.path);
      } else {
        addLog(`Error creating folder: ${res.error}`, 'error');
      }
    }
  };

  const handleCreateFileClick = () => openModal('file');
  const handleCreateFolderClick = () => openModal('folder');

  const refreshFileTree = async (path) => {
    if (window.api && window.api.fs) {
      const result = await window.api.fs.readFolder(path);
      if (result.success) {
        setFileTree(prev => ({ ...prev, files: result.files }));
      }
    }
  };

  const handleSave = async () => {
    if (!currentFile) {
      addLog('No file open to save.', 'warning');
      return;
    }
    if (window.api && window.api.fs) {
      try {
        const success = await window.api.fs.saveFile(currentFile.path, code);
        if (success) {
          addLog(`Saved ${currentFile.name}`, 'success');
        } else {
          addLog(`Failed to save ${currentFile.name}`, 'error');
        }
      } catch (err) {
        addLog(`Error saving: ${err}`, 'error');
      }
    }
  };

  useEffect(() => {
    if (window.api && window.api.onMenuAction) {
      const removeListener = window.api.onMenuAction((action) => {
        switch (action) {
          case 'new-file':
            handleCreateFileClick();
            break;
          case 'new-folder':
            handleCreateFolderClick();
            break;
          case 'open-folder':
            handleOpenFolder();
            break;
          case 'save':
            handleSave();
            break;
          default:
            break;
        }
      });
      return () => removeListener();
    }
  }, [fileTree, currentFile, code, modal]);

  const handleSend = async (data) => {
    if (!isConnected) {
      addLog('Not connected to any device.', 'warning');
      return;
    }
    if (window.api) {
      try {
        await window.api.serial.write(data);
        // We don't necessarily log outgoing data as a 'serial' log type unless the device echoes it,
        // but it helps visual feedback.
        addLog(`> ${data}`, 'info');
      } catch (err) {
        addLog(`Error sending: ${err}`, 'error');
      }
    }
  };

  return (
    <div className="flex w-full h-full text-white overflow-hidden">
      <InputModal
        isOpen={modal.isOpen}
        title={modal.type === 'file' ? 'New File' : 'New Folder'}
        placeholder={modal.type === 'file' ? 'sketch.ino' : 'lib_name'}
        onConfirm={handleModalConfirm}
        onCancel={closeModal}
      />

      {/* Left Sidebar */}
      <Sidebar
        fileTree={fileTree}
        onOpenFolder={handleOpenFolder}
        onFileClick={handleFileClick}
        onCreateFile={handleCreateFileClick}
        onCreateFolder={handleCreateFolderClick}
      />

      {/* Main Content */}
      <div className="flex flex-col grow min-w-0" style={{ background: '#0b0f14' }}>

        {/* Toolbar */}
        <div style={{ height: '52px', borderBottom: '1px solid #30363d', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '16px', background: '#161b22', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium transition-colors"
              onClick={handleCompile}
              title="Verify Code"
            >
              <CheckCircleIcon size={16} /> Verify
            </button>
            <button
              className="flex items-center gap-2 px-3 py-1.5 bg-transparent border border-gray-700 hover:border-gray-500 rounded text-sm font-medium transition-colors"
              onClick={handleUpload}
              title="Upload to Arduino"
            >
              <Upload size={16} /> Upload
            </button>
          </div>

          <div className="h-6 w-px bg-gray-700"></div>

          {/* Hardware Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#0d1117] border border-[#30363d] rounded px-2 py-1">
              <Cpu size={14} className="text-gray-400" />
              <select
                value={selectedPort}
                onChange={e => setSelectedPort(e.target.value)}
                className="bg-transparent text-sm outline-none cursor-pointer"
                style={{ minWidth: '100px' }}
              >
                <option value="">Select Port</option>
                {ports.map(p => (
                  <option key={p.path} value={p.path}>{p.path} {p.manufacturer ? `(${p.manufacturer})` : ''}</option>
                ))}
              </select>
            </div>

            <button onClick={refreshPorts} className="p-1.5 hover:bg-white/10 rounded transition-colors" title="Refresh Ports">
              <RefreshCw size={14} className="text-gray-400" />
            </button>

            <button
              onClick={handleConnect}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all ${isConnected
                  ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20'
                  : 'bg-green-500/10 text-green-500 border border-green-500/50 hover:bg-green-500/20'
                }`}
            >
              <PlugZap size={14} />
              {isConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>

          <div style={{ flexGrow: 1 }}></div>

          {/* Board Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Board:</span>
            <select
              value={board}
              onChange={e => setBoard(e.target.value)}
              className="bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 text-sm outline-none hover:border-gray-500 transition-colors"
            >
              <option value="arduino:avr:uno">Arduino Uno</option>
              <option value="arduino:avr:nano">Arduino Nano</option>
              <option value="arduino:avr:mega">Arduino Mega</option>
            </select>
          </div>
        </div>

        {/* Editor Area */}
        <div style={{ flexGrow: 1, position: 'relative' }}>
          <CodeEditor code={code} setCode={setCode} />
        </div>

        {/* Tabbed Bottom Panel */}
        <div style={{ height: '240px', borderTop: '1px solid #30363d', display: 'flex', flexDirection: 'column', background: '#0d1117' }}>
          {/* Tab Header */}
          <div className="flex items-center px-4 bg-[#161b22] border-b border-[#30363d]">
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all border-b-2 ${activeTab === 'terminal' ? 'text-blue-400 border-blue-400' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
            >
              <TerminalIcon size={14} /> Output
            </button>
            <button
              onClick={() => setActiveTab('serial')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all border-b-2 ${activeTab === 'serial' ? 'text-blue-400 border-blue-400' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
            >
              <ListFilter size={14} /> Serial Monitor
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'terminal' ? (
              <Terminal
                logs={logs.filter(l => l.type !== 'serial')}
                onSend={handleSend}
                onClear={clearLogs}
                baudRate={baudRate}
                setBaudRate={setBaudRate}
                isConnected={isConnected}
              />
            ) : (
              <SerialMonitor
                logs={logs}
                onSend={handleSend}
                onClear={clearLogs}
                baudRate={baudRate}
                setBaudRate={setBaudRate}
                isConnected={isConnected}
                onConnect={handleConnect}
                onDisconnect={handleConnect}
                selectedPort={selectedPort}
              />
            )}
          </div>
        </div>
      </div>

      {/* Right AI Panel */}
      <AIPanel onApplyCode={setCode} />
    </div>
  );
}

// Icon Helper
const CheckCircleIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

export default App;

