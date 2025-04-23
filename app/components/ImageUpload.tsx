'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

interface UploadedFile {
  url: string;
  imageName: string;
  originalName: string;
}

interface UploadProgress {
  [key: string]: number;
}

export default function ImageUpload() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    setSelectedFiles(fileArray);
    setError(null);

    // Create previews
    const newPreviews = fileArray.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add('border-blue-500');
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-blue-500');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-blue-500');
    }
    handleFileSelect(e.dataTransfer.files);
  }, []);

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress({});

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadedFiles(result.files);
      setSelectedFiles([]);
      setPreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Image Upload</h1>
      
      <div className="space-y-6">
        {/* Drop Zone */}
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors"
        >
          <label htmlFor="file-upload" className="sr-only">
            Upload Images
          </label>
          <input
            id="file-upload"
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            aria-label="Upload Images"
          />
          <div className="space-y-2">
            <p className="text-gray-600">
              Drag and drop images here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-700"
              >
                browse
              </button>
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: JPEG, PNG, WebP (max 5MB each)
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Selected Images</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="relative aspect-video">
                    <Image
                      src={previews[index]}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 truncate">
                    {file.name}
                  </p>
                  {uploadProgress[file.name] !== undefined && (
                    <div className="mt-1 h-1 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${uploadProgress[file.name]}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={isUploading || selectedFiles.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Uploading...' : 'Upload Images'}
        </button>

        {/* Uploaded Images */}
        {uploadedFiles.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Uploaded Images</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="relative aspect-video">
                  <Image
                    src={file.url}
                    alt={`Uploaded ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                    {file.originalName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 