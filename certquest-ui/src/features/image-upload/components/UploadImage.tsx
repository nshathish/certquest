import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowUp, Loader2, UploadCloud, X } from 'lucide-react';

import TagInput from './TagInput.tsx';
import Category from './Category.tsx';

import { useImageInput } from '../hooks/useImageInput.ts';
import { useImageUpload } from '../hooks/useImageUpload.ts';

export default function UploadImage() {
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState<string>('');

  const {
    fileInputRef,
    selectedFile,
    previewURL,
    handleChange,
    triggerFileSelect,
    clearPreview,
  } = useImageInput();

  const {
    uploadImage,
    uploadImageReset,
    isPending,
    isError,
    isSuccess,
    error,
  } = useImageUpload();

  useEffect(() => {
    if (selectedFile) {
      uploadImageReset();
      setTags([]);
      setCategory('');
    }
  }, [selectedFile, uploadImageReset]);

  const handleFileUpload = () => {
    if (selectedFile) {
      uploadImage(
        {
          file: selectedFile,
          tags,
          category,
        },
        { onSuccess: () => clearPreview() },
      );
    }
  };

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

        {isPending && (
          <div className="mb-4">
            <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
          </div>
        )}

        {selectedFile && (
          <div className="mb-4">
            <Category category={category} setCategory={setCategory} />
            <TagInput tags={tags} setTags={setTags} />
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
              onChange={handleChange}
              className="hidden"
            />
            <div className="text-base text-gray-400">
              or paste with{' '}
              <span className="font-semibold text-gray-600">Ctrl+V</span>
            </div>
          </div>

          {selectedFile && !isSuccess && !isPending && (
            <button
              onClick={handleFileUpload}
              className="bg-black text-white p-3 rounded-full hover:bg-gray-800"
              title="Upload"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          )}
        </div>

        {isSuccess && (
          <p className="mt-4 flex items-center text-green-600 text-base justify-center">
            <UploadCloud className="w-5 h-5 mr-2" /> Uploaded Successfully
          </p>
        )}
        {isError && (
          <p className="mt-4 flex items-center text-red-600 text-base justify-center">
            <AlertTriangle className="w-5 h-5 mr-2" />{' '}
            {(error as Error).message}
          </p>
        )}
      </div>
    </div>
  );
}
