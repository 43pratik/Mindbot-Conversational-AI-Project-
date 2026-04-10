import React, { useState } from 'react';
import { uploadDocument } from '../../services/api';

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus({ type: '', message: '' }); // Clear old status
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus({ type: 'error', message: 'Please select a PDF first.' });
      return;
    }

    setIsUploading(true);
    setStatus({ type: 'info', message: 'Uploading & learning...' });

    try {
      const response = await uploadDocument(file);
      setStatus({ type: 'success', message: response.message || 'Document learned successfully!' });
      setFile(null); // Reset the input after success
      // Note: We need to manually clear the actual HTML input element if we want it to look fully reset, 
      // but setting state to null handles the logic side.
      document.getElementById('pdf-upload').value = ''; 
    } catch (error) {
      setStatus({ type: 'error', message: 'Upload failed. Is the server running?' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-dark p-5 rounded-xl border border-secondary flex flex-col items-center text-center">
      
      {/* File Input */}
      <input 
        type="file" 
        id="pdf-upload"
        accept=".pdf" 
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-400
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-primary file:text-darker
          hover:file:bg-opacity-80 file:cursor-pointer mb-4 cursor-pointer"
      />

      {/* Upload Button */}
      <button 
        onClick={handleUpload}
        disabled={isUploading || !file}
        className={`w-full py-2 rounded-lg font-bold transition-all ${
          isUploading || !file 
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
            : 'bg-primary text-darker hover:bg-cyan-400 cursor-pointer shadow-[0_0_10px_rgba(0,229,255,0.3)]'
        }`}
      >
        {isUploading ? 'Processing PDF...' : 'Upload & Learn'}
      </button>

      {/* Status Message */}
      {status.message && (
        <p className={`mt-3 text-sm font-medium ${
          status.type === 'success' ? 'text-green-400' : 
          status.type === 'error' ? 'text-red-400' : 'text-primary'
        }`}>
          {status.type === 'success' ? '✅ ' : status.type === 'error' ? '❌ ' : '⏳ '}
          {status.message}
        </p>
      )}
    </div>
  );
}