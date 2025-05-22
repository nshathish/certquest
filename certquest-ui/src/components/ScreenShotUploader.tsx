import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowUp, Loader2, UploadCloud, X } from 'lucide-react';

import type { ChangeEvent } from 'react';

export default function UploadImage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadSuccess(false);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        setError('Failed to upload image');
        return;
      }

      setUploadSuccess(true);
      setPreviewURL(null);
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readyToUpload(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const clearPreview = () => {
    setSelectedFile(null);
    setPreviewURL(null);
    setUploadSuccess(false);
    setError(null);
  };

  const readyToUpload = (file: File) => {
    setSelectedFile(file);
    setPreviewURL(URL.createObjectURL(file));
    setUploadSuccess(false);
    setError(null);
  };

  useEffect(() => {
    const handlePase = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            readyToUpload(file);
          }
        }
      }
    };

    window.addEventListener('paste', handlePase);
    return () => window.removeEventListener('paste', handlePase);
  }, []);

  return (
    <div className="w-full max-w-[70vw] mx-auto px-4">
      <div className="flex flex-col border rounded-3xl px-8 py-6 bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-400 w-full">
        {previewURL && (
          <div className="relative w-16 h-16 mb-2">
            <img
              src={previewURL}
              alt="Preview"
              className="w-full h-full object-cover rounded-full"
            />
            <button
              className="absolute top-0 right-0 bg-black bg-opacity-70 text-white rounded-full p-1"
              onClick={clearPreview}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {uploading && (
          <div className="mb-4">
            <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
          </div>
        )}

        <div className="flex w-full items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={triggerFileSelect}
              className="flex items-center gap-2 text-base font-medium text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              <UploadCloud className="w-6 h-6" />
              Upload Screenshot
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageSelect}
              className="hidden"
            />
            <div className="text-base text-gray-400">
              or paste with{' '}
              <span className="font-semibold text-gray-600">Ctrl+V</span>
            </div>
          </div>

          {selectedFile && !uploadSuccess && !uploading && (
            <button
              onClick={handleFileUpload}
              className="bg-black text-white p-3 rounded-full hover:bg-gray-800"
              title="Upload"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          )}
        </div>

        {uploadSuccess && (
          <p className="mt-4 flex items-center text-green-600 text-base justify-center">
            <UploadCloud className="w-5 h-5 mr-2" /> Uploaded Successfully
          </p>
        )}
        {error && (
          <p className="mt-4 flex items-center text-red-600 text-base justify-center">
            <AlertTriangle className="w-5 h-5 mr-2" /> {error}
          </p>
        )}
      </div>
    </div>
  );
}
