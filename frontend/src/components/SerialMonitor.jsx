import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Zap, ZapOff, Wifi, WifiOff } from 'lucide-react';

const SerialMonitor = ({ logs, onSend, onClear, baudRate, setBaudRate, isConnected, onConnect, onDisconnect, selectedPort }) => {
    const [input, setInput] = useState('');
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && input.trim()) {
            onSend(input);
            setInput('');
        }
    };

    const serialLogs = logs.filter(log => log.type === 'serial' || log.type === 'info' || log.type === 'error' || log.type === 'success');

    return (
        <div className="flex flex-col h-full w-full bg-[#0d1117] font-mono text-sm overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#30363d] select-none">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        <Wifi size={14} className={isConnected ? "text-green-500" : "text-gray-600"} />
                        <span>Serial Monitor</span>
                        <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
                        <span className={isConnected ? "text-green-500" : "text-red-500"}>{isConnected ? 'Connected' : 'Disconnected'}</span>
                    </div>
                    {selectedPort && (
                        <span className="text-[10px] bg-[#0d1117] px-2 py-0.5 rounded border border-[#30363d] text-gray-400">
                            {selectedPort}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={baudRate}
                        onChange={(e) => setBaudRate(parseInt(e.target.value))}
                        className="bg-[#0d1117] text-gray-300 border border-[#30363d] rounded px-2 py-0.5 text-[11px] outline-none hover:border-gray-500 transition-colors cursor-pointer"
                    >
                        {[300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 74880, 115200, 230400, 250000, 500000, 1000000, 2000000].map(rate => (
                            <option key={rate} value={rate}>{rate} baud</option>
                        ))}
                    </select>

                    <button
                        onClick={isConnected ? onDisconnect : onConnect}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-bold transition-all ${isConnected
                                ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20'
                                : 'bg-green-500/10 text-green-500 border border-green-500/50 hover:bg-green-500/20'
                            }`}
                    >
                        {isConnected ? <WifiOff size={12} /> : <Wifi size={12} />}
                        {isConnected ? 'Disconnect' : 'Connect'}
                    </button>

                    <button
                        onClick={onClear}
                        title="Clear Output"
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Output Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar scroll-smooth">
                {serialLogs.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-600 italic animate-pulse">
                        Waiting for serial data...
                    </div>
                ) : (
                    serialLogs.map((log, index) => (
                        <div key={index} className="flex gap-3 group">
                            <span className="text-gray-600 tabular-nums select-none w-16 opacity-50 group-hover:opacity-100 transition-opacity">
                                {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                            <span className={`flex-1 break-all whitespace-pre-wrap ${log.type === 'error' ? 'text-red-400' :
                                    log.type === 'success' ? 'text-green-400' :
                                        log.type === 'warning' ? 'text-yellow-400' :
                                            log.type === 'serial' ? 'text-blue-300' : 'text-gray-400'
                                }`}>
                                {log.message}
                            </span>
                        </div>
                    ))
                )}
                <div ref={endRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-[#0d1117] border-t border-[#30363d] flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all">
                    <span className="text-blue-500 font-bold select-none">&gt;</span>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isConnected ? "Send data to Arduino..." : "Connect to send data..."}
                        disabled={!isConnected}
                        className="bg-transparent border-none outline-none text-gray-200 w-full placeholder:text-gray-600"
                    />
                </div>
                <button
                    onClick={() => { if (input.trim()) { onSend(input); setInput(''); } }}
                    disabled={!isConnected || !input.trim()}
                    className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/10"
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
};

export default SerialMonitor;
