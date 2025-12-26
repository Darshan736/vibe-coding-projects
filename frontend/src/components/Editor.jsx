import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, setCode, language = 'cpp' }) => {
    const handleEditorChange = (value) => {
        setCode(value);
    };

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <Editor
                height="100%"
                defaultLanguage={language}
                value={code}
                theme="vs-dark"
                onChange={handleEditorChange}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', monospace",
                    scrollBeyondLastLine: false,
                    padding: { top: 16 },
                    automaticLayout: true,
                }}
            />
        </div>
    );
};

export default CodeEditor;
