import { QueryClientProvider } from '@tanstack/react-query';

import UploadImage from './features/image-upload/components/UploadImage.tsx';

import { queryClient } from './lib/queryClient.ts';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-4xl font-bold text-blue-600">CERTQUEST</h1>
        <div className="mt-4 w-full  text-gray-700">
          <UploadImage />
        </div>
      </div>
    </QueryClientProvider>
  );
}
