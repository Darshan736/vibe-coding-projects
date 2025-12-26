import React from 'react';

const Terminal = ({ logs, onSend, onClear, baudRate, setBaudRate, isConnected }) => {
    const [input, setInput] = React.useState('');
    const endRef = React.useRef(null);

    React.useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && input.trim()) {
            onSend(input);
            setInput('');
        }
    };

    return (
        <div style={{
            height: '100%',
            width: '100%',
            background: '#0d1117',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: '12px'
        }}>
            {/* Header / Toolbar */}
            <div style={{
                padding: '4px 12px',
                borderBottom: '1px solid #30363d',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#161b22',
                color: '#8b949e',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span>Serial Monitor</span>
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: isConnected ? '#3fb950' : '#f85149',
                        textTransform: 'none',
                        letterSpacing: 'normal',
                        fontSize: '10px',
                        fontWeight: 'bold'
                    }}>
                        <div style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: isConnected ? '#3fb950' : '#f85149'
                        }} />
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select
                        value={baudRate}
                        onChange={(e) => setBaudRate(parseInt(e.target.value))}
                        style={{
                            background: '#0d1117',
                            color: '#8b949e',
                            border: '1px solid #30363d',
                            borderRadius: '3px',
                            fontSize: '10px',
                            padding: '1px 4px',
                            outline: 'none'
                        }}
                    >
                        <option value="9600">9600 baud</option>
                        <option value="19200">19200 baud</option>
                        <option value="38400">38400 baud</option>
                        <option value="57600">57600 baud</option>
                        <option value="115200">115200 baud</option>
                    </select>
                    <button
                        onClick={onClear}
                        style={{
                            background: 'transparent',
                            border: '1px solid #30363d',
                            borderRadius: '3px',
                            color: '#8b949e',
                            padding: '2px 8px',
                            cursor: 'pointer',
                            fontSize: '10px'
                        }}
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Log Area */}
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '12px' }} className="custom-scrollbar">
                {logs.map((log, index) => (
                    <div key={index} style={{
                        marginBottom: '2px',
                        color: log.type === 'error' ? '#ff7b72' :
                            log.type === 'success' ? '#3fb950' :
                                log.type === 'warning' ? '#d29922' :
                                    log.type === 'serial' ? '#58a6ff' : '#8b949e',
                        display: 'flex',
                        gap: '8px'
                    }}>
                        <span style={{ color: '#484f58', flexShrink: 0, userSelect: 'none' }}>
                            {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                        </span>
                        <span style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>{log.message}</span>
                    </div>
                ))}
                {logs.length === 0 && <div style={{ color: '#484f58', fontStyle: 'italic' }}>Waiting for data...</div>}
                <div ref={endRef} />
            </div>

            {/* Input Area */}
            <div style={{
                borderTop: '1px solid #30363d',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#0d1117'
            }}>
                <span style={{ color: '#58a6ff', fontWeight: 'bold' }}>&gt;</span>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type message to send..."
                    style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: '#e6edf3',
                        flexGrow: 1,
                        fontFamily: 'inherit'
                    }}
                />
            </div>
        </div>
    );
};

export default Terminal;
