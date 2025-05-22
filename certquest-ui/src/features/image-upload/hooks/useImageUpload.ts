import { useMutation } from '@tanstack/react-query';

type UploadArgs = {
  file: File;
  tags: string[];
  category: string;
};

const uploadImage = async ({ file, tags, category }: UploadArgs) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tags', JSON.stringify(tags));
  formData.append('category', category);

  const response = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('Upload failed');
  return response.json();
};

export function useImageUpload() {
  const mutation = useMutation({ mutationFn: uploadImage });

  return {
    ...mutation,
    uploadImage: mutation.mutate,
    uploadImageAsync: mutation.mutateAsync,
    uploadImageReset: mutation.reset,
  };
}
