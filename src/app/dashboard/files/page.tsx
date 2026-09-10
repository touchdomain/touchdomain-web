'use client';

import { useState, useCallback } from 'react';

export default function FilesPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setMessage(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'File uploaded successfully!', type: 'success' });
      } else {
        setMessage({ text: `Error: ${data.error}`, type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'An error occurred during upload.', type: 'error' });
    } finally {
      setUploading(false);
      setIsDragging(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) uploadFile(e.dataTransfer.files[0]);
  }, []);

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Project Files</h1>
        <p className="mt-1 text-sm text-slate-400">
          Securely upload and manage documents for your Touch Domain project.
        </p>
      </div>

      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
          isDragging 
            ? 'border-indigo-500 bg-indigo-500/10' 
            : 'border-slate-700 bg-slate-900 hover:border-slate-600'
        }`}
      >
        <div className="rounded-full bg-slate-800 p-4 mb-4">
          <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-1">
          {uploading ? 'Uploading...' : 'Click or drag file to this area to upload'}
        </h3>
        
        <label className="mt-4 cursor-pointer rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
          Select File
          <input 
            type="file" 
            className="hidden" 
            onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])} 
            disabled={uploading} 
          />
        </label>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'error' ? 'bg-red-950/50 border-red-500/50 text-red-200' : 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
}