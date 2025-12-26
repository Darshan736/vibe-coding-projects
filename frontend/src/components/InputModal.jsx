import React, { useState, useEffect } from 'react';

const InputModal = ({ isOpen, title, placeholder, initialValue = '', onConfirm, onCancel }) => {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        if (isOpen) setValue(initialValue);
    }, [isOpen, initialValue]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(value);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: '#1f2937', padding: '20px', borderRadius: '8px',
                width: '300px', border: '1px solid #374151',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
            }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 600, color: 'white' }}>{title}</h3>
                <form onSubmit={handleSubmit}>
                    <input
                        autoFocus
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={placeholder}
                        style={{
                            width: '100%', padding: '8px', borderRadius: '4px',
                            background: '#111827', border: '1px solid #374151',
                            color: 'white', marginBottom: '16px', outline: 'none'
                        }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                            type="button"
                            onClick={onCancel}
                            style={{
                                padding: '6px 12px', borderRadius: '4px',
                                background: 'transparent', color: '#9ca3af',
                                border: '1px solid #4b5563', cursor: 'pointer'
                            }}
                            className="hover:bg-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{
                                padding: '6px 12px', borderRadius: '4px',
                                background: '#2563eb', color: 'white',
                                border: 'none', cursor: 'pointer'
                            }}
                            className="hover:bg-blue-700"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InputModal;
