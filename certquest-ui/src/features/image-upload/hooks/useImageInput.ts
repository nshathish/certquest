import { useEffect, useRef, useState } from 'react';

import type { ChangeEvent } from 'react';

export function useImageInput() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const triggerFileSelect = () => fileInputRef.current?.click();

  const clearPreview = () => {
    setSelectedFile(null);
    setPreviewURL(null);
  };

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
    setPreviewURL(URL.createObjectURL(file));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) handleImageSelect(file);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  return {
    fileInputRef,
    selectedFile,
    previewURL,
    handleChange,
    triggerFileSelect,
    clearPreview,
  };
}
