import React, { useState } from 'react';
import { Send, Cpu, AlertTriangle, CheckCircle } from 'lucide-react';
import axios from 'axios';

const AIPanel = ({ onApplyCode }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your Arduino AI Guide. What are we building today?' }
    ]);
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Call Backend API
            const res = await axios.post('http://localhost:8001/ai/generate', { prompt: input });
            const aiMsg = {
                role: 'assistant',
                content: res.data.explanation,
                code: res.data.code
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Error connecting to AI Brain.' }]);
        }
        setLoading(false);
    };

    return (
        <div style={{ width: '350px', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-panel)' }}>
            {/* Header */}
            <div style={{ padding: '10px', borderBottom: '1px solid var(--border)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={16} color="var(--accent)" />
                <span>AI Assistant</span>
            </div>

            {/* Messages */}
            <div style={{ flexGrow: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '90%' }}>

                        <div style={{
                            background: msg.role === 'user' ? 'var(--accent)' : '#21262d',
                            color: msg.role === 'user' ? '#000' : 'var(--text-primary)',
                            padding: '10px', borderRadius: '8px', fontSize: '14px', lineHeight: '1.4'
                        }}>
                            {msg.content}
                        </div>

                        {/* Code Block Option */}
                        {msg.code && (
                            <div style={{ marginTop: '8px', background: '#0d1117', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
                                <div style={{ background: '#30363d', padding: '4px 8px', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Arduino C++</span>
                                    <button onClick={() => onApplyCode(msg.code)} style={{ color: 'var(--accent)', cursor: 'pointer' }}>Apply</button>
                                </div>
                                <pre style={{ padding: '8px', fontSize: '12px', overflowX: 'auto', margin: 0 }}>
                                    <code>{msg.code}</code>
                                </pre>
                            </div>
                        )}
                    </div>
                ))}
                {loading && <div style={{ opacity: 0.5, fontSize: '12px' }}>Thinking...</div>}
            </div>

            {/* Input */}
            <div style={{ padding: '10px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-input)', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        placeholder="Ask AI to blink an LED..."
                        style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', flexGrow: 1, fontSize: '14px' }}
                    />
                    <button onClick={sendMessage} title="Send"><Send size={16} color="var(--accent)" /></button>
                </div>
            </div>
        </div>
    );
};

export default AIPanel;
