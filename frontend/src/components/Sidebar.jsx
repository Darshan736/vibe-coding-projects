import React from 'react';
import { FileCode, Folder, Plus } from 'lucide-react';

const Sidebar = ({ fileTree, onFileClick, onOpenFolder, onCreateFile, onCreateFolder }) => {
    return (
        <div style={{ width: '250px', background: 'var(--bg-panel)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', fontSize: '0.85rem' }}>
            {/* Header */}
            <div style={{ padding: '8px 12px', background: '#111b27', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, letterSpacing: '0.5px', color: '#8b9bb4' }}>EXPLORER</span>
                <div style={{ display: 'flex', gap: '2px' }}>
                    <button onClick={onCreateFile} title="New File" className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"><FileCode size={14} /></button>
                    <button onClick={onCreateFolder} title="New Folder" className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"><Folder size={14} /></button>
                    <button onClick={onOpenFolder} title="Open Folder" className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"><Folder size={14} /></button>
                </div>
            </div>

            {/* File List */}
            <div style={{ flexGrow: 1, overflowY: 'auto', paddingTop: '4px' }}>
                {fileTree ? (
                    <div>
                        <div style={{ padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#e5e7eb', fontWeight: 600 }}>
                            <Folder size={14} color="#60a5fa" />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fileTree.name || 'Project'}</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {fileTree.files.map((file, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => !file.isDirectory && onFileClick(file)}
                                    style={{
                                        padding: '4px 12px 4px 28px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        cursor: file.isDirectory ? 'default' : 'pointer',
                                        color: file.isDirectory ? '#9ca3af' : '#d1d5db',
                                    }}
                                    className="hover:bg-[#1f2937] transition-colors"
                                >
                                    {file.isDirectory ? <Folder size={14} /> : <FileCode size={14} />}
                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280', gap: '12px' }}>
                        <Folder size={32} opacity={0.5} />
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ marginBottom: '8px' }}>No Folder Open</div>
                            <button
                                onClick={onOpenFolder}
                                style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                                Open Folder
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
