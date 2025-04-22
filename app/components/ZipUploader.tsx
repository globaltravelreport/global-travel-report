'use client'

import { useState } from 'react';

interface ExtractedFile {
  name: string;
  size: number;
  compressed: number;
  isDirectory: boolean;
}

interface ExtractionResult {
  success: boolean;
  extractedPath: string;
  files: ExtractedFile[];
}

export default function ZipUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractionResult | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/unzip', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process zip file');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <label 
          htmlFor="zipFile" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Upload ZIP File
        </label>
        <input
          type="file"
          id="zipFile"
          accept=".zip"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          disabled={isUploading}
        />
      </div>

      {isUploading && (
        <div className="text-blue-600">Processing zip file...</div>
      )}

      {error && (
        <div className="text-red-600 mb-4">{error}</div>
      )}

      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Extracted Files:</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-2">
              {result.files.map((file, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
                >
                  <span className="flex items-center">
                    {file.isDirectory ? '📁' : '📄'} {file.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Files extracted to: {result.extractedPath}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 